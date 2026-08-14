# マージ済み機能の受け入れ検証チェックリスト

> 作成: 2026-06-20 / 対象: develop にマージ済みだが「🟢 検証中」の機能群（[ダッシュボード](../README.md)）。
> コードは全て develop に入っており、残るは **実環境での runtime 検証**。
> 各項目を確認したら `- [ ]` を `- [x]` にする。完了したら [ダッシュボード](../README.md) の該当行を `✅ 検証完了` に昇格。

検証は **2 段構え**:

- **A. ローカル(dev / Docker)** で確認できるもの — まずここを全部通す
- **B. stg / prod 実環境** が要るもの — A 通過後、笹木さんが実環境で確認

---

## 0. 共通の起動（dev スタック）

```bash
# これ 1 本: postgres + gotrue 起動(--wait) → migrate → seed(冪等) → web 前面
pnpm dev:up

# 壊れたら作り直し
pnpm compose:dev:down -v && pnpm dev:up
```

ログイン: `admin@example.com` / `Admin1234!`（管理者）, `alice@example.com` / `Alice1234!`（一般）

UI 以外の確認ポート: MinIO console `http://localhost:9001`（minioadmin/minioadmin）, GoTrue `http://localhost:9999`

- [x] `pnpm dev:up` で web が立ち、`admin@example.com`/`Admin1234!` でログインできる（クリーン作り直しから検証。alice も `isAdmin:false` で 200）
- [x] `pnpm -r typecheck`（現 `turbo run typecheck`）/ web test / `pnpm test:db`(pgTAP 5) が green

---

## A. ローカル(dev / Docker)で確認できるもの

### A-1. 認証: GoTrue 同期 + force-change（Plan: auth-gotrue-sync-force-change）

- [x] admin がユーザーの **email を変更**（PUT `/v1/users/[id]`）→ 新 email でログイン 200 / 旧 email 401
- [x] admin の「パスワードをリセット」（POST `/v1/users/[id]/reset-password`）→ 生成 PW が応答 `initialPassword` に **一度だけ**返る（再取得不可）。`must_change=true` 再設定
- [x] 新規作成ユーザーで初回ログイン → `must_change=true` で業務 API 403（API 層ゲート。`/change-password` のみ通る）
- [x] 正しい現 PW で change-password → 200・`must_change=false`・業務 API 200。誤った現 PW → 401 拒否
- [x] force-change 中の業務 API は 403（`/v1/surveys`・`/v1/dashboard` で確認）

> 検証は使い捨てユーザ verify1 で実施し、終了後 GoTrue + public.users から削除（seed 4 ユーザのみ残）。UI（`/change-password` 画面誘導）は API 層ゲートの 403 で代替確認。

### A-2. 添付ファイル（Plan: attachments-minio / complete-validation）

- [x] interview/answer/survey/user_avatar の各添付で presign→PUT(MinIO 直)→complete(200)→一覧→download(実体一致)→delete が動く
- [x] アンケート回答 / アンケート資料 / ユーザーアバターの各添付も upload→download→delete（上記 4 種で確認）
- [x] **アバター上書き**: user_avatar/1 に 2 枚 → status=200 は 1 件（新 id が残り旧 id は置換削除）
- [x] **非権限ユーザー**が他人の添付 download → **404**（owner alice=200 / 無関係 carol=404。RLS が存在ごと隠す＝404。checklist の 403 より厳しめ）
- [~] presigned URL の **TTL 切れ**後はアクセス不可 → **コード確認のみ**（`expiresInSec=300`。実時間切れ 5 分は未待機）
- [x] complete の実体検証: 不在=**422** / サイズ超過(21MB)=**413** / MIME は presign で **415**（complete 側 415 は防御多重で code 上存在）。size はサーバ実測（complete 応答 `sizeBytes` が実バイト）
- [x] presign 前に MIME allowlist=**415** + 最大 20MB（complete で実測 413）
- [x] 一覧 / download は `status=200` のみ（pending id は一覧に出ず）

> API 経由で検証（admin/alice/carol）。answer/1 の respondent は alice のため owner=alice。検証で作成した添付は全て削除し attachments テーブルは 0 件に復帰。MinIO console 目視は未実施（download 実体一致で代替）。

### A-3. AI 要約 / メンター提案（Plan: ai-pgvector-mentor-summary）

