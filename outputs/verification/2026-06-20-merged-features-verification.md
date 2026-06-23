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

- [ ] `pnpm dev:up` で web が立ち、`admin@example.com` でログインできる
- [ ] `pnpm -r typecheck` / `pnpm --filter @waoon/web test` / `pnpm test:db`(pgTAP) が green

---

## A. ローカル(dev / Docker)で確認できるもの

### A-1. 認証: GoTrue 同期 + force-change（Plan: auth-gotrue-sync-force-change）

- [ ] admin がユーザーの **email を変更** → 新 email でログインできる（旧 email では不可）
- [ ] admin の「パスワードをリセット」→ 生成 PW が **一度だけ表示**される
- [ ] リセット/新規作成したユーザーで初回ログイン → **`/change-password` へ強制**され、他画面に進めない
- [ ] 現 PW を正しく入れて変更 → フラグ解除、通常画面に入れる。誤った現 PW では拒否
- [ ] force-change 中の業務 API は 403（API 層ゲート。middleware はページ誘導のみ）

### A-2. 添付ファイル（Plan: attachments-minio / complete-validation）

- [ ] 面談記録で添付を upload → 一覧表示 → download → delete が動く（MinIO console でオブジェクト増減確認）
- [ ] アンケート回答 / アンケート資料 / ユーザーアバターの各添付も upload→download→delete
- [ ] **アバター上書き**: 2 枚目を上げると 1 枚に保たれる（complete 成功時に旧を置換）
- [ ] **非権限ユーザー**が他人の添付 download URL を取得 → 403
- [ ] presigned URL の **TTL 切れ**後はアクセス不可
- [ ] complete の実体検証: 不在=422 / サイズ超過=413 / 不許可 MIME=415（size はサーバ実測）
- [ ] presign 前に MIME allowlist + 最大 20MB が効く
- [ ] 一覧 / download は `status=200`(complete 済) のみ対象

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

- [ ] **gate off**（key 未設定 or approved=false）で要約/メンターボタンを押す → 外部送信ゼロで無効応答（送信が起きないこと）
- [ ] **gate on** で「AI 要約」→ 面談メモ/next_action の要約が返る（面談者 or admin のみ・他人は 403、本文空は 400、Claude 失敗は 502）
- [ ] `pnpm compose:ai:up` 後「メンター提案」→ 類似過去面談を文脈に提案が返る。RLS 範囲外の面談は検索に出ない
- [ ] プロンプト本文がサーバログに残っていない

### A-4. 非同期ジョブ worker（Plan: async-jobs-pgmq-pgcron）

```bash
pnpm worker:start        # apps/worker（pgmq.read → MinIO DeleteObject → pgmq.delete ループ）
```

- [ ] **孤児掃除(Phase1)**: `status=100` のまま古い添付行が pg_cron(30分毎) で消える。手動確認は
      `pnpm db:psql` → `SELECT app.gc_stale_attachments();` が件数を返す
- [ ] **本体削除(Phase2)**: 添付を delete → `AFTER DELETE` トリガで pgmq に enqueue → worker が MinIO 本体を削除
      （MinIO console でオブジェクトが消えることを確認）
- [ ] 壊れたメッセージは `pgmq.archive` され無限再配信しない

### A-5. スケジュール カレンダー対話（親 Plan #23）

- [ ] `/schedule` で日付クリック → 作成モーダル → 保存で予定が出る
- [ ] 既存イベントの編集 / 削除
- [ ] ドラッグ移動で日付が変わり永続化される
- [ ] owner/admin 以外は write できない（RLS）

### A-6. API helpers runtime スモーク（Plan: api-route-helpers / api-hardening）

- [ ] 認証必須 API に未ログインでアクセス → 401/403（`withActiveUser` 合成が効く）
- [ ] admin 専用 API に一般ユーザー → 403
- [ ] login / refresh のレートリミット → 連打で 429 + Retry-After
- [ ] `pnpm --filter @waoon/web lint`（no-restricted-imports で認証プリミティブ直 import が禁止）

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

- [ ] CD で `waoon-worker` image が build/push される
- [ ] `dc up -d web worker nginx`（migration 後）で worker が起動・superuser 接続で pgmq を消化
- [ ] 添付削除 → enqueue → worker が MinIO 本体削除（実環境）

---

## 検証ログ

| 日付 | 項目 | 結果 | メモ |
|---|---|---|---|
| | | | |
