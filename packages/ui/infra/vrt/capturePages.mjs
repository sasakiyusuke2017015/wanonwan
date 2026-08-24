// apps/web の画面を静止画として撮影する（VRT の撮影層・app ページ編）。
//
// 前提: dev スタック起動済み + `pnpm provision:dev` 済み + `pnpm dev` で :3000 が上がっていること。
//
// 使い方:
//   pnpm --filter @ui-catalog/core vrt:pages
//
// 主なオプション:
//   --base <url>     対象 origin（既定: http://localhost:3000）
//   --out <dir>      出力先（既定: .vrt/pages-actual）
//   --filter <re>    画面名の部分一致フィルタ（正規表現）
//   --repeat         同じ画面を 2 回撮って差分の有無だけを報告（flaky 検査。画像は保存しない）
//
// story 撮影（captureStories.mjs）と同じ capture-mode を使う。差分は
// 「ログインが要る」「URL が動的 id を含む」の 2 点だけなので、静止化の実装はそちらと揃える。
import { createHash } from 'node:crypto'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import { chromium } from 'playwright'

const args = process.argv.slice(2)
const optionOf = (name, fallback) => {
  const i = args.indexOf(name)
  return i === -1 ? fallback : args[i + 1]
}
const BASE = optionOf('--base', 'http://localhost:3000').replace(/\/$/, '')
const OUT = resolve(process.cwd(), optionOf('--out', '.vrt/pages-actual'))
const FILTER = optionOf('--filter', null)
const REPEAT = args.includes('--repeat')

const VIEWPORT = { width: 1280, height: 800 }
const FIXED_TIME = new Date('2026-01-01T09:00:00+09:00')
const PASSWORD = 'Password1!'

// provision:dev の固定アカウント（scripts/provision.mjs の seed）
const ACCOUNTS = {
  admin: 'admin1@example.com',
  interviewer: 'interviewer1@example.com',
  member: 'member1@example.com',
}

// 撮影対象。`role: null` は未ログイン。
// dynamic は「一覧ページから最初の詳細リンクを辿る」ことで id を解決する。
const TARGETS = [
  { name: 'login', role: null, path: '/login' },
  { name: 'not-found', role: null, path: '/this-page-does-not-exist' },

  { name: 'member-dashboard', role: 'member', path: '/dashboard' },
  { name: 'member-surveys', role: 'member', path: '/surveys' },
  { name: 'member-survey-answer', role: 'member', path: '/surveys', follow: 'button:has-text("回答する")' },
  { name: 'member-schedule', role: 'member', path: '/schedule' },
  { name: 'member-change-password', role: 'member', path: '/change-password' },

  { name: 'interviewer-interviews', role: 'interviewer', path: '/interviews' },
  // 面談詳細（/interviews/[id]）は provision:dev では撮れない。面談担当が割り当たっている
  // answers は demomgr@example.com のものだけで、このアカウントは GoTrue identity を持たず
  // ログインできないため。撮るには seed 側で interviewer1 に担当を割り当てる必要がある。

  { name: 'admin-users', role: 'admin', path: '/admin/users' },
  { name: 'admin-users-new', role: 'admin', path: '/admin/users/new' },
  { name: 'admin-surveys', role: 'admin', path: '/admin/surveys' },
  { name: 'admin-surveys-new', role: 'admin', path: '/admin/surveys/new' },
  { name: 'admin-answers', role: 'admin', path: '/admin/answers' },
  { name: 'admin-answer-detail', role: 'admin', path: '/admin/answers', follow: 'tbody tr' },
  { name: 'admin-questions', role: 'admin', path: '/admin/questions' },
  { name: 'admin-question-edit', role: 'admin', path: '/admin/questions', follow: 'tbody tr' },
  { name: 'admin-org', role: 'admin', path: '/admin/org' },
  { name: 'admin-positions', role: 'admin', path: '/admin/positions' },
  { name: 'admin-urgencies', role: 'admin', path: '/admin/urgencies' },
]

const INIT_SCRIPT = () => {
  window.__VRT_CAPTURE__ = true
  const mark = () => document.documentElement.setAttribute('data-vrt-capture', 'true')
  if (document.documentElement) mark()
  document.addEventListener('DOMContentLoaded', () => {
    mark()
    // app ページ側の capture-mode CSS を有効にする（globals.css の body[data-vrt-scope]）
    document.body?.setAttribute('data-vrt-scope', 'page')
  })

  let seed = 0x9e3779b9
  Math.random = () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  const freezeSvg = (svg) => {
    try {
      svg.pauseAnimations()
      svg.setCurrentTime(0)
    } catch {
      /* SMIL 非対応要素は無視 */
    }
  }
  const freezeAll = (root) => {
    if (typeof root.querySelectorAll !== 'function') return
    root.querySelectorAll('svg').forEach(freezeSvg)
  }
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType !== 1) continue
        if (node.tagName === 'svg') freezeSvg(node)
        freezeAll(node)
      }
    }
  })
  document.addEventListener('DOMContentLoaded', () => {
    freezeAll(document)
    observer.observe(document.documentElement, { childList: true, subtree: true })
  })
}

