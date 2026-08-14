# nginx（TLS 終端・ルーティング・レートリミット）

stg/prod compose の `nginx` サービスが読む設定。`web`(Next.js) への reverse proxy、
Let's Encrypt 証明書での TLS 終端、認証エンドポイントの一次レートリミットを担う。

| ファイル | 役割 |
|---|---|
| [`templates/default.conf.template`](templates/default.conf.template) | 起動時に `${WANONWAN_DOMAIN}` / `${WANONWAN_STORAGE_DOMAIN}` を envsubst 展開 → `/etc/nginx/conf.d/default.conf` |
| [`conf.d/10-limits.conf`](conf.d/10-limits.conf) | `limit_req_zone`（認証エンドポイント用、http コンテキスト） |

GoTrue はサーバ間通信のみ（`GOTRUE_URL=http://gotrue:9999`）なので **公開しない**。
ブラウザは Next.js の `/api/v1/auth/*` 経由でのみ認証する。

## 添付（MinIO）の storage サブドメイン

添付ファイルは presigned URL でブラウザが MinIO へ直接 up/down する。presigned(SigV4) は
パスを署名対象にするため、サブパス書き換えだと署名が壊れる。よって **`${WANONWAN_STORAGE_DOMAIN}`
（既定 `storage.<domain>`）のサブドメインを MinIO へ path-style で proxy** する構成にしている。

セットアップ時の追加要件:

- **DNS**: `${WANONWAN_STORAGE_DOMAIN}` の A レコードを同じサーバへ向ける。
- **証明書**: 単一 cert の **SAN に storage 名を含める**（storage server ブロックは
  `live/${WANONWAN_DOMAIN}/` の cert を共用）。下記 certbot コマンドに `-d "$WANONWAN_STORAGE_DOMAIN"` を追加する。
- MinIO のバケットはアプリの `ensureBucket()` が初回アップロード時に冪等作成する（init 不要）。

## 初回 TLS 発行（新環境セットアップ・Linux サーバで実行）

`:443` の server ブロックが証明書ファイルを参照するため、証明書が無いと nginx が
起動しない。初回だけダミー証明書で nginx を立ち上げ → certbot で本物を取得 →
リロード、の順で行う。`$WANONWAN_DOMAIN` は実ドメインに読み替える。

```bash
# 0) env を用意（infra/.env.prod を実値で埋める。WANONWAN_DOMAIN / CERTBOT_EMAIL 必須）

# 1) ダミー自己署名証明書を作って nginx を起動可能にする
docker compose --env-file infra/.env.prod -f infra/docker-compose.prod.yml run --rm --entrypoint sh certbot -c '
  mkdir -p /etc/letsencrypt/live/$WANONWAN_DOMAIN
  openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
    -keyout /etc/letsencrypt/live/$WANONWAN_DOMAIN/privkey.pem \
    -out    /etc/letsencrypt/live/$WANONWAN_DOMAIN/fullchain.pem \
    -subj "/CN=localhost"'

# 2) nginx を起動（:80 で ACME challenge を受けられる状態にする）
docker compose --env-file infra/.env.prod -f infra/docker-compose.prod.yml up -d nginx

# 3) ダミーを消して本物を webroot 方式で取得
docker compose --env-file infra/.env.prod -f infra/docker-compose.prod.yml run --rm --entrypoint sh certbot -c '
  rm -rf /etc/letsencrypt/live/$WANONWAN_DOMAIN /etc/letsencrypt/archive/$WANONWAN_DOMAIN /etc/letsencrypt/renewal/$WANONWAN_DOMAIN.conf'
docker compose --env-file infra/.env.prod -f infra/docker-compose.prod.yml run --rm certbot \
  certonly --webroot -w /var/www/certbot -d "$WANONWAN_DOMAIN" -d "$WANONWAN_STORAGE_DOMAIN" \
  --email "$CERTBOT_EMAIL" --agree-tos --no-eff-email

# 4) nginx をリロードして本証明書を反映
docker compose --env-file infra/.env.prod -f infra/docker-compose.prod.yml exec nginx nginx -s reload
```

以降の更新は compose の `certbot` サービスが 12h ごとに `certbot renew` を試みる
（更新があったら `nginx -s reload` が必要。renew 後の reload は cron かデプロイ時に行う）。

## 設定変更の反映

`default.conf.template` や `10-limits.conf` を変えたら nginx を再生成/リロードする。

```bash
docker compose --env-file infra/.env.prod -f infra/docker-compose.prod.yml up -d --force-recreate nginx
```
