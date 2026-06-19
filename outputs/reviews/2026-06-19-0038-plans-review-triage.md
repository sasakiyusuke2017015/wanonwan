# Plans 横断レビュー・トリアージ

| 項目 | 値 |
|---|---|
| 種別 | Plan 群のレビュー優先度整理 + 先行レビュー指摘 |
| 対象 | `outputs/plans` の未レビュー/レビュー待ち Plan |
| 判定 | **AI / 添付は NEEDS WORK。async-jobs は runtime 検証待ちの APPROVE 寄り。** |

## レビューを入れる価値が高い Plan

| 優先 | Plan | 理由 | 推奨 |
|---|---|---|---|
| P0 | [AI 機能: 面談メンター提案 + 自由記述の要約/分析](../plans/2026-06-18-1900-ai-pgvector-mentor-summary.md) | HR データの外部送信。Plan 上の承認ブロッカーと実装済みステータスが衝突。 | 個別レビュー **NEEDS WORK** |
| P0 | [添付ファイル基盤](../plans/2026-06-18-1330-attachments-minio.md) | presigned upload の complete/置換ライフサイクルに実害のある穴あり。 | 個別コードレビュー **NEEDS WORK** |
| P1 | [非同期/定期ジョブ基盤](../plans/2026-06-18-2030-async-jobs-pgmq-pgcron.md) | DB/worker/CD に跨るが、現状の設計とコードは概ね Plan と整合。runtime 検証未了。 | Plan review は APPROVE 寄り、runtime 後にコードレビュー |
| P2 | [管理一覧のフィルタ/ソート + StatisticPanel](../plans/2026-06-18-1115-admin-list-filter-sort-stats.md) | client-side UI/純関数中心で低めのリスク。 | 通常コードレビュー |
| P2 | [フォームのフィールド単位 valibot エラー表示](../plans/2026-06-17-2240-form-field-level-errors.md) | Phase 3 PR マージ前。影響範囲はフォーム表示。 | 通常コードレビュー |
| P2 | [API 堅牢化: ESLint + import ガード](../plans/2026-06-17-2210-api-hardening-lint-guard.md) | Phase 1 実装済み。guard が CI で効くかを見る価値あり。 | Phase 1 コードレビュー |

## 先行 Findings

### [BLOCKER] AI Plan の承認ブロッカーと実装済みステータスが矛盾している

- Plan は「決まるまで実装着手しない」と明記している（Plan line 41）一方、同じ Plan の status は `Phase A` / `Phase B` を実装済みにしている（Plan lines 128, 131）。
- さらに `apps/web/lib/ai/client.ts:5` では「env にキーを入れる行為 = 組織承認」と扱っているが、`scripts/check-secrets.mjs` には `ANTHROPIC_API_KEY` と承認状態の対応を検証するガードがない。
- 事故パターン: stg/prod にテスト目的で `ANTHROPIC_API_KEY` が入ると、`summary` / `mentor` API は即座に従業員面談データを Claude に送れる状態になる。

**推奨**: Plan を「実装は disabled-by-default なら先行可」に改訂して承認状態を明記するか、コード側に `AI_EXTERNAL_PROCESSING_APPROVED=true` のような明示 gate を追加し、key だけでは有効化しない。stg/prod の check-secrets でも `ANTHROPIC_API_KEY` があるのに承認 gate が無い状態を拒否する。

### [HIGH] AI 送信データの最小化/マスキングが未実装

- `summary` は `interview_memo` と `next_action` を連結してそのまま Claude へ送る（`apps/web/app/api/v1/answers/[id]/summary/route.ts:39` → `apps/web/lib/ai/summarize.ts:27`）。
- `mentor` は対象面談に加え、類似過去面談の `interview_memo` 最大 3 件をそのまま prompt に含める（`apps/web/app/api/v1/answers/[id]/mentor/route.ts:45`, `:93`, `apps/web/lib/ai/mentor.ts:14-16`）。
- Plan §3.1 / §6 では送信範囲の最小化・マスキングが承認論点になっているが、実装は「送る/送らない」の gate が中心で、送る内容の削減処理はない。

**推奨**: 承認前は現状維持で無効。承認後に有効化する場合も、prompt 構築前に個人識別子・健康/評価につながる記述の扱いを決め、送信する field/文字数/類似件数を Plan に固定する。

### [HIGH] 添付 complete が実オブジェクトを検証せず、クライアント申告だけで `status=200` にできる

- complete API は `sizeBytes` だけを受け取り（`apps/web/app/api/v1/attachments/[id]/route.ts:24`）、MinIO の `HEAD` で存在・Content-Length・Content-Type を確認せずに `status = 200` へ更新している（`:37-40`）。
- presigned PUT 側も `ContentType` を署名に入れるだけで、最大サイズや MIME allowlist は実装されていない（`apps/web/lib/storage/presign.ts:34-45`）。
- Plan §3/§6 は「complete で size/content-type 検証」「許可 MIME / 最大サイズ」を緩和策にしているため、現コードは Plan の受け入れ基準を満たしていない。

**推奨**: complete 時に `HeadObject` して `ContentLength` / `ContentType` を DB へ反映し、未存在・型不一致・上限超過は 4xx にする。presign 時にも allowed MIME / max size を server-side の設定として固定する。

### [HIGH] アバター置換で、新規 upload 未完了でも既存 avatar が消える

- `POST /api/v1/attachments` は `entityType === "user_avatar"` のとき、既存 avatar 行を先に削除してから新しい仮メタデータを作る（`apps/web/app/api/v1/attachments/route.ts:33-43`）。
- その後ブラウザ upload が失敗/放置されると、新 avatar は `status=100` のまま、旧 avatar は DELETE trigger + worker で本体削除対象になる。
- 結果として「アバター変更を開始しただけ」で既存 avatar を失う。

**推奨**: 新 avatar は pending として作成し、upload complete の transaction で旧 `status=200` avatar を削除して新 row を current にする。少なくとも旧 avatar 削除は complete 成功後へ移す。

### [MEDIUM] 未完了添付が一覧/ダウンロード対象に混ざる

- 添付一覧は `status` を返すが `status=200` に絞っていない（`apps/web/app/api/v1/attachments/route.ts:69-73`）。
- download URL 発行も `id` のみで引き、`status=200` を要求していない（`apps/web/app/api/v1/attachments/[id]/route.ts:15-20`）。
- upload 放置や complete 前の row が UI に出たり、存在しない object の presigned GET を返したりする。

**推奨**: 通常一覧/GET は `status=200` のみ。pending を UI で出すなら別 API/別表示として扱う。

## 補足

`async-jobs-pgmq-pgcron` は、`85_jobs.sql` / `86_attachment_gc_queue.sql` / `apps/worker` を読む限り、Plan の制約（pg_cron は SQL のみ、MinIO は worker、DELETE trigger で enqueue）と大きな齟齬は見当たらない。未完了の runtime 検証（cron 登録、実削除、worker drain、stg 起動）を Plan どおり完了してから最終 approve が妥当。
