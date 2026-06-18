# 添付ファイル基盤（MinIO + presigned URL）

> ステータス: 🟡 実装中（Phase 1 実装済み / Phase 2-3 残り）
> 由来: 親 Plan §10「MinIO / 添付」（将来検討）の本着手。AI/pgvector は別 Plan で後続。

| 項目 | 値 |
|---|---|
| 一次情報 | [evergreen.md の STORAGE_ENDPOINT 例](../../.claude/rules/evergreen.md#L126) / [dev compose](../../infra/docker-compose.yml) / [data-access.md](../../.claude/rules/data-access.md) / 添付先テーブル: `answers` / interview 関連 / `users` / `survey_publications` |
| 関連 Review | （未） |
| 関連 PR | （未） |

---

## 1. 目的 / 非目的

### 目的

ファイル添付の基盤を作り、4 つの対象に添付できるようにする:
1. **アンケート回答**（回答者が設問へファイル添付）
2. **面談記録**（面談メモに資料添付）
3. **ユーザーのアバター**（1 ユーザー 1 枚）
4. **アンケート添付資料**（管理者が survey/publication に説明資料）

設計は evergreen.md の方針に従い **presigned URL 方式**: API が認可を判定して presigned URL を発行 → **ブラウザが MinIO へ直接 upload/download**。API はメタデータ記録 + 認可ゲートに徹し、ファイル本体は経由しない。

### 非目的

- **画像変換 / サムネイル生成 / ウイルススキャン**（後続）。
- **大容量・マルチパートアップロード**（当面は単発 PUT、上限サイズで制限）。
- **AI/pgvector**（別 Plan）。
- 添付の版管理・履歴（上書き/削除のみ）。

## 2. 現状コンテキスト

- ストレージは**完全に未着手**（compose に MinIO 無し、storage コード・S3 SDK 無し、添付テーブル無し）。
- **設計の意図は evergreen.md に明記**: presigned URL をブラウザから直接叩く前提で `STORAGE_ENDPOINT` は browser-reachable。
- CLAUDE.md「DB アクセスは必ず API 経由」は **DB の話**。ストレージの presigned 方式は「API が認可して URL 発行 → ブラウザが直接 MinIO」で、API が gatekeeper である点は維持される（SDK 直叩きの禁止に反しない）。
- dev compose は `${VAR:-default}` パターン + healthcheck + named volume + `waoon` network。MinIO もこれに倣う。
- 認可は二層（API 層 + RLS）。添付メタデータも RLS 対象テーブルにする。

## 3. 設計判断（要レビュー）

### ストレージ方式
- **MinIO（S3 互換）** を compose に追加。SDK は **`@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner`**（標準・MinIO 互換）。
- **単一バケット `waoon` + キー prefix**（`answers/`・`interviews/`・`avatars/`・`surveys/`）。バケット分割はしない。
- presigned **PUT（upload）** と **GET（download）** を API が発行。TTL 短め（例 5 分）。

### メタデータ（添付テーブル）
- **単一 `attachments` テーブル**（polymorphic）を採用:
  `id / bucket / object_key / filename / content_type / size_bytes / entity_type / entity_id / uploaded_by / created_at`。
  - `entity_type`: `answer` / `interview` / `user_avatar` / `survey`。
  - アバターは `entity_type='user_avatar'` の 1 行（重複は upsert で 1 枚に保つ）。
- **RLS**: `entity_type` ごとに親の可視性へ委譲する helper（例: answer 添付は回答の可視性、interview は面談の可視性、survey は認証ユーザー閲覧/admin write、avatar は本人 + 関係者）。security-definer helper を `90_rls_helpers` 方針で追加。
- 代替案（per-target テーブル）は §6 判断ログ参照。単一表 + 明示 RLS を推奨。

### API（presigned ゲート）
- `POST /api/v1/attachments`（presign-upload）: 認可判定 → object_key 採番 → presigned PUT URL + 仮メタデータ返却。
- `POST /api/v1/attachments/:id/complete`（or upload 後の確定）: アップロード後にメタデータを確定（size/content-type 検証）。
- `GET /api/v1/attachments/:id`（presign-download）: 認可判定 → presigned GET URL を返す（302 or JSON）。
- `DELETE /api/v1/attachments/:id`: 認可判定 → MinIO 削除 + 行削除。
- いずれも `withActiveUser` + RLS。

## 4. 実装ステップ

### Phase 1 — 基盤 + 1 対象（面談記録）でパターン確立
1. **compose（dev）に MinIO 追加**: service + console/api ポート + root creds（env）+ volume + healthcheck。`infra/.env.example` に `MINIO_*` / `STORAGE_ENDPOINT` 追加。起動時バケット作成（mc or 初回 ensure）。
2. **storage lib**（`apps/web/lib/storage/`, server-only）: S3 クライアント、presignPut / presignGet / deleteObject、object_key 採番。**unit test**（SDK をモックし URL 生成・キー規則を検証）。
3. **`attachments` テーブル + RLS**（`outputs/infra-data/schema/`、pgTAP）。
4. **API**: presign-upload / complete / presign-download / delete（interview スコープから）。
5. **UI**: InterviewForm に添付アップロード + 一覧 + 削除。
6. dev で疎通（Docker）—（笹木さん環境で受け入れ、コードは mock test で担保）。

### Phase 2 — 残り 3 対象へ展開
7. アンケート回答（AnswerForm の file 設問 / 添付）、アンケート添付資料（SurveyForm）、ユーザーアバター（UserForm、`user_avatar` 1 枚 upsert + 表示）。各 RLS 追加。

### Phase 3 — stg/prod + nginx
8. stg/prod compose に MinIO（または外部 S3 互換）+ secrets。nginx で `STORAGE_ENDPOINT`（browser-reachable）配線。`check-secrets` に MinIO 鍵追加。backup に bucket dump 方針。

## 5. 検証

- `pnpm --filter @waoon/web test`（storage lib unit test）/ `pnpm test:db`（attachments RLS pgTAP）/ `typecheck` / `lint` green。
- **マージ後（Docker・笹木さん）**: dev で各対象の upload→download→delete、presigned TTL 切れ、非権限ユーザーが他人の添付 URL を取得できない（403）、アバター上書きが 1 枚を保つ。

## 6. リスクと緩和

| リスク | 影響 | 緩和 |
|---|---|---|
| presigned 直アクセスと「API 一本化」方針の解釈衝突 | 方針違反に見える | API が認可判定 + URL 発行 + メタ記録の gatekeeper である点を明記（evergreen.md の設計に準拠）。本体だけ直接転送 |
| polymorphic `attachments` の RLS が複雑 | 認可漏れ | `entity_type` ごとに親可視性へ委譲する security-definer helper を個別に書き、pgTAP で全 type を網羅検証。曖昧なら per-target テーブルへ切替（判断ログ） |
| `STORAGE_ENDPOINT` が内部ホスト名だとブラウザから引けない | upload/download 失敗 | dev は `localhost:9000`、stg/prod は nginx 経由の公開ホスト。env で分離（evergreen の制約コメントを実装にも残す） |
| 確定前の孤児オブジェクト（presign したが complete されない） | ゴミ蓄積 | complete されない仮行/オブジェクトを pg_cron で定期掃除（非同期通知 Plan と同じ pgmq/pg_cron 基盤・別途）。当面は手動/TTL |
| アップロードサイズ・型の悪用 | ストレージ濫用 | presign 時に content-type / 最大サイズを条件付け、complete で実測検証。許可 MIME のホワイトリスト |

## 7. 判断ログ

| 日付 | 決定 | 理由 |
|---|---|---|
| 2026-06-18 | presigned URL 方式（ブラウザ直 upload/download）。API は認可+メタのみ | evergreen.md の既定設計。ファイル本体を Next 経由にすると重く、API 一本化は「認可ゲート」の意味で維持される |
| 2026-06-18 | 単一 `attachments` テーブル（polymorphic）+ entity_type 別 RLS を推奨 | API/UI を 1 系統に集約できる。RLS は helper で親可視性へ委譲。per-target 分割は表/コード増で保守コスト高 |
| 2026-06-18 | SDK は `@aws-sdk/client-s3`（+ presigner） | S3 標準・MinIO 互換・presigned 生成が公式サポート。`minio` 専用 SDK より移植性が高い |
| 2026-06-18 | 単一バケット + prefix、バケット分割しない | 運用簡素。可視性は RLS（メタ側）で担保、object_key は推測不能な採番 |
| 2026-06-18 | Phase 1 は面談記録 1 対象でパターン確立 → 横展開 | 4 対象同時は RLS/UI が広い。1 経路を pgTAP/test で固めてから増分 |

## 8. ステータス

- [x] Plan ドラフト完成（本ファイル）
- [x] 計画レビュー / 笹木さん承認（2026-06-18 承認）
- [x] Phase 1 実装（MinIO compose + storage lib(unit test 3) + attachments 表/RLS + pgTAP(4) + interview API 5本 + InterviewForm 添付 UI）。typecheck/lint/web test green。pgTAP は CI、実 upload/download は Docker・笹木さん
- [ ] Phase 1 コードレビュー
- [ ] Phase 2（回答 / 資料 / アバター）
- [ ] Phase 3（stg/prod + nginx）
- [ ] マージ後検証（Docker・笹木さん）
