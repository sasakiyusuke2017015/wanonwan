#!/usr/bin/env sh
# 日次 DB バックアップ（host cron で実行・Linux 専用）。
# compose の postgres から custom format(-Fc) で pg_dump し、保持期間を過ぎた dump を掃除する。
# 退避先（host 外ストレージ）への転送は環境ごとに最後の TODO ブロックで行う。
#
# cron 例（毎日 03:10）:
#   10 3 * * * cd /opt/waoon && ENV_FILE=infra/.env.prod COMPOSE=infra/docker-compose.prod.yml \
#     BACKUP_DIR=/var/backups/waoon sh infra/backup/backup-db.sh >> /var/log/waoon-backup.log 2>&1
set -eu

ENV_FILE="${ENV_FILE:-infra/.env.prod}"
COMPOSE="${COMPOSE:-infra/docker-compose.prod.yml}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/waoon}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"

PG_SUPERUSER="$(grep -E '^PG_SUPERUSER=' "$ENV_FILE" | cut -d= -f2)"
PG_DATABASE="$(grep -E '^PG_DATABASE=' "$ENV_FILE" | cut -d= -f2)"
stamp="$(date +%Y%m%d-%H%M%S)"
out="$BACKUP_DIR/waoon-$stamp.dump"

mkdir -p "$BACKUP_DIR"
echo "dumping ${PG_DATABASE} -> ${out}"
docker compose --env-file "$ENV_FILE" -f "$COMPOSE" exec -T postgres \
  pg_dump -U "$PG_SUPERUSER" -d "$PG_DATABASE" -Fc > "$out"

# 保持期間を過ぎた dump を削除
find "$BACKUP_DIR" -name 'waoon-*.dump' -mtime "+${RETENTION_DAYS}" -delete
echo "done. retained $(ls -1 "$BACKUP_DIR"/waoon-*.dump 2>/dev/null | wc -l) dump(s)"

# TODO(運用): host 外ストレージへ退避（退避先は笹木さん確定後に有効化）。
#   例: rsync -a "$out" backup-host:/srv/waoon-backups/
#   例: aws s3 cp "$out" s3://waoon-backups/
