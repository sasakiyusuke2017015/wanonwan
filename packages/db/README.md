# packages/db

PostgreSQL の DDL / RLS / seed / pgTAP。DDL は **migrations が真実・snapshot は生成物**。

```
packages/db/
├─ schema/00_bootstrap.sql   ロール/スキーマ(auth,app)/拡張(vector,pgtap,pgmq)。initdb.d で最初に 1 度
├─ migrations/               app 層 DDL の真実（唯一の編集対象）。4 桁連番・単調増加
│  └─ 0001_initial.sql       初期スキーマ一式
├─ snapshot/schema.sql       生成物（pg_dump）。空 DB の高速初期化用。手で編集しない
├─ seed/                     初期データ（seed/README.md）
└─ tests/                    pgTAP（RLS）
```

## 3 層の責務

| 層 | 役割 | いつ走る | 編集 |
|---|---|---|---|
| `schema/00_bootstrap.sql` | ロール・スキーマ・拡張。空環境の前提 | コンテナ初回起動（initdb.d マウント） | まれ |
| `migrations/*.sql` | app テーブル・RLS・関数・pg_cron ジョブ | `db:migrate` が未適用分を適用 | **ここを編集** |
| `snapshot/schema.sql` | migrations を空 DB に全適用した結果の pg_dump | 空 DB の `db:migrate` 高速パス | `db:snapshot` が再生成 |

`public.schema_migrations`（version, applied_at）が適用済みを記録する。

## `pnpm db:migrate` の自動分岐

1 コマンドで dev / CI / 本番すべてに対応する:

| DB の状態 | 動作 |
|---|---|
| 真に空 + snapshot あり | **snapshot を 1 本適用**（高速）。schema_migrations も埋まる |
| 空 + snapshot なし | migrations を 0001 から順次適用 |
| 既存テーブルあり + tracker なし（旧構築） | 既存を `0001_initial` の baseline として採用し、以降の増分だけ適用 |
| tracker あり | 未適用の migration だけを増分適用（**本番の通常運用。止めずに `ALTER`**） |

本番は稼働中 DB に対し `db:migrate` を実行すれば、未適用の migration だけが順に当たる。

## migration を足す

1. `migrations/NNNN_<説明>.sql` を作る（連番は単調増加・**番号衝突禁止**）。
   - 各ファイルは `db:migrate` が 1 トランザクションで包む。`CREATE INDEX CONCURRENTLY` 等
     トランザクション不可の文を使う場合はファイル先頭に `-- migrate:no-transaction` を書く。
2. `pnpm db:migrate` で既存 dev DB に増分適用（`down -v` 不要）。
3. `pnpm db:snapshot` で snapshot を再生成し、**migration と一緒にコミットする**。
4. CI が「snapshot を再生成して diff が出ないこと」を検証する。忘れると落ちる。

**`snapshot/schema.sql` を手で編集しない。** 真実は migrations 側。

## snapshot 再生成の仕組み（`db:snapshot`）

使い捨ての postgres コンテナ（`waoon-postgres:15`）を立て、bootstrap → migrations を順に適用し
pg_dump する。dev の `waoon` DB は触らない。pg_cron は `cron.database_name='waoon'` に固定のため
生成も `waoon` という名の DB に対して行う（[scripts/db-snapshot.mjs](../../scripts/db-snapshot.mjs)）。

pg_dump 出力は決定的になるよう正規化する（`\restrict` のランダムトークンと版情報行を除去、
`CREATE SCHEMA`→`IF NOT EXISTS`、関数を `OR REPLACE` 化、pgmq のキュー実体は除外して
`pgmq.create()` で冪等再作成）。

## 作り直し（fresh init）

```bash
pnpm compose:dev:down -v && pnpm compose:dev:up   # snapshot 高速パスで初期化
pnpm db:seed                                       # 初期データ（seed/README.md）
pnpm test:db                                       # pgTAP
```
