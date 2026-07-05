# Review: カタログ堅牢化（MarkdownPreview XSS 修正 + モーダル focus-trap / ARIA）

| 項目 | 値 |
|---|---|
| 作成日時 | 2026-07-05 08:40 JST |
| レビュアー | Codex |
| 対象 Plan | [`plans/2026-07-05-0835-ui-catalog-hardening.md`](../plans/2026-07-05-0835-ui-catalog-hardening.md) |
| レビュー種別 | 計画レビュー |

## 判定

| 軸 | 判定 | スコープ / 意味 |
|---|---|---|
| 最終判定 | **APPROVE** | BLOCKER はなし。MarkdownPreview の XSS 封じとモーダル a11y 改善は catalog 層の局所変更として妥当で、実装着手できる |
| Plan 判定 | **APPROVE** | 目的・スコープ・非目標・リスク整理はいずれもテーマ2として適切。NICE-TO-HAVE は実装時の補強で足りる |
| 実装判定 | N/A | 本 Review は計画のみ。実装コードは未レビュー |
| 記録整理 | OK | 対象 Plan へのリンク、判断ログ、検証観点は揃っている |

## Findings

BLOCKER はありません。以下はすべて [NICE-TO-HAVE] で、差し戻し理由にはしません。

| 重大度 | 位置 | 指摘 | 推奨修正 |
|---|---|---|---|
| [NICE-TO-HAVE] MEDIUM N-1 | Plan 検証: [`ui-catalog-hardening.md` lines 89-93](../plans/2026-07-05-0835-ui-catalog-hardening.md#L89-L93) | MarkdownPreview の XSS 固定は unit test 方針まで書けているが、packages/ui の通常 Vitest 実行コマンドが Plan に明記されていない。現行 package は `vitest.config.ts` と既存 `*.test.tsx` を持つ一方、script は `test:storybook` のみなので、実装者が `pnpm lint` / web test だけで終えると sanitize 回帰テストが走らない可能性がある | 検証に `pnpm --filter @ui-catalog/core exec vitest run` を追加する。可能なら `packages/ui/package.json` に `test: "vitest run"` を追加する判断も Plan に追記する |
| [NICE-TO-HAVE] LOW N-2 | Plan 実装計画 Step 3-4: [`ui-catalog-hardening.md` lines 78-85](../plans/2026-07-05-0835-ui-catalog-hardening.md#L78-L85) | 「初期フォーカスはキャンセルボタン」は破壊的 ConfirmDialog では妥当だが、AlertDialog / Modal / EventModal にはキャンセルボタンが無い場合がある。Step 4 の「同処置」だけだと、EventModal の既存タイトル入力 focus などをどう扱うかが少し曖昧 | 初期フォーカス方針を component 別に 1 行足す。例: ConfirmDialog はキャンセル、AlertDialog は閉じる/OK、Modal は閉じるボタンまたは `initialFocusRef`、EventModal は既存どおりタイトル入力（不可なら close/fallback） |
| [NICE-TO-HAVE] LOW N-3 | Plan リスク: [`ui-catalog-hardening.md` lines 101-109](../plans/2026-07-05-0835-ui-catalog-hardening.md#L101-L109) / 手動確認: [`lines 94-100`](../plans/2026-07-05-0835-ui-catalog-hardening.md#L94-L100) | EventModal を同 PR に含めつつ分離可能にする判断は妥当。ただ、dnd-kit / MonthView との干渉判定が「問題があれば」だけだと少し主観的 | 手動確認に EventModal 固有の成功条件を足す。例: 月表示の日付クリックで新規作成、既存イベント編集、保存/削除、バックドロップ/Esc close、モバイル full-screen 表示で Tab 循環が成立すること |

## 妥当性レビュー

- XSS 修正と a11y 改善を 1 PR に束ねる判断は妥当。どちらも `packages/ui/core/organisms` 内の局所変更で、apps/web 側の利用コード変更を前提にしない。影響範囲も Plan の利用箇所表で把握できている。
- MarkdownPreview を apps/web 未使用の段階で catalog 層で塞ぐ判断は妥当。現行実装は `marked.parse()` の出力と catch 節の HTML をそのまま `dangerouslySetInnerHTML` に渡しており、将来使った瞬間に stored XSS 化するリスクがある。
- `isomorphic-dompurify` / `focus-trap-react` を peerDependencies ではなく dependencies に置く判断は妥当。sanitize と focus-trap は部品内部の安全性・アクセシビリティ実装であり、利用側 app に導入判断を漏らさない方が catalog の責務に合う。
- 初期フォーカスをキャンセルボタンへ置く判断は、破壊的確認では妥当。テーマ1で削除 ConfirmDialog が増えたため、誤確定を避ける保守的な default として筋がよい。
- EventModal を同 PR に含める判断も許容できる。apps/web の実利用が ScheduleCalendar に限られ、Plan が干渉時の別 PR 分離をリスク対応として持っているため、最初から分割する必要は薄い。
- 非目標の切り方は妥当。DropdownMenu / ContextMenu / EventPopover など非モーダル系と InteractiveTable キーボードナビは別の操作体系であり、今回の modal hardening に混ぜない方がレビューしやすい。

## 次に進む道

1. Plan は承認扱いで実装に進めてよい。
2. 実装時に N-1〜N-3 を小さく拾う。特に MarkdownPreview の XSS 回帰テストは security fix の核なので、packages/ui 側で実行できるコマンドまで残したい。
3. コードレビューでは sanitize の対象（通常 parse / catch fallback）、Dialog wrapper への波及、FocusTrap の Esc/backdrop/return focus、EventModal の既存 title focus / dnd 操作への干渉を重点確認する。

## 検証（この Review 自体の）

- [x] 対象 Plan を確認
- [x] 既存計画レビューの形式を確認
- [x] `.claude/rules/plan-review-workflow.md` と CLAUDE.md の関連方針を確認
- [x] MarkdownPreview / Dialog / Modal / EventModal の現状実装を確認
- [x] apps/web の利用箇所（ThemeSettingsModal / ConfirmDialog 利用箇所 / ScheduleCalendar）を確認
- [x] packages/ui の Vitest / Storybook / a11y addon 周辺を確認
- [ ] 実装コードの typecheck / lint / test は未実施（計画レビューのため）

verdict: APPROVE