const settle = () => {
  for (const animation of document.getAnimations()) {
    let infinite = false
    try {
      infinite = animation.effect?.getComputedTiming?.().iterations === Infinity
    } catch {
      /* 取得できないものは有限扱い */
    }
    try {
      if (infinite) {
        animation.currentTime = 0
        animation.pause()
      } else {
        animation.finish()
      }
    } catch {
      /* 既に終了している */
    }
  }
  document.querySelectorAll('svg').forEach((svg) => {
    try {
      svg.pauseAnimations()
      svg.setCurrentTime(0)
    } catch {
      /* SMIL 非対応要素は無視 */
    }
  })
}

const login = async (page, email) => {
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' })
  // ログイン画面は入力欄を複数レンダリングする（レスポンシブで sm 用と lg 用）ため
  // `.first()` で可視の 1 組に絞る。セレクタ全体に fill すると片方が空のまま送信される。
  await page.locator('input[type="email"]').first().fill(email)
  await page.locator('input[type="password"]').first().fill(PASSWORD)
  await page.locator('button[type="submit"]').first().click()
  // router.replace によるクライアント遷移。click 後に待つ（Promise.all だと取りこぼす）。
  await page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 30_000 })
}

const stabilize = async (page) => {
  await page.evaluate(() => document.fonts.ready)
  // データ取得後の再描画を待つ（TanStack Query のローディングが消えるまで）
  await page
    .waitForFunction(
      () => !document.querySelector('[data-loading="true"], [aria-busy="true"]'),
      null,
      { timeout: 10_000 }
    )
    .catch(() => {
      /* ローディング表示を持たない画面は素通し */
    })
  await page.waitForTimeout(600)
  await page.evaluate(settle)
  await page.waitForTimeout(80)
}

const capture = async (page, target) => {
  await page.goto(`${BASE}${target.path}`, { waitUntil: 'domcontentloaded' })
  await stabilize(page)

  if (target.follow) {
    // 一覧から詳細へ 1 件辿る。<a href> のものと onClick + router.push のものが混在するため
    // セレクタは呼び出し側が指定し、遷移判定は URL が変わったかで見る。
    const entry = page.locator(target.follow).first()
    // 一覧は取得完了後に描画されるので、要素が現れるまで待つ（即 count すると 0 になる）
    await entry.waitFor({ state: 'visible', timeout: 20_000 }).catch(() => {
      throw new Error(`follow セレクタに一致する要素が現れない: ${target.follow}`)
    })
    const before = page.url()
    await entry.click()
    await page.waitForURL((url) => url.href !== before, { timeout: 30_000 })
    await stabilize(page)
  }

  return page.screenshot({ fullPage: true })
}

const main = async () => {
  const pattern = FILTER ? new RegExp(FILTER) : null
  const targets = TARGETS.filter((t) => !pattern || pattern.test(t.name))
  if (targets.length === 0) {
    console.error('撮影対象がありません。')
    process.exit(1)
  }

  if (!REPEAT) {
    await rm(OUT, { recursive: true, force: true })
    await mkdir(OUT, { recursive: true })
  }

  const browser = await chromium.launch()
  const failed = []
  const unstable = []

  // ロールごとに context を分ける（ログイン状態を混ぜない）
  const byRole = new Map()
  for (const target of targets) {
    const key = target.role ?? '_anon'
    if (!byRole.has(key)) byRole.set(key, [])
    byRole.get(key).push(target)
  }

  const startedAt = Date.now()
  for (const [role, list] of byRole) {
    const context = await browser.newContext({ viewport: VIEWPORT, reducedMotion: 'reduce' })
    await context.addInitScript(INIT_SCRIPT)
    // 時刻の起点だけ固定し、時計は止めない。`pauseAt` で止めると setTimeout ごと凍り、
    // TanStack Query のデータ取得も router.replace によるログイン遷移も進まなくなる
    // （story 撮影は静的なので止められるが、app は動いている必要がある）。
    await context.clock.install({ time: FIXED_TIME })
    const page = await context.newPage()

    if (role !== '_anon') {
      try {
        await login(page, ACCOUNTS[role])
      } catch (error) {
        list.forEach((t) => failed.push({ name: t.name, message: `login 失敗: ${error.message.split('\n')[0]}` }))
        await context.close()
        continue
      }
    }

    for (const target of list) {
      try {
        const first = await capture(page, target)
        if (REPEAT) {
          const second = await capture(page, target)
          const a = createHash('sha1').update(first).digest('hex')
          const b = createHash('sha1').update(second).digest('hex')
          if (a !== b) unstable.push(target.name)
        } else {
          await writeFile(resolve(OUT, `${target.name}.png`), first)
        }
        console.log(`  ✓ ${target.name}`)
      } catch (error) {
        failed.push({ name: target.name, message: error.message.split('\n')[0] })
        console.log(`  ✘ ${target.name}`)
      }
    }
    await context.close()
  }
  const elapsed = Date.now() - startedAt
  await browser.close()

  console.log(`\n${targets.length} pages / ${(elapsed / 1000).toFixed(0)}s`)
  if (!REPEAT) console.log(`出力: ${OUT}`)

  if (failed.length > 0) {
    console.error(`\n撮影失敗 ${failed.length} 件:`)
    failed.forEach((f) => console.error(`  ${f.name}: ${f.message}`))
  }
  if (REPEAT) {
    if (unstable.length > 0) {
      console.error(`\n不安定 ${unstable.length} 件（2 回撮って差分あり）:`)
      unstable.forEach((name) => console.error(`  ${name}`))
    } else {
      console.log('\n2 回撮って全件差分なし')
    }
  }

  if (failed.length > 0 || unstable.length > 0) process.exitCode = 1
}

await main()
