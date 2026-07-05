# コードレビュー: 仕上げ Phase 2（公開一覧 UX）

- 対象 Plan: [仕上げ（ページタイトル/公開一覧/ダーク/VRT）](../plans/2026-07-05-2015-finishing-touches.md)
- 対象ブランチ: `feature/public-list-ux`（develop 起点・未コミット作業ツリー）
- レビュー種別: コードレビュー（Phase 2 実装・代行 code-reviewer）
- レビュー方針: `[BLOCKER]` / `[NICE-TO-HAVE]`。現行スタック（Next 16 / React 19 / @ui-catalog/core / TanStack Query）は所与。当差分で変更していない既存コードの bad practice は対象外。

## 最終判定

| 軸 | 判定 | 補足 |
|---|---|---|
| 最終判定 | **APPROVE** | 初回 NEEDS WORK（BLOCKER 1 件）→ 対応後 APPROVE |
| Plan 判定 | N/A | 計画レビューは [2040 review](2026-07-05-2040-finishing-touches-review.md) 済み |
| 実装判定 | APPROVE | ロジック・API 安全性・UI 一貫性・テストすべて確認済み |
| 記録整理 | OK | Plan ステータス / dashboard は同ブランチで更新 |

## 対象スコープ

- `/surveys` 一覧: EmptyState（再読み込み導線付き）/ `SurveyCardSkeleton` グリッド / エラー時再試行（テーマ3 AdminListTable 様式）/ 締切訴求バッジ / 回答状態 3 値化（未回答・下書き=「続きから回答」・回答済み=「回答を見直す」）/ `lg:grid-cols-3` 多カラム
- `/surveys/[publishId]`: 期間・締切・回答状態バッジの再掲、ローディング/エラー体裁を一覧と統一
- API: [me/surveys/route.ts](../../apps/web/app/api/v1/me/surveys/route.ts) の order を `end_at asc nulls last, id desc` に / [detail/route.ts](../../apps/web/app/api/v1/publications/[id]/detail/route.ts) に `start_at`/`end_at` 追加
- lib: [lib/surveys/status.ts](../../apps/web/lib/surveys/status.ts)（`deadlineInfo` / `answerState`・テスト先行）+ [lib/surveys/format.ts](../../apps/web/lib/surveys/format.ts)（`fmtDate`/`fmtPeriod`）
- ui-catalog: SurveyCard に `deadlineLabel`/`deadlineColor` prop 追加、`SurveyCardSkeleton` 新設（stories/test 同梱）、`./organisms/EmptyState` subpath export 追加

## 指摘と対応（初回判定: NEEDS WORK → 対応後判定: APPROVE）

### [BLOCKER] deadlineInfo のテストが UTC（CI 環境）で失敗する — ✅ 対応済み

初回テストは `+09:00` 固定オフセットの ISO 文字列で JST の日付を期待していたが、`deadlineInfo` の日付境界は実行環境ローカル TZ（`getFullYear`/`getMonth`/`getDate`）。CI は ubuntu-latest（UTC）のため `2026-07-05T00:00:00+09:00` が前日扱いになり 1 件 FAIL（レビュアーが実機シミュレーションで確認）。

対応: `TZ` 環境変数の固定は Windows の Node で効かないため、テスト側を TZ 非依存化。日時文字列を全てオフセットなし（= 実行環境ローカル時刻として解釈）に変更し、`now` も同様に構築。UTC / JST / America/New_York の 3 TZ で全境界値（本日締切 / あと1日 / あと3日 / null / 締切超過）が一致することをレビュアーが再確認。`status.ts` に「本日の境界は閲覧者のブラウザのローカル TZ」のコメントを追記。

### [NICE-TO-HAVE] 3 件 — ✅ すべて対応済み

| 指摘 | 対応 |
|---|---|
| `fmt` 日付フォーマッタが両ページに重複 | `lib/surveys/format.ts` に `fmtDate`/`fmtPeriod` を切り出し |
| ローディング/エラー時に空の GRID div が余分に描画 | 一覧本体グリッドを `rows.length > 0 &&` で条件描画 |
| 詳細ページ loading スケルトンの角丸二重指定（`rounded` + inline） | `rounded` クラスを除去し inline `borderRadius` のみに |

## 確認できた良い点（記録）

- `me/surveys` の ORDER BY 変更・`detail` の列追加は RLS/認可に無影響（認可済み行への並び替え・列追加のみ）。
- エラー表示がテーマ3（AdminListTable）と同一様式（`border-dashed border-red-300` + `Button variant="secondary"` 再試行）で一貫。
- `answerState` の 3 値化はドメイン定数（`ANSWER_STATUSES`: 100/200/400/900）と整合。`>= 200` で提出扱い・status null 時は draft フォールバック。
- `satisfies Record<AnswerState, unknown>` で回答状態→カード表示マップの網羅性を型担保。
- `SurveyCardSkeleton` の `composes` は CSS Modules の正当な機能。`aria-hidden` で支援技術から隠蔽。
- `./organisms/EmptyState` subpath export は既存 exports パターンに準拠。

## 実施した検証 / ギャップ

- 実施: 差分全読み、TZ 3 種での境界値実機確認（レビュアー）、`pnpm turbo run typecheck lint build test` 10/10 green、ui 側 SurveyCard/Skeleton テスト 10 件 green（ローカル。CI では ui の test は走らない既知の運用 [[ci-ui-test-exclusion]]）。
- 未実施: dev 起動での実画面確認（空状態/スケルトン/再試行/締切バッジ/下書き導線は笹木さん手動確認）。`me/surveys` の order 変更は HTTP レベルの API テスト基盤が未整備のため SQL 目視 + 型チェックのみ（既存全ルート共通の状況で本 PR 固有のギャップではない）。

## verdict

APPROVE