> **前提**: §3.1「HR データ外部送信の組織承認」。承認なしでは A-3 を実行しない。
> 外部送信は **二重ゲート**: `ANTHROPIC_API_KEY` 設定 **かつ** `AI_EXTERNAL_PROCESSING_APPROVED=true` の両方が必要。

```bash
# apps/web/.env.local に設定（承認後にのみ）
ANTHROPIC_API_KEY=sk-ant-...
AI_EXTERNAL_PROCESSING_APPROVED=true
AI_MODEL=claude-sonnet-4-6
# メンター提案(pgvector)を試すとき: 自前ホスト埋め込みを起動
pnpm compose:ai:up        # profile ai の embeddings コンテナ（e5-small / 384 次元）
EMBEDDINGS_URL=http://localhost:8081
```

- [x] **gate off**（dev 既定: key/approved 未設定）で summary/mentor → **503**（外部送信ゼロ。DB アクセス前に早期 return）
- [x] **fail-safe**: `ANTHROPIC_API_KEY` のみ設定・`approved` 未設定でも summary は **503**（key だけでは送らない。`aiEnabled = key && approved`）
- [ ] **gate on** で「AI 要約」→ 要約が返る（面談者/admin のみ・他人 403・空 400・Claude 失敗 502）— **§3.1 組織承認 + 実 API キー待ちで未実施（ブロック）**
- [ ] `pnpm compose:ai:up` 後「メンター提案」→ 類似過去面談を文脈に提案 — **同上ブロック（承認 + EMBEDDINGS_URL 待ち）**
- [x] プロンプト本文がサーバログに残っていない（gate off 時に prompt/interview_memo/anthropic 送信跡なしを確認。gate on 時の確認は承認後）

### A-4. 非同期ジョブ worker（Plan: async-jobs-pgmq-pgcron）

```bash
pnpm worker:start        # apps/worker（pgmq.read → MinIO DeleteObject → pgmq.delete ループ）
```

- [x] **孤児掃除(Phase1)**: 古い `status=100` を 2 件投入 → `SELECT app.gc_stale_attachments()` が **2 を返して削除**（pending→0）。pg_cron 登録(`*/30`)は schema 上存在（実時刻待ちは未実施）
- [x] **本体削除(Phase2)**: avatar 置換で旧行 delete → `AFTER DELETE` トリガで pgmq enqueue → `pnpm worker:start` 起動で旧 object が MinIO から削除（worker 前 EXISTS → 後 NotFound）。現行 object は保持。MinIO 実体は HeadObject で確認（console 目視の代替）
- [x] 壊れたメッセージ（`{"bad":"shape"}`）→ worker が `pgmq.archive`（queue=0 / archive=1 / ログ "archiving msgId 12"）。無限再配信なし

### A-5. スケジュール カレンダー対話（親 Plan #23）

- [x] 予定作成（POST `/v1/schedules`）→ GET 一覧に出る（UI の「日付クリック→モーダル→保存」の永続化 API を確認）
- [x] 既存イベントの編集（PUT）/ 削除（DELETE）→ owner alice で 200、削除後 0 件
- [x] 日付変更（PUT で startAt/endAt 更新＝ドラッグ移動相当）が永続化（07-01→07-03 に変わり再取得で確認）。ドラッグ操作自体は UI（ブラウザ）
- [x] owner/admin 以外は write できない（RLS）: 非 owner bob は PUT/DELETE → **404**（write 拒否。select は認証済み全員可で一覧は読める）。admin は他人の予定も PUT 200（override）

> API 経由で検証（alice=owner / bob=非 owner / admin）。検証予定は削除し schedules 0 件に復帰。`/schedule` 画面でのクリック・ドラッグ UI 操作自体はブラウザ未実施（永続化 API で代替）。

### A-6. API helpers runtime スモーク（Plan: api-route-helpers / api-hardening）

- [x] 認証必須 API に未ログインでアクセス → 401（`/v1/users`・`/v1/surveys` とも 401。`withActiveUser` 合成）
- [x] admin 専用 API に一般ユーザー(alice) → 403（POST `/v1/surveys`・POST `/v1/users` とも 403。GET `/v1/users` は 200＝read は許可で対比確認）
- [x] login レートリミット → 10 回目で 429 + `Retry-After: 45`（loginPerIp=10/60s）。refresh も同機構（refreshPerIp=30）
- [x] `pnpm --filter @wanonwan/web lint` green。no-restricted-imports が `app/api/**/route.ts` に対し認証プリミティブ直 import を禁止する設定を確認

