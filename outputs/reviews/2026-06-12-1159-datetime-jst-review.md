# コードレビュー: 日時タイムゾーン不整合の修正（JST ⇄ UTC 変換ヘルパ）

- slug: `datetime-jst`
- ブランチ: `feature/datetime-jst`
- 対応 Plan: [outputs/plans/2026-06-11-1730-pleasanter-exit-1on1-rebuild.md](../plans/2026-06-11-1730-pleasanter-exit-1on1-rebuild.md)
- レビュー対象: `apps/web/lib/datetime.ts`（新規）, `apps/web/components/admin/PublicationsEditor.tsx`, `apps/web/components/admin/InterviewForm.tsx`
- レビュー方針: [BLOCKER] / [NICE-TO-HAVE]。BLOCKER 無ければ APPROVE。現行スタック所与、ライブラリ導入は提案しない。

## サマリ

`<input type="datetime-local">`（tz 情報なし・JST 壁時計）を UTC として誤保存していた
9 時間ズレのバグを、JST(+09:00, DST 無し)固定の軽量変換ヘルパで修正する実装。
変換の正しさ・フォールバック・環境非依存性・既存挙動の維持をすべて確認し、
**BLOCKER は無し**。typecheck green。

## 検証した内容

### 1. 変換の正しさ（実機で確認）

node 実行で全ケースを実測し、期待通りであることを確認:

| ケース | 入力 | 出力 |
|---|---|---|
| JST 15:30 → UTC | `2026-06-12T15:30` | `2026-06-12T06:30:00.000Z` ✓ |
| 深夜跨ぎ JST 00:30 → 前日 UTC | `2026-06-12T00:30` | `2026-06-11T15:30:00.000Z` ✓ |
| 往復 06:30Z → 壁時計 | `2026-06-12T06:30:00.000Z` | `2026-06-12T15:30` ✓ |
| 日付繰り上がり 15:30Z → 翌 00:30 | `2026-06-12T15:30:00.000Z` | `2026-06-13T00:30` ✓ |
| 秒付き local の丸め | `2026-06-12T15:30:45` | `2026-06-12T06:30:00.000Z` ✓ |

`utcIsoToJstInput` の `.slice(0,16)` は「+9h ずらした後の UTC ISO 文字列」に対して
行われるため、日付繰り上がり（15:30Z → 翌 00:30）でも日付部が正しく繰り上がる。
切り出しの罠（日付が古いまま時刻だけ進む）には陥っていない。

### 2. 環境非依存性（TZ 非依存）

`TZ=America/New_York` でも `15:30 JST → 06:30Z` / `06:30Z → 15:30` が変わらないことを実測。
- `jstInputToUtcIso`: offset 付き文字列 `...+09:00` を `new Date()` に渡すため、
  パースがローカル TZ に依存しない（ISO 8601 offset 指定は仕様で絶対時刻に確定する）。
- `utcIsoToJstInput`: ms 数値に対して固定オフセットを加算し `toISOString()`（常に UTC 表現）で
  読むため、`getHours()` 系のローカル依存 API を一切使っていない。設計として正しい。

これにより SSR（Node）／ブラウザ／サーバ session timezone のいずれにも依存しない。
**点 5（API/DB 無改修・session timezone 非依存）も妥当**: timestamptz は絶対時刻を受け、
フロントが UTC ISO に正規化済みなので API 層は素通しで正しく保存される。

### 3. フォールバック

`""` / `null` / `undefined` / `"garbage"` / 不正日付（`2026-13-99T99:99`）/ 日付のみ
（`2026-06-12`、time 欠落）すべてで、保存側は `null`・表示/編集側は `""` に収束することを確認。
`Number.isNaN(d.getTime())` ガードが効いており、不正値が API に漏れない。

### 4. 既存挙動の維持（regression なし）

- **payload キー不変**: `startAt` / `endAt` / `interviewAt` のキー名・他フィールドは変更なし。
  変換は値のみに適用されている。
- **空 → null の挙動一致**: 旧 `d.startAt || null` / `f.interviewAt || null` が送っていた
  `null` は、新 `jstInputToUtcIso("")` も `null` を返すため API への送信形は不変。
  API 側 `nz()`（falsy→null）+ valibot `v.optional(v.nullable(v.string()))` のいずれも
  ISO 文字列・null 両方を受理する（`packages/domain/src/publication.ts` / `interview.ts` で確認）。
- **dead code なし**: 旧 `toLocal`（slice 版）は両コンポーネントから完全に削除済み。
  他に slice ベースの日時処理は残っていない（grep 確認）。
- DST 無しの JST を +09:00 固定で扱う前提は日本のドメインとして妥当（点 2）。
- `slice(0,16)` による分精度への丸めは datetime-local の精度と一致しており妥当（点 3）。

### 5. evergreen / 命名

- `datetime.ts` 冒頭コメントは「なぜ変換が要るか（しないと 9h ズレる）」という WHY を
  述べており evergreen 原則に合致。PR 番号や履歴参照なし。
- `PublicationsEditor.tsx` の `draftToPayload` 上のコメントも WHY + 参照先のみで妥当。
- 関数名（`jstInputToUtcIso` / `utcIsoToJstInput` / `formatJstDateTime`）は方向と入出力が
  名前から読め、明快。

## 指摘

### [NICE-TO-HAVE] `JST_OFFSET_MS` 加算による表示の不変条件をコメント補強（任意）

`utcIsoToJstInput` の「+9h ずらした UTC 表現が JST 壁時計と一致する」トリックは既にコメント済みで
十分だが、`.slice(0,16)` が日付繰り上がりを正しく扱える理由（ずらした後の文字列に対して切る）が
非自明。1 行追記すると次の読者が安心できる。必須ではない。

### [NICE-TO-HAVE] `.claude/settings.json` の混在

本ブランチの working tree に `.claude/settings.json`（権限 allowlist 追記）が含まれている。
日時修正とは無関係なので、コミット時はこの機能の commit に巻き込まないことを推奨
（別 commit or 除外）。git-workflow の「テーマ混在を避ける」方針に沿う。コード品質には無影響。

### [NICE-TO-HAVE] 変換ヘルパの単体テスト追加（後続タスク）

検証は手動 node 実行で済んでいるが、深夜跨ぎ・日付繰り上がり・フォールバックは regression が
怖い箇所。`apps/web/lib/datetime.ts` に Vitest を 1 ファイル足しておくと将来の安全網になる。
本 PR のスコープ外として残課題に積んで良い。

## 残課題（後続）

- `datetime.ts` の Vitest 単体テスト（深夜跨ぎ・日付繰り上がり・空/無効）。
- 移行前に誤った instant で保存済みの既存行の補正（本 PR スコープ外・dev は seed のみ）。
- `schedules` 等、今後 datetime-local UI を足す箇所では同ヘルパを使う運用統一。

## 最終判定

- **Plan 判定**: 該当なし（本レビューはコードレビュー）。
- **実装判定**: ✅ APPROVE — CRITICAL / HIGH（BLOCKER）なし。変換の正しさ・環境非依存性・
  フォールバック・既存挙動維持・API 無改修の妥当性をすべて実機で確認。残りは [NICE-TO-HAVE] のみ。
- **記録整理**: 残課題（単体テスト・既存データ補正・運用統一）を上記に列挙済み。

verdict: APPROVE
