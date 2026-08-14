# Plan: packages/ui の既存テスト 13 失敗を解消する

| 項目 | 値 |
|---|---|
| 概要 | packages/ui に長く放置されている 13 テスト失敗（6 スイート）を、原因を 3 分類に切り分けて解消する。CI ゲート外のため気付かれずに溜まっていたもの |
| ステータス | ✅ 検証完了 |
| 前提 Plan | なし |
| PR | [#105](https://github.com/sasakiyusuke2017015/wanonwan/pull/105) |
| Review | [コードレビュー](../reviews/2026-07-23-2045-ui-catalog-broken-tests-review.md) |

## 目的

`packages/ui` の vitest で **13 テスト / 6 スイート**が失敗し続けている状態を解消する。
これまで「develop でも同じ失敗」というベースライン比較で新規失敗ゼロを判定してきたが、
ベースライン自体が赤いままでは回帰検出の網が粗い。全部緑にして、以降は
「失敗 = 回帰」と即断できる状態にする。

## スコープ

### やること

- 失敗 13 件を原因別に分類し、それぞれ適切な層（テスト / 実装 / テスト環境）を直す
- `Toggle` にサイズ検証用の安定した hook（`data-size`）を追加する
- `vitest.setup.ts` に jsdom 未実装 API の polyfill を足す

### やらないこと（スコープ外）

- `data-component` の命名ゆれ（kebab-case 優勢の中に PascalCase が数件）の一括統一。
  横断的な整合作業なので別タスクにする
- `packages/ui` に `test` npm script を足して CI ゲートに入れること。
  本 Plan は「緑にする」までで、ゲート化の是非は別途判断する
- 上流 ui-catalog 由来の部品仕様変更（今回は wanonwan 側のテスト / 環境のみ触る）

## 現状コンテキスト（2026-07-23 時点）

`pnpm --filter @ui-catalog/core exec vitest run` の結果は **13 失敗 / 1465 passed / 6 スイート**。
6 スイートすべて単独実行でも失敗するため、テスト間の汚染ではない。原因は 3 つに分かれる。

### A. `toHaveStyle` が色キーワードを正規化しなくなった（1 件）

`Footer`「style が追加される」。実 DOM は正しく
`style="... background-color: red;"` を出力し、`getComputedStyle().backgroundColor` も
`"rgb(255, 0, 0)"` を返す。にもかかわらず `toHaveStyle({ backgroundColor: 'red' })` は失敗し、
`toHaveStyle({ backgroundColor: 'rgb(255, 0, 0)' })` は通る（実測で確認）。
**jest-dom / jsdom のバージョン更新に伴う挙動変化**であり、実装は正しい。

### B. 実装が移行済みで、テストが旧 API / 旧マークアップを見ている（8 件）

| 対象 | テストの期待 | 実装の現在 |
|---|---|---|
| `Toggle` ×3 | Tailwind の `.w-8` / `.w-11` / `.w-14` | SCSS Modules。幅は 2rem / 2.75rem / 3.5rem = **32 / 44 / 56px で同値** |
| `TabBar` ×1 | `border-blue-500` クラス | `data-color={activeColor}` |
| `LoadingOverlay` ×3 | `icon` prop / `.animate-spin` に `accentBgColor` | prop は `preset`。`accentBgColor` は `Icon` の色に適用 |
| `ToggleableSection` ×1 | `data-component="toggleable-section"` | `data-component="ToggleableSection"` |

いずれも**実装の意図的な移行**で、見た目・寸法は保たれている。テスト側が追随できていない。

### C. jsdom が実装していない API（4 件）

`Timeline` の 4 件はすべて `TypeError: el.scrollTo is not a function`。
`useInfiniteTimeline.ts` が `el.scrollTo({ top, behavior })` を呼ぶが、
**jsdom は `Element.prototype.scrollTo` を実装していない**。実装・テストとも正しく、
テスト環境の穴。

## 実装計画

1. `develop` 起点で `fix/ui-catalog-broken-tests` を作成
2. **A（1 件）**: `Footer.test.tsx` の期待値を `'rgb(255, 0, 0)'` にする。
   色キーワードに依存しない書き方に寄せる
3. **B（8 件）**:
   - `Toggle`: 実装に `data-size={size}` を追加（既存の `data-component` / `data-variant` と
     同じ規約）し、テストは `data-size` を検証する。寸法そのものは SCSS の責務なので
     クラス名ではなく契約属性で見る
   - `TabBar`: `data-color="blue"` を検証する
   - `LoadingOverlay`: `preset` prop に合わせ、`Icon` 描画 / `iconSize` / `accentBgColor` の
     検証を現在の実装契約（`preset` 指定時に `Icon` が出る / 未指定なら `Spinner`）へ書き換える
   - `ToggleableSection`: 実装が出す `"ToggleableSection"` を検証する
     （命名ゆれの統一はスコープ外のため、テストを実態に合わせる）
4. **C（4 件）**: `vitest.setup.ts` に `Element.prototype.scrollTo` / `scrollBy` の
   no-op polyfill を足す（jsdom 未実装分の補完であることをコメントで明示）
5. 検証（下記）→ コードレビュー → PR

## 検証

- `pnpm --filter @ui-catalog/core exec vitest run` が **0 失敗**
- `pnpm turbo run typecheck lint build test`（CI と同一）が成功
- `Toggle` / `TabBar` / `LoadingOverlay` / `ToggleableSection` の Storybook 表示が
  変わらないこと（`data-size` 追加以外に DOM を変えないため、実質は typecheck + テストで担保）

## リスク

| リスク | 影響 | 緩和策 |
|---|---|---|
| テストを実装に合わせるだけで、本当のバグを塗り潰す | 回帰の見逃し | 各件について「実装が正しいこと」を実測で確認してから直す（A は computed style、B は寸法・属性の同値性、C は jsdom の API 不在） |
| `data-size` 追加が既存スタイルに影響 | Toggle の見た目 | 属性追加のみでクラス・スタイルは変えない |
| polyfill が実際のスクロール不具合を隠す | Timeline の回帰 | no-op ではなく呼び出し可能にするだけ。スクロール位置の検証は元々していない |

## 判断ログ

| 日時 | 判断 | 理由 |
|---|---|---|
| 2026-07-23 | 13 件すべて「実装は正しい」と判断し、テスト / テスト環境を直す | testing.md は「テストではなく実装を直す（テスト自体が間違っているケースを除く）」だが、実測の結果 A は jest-dom の挙動変化、B は実装の意図的移行、C は jsdom の API 不在で、いずれも実装側に欠陥が無いことを確認した |
| 2026-07-23 | `Toggle` はクラス名ではなく `data-size` 属性で検証する | 旧テストが見ていた `.w-8` 等の **Tailwind ユーティリティが SCSS Modules 移行で消滅した**ため。`Button` / `Input` / `TextArea` / `Segment` が既に `data-size` を持っており規約として整合する（※当初「クラス名がハッシュ化される」を理由に挙げたが、`vitest.config.ts` は `classNameStrategy: 'non-scoped'` でテスト内はリテラル解決されるため誤り。コードレビューで訂正） |
| 2026-07-23 | `data-component` の命名ゆれ統一はスコープ外 | kebab-case が優勢だが PascalCase も数件あり、横断的な整合作業になる。1 箇所だけ変えると却って不統一が見えにくくなる |

## 残課題

- **`LoadingOverlay.accentBgColor` が `preset` 未指定時に黙って無視される**。既定値 `'#3b82f6'` を
  持ちながら、`preset` 無しの `Spinner` 経路では参照されない（`Spinner` は `variant="info"` 固定）。
  呼び出し側から見て「色を渡したのに効かない」不透明な API。旧テストが spinner の色を見ていたのは
  この期待の名残と思われる。
- `packages/ui` に `test` script を足して **CI ゲートに載せる**件。今回で赤いベースラインが解消し
  「失敗 = 回帰」と即断できる状態になったため、ゲート化の前提は揃った。
- `useInfiniteTimeline.scrollToDate` のスクロール座標算出の検証。jsdom は要素スクロールを
  実装しないため、`scrollTo` の呼び出し引数を assert する形でしか確認できない。
- `data-component` の命名ゆれ（kebab-case 優勢の中に PascalCase が数件）の一括統一。

## ステータス

- [x] 実装（A / B / C）
- [x] 検証（vitest 168 スイート / 1479 テスト全通過・失敗ゼロ / CI parity 10 タスク成功）
- [x] コードレビュー（APPROVE。NICE-TO-HAVE 6 件のうち 5 件を反映）
- [x] PR 作成（#105・CI pass）
- [x] マージ（#105・2026-07-24）
- [x] **マージ後検証**
  - [x] develop 上で `pnpm --filter @ui-catalog/core exec vitest run` が 168 スイート / 1479 passed・失敗ゼロ（2026-08-13）
