// Storybook の全 story を静止画として撮影する（VRT の撮影層）。
//
// 使い方:
//   pnpm --filter @ui-catalog/core storybook:build   # storybook-static を作る
//   pnpm --filter @ui-catalog/core vrt:capture       # 撮影
//
// 主なオプション:
//   --out <dir>      出力先（既定: .vrt/actual）
//   --filter <re>    story id の部分一致フィルタ（正規表現）
//   --concurrency N  並列ページ数（既定: 4）
//   --repeat         同じ story を 2 回撮って差分の有無だけを報告（flaky 検査。画像は保存しない）
//
// storycap は Storybook 10 系に非対応（最新 5.0.1 の peer は ^7 || ^8）のため、
// storybook-static/index.json を読んで iframe.html?id=<id> を直接開く方式を採る。
import { createHash } from 'node:crypto'
import { createServer } from 'node:http'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { extname, join, normalize, resolve } from 'node:path'

import { chromium } from 'playwright'

const ROOT = resolve(process.cwd(), 'storybook-static')
const args = process.argv.slice(2)
const optionOf = (name, fallback) => {
  const i = args.indexOf(name)
  return i === -1 ? fallback : args[i + 1]
}
const OUT = resolve(process.cwd(), optionOf('--out', '.vrt/actual'))
const FILTER = optionOf('--filter', null)
const CONCURRENCY = Number(optionOf('--concurrency', '4'))
const REPEAT = args.includes('--repeat')

const VIEWPORT = { width: 1280, height: 800 }
// 撮影時刻を固定する。`new Date()` / `Date.now()` をそのまま表示する箇所
// （RefreshButton の「最終更新 HH:mm」等）が、撮影のたびに変わるのを防ぐ。
const FIXED_TIME = new Date('2026-01-01T09:00:00+09:00')
const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
}

