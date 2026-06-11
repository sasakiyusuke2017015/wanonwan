---
description: Playwright で E2E テストを生成・実行する。テストジャーニーの作成、テスト実行、スクリーンショット / 動画 / トレースの保存、アーティファクトのアップロードまで行う。
---

# E2E Command

このコマンドは **e2e-runner** Agent を起動して、Playwright を使った E2E テストを生成 / 保守 / 実行する。

## このコマンドがやること

1. **テストジャーニー生成** — ユーザーフローに対する Playwright テストを作成
2. **E2E テスト実行** — 複数ブラウザでテストを実行
3. **アーティファクト保存** — 失敗時のスクリーンショット / 動画 / トレース
4. **結果アップロード** — HTML レポートと JUnit XML
5. **フレーキーテスト特定** — 不安定なテストを quarantine

## 使うタイミング

`/e2e` を使う場面:
- クリティカルなユーザージャーニーのテスト (ログイン、取引、決済)
- 複数ステップのフローが end-to-end で動くか検証
- UI 操作 / ナビゲーションのテスト
- フロントエンドとバックエンドの連携検証
- 本番デプロイの準備

## 動作の流れ

e2e-runner Agent は以下を行う:

1. ユーザーフローを **分析** し、テストシナリオを特定
2. Page Object Model パターンで **Playwright テストを生成**
3. 複数ブラウザ (Chrome / Firefox / Safari) で **テスト実行**
4. 失敗時に スクリーンショット / 動画 / トレースを **保存**
5. 結果とアーティファクト付きの **レポート生成**
6. フレーキーテストを特定し、修正案を提案

## 使用例

```
User: /e2e マーケット検索 & 詳細表示フローをテストして

Agent (e2e-runner):
# E2E テスト生成: Market Search and View Flow

## テストシナリオ

**ユーザージャーニー:** マーケット検索 → 結果表示 → マーケットクリック → 詳細表示

**テストカバレッジ:**
1. マーケットページに遷移
2. セマンティック検索を実行
3. 検索結果を検証
4. 最初の結果をクリック
5. マーケット詳細ページがロードされることを検証
6. チャートがレンダリングされることを検証

## 生成されたテストコード

```typescript
// tests/e2e/markets/search-and-view.spec.ts
import { test, expect } from '@playwright/test'
import { MarketsPage } from '../../pages/MarketsPage'
import { MarketDetailsPage } from '../../pages/MarketDetailsPage'

test.describe('Market Search and View Flow', () => {
  test('user can search markets and view details', async ({ page }) => {
    // 1. マーケットページに遷移
    const marketsPage = new MarketsPage(page)
    await marketsPage.goto()

    // ページがロードされたか検証
    await expect(page).toHaveTitle(/Markets/)
    await expect(page.locator('h1')).toContainText('Markets')

    // 2. セマンティック検索を実行
    await marketsPage.searchMarkets('election')

    // API レスポンスを待つ
    await page.waitForResponse(resp =>
      resp.url().includes('/api/markets/search') && resp.status() === 200
    )

    // 3. 検索結果を検証
    const marketCards = marketsPage.marketCards
    await expect(marketCards.first()).toBeVisible()
    const resultCount = await marketCards.count()
    expect(resultCount).toBeGreaterThan(0)

    // 検索結果のスクリーンショット
    await page.screenshot({ path: 'artifacts/search-results.png' })

    // 4. 最初の結果をクリック
    const firstMarketTitle = await marketCards.first().textContent()
    await marketCards.first().click()

    // 5. マーケット詳細ページがロードされることを検証
    await expect(page).toHaveURL(/\/markets\/[a-z0-9-]+/)

    const detailsPage = new MarketDetailsPage(page)
    await expect(detailsPage.marketName).toBeVisible()
    await expect(detailsPage.marketDescription).toBeVisible()

    // 6. チャートがレンダリングされることを検証
    await expect(detailsPage.priceChart).toBeVisible()

    // マーケット名が一致することを検証
    const detailsTitle = await detailsPage.marketName.textContent()
    expect(detailsTitle?.toLowerCase()).toContain(
      firstMarketTitle?.toLowerCase().substring(0, 20) || ''
    )

    // 詳細ページのスクリーンショット
    await page.screenshot({ path: 'artifacts/market-details.png' })
  })

  test('search with no results shows empty state', async ({ page }) => {
    const marketsPage = new MarketsPage(page)
    await marketsPage.goto()

    // 存在しないマーケットで検索
    await marketsPage.searchMarkets('xyznonexistentmarket123456')

    // 空状態を検証
    await expect(page.locator('[data-testid="no-results"]')).toBeVisible()
    await expect(page.locator('[data-testid="no-results"]')).toContainText(
      /no.*results|no.*markets/i
    )

    const marketCount = await marketsPage.marketCards.count()
    expect(marketCount).toBe(0)
  })

  test('can clear search and see all markets again', async ({ page }) => {
    const marketsPage = new MarketsPage(page)
    await marketsPage.goto()

    // 初期マーケット数
    const initialCount = await marketsPage.marketCards.count()

    // 検索実行
    await marketsPage.searchMarkets('trump')
    await page.waitForLoadState('networkidle')

    // フィルタ後の結果を検証
    const filteredCount = await marketsPage.marketCards.count()
    expect(filteredCount).toBeLessThan(initialCount)

    // 検索をクリア
    await marketsPage.searchInput.clear()
    await page.waitForLoadState('networkidle')

    // 全マーケットが再表示されることを検証
    const finalCount = await marketsPage.marketCards.count()
    expect(finalCount).toBe(initialCount)
  })
})
```

## テスト実行

```bash
# 生成されたテストを実行
npx playwright test tests/e2e/markets/search-and-view.spec.ts

