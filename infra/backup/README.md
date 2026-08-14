# DB バックアップ / リストア

stg/prod の PostgreSQL を日次 `pg_dump`（custom format）で退避し、別環境へ restore できる
ようにする。スクリプトは Linux host で実行する前提（cron 配線含む）。

| ファイル | 役割 |
|---|---|
| [`backup-db.sh`](backup-db.sh) | 日次 `pg_dump -Fc` → `BACKUP_DIR` に保存 + 保持期間掃除。cron から呼ぶ |

## バックアップ

`backup-db.sh` の先頭コメントの cron 例を host の crontab に登録する。退避先（host 外
ストレージ）への転送はスクリプト末尾の TODO ブロックを環境に合わせて有効化する。

## リストア（別 DB / 新環境へ）

stack を起動して postgres が空の状態から復元する。`-Fc` dump なので `pg_restore` を使う。

```bash
# 1) stack を起動（postgres が initdb で 00_bootstrap.sql を流し終えるまで待つ）
docker compose --env-file infra/.env.prod -f infra/docker-compose.prod.yml up -d postgres

# 2) dump を restore（既存オブジェクトを置換しつつ復元）
cat /var/backups/wanonwan/wanonwan-YYYYMMDD-HHMMSS.dump | \
  docker compose --env-file infra/.env.prod -f infra/docker-compose.prod.yml exec -T postgres \
  pg_restore -U postgres -d wanonwan --clean --if-exists --no-owner

# 3) schema を最新化（dump 後に追加された migration を流す。冪等）
node scripts/db-migrate.mjs --compose-file infra/docker-compose.prod.yml --env-file infra/.env.prod

# 4) 残りのサービスを起動
docker compose --env-file infra/.env.prod -f infra/docker-compose.prod.yml up -d
```

> リストア検証は別 DB 名 / 別ホストで行い、本番 volume を上書きしないこと。
