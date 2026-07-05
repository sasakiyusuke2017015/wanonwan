# Review: DataTable 移植（ai_edu 版）+ admin 一覧の乗り換え

| 項目 | 値 |
|---|---|
| 作成日時 | 2026-07-05 09:25 JST |
| レビュアー | Codex |
| 対象 Plan | [`plans/2026-07-05-0920-datatable-port.md`](../plans/2026-07-05-0920-datatable-port.md) |
| レビュー種別 | 計画レビュー |

## 判定

| 軸 | 判定 | スコープ / 意味 |
|---|---|---|
| 最終判定 | **APPROVE** | BLOCKER はなし。organism ごと移植、2 PR 分割、InteractiveTable との役割分離、テーマ差分の扱いはいずれも妥当で、実装に進めてよい |
| Plan 判定 | **APPROVE** | スコープ・非目標・リスク・検証観点は概ね揃っている。下記 NICE-TO-HAVE は実装時の明確化で足りる |
| 実装判定 | N/A | 本 Review は計画のみ。実装コードは未レビュー |
| 記録整理 | OK | 対象 Plan へのリンク、判断ログ、PR-A/PR-B の責務分離、ステータスは整理されている |

## Findings

BLOCKER はありません。以下はすべて [NICE-TO-HAVE] で、差し戻し理由にはしません。

| 重大度 | 位置 | 指摘 | 推奨修正 |
|---|---|---|---|
| [NICE-TO-HAVE] MEDIUM N-1 | PR-B 完了条件: [`datatable-port.md` lines 62-66](../plans/2026-07-05-0920-datatable-port.md#L62-L66) / 手動確認: [`lines 88-94`](../plans/2026-07-05-0920-datatable-port.md#L88-L94) | Plan は apps/web の InteractiveTable 参照ゼロと admin 4 一覧 + マスタ画面乗り換えを完了条件にしているが、PR-B の手動確認は admin 4 一覧だけに見える。MasterListView 経由の org×3 / positions / urgencies も今回の乗り換え対象なので、型チェックだけだと画面単位の退行を見落としやすい | PR-B 検証に `rg -n "InteractiveTable" apps/web` が 0 件になること、MasterListView 系 5 画面の表示・検索・行クリック遷移を確認することを追記する。設問マスタを admin 4 側にもマスタ側にも数える場合は、ユニーク画面数も明記するとよい |
| [NICE-TO-HAVE] LOW N-2 | PR-B scope: [`datatable-port.md` line 72](../plans/2026-07-05-0920-datatable-port.md#L72) | リトライ導線の方針は妥当だが、現行 AdminListTable は `error` 文字列だけを受け取り、各一覧ページの `useQuery` から `refetch` を渡していない。Plan 上で adapter API が省略されているため、実装時に「ボタン表示だけで再取得できない」形に寄る余地が少しある | `AdminListTable` に `onRetry?: () => void` などの props を追加し、users/surveys/answers/questions と MasterListView から `refetch` を渡す、と 1 行追記する |
| [NICE-TO-HAVE] LOW N-3 | PR-A tokens: [`datatable-port.md` lines 56-58](../plans/2026-07-05-0920-datatable-port.md#L56-L58) / theme risk: [`line 100`](../plans/2026-07-05-0920-datatable-port.md#L100) | テーマ供給経路の違いを最大リスクとして扱っている点はよい。一方で PR-A を「アプリ側変更ゼロ」と位置づけるなら、tokens/Tailwind 補完は既存値の上書きではなく additive に限ること、追従しない場合の CSS 変数注入層が catalog 側か AdminListTable 側かを決めておくとレビューしやすい | トークン補完は未定義追加のみ、既存トークン差し替えが必要なら判断ログに残す、CSS 変数注入は DataTable wrapper か AdminListTable adapter のどちらで行うかを実装前に固定する |

## 妥当性レビュー

- organism ごと移植する判断は妥当。現行 waoon の `DataTable` は string[][] 前提の簡易版で、apps/web からの参照は見当たらない。部分移植や独自再実装より、ai_edu で稼働済みの構成とテストを保ったまま持ち込む方が、今回の一覧 UX 改善には合っている。
- PR-A / PR-B の分割も妥当。PR-A は catalog の移植・exports・tokens・テスト green に閉じ、PR-B で AdminListTable adapter とアプリ画面移行に集中できる。5,600 行規模の移植とアプリ挙動変更を同一 PR に混ぜない判断はレビュー可能性の面で正しい。
- 「一本化」をアプリ利用レベルで行い、InteractiveTable のセル選択・列リサイズ・仮想化を DataTable に吸収しない判断は妥当。現行 apps/web の InteractiveTable 依存は AdminListTable と型 import に集約されており、adapter 置換で目的は達成できる。表計算用の機能を一覧用 DataTable に足すと責務が太りすぎる。
- テーマ供給経路の違いを最大リスクとして明示し、PR-A 完了条件にテーマ切替追従確認を置いている点は妥当。waoon は `useTheme()` で runtime props を渡す箇所が多く、DataTable が CSS 変数駆動なら、実機・Storybook で computed style まで見る価値がある。
- ServerDataTable を移植しつつアプリ採用を見送る判断も妥当。現行の管理一覧は client-side TanStack Query で全件取得しており、API の limit/offset 化を今回に混ぜると PR-B の目的が膨らむ。upstream parity は保ち、採用判断だけ遅らせるのが現実的。

## 検証（この Review 自体の）

- [x] 対象 Plan を確認
- [x] 既存計画レビュー形式と Plan / Review workflow を確認
- [x] 現行 `DataTable` が apps/web で未使用であることを `rg` で確認
- [x] apps/web の InteractiveTable 参照が AdminListTable / 型 import / MasterListView 経由に集約されていることを確認
- [x] `packages/ui` / `apps/web` の package scripts と主要依存を確認
- [x] テーマ供給経路（`useTheme()` runtime props と `tokens.css` import）を確認
- [ ] 実装コードの typecheck / lint / test は未実施（計画レビューのため）

verdict: APPROVE
