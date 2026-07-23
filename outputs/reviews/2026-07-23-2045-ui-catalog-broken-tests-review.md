# Review: packages/ui の既存テスト 13 失敗の解消（コードレビュー）

| 項目 | 値 |
|---|---|
| 作成日時 | 2026-07-23 20:45 JST |
| レビュアー | Claude Code（code-reviewer サブエージェント） |
| 対象 Plan | [`plans/2026-07-23-2023-ui-catalog-broken-tests.md`](../plans/2026-07-23-2023-ui-catalog-broken-tests.md) |
| 対象 | ブランチ `fix/ui-catalog-broken-tests` の未 commit 差分（7 ファイル） |
| ブランチ | `fix/ui-catalog-broken-tests` |
| 関連 PR | TBD |
| レビュー種別 | 実装 |
| verdict | **APPROVE** |

## サマリ

失敗 13 件に対する A（jest-dom の色正規化）/ B（旧 API・旧マークアップ追随）/ C（jsdom polyfill）の
3 分類修正をレビューした。主眼は「テストを甘くして実バグを塗り潰していないか」。実装側の該当コード
（`Toggle.tsx` / `TabBar.tsx` / `LoadingOverlay.tsx` / `Icon.tsx` / `Spinner.tsx` /
`useInfiniteTimeline.ts`）と vitest 設定を突き合わせた結果、実装欠陥を隠している修正は無く、
B の 8 件はいずれも「実装が意図的に移行済み・テストが旧仕様を見ていた」で説明がつく。BLOCKER なし。

## 判定スコープ

| 軸 | 判定 |
|---|---|
| 最終判定 | APPROVE |
| Plan 判定 | APPROVE |
| 実装判定 | APPROVE |
| 記録整理 | FOLLOW-UP → 対応済み |

## 検証したこと

| 観点 | 結果 |
|---|---|
| 6 スイートが実際に緑か | 6 files / 47 tests すべて pass |
| `data-size` の副作用 | SCSS / CSS に `[data-size]` セレクタは**1 件も存在しない**（属性追加でスタイルは変化しない）。`Button` / `Input` / `TextArea` / `Segment` が既に同じ規約を持ち命名も整合 |
| `Toggle` の外部消費者 | `data-component="toggle"` の参照は自身とテストのみ。apps/web からの参照なし |
| `LoadingOverlay` の分岐 | `preset` 指定時のみ `Icon`、未指定は `Spinner` にフォールバック。`accentBgColor` は `Icon` の `style.color` にのみ渡る。テストのコメントと実装が一致 |
| `Icon` の出力契約 | 独自 SVG / lucide の双方で `data-component="icon"` を出力。`width={resolvedSize}` なので `iconSize={100}` → `width="100"` は実装契約どおり |
| `Spinner` が誤検出されないか | `div.animate-spin`（svg ではない）。`svg[data-component="icon"]` は Icon 経路のみを捉えるため、旧テストの `querySelector('svg')` より**厳しくなっている** |
| 色キーワードの残存 | `toHaveStyle` + 色名の組み合わせは他に残存ゼロ |
| polyfill が実バグを隠さないか | `Timeline.test.tsx` の 4 件はすべてレンダリング smoke で、スクロール位置への assert は元々存在しない。no-op 化で失われる検証は無い |
| Plan とスコープの整合 | `data-component` 命名ゆれ統一（スコープ外）に手を入れていない |

## Findings

BLOCKER なし。以下はすべて `[NICE-TO-HAVE]`。

### [NICE-TO-HAVE] TabBar のアサーションが「アクティブ時に配色される」契約の半分を落としている

`data-color={activeColor}` は**全タブに無条件で付与**され、配色が当たるのは SCSS が
`--active` と `[data-color]` を AND した場合のみ。現在のアサーションは非アクティブタブでも
通るため、旧テストが持っていた "アクティブ側" の意味が抜けている。
`classNameStrategy: 'non-scoped'` によりクラス名はリテラル解決されるので低コストで復元できる。

→ **反映済み**: `toHaveClass('tabBar__tab--active')` を併記。

### [NICE-TO-HAVE] `data-size` の付与位置が label の有無でズレる

`label` ありでは外側の `<label>`（サイズクラスを持たない）に付き、`label` なしでは
`styles[size]` を持つ `<span>` 自身に付く。`[data-size]` を見る CSS が無いため機能影響は
無いが、label あり分岐がテスト未カバー。

→ **反映済み**: label 付きのケースを 1 本追加。

### [NICE-TO-HAVE] `it.each` のタプルが恒等で冗長

`['small', 'small']` のように入力と期待値が同値で 2 列目が情報を持っていない。

→ **反映済み**: 1 列に畳んだ。

### [NICE-TO-HAVE] テストコメントの「クラス名はハッシュ化される」が設定と食い違う

`vitest.config.ts` の `css.modules.classNameStrategy: 'non-scoped'` により、テスト環境では
SCSS Modules のクラス名は素の名前で解決される（`Radio.test.tsx` の `toHaveClass('small')` が
通ることで実証済み）。旧テストが壊れた真因は「Tailwind ユーティリティが SCSS Modules 移行で
消えた」ことのみ。`data-size` という結論自体は既存規約と整合しており妥当。

→ **反映済み**: テストコメントと Plan の判断ログを訂正。

### [NICE-TO-HAVE] `accentBgColor` が `preset` 未指定時に黙って無視される

本差分で持ち込まれた問題ではない。既定値 `'#3b82f6'` を持ちながら `preset` 未指定の Spinner
経路では一切参照されず、呼び出し側から「色を渡したのに効かない」不透明な API になっている。
旧テストが spinner の色を見ていたのはこの期待の名残と読める。

→ **Plan の残課題へ記載**（別タスク）。

### [NICE-TO-HAVE] polyfill の `vi.fn()` がテスト間で共有・未リセット

`clearMocks` / `restoreMocks` の指定が無いため呼び出し履歴が横断で蓄積する。現在 assert が
無いので実害は無いが、将来 `toHaveBeenCalledWith` を書いた瞬間に他テストの呼び出しが混ざる。

→ **反映済み**: 素の no-op 関数に変更。

### [NICE-TO-HAVE] テスト名に旧 prop 名 `icon` が残っている

→ **反映済み**: `preset が未指定の場合〜` に統一。

## 記録整理

- Plan のステータスとチェックリストを実態に合わせる（→ 対応済み）
- Plan ヘッダの `Review` 欄に本ファイルを追記し dashboard を再生成（→ 対応済み）
- 判断ログの「ハッシュ化」記述を訂正（→ 対応済み）
- `accentBgColor` の件を残課題へ追記（→ 対応済み）

## 残課題（本 PR スコープ外）

- `data-component` の命名ゆれ（kebab-case 優勢の中に PascalCase）の一括統一
- `packages/ui` に `test` script を足して CI ゲートに載せる件。赤いベースラインが解消され
  「失敗 = 回帰」と即断できる状態になったため、前提条件は揃った
- `useInfiniteTimeline.scrollToDate` のスクロール座標算出に対する単体テスト