Running 3 tests using 3 workers

  ✓  [chromium] › search-and-view.spec.ts:5:3 › user can search markets and view details (4.2s)
  ✓  [chromium] › search-and-view.spec.ts:52:3 › search with no results shows empty state (1.8s)
  ✓  [chromium] › search-and-view.spec.ts:67:3 › can clear search and see all markets again (2.9s)

  3 passed (9.1s)

生成されたアーティファクト:
- artifacts/search-results.png
- artifacts/market-details.png
- playwright-report/index.html
```

## テストレポート

```
╔══════════════════════════════════════════════════════════════╗
║                    E2E Test Results                          ║
╠══════════════════════════════════════════════════════════════╣
║ Status:     ✅ ALL TESTS PASSED                              ║
║ Total:      3 tests                                          ║
║ Passed:     3 (100%)                                         ║
║ Failed:     0                                                ║
║ Flaky:      0                                                ║
║ Duration:   9.1s                                             ║
╚══════════════════════════════════════════════════════════════╝

Artifacts:
📸 Screenshots: 2 files
📹 Videos: 0 files (失敗時のみ)
🔍 Traces: 0 files (失敗時のみ)
📊 HTML Report: playwright-report/index.html

レポート表示: npx playwright show-report
```

✅ E2E テストスイートが CI/CD 連携の準備完了!
```

## テストアーティファクト

テスト実行時に以下のアーティファクトが保存される:

**全テスト共通:**
- タイムラインと結果付きの HTML レポート
- CI 連携用 JUnit XML

**失敗時のみ:**
- 失敗時のスクリーンショット
- テストの動画録画
- デバッグ用トレースファイル (ステップごとの再生)
- ネットワークログ
- コンソールログ

## アーティファクトの確認

```bash
# HTML レポートをブラウザで開く
npx playwright show-report

# 特定のトレースファイルを開く
npx playwright show-trace artifacts/trace-abc123.zip

# スクリーンショットは artifacts/ ディレクトリに保存される
open artifacts/search-results.png
```

## フレーキーテスト検出

テストが断続的に失敗する場合:

```
⚠️  FLAKY TEST DETECTED: tests/e2e/markets/trade.spec.ts

Test passed 7/10 runs (70% pass rate)

よくある失敗原因:
"Timeout waiting for element '[data-testid="confirm-btn"]'"

推奨される修正:
1. 明示的に待つ: await page.waitForSelector('[data-testid="confirm-btn"]')
2. タイムアウト延長: { timeout: 10000 }
3. コンポーネント内の競合条件を確認
4. アニメーションで要素が隠れていないか確認

Quarantine の推奨: 修正されるまで test.fixme() でマーク
```

## ブラウザ設定

デフォルトで複数ブラウザで実行される:
- ✅ Chromium (Desktop Chrome)
- ✅ Firefox (Desktop)
- ✅ WebKit (Desktop Safari)
- ✅ Mobile Chrome (任意)

`playwright.config.ts` でブラウザを調整できる。

## CI/CD 連携

CI パイプラインに追加:

```yaml
# .github/workflows/e2e.yml
- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run E2E tests
  run: npx playwright test

- name: Upload artifacts
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## PMX 固有のクリティカルフロー

PMX では、以下の E2E テストを優先する:

**🔴 CRITICAL (常にパスすべき):**
1. ユーザーがウォレットを接続できる
2. マーケットを閲覧できる
3. マーケットを検索できる (セマンティック検索)
4. マーケットの詳細を表示できる
5. 取引できる (テスト資金で)
6. マーケットが正しく決済される
7. 資金を引き出せる

**🟡 IMPORTANT:**
1. マーケット作成フロー
2. ユーザープロフィール更新
3. リアルタイム価格更新
4. チャートのレンダリング
5. マーケットのフィルタとソート
6. モバイルレスポンシブレイアウト

## ベストプラクティス

**DO:**
- ✅ 保守性のため Page Object Model を使う
- ✅ セレクタには data-testid 属性を使う
- ✅ 任意のタイムアウトではなく API レスポンスを待つ
- ✅ クリティカルなユーザージャーニーを end-to-end でテスト
- ✅ main にマージする前にテスト実行
- ✅ テストが失敗したらアーティファクトを確認

**DON'T:**
- ❌ 壊れやすいセレクタを使う (CSS クラスは変わる)
- ❌ 実装詳細をテストする
- ❌ 本番に対してテストを実行する
- ❌ フレーキーテストを無視する
- ❌ 失敗時のアーティファクト確認を省略する
- ❌ 全エッジケースを E2E でテストする (unit test を使う)

## 重要事項

**CRITICAL for PMX:**
- 実際のお金が絡む E2E テストは **必ず** testnet / staging のみで実行
- 取引テストを本番に対して実行しない
- 金融テストには `test.skip(process.env.NODE_ENV === 'production')` を設定
- 少額のテストファンドを持つテストウォレットのみ使用

## 他コマンドとの連携

- `/plan` でテストすべきクリティカルジャーニーを特定する
- `/tdd` で unit test (より高速・粒度が細かい)
- `/e2e` で integration とユーザージャーニーテスト
- `/code-review` でテスト品質を検証

## 関連 Agent

このコマンドが起動する Agent:
`.claude/agents/e2e-runner.md`

## よく使うコマンド

```bash
# 全 E2E テストを実行
npx playwright test

# 特定のテストファイルを実行
npx playwright test tests/e2e/markets/search.spec.ts

# headed モードで実行 (ブラウザを表示)
npx playwright test --headed

# テストをデバッグ
npx playwright test --debug

# テストコードを生成
npx playwright codegen http://localhost:3000

# レポートを表示
npx playwright show-report
```