// 撮影モードの注入。
// - window.__VRT_CAPTURE__ : JS スプリング（framer-motion useSpring）を最終値へ確定させる
// - html[data-vrt-capture] : CSS アニメーションを先頭フレームで停止する
// - MutationObserver + SMIL: SVG 内の <animate> は CSS からも WAAPI からも止められないため、
//                            svg が生えた時点で pauseAnimations() する
const INIT_SCRIPT = () => {
  window.__VRT_CAPTURE__ = true
  const mark = () => document.documentElement.setAttribute('data-vrt-capture', 'true')
  if (document.documentElement) mark()
  document.addEventListener('DOMContentLoaded', mark)

  // Math.random を決定的な擬似乱数（mulberry32）に差し替える。
  // スケルトンの幅（LoadingZone）や story のフィクスチャなど、
  // アニメーションではなく「描画内容そのもの」が毎回変わる箇所があるため。
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

// 撮影直前の静止処理。init script では拾えない「撮影時点で走っているもの」を畳む。
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

// story のマウント完了判定。
// .sb-loader / .sb-previewBlock はマウント後も hidden で DOM に残るため存在判定に使えない。
const isMounted = () => {
  const root = document.querySelector('#storybook-root')
  return (
    Boolean(root) &&
    root.childElementCount > 0 &&
    document.body.classList.contains('sb-show-main')
  )
}

// story id をファイル名にする。日本語部分は非 ASCII が潰れて衝突しうるので、
// 潰した名前に id の短いハッシュを添えて一意性を保証する。
const fileNameOf = (id) => {
  const ascii = id.replace(/[^\w.-]/g, '_').replace(/_+/g, '_')
  const digest = createHash('sha1').update(id).digest('hex').slice(0, 8)
  return `${ascii}-${digest}`
}

const startServer = async () => {
  const server = createServer(async (req, res) => {
    try {
      const path = decodeURIComponent(req.url.split('?')[0])
      const file = join(ROOT, normalize(path === '/' ? '/index.html' : path))
      if (!file.startsWith(ROOT)) {
        res.writeHead(403)
        res.end('forbidden')
        return
      }
      const body = await readFile(file)
      res.writeHead(200, {
        'content-type': MIME[extname(file)] ?? 'application/octet-stream',
      })
      res.end(body)
    } catch {
      res.writeHead(404)
      res.end('not found')
    }
  })
  await new Promise((done) => server.listen(0, '127.0.0.1', done))
  return { server, port: server.address().port }
}

const capture = async (page, url) => {
  await page.goto(url, { waitUntil: 'load' })
  await page.waitForFunction(isMounted, null, { timeout: 30_000 })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(400)
  await page.evaluate(settle)
  await page.waitForTimeout(80)
  return page.screenshot()
}

const main = async () => {
  let index
  try {
    index = JSON.parse(await readFile(join(ROOT, 'index.json'), 'utf8'))
  } catch {
    console.error(
      'storybook-static/index.json が見つかりません。先に storybook:build を実行してください。'
    )
    process.exit(1)
  }

  const pattern = FILTER ? new RegExp(FILTER) : null
  const stories = Object.values(index.entries)
    .filter((entry) => entry.type === 'story')
    .filter((entry) => !pattern || pattern.test(entry.id))
  if (stories.length === 0) {
    console.error('撮影対象の story がありません。')
    process.exit(1)
  }

  if (!REPEAT) {
    await rm(OUT, { recursive: true, force: true })
    await mkdir(OUT, { recursive: true })
  }

  const { server, port } = await startServer()
  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: VIEWPORT,
    reducedMotion: 'reduce',
  })
  await context.addInitScript(INIT_SCRIPT)
  // 時刻を固定して進めない。context 単位で 1 度だけ（page ごとに呼ぶと 2 回目が失敗する）。
  await context.clock.install({ time: FIXED_TIME })
  await context.clock.pauseAt(FIXED_TIME)

  const queue = [...stories]
  const failed = []
  const unstable = []
  let done = 0

  const worker = async () => {
    const page = await context.newPage()
    while (queue.length > 0) {
      const story = queue.shift()
      const url = `http://127.0.0.1:${port}/iframe.html?id=${encodeURIComponent(story.id)}&viewMode=story`
      try {
        const first = await capture(page, url)
        if (REPEAT) {
          const second = await capture(page, url)
          const a = createHash('sha1').update(first).digest('hex')
          const b = createHash('sha1').update(second).digest('hex')
          if (a !== b) unstable.push(story.id)
        } else {
          await writeFile(join(OUT, `${fileNameOf(story.id)}.png`), first)
        }
      } catch (error) {
        failed.push({ id: story.id, message: error.message.split('\n')[0] })
      }
      done += 1
      if (done % 50 === 0) console.log(`  ${done}/${stories.length}`)
    }
    await page.close()
  }

  const startedAt = Date.now()
  await Promise.all(Array.from({ length: Math.max(1, CONCURRENCY) }, worker))
  const elapsed = Date.now() - startedAt

  await context.close()
  await browser.close()
  server.close()

  const seconds = (elapsed / 1000).toFixed(0)
  console.log(
    `\n${stories.length} stories / ${seconds}s (${Math.round(elapsed / stories.length)}ms per story)`
  )
  if (!REPEAT) console.log(`出力: ${OUT}`)

  if (failed.length > 0) {
    console.error(`\n撮影失敗 ${failed.length} 件:`)
    failed.slice(0, 20).forEach((f) => console.error(`  ${f.id}: ${f.message}`))
  }
  if (REPEAT) {
    if (unstable.length > 0) {
      console.error(`\n不安定 ${unstable.length} 件（2 回撮って差分あり）:`)
      unstable.forEach((id) => console.error(`  ${id}`))
    } else {
      console.log('\n2 回撮って全件差分なし')
    }
  }

  // exitCode で返す（process.exit だと stdout の flush 前に落ちて出力が欠けることがある）
  if (failed.length > 0 || unstable.length > 0) process.exitCode = 1
}

await main()