---

## B. stg / prod 実環境が要るもの

### B-1. デプロイ基盤（Plan: deploy-infra）

```bash
# 事前に infra/.env.stg を用意（infra/.env.stg.example を元に。dev フォールバック値は禁止）
pnpm check:secrets:stg          # dev-only-... 等の弱い値が無いか遮断
pnpm compose:stg:build          # or compose:stg:pull
pnpm compose:stg:up             # check-secrets 内蔵
pnpm compose:stg:migrate        # スキーマ適用
pnpm provision:stg              # 組織マスタ seed + admin 1 名を GoTrue provisioning
```

- [ ] `check:secrets:stg` が弱い secret を正しく弾く / 正しい値では通る
- [ ] nginx 経由で TLS 終端・ルーティング・X-Forwarded-For 注入が効く
- [ ] CD（GitHub Actions）で build → push → host 反映 → migrate → 起動が一連で回る
- [ ] `provision:stg` で admin 1 名が GoTrue 経由で作成され、ログインできる
- [ ] DB バックアップ(`infra/backup/backup-db.sh`)取得 → リストア確認
- [ ] prod でも同手順（`*:prod`）で再現

### B-2. 添付 MinIO（stg/prod の storage サブドメイン）

- [ ] `storage.<domain>` の DNS A レコード + 証明書 SAN に storage 名が入っている
- [ ] 公開ホスト経由で実 upload / download（SigV4 整合・サブドメイン方式）
- [ ] `check-secrets` が `MINIO_ROOT_PASSWORD` を必須チェック

### B-3. AI（stg/prod runtime）

- [ ] §3.1 組織承認済みの上で key/URL を secret 配備 → 実環境で要約/メンターが返る
- [ ] レイテンシ / コストが許容範囲

### B-4. worker（stg/prod デプロイ）

- [ ] CD で `wanonwan-worker` image が build/push される
- [ ] `dc up -d web worker nginx`（migration 後）で worker が起動・superuser 接続で pgmq を消化
- [ ] 添付削除 → enqueue → worker が MinIO 本体削除（実環境）

---

## 検証ログ

| 日付 | 項目 | 結果 | メモ |
|---|---|---|---|
| 2026-06-23 | §0 起動・ログイン | ✅ | クリーン作り直し→`dev:up` 相当で admin/alice ログイン 200、`/me` ロール正、誤PW/未認証 401。typecheck/test/pgTAP green。#53(dev GoTrue bootstrap) で恒久化 |
| 2026-06-23 | A-6 API helpers | ✅ | 未認証 401 / 一般ユーザの admin 専用 403（read は 200）/ login 連打 10 回目 429+Retry-After / web lint green（no-restricted-imports） |
| 2026-06-23 | A-1 認証 force-change | ✅ | email 変更で新 200/旧 401 / reset PW は一度だけ・must_change 再設定 / force-change 中 業務 API 403 / 正現PWで解除→200・誤現PW 401。使い捨てユーザで実施し掃除済み |
| 2026-06-24 | A-2 添付 (MinIO) | ✅ (TTL のみ code 確認) | 4 entity で presign→PUT→complete→download(実体一致)→delete / avatar 上書き 1 件維持 / 無関係 carol 404・owner 200 / 415(presign)・422・413(21MB) / 一覧 status=200 のみ。TTL=300s は未待機。検証データ全削除 |
| 2026-06-24 | A-4 worker (pgmq/pg_cron) | ✅ (pg_cron 時刻のみ未待機) | Phase1 `gc_stale_attachments()`=2 返却・削除 / Phase2 worker が旧 object 削除(EXISTS→NotFound)・現行は保持 / 壊れた msg は archive(無限再配信なし)。検証データ全削除（archive 表に test msg 1 件のみ残＝down -v で消える） |
| 2026-06-24 | A-3 AI (gate off のみ) | ◯ 部分 | gate off で summary/mentor 503・送信ゼロ・ログに prompt 跡なし / fail-safe(key のみ→503) 確認。**gate on（実要約/メンター/pgvector）は §3.1 組織承認 + 実 API キー待ちでブロック** |
| 2026-06-24 | A-5 スケジュール (API) | ✅ (UI 操作除く) | 作成→一覧表示 / PUT で日付変更永続化(ドラッグ相当) / 編集・削除 / 非 owner 404・admin override 200。クリック/ドラッグ UI 自体はブラウザ未実施 |
