#!/bin/sh
# stg/prod 専用。initdb（初回のみ）で 00_bootstrap.sql の後に走り、dev 固定値で作られた
# DB ロール password を env 由来の secret へ rotate する（B-2: dev secret を本番に残さない）。
# dev compose はこのスクリプトを mount しないため影響しない。
#
# postgres の initdb 中に同一サーバ内で実行される。healthcheck はこの完了後に通るので、
# gotrue/web は rotate 済みの password で接続する。
# psql の :'var' は安全に quote されるため、password の特殊文字でも壊れない。
#
# 注意（PW ローテーション運用）: これは initdb（db-data volume が空の初回）でのみ走る。
# 既存環境で後から AUTH_ADMIN_PASSWORD / APP_DB_PASSWORD を変えても自動反映されない。
# その場合は手動で: docker compose ... exec -T postgres psql -U "$PG_SUPERUSER" -d "$PG_DATABASE"
#   -c "ALTER ROLE supabase_auth_admin PASSWORD '...'; ALTER ROLE app_user PASSWORD '...';"
# を打ち、web/gotrue を再起動する（compose の DATABASE_URL/GOTRUE_DB_URL と一致させる）。
set -e

if [ -z "${AUTH_ADMIN_PASSWORD:-}" ] || [ -z "${APP_DB_PASSWORD:-}" ]; then
  echo "05_rotate_roles: AUTH_ADMIN_PASSWORD / APP_DB_PASSWORD が未設定。rotate を中止します" >&2
  exit 1
fi

psql -v ON_ERROR_STOP=1 \
  -v authpw="$AUTH_ADMIN_PASSWORD" \
  -v apppw="$APP_DB_PASSWORD" \
  --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<'SQL'
ALTER ROLE supabase_auth_admin PASSWORD :'authpw';
ALTER ROLE app_user           PASSWORD :'apppw';
SQL

echo "05_rotate_roles: supabase_auth_admin / app_user の password を env 由来へ rotate しました"
