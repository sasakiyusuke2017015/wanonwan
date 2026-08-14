# Plan: @wanonwan/storage 切り出しと packages/db/seed の用途別再編

| 項目 | 値 |
|---|---|
| 概要 | web/worker で重複する S3Client を `@wanonwan/storage` へ集約し env を必須検証化。あわせて `packages/db/seed/` を master/users/demo に再編 |
| ステータス | 🟢 マージ済み（検証中） |
| 前提 Plan | なし |
| PR | [#107](https://github.com/sasakiyusuke2017015/wanonwan/pull/107)（storage） / [#108](https://github.com/sasakiyusuke2017015/wanonwan/pull/108)（db-seed） |
| Review | [storage コードレビュー](../reviews/2026-07-24-1531-storage-package-review.md)（APPROVE） / [db-seed コードレビュー](../reviews/2026-07-24-1531-db-seed-layout-review.md)（APPROVE） |

## 目的

別プロジェクト（ai-education）の `packages/{db,storage}` 構成を参照し、wanonwan に有効な部分だけを取り込む。
具体的には (1) web と worker に二重定義されている MinIO クライアントの集約と env の FailFast 化、
(2) フラットな seed CSV の用途別再編と「投入経路の明文化」を行う。

## スコープ

### やること

**A. `packages/storage`（`@wanonwan/storage`）の新設**

- `apps/web/lib/storage/client.ts` と `apps/worker/src/storage.ts` の S3Client 定義を 1 箇所へ集約
- env を valibot スキーマで検証し、認証情報のハードコード既定値（`minioadmin`）を撤廃（FailFast）
- `STORAGE_INTERNAL_ENDPOINT` を追加し、**browser 向け署名 endpoint** と **server→MinIO 実通信 endpoint** を分離
- 既存の `ensureBucket` / `presign*` / `headObject` / `deleteObject` / `objectKeyFor` / policy 検証を移設
- 既存テスト（`presign.test.ts` / `keys.test.ts` / `policy.test.ts`）を package 側へ移し、vitest で回す

**B. `packages/db/seed/` の再編**

- `seed/csv/*.csv`（フラット 13 本）を `seed/master/` `seed/users/` `seed/demo/` に分類
- `scripts/seed-from-csv.mjs` の参照パスを追随
- `packages/db/seed/README.md` を新規作成し、「CSV が初期シードの source of truth」「投入経路と冪等性の根拠」を明文化

### やらないこと（スコープ外）

- **`packages/db` への migrations 方式導入**（snapshot + 増分 SQL）。stg/prod にデータが乗る前に別 Plan で判断する
- **`queries/*.sql` + `queries.ts` の二重管理**。同一 SQL の手動同期は evergreen.md に反するため採用しない
- **複数 bucket 化（`BUCKETS` 定数）**。wanonwan は `STORAGE_BUCKET` 単一運用のまま
- **`db:seed` と `provision:*` の投入経路一本化**。再編とは別軸の変更なので分離する（下記「未確定事項」）
- `packages/db/Dockerfile` への image 定義移動（現状 `infra/data/Dockerfile.db` のままでよい）
- `packages/db` の実パッケージ化（`main`/`types` 付与）。SQL 置き場のままとする

## 現状コンテキスト（2026-07-24 時点）

**storage**

| 場所 | 内容 |
|---|---|
| [apps/web/lib/storage/client.ts](../../apps/web/lib/storage/client.ts) | `import "server-only"` + S3Client。`?? "minioadmin"` の既定値あり |
| [apps/web/lib/storage/presign.ts](../../apps/web/lib/storage/presign.ts) | `ensureBucket` / `presignPut` / `presignGet` / `deleteObject` / `headObject` |
| [apps/web/lib/storage/keys.ts](../../apps/web/lib/storage/keys.ts) | `objectKeyFor(entity, entityId, uuid)` |
| [apps/web/lib/storage/policy.ts](../../apps/web/lib/storage/policy.ts) | 許可 MIME / 最大 20MB |
| [apps/worker/src/storage.ts](../../apps/worker/src/storage.ts) | **client.ts とほぼ同一の S3Client 定義**（presign しない） |

呼び出し元は [attachments/route.ts](../../apps/web/app/api/v1/attachments/route.ts) /
[attachments/[id]/route.ts](../../apps/web/app/api/v1/attachments/[id]/route.ts) /
[apps/worker/src/main.ts](../../apps/worker/src/main.ts) の 3 箇所のみ。

endpoint の現状: stg/prod compose は web に公開ホスト（`https://storage.<domain>`）、worker に `http://minio:9000` を
**サービスごとに別値で**渡して回避している。ただし **web の server-side `headObject` / `deleteObject` も
公開ホスト経由**になり、内部通信が nginx を往復する。

env の現状: web は [apps/web/.env.example](../../apps/web/.env.example)（dev は `.env.local` 前提）、
stg/prod は compose が注入。worker には `.env.example` が無く、dev はコード側フォールバックで動いている。

**db/seed**

`packages/db/seed/csv/` に 13 本の CSV がフラットに同居し、性質が 3 つ混在している:

| 性質 | ファイル |
|---|---|
| 組織マスタ（FK 依存順に投入・非空スキップ） | `divisions` `departments` `sections` `positions` `urgency_levels` |
| dev ユーザー（`gotrue_id` 固定・dev 専用） | `users` |
| デモデータ（`--demo` 時のみ・本番に入らない） | `demo_users` `surveys` `questions` `survey_questions` `survey_publications` `answers` `schedules` |

加えて `seed/20_sample.sql`（RLS テスト兼デモの SQL フィクスチャ）が同階層にあり、
投入は [scripts/db-seed.mjs](../../scripts/db-seed.mjs)（CSV → SQL の順）と
[scripts/provision.mjs](../../scripts/provision.mjs)（`--no-users` で master のみ）の 2 経路。

## 実装計画

**PR 1: `@wanonwan/storage` の切り出し**（branch: `refactor/storage-package`）

1. `packages/storage` を新設。`package.json` は `@wanonwan/auth` に倣う（`type: module` / `main` / `types` / `exports` / `typecheck`）。
   依存は `@aws-sdk/client-s3` `@aws-sdk/s3-request-presigner` `valibot`、dev 依存に `vitest` `typescript` `@types/node`。
2. `src/env.ts`: valibot で `StorageEnv` を検証する `parseStorageEnv(env)` を実装。
   - `STORAGE_ENDPOINT`（必須・URL）/ `STORAGE_INTERNAL_ENDPOINT`（任意・URL。省略時は `STORAGE_ENDPOINT` へフォールバック）
   - `STORAGE_ACCESS_KEY` / `STORAGE_SECRET_KEY`（**必須・1 文字以上**。既定値なし）
   - `STORAGE_REGION`（既定 `us-east-1`）/ `STORAGE_BUCKET`（既定 `wanonwan`）
3. `src/client.ts`: `createStorageClient(env)`（署名用・public endpoint）と
   `createInternalStorageClient(env)`（server 実通信用・internal endpoint）を実装。`forcePathStyle: true` は据え置き。
4. `src/presign.ts` / `src/keys.ts` / `src/policy.ts` を既存実装から移設（`ensureBucket` の promise キャッシュもそのまま維持）。
   `src/index.ts` から公開 API を re-export。
5. 既存テスト 3 本を `packages/storage/src/**/*.test.ts` へ移設し、`vitest.config.ts` を追加。env スキーマのテストを追加
   （必須欠落で throw する／`STORAGE_INTERNAL_ENDPOINT` 省略時のフォールバック）。
6. `apps/web/lib/storage/index.ts` を薄いアダプタとして残す: `import "server-only"` + `parseStorageEnv(process.env)` を
   1 度だけ評価し、設定済み client を export（Next.js の server-only 規律をアプリ側に留めるため。package 自体は
   framework 非依存に保つ）。`client.ts` / `presign.ts` / `keys.ts` / `policy.ts` は削除し、呼び出し元 2 ファイルの import を差し替える。
7. `apps/worker/src/storage.ts` を削除し、`@wanonwan/storage` の internal client を使う。`main.ts` の import を差し替える。
8. env サンプル・compose を追随:
   - `apps/web/.env.example` に `STORAGE_INTERNAL_ENDPOINT` を追記
   - `apps/worker/.env.example` を新規作成（dev で worker を動かすのに必要な env を明示）
   - `infra/docker-compose.{stg,prod}.yml` の web に `STORAGE_INTERNAL_ENDPOINT: http://minio:9000` を追加
   - `infra/.env.{stg,prod}.example` のコメントを追随
9. `pnpm -r typecheck` / `pnpm test` / `pnpm --filter @wanonwan/web build` を通す。

**PR 2: `packages/db/seed` の再編**（branch: `refactor/db-seed-layout`）

10. `git mv` で分類する:
    ```
    seed/master/{divisions,departments,sections,positions,urgency_levels}.csv
    seed/users/users.csv
    seed/demo/{demo_users,surveys,questions,survey_questions,survey_publications,answers,schedules}.csv
    ```
11. `scripts/seed-from-csv.mjs` の `csvDir` を分類ごとのパスへ変更（`MASTER_TABLES` / demo / users の各読み込み箇所）。
    `--users-csv` の既定値も追随。
12. `packages/db/seed/README.md` を新規作成し、以下を明文化する:
    - ディレクトリ構成と各分類の意味（master = 全環境投入 / users = dev 専用 / demo = `--demo` 時のみ）
    - 冪等性の根拠（非空スキップであり `ON CONFLICT DO NOTHING` ではない理由 = 画面で消した行を復活させないため）
    - CSV の追加・更新手順（誰がどのコマンドで反映するか）
13. `packages/db/package.json` の `description` を新レイアウトに合わせて更新。
14. `pnpm compose:dev:down -v` → `up` → `db:migrate` → `db:seed` で fresh init が通ることを確認。

## 検証

```bash
pnpm -r typecheck
pnpm test
pnpm --filter @wanonwan/web build

# storage: 単体
pnpm --filter @wanonwan/storage test

# storage: 手動（dev）— 添付の presign → upload → download → 削除
pnpm compose:dev:up
#   1) 回答画面から添付をアップロード（presigned PUT がブラウザから MinIO へ直通）
#   2) 同じ添付をダウンロード（presigned GET）
#   3) 添付を削除 → pnpm worker:start で GC が MinIO 上の実体を消すことを確認

# storage: env 必須化の確認（STORAGE_ACCESS_KEY を外すと起動時に落ちること）
# db/seed: fresh init
pnpm compose:dev:down -v && pnpm compose:dev:up && pnpm db:seed
pnpm test:db
```

## リスク

| リスク | 緩和策 |
|---|---|
| **env 必須化で dev が起動しなくなる**（`.env.local` 未作成の開発者は今までフォールバックで動いていた） | `.env.example` を更新し、README の dev 手順に「`.env.local` を作る」を明記。エラーメッセージに不足キー名を含める |
| **worker の dev 起動に env が必要になる**（現状 env ファイルなし） | `apps/worker/.env.example` を追加し、必要な env を列挙 |
| `STORAGE_INTERNAL_ENDPOINT` 追加で stg/prod の compose に env 追加漏れ → server 側通信が公開ホスト経由のまま | 省略時は `STORAGE_ENDPOINT` へフォールバックするため**壊れはしない**（現状維持に退化するだけ）。compose 側の追加を PR チェックリストに入れる |
| `ensureBucket` の promise キャッシュがモジュール単位のため、client を 2 つ作ると挙動が変わる | bucket 作成は internal client のみで行う。テストでキャッシュ挙動を固定 |
| seed の path 変更で `provision:stg` / `provision:prod` が壊れる | `seed-from-csv.mjs` の全参照箇所を grep で洗い、dev の fresh init と `--no-users` 経路の両方を実行して確認 |
| stg/prod で稼働中に seed path 変更が影響する | seed は初回投入専用（非空スキップ）のため稼働中データには影響しない。ただし fresh init 手順のみ再確認する |

## 判断ログ

| 日付 | 判断 | 理由 |
|---|---|---|
| 2026-07-24 | env 検証は zod ではなく **valibot** を使う | 参照元は zod だが、wanonwan は `@wanonwan/domain` / `apps/web` ですでに valibot を採用済み。バリデータを 2 種持たない |
| 2026-07-24 | `queries/*.sql` + `queries.ts` の二重管理は**採用しない** | 同一 SQL を 2 ファイルで手動同期する構成。参照元 README 自身が「CI で diff できたら」と書いており未解決。evergreen.md の二重持ち禁止に反する |
| 2026-07-24 | migrations 方式の導入は**別 Plan へ分離** | 参照元の `migrations/` は `002` `004` `007` `033` が番号衝突しており、そのまま模倣すると適用順が壊れる。導入するなら単調増加連番 + `schema_migrations` 記録を設計してから |
| 2026-07-24 | 複数 bucket 化（`BUCKETS` 定数）は見送り | wanonwan は単一 bucket + key prefix（`objectKeyFor`）で分離済み。用途が増えていない段階で分ける理由がない |
| 2026-07-24 | `server-only` は package に入れず apps/web 側のアダプタに残す | worker は Next.js ではないため `server-only` を import できない。package は framework 非依存に保つ |
| 2026-07-24 | 認証情報の既定値（`minioadmin`）を撤廃する | prod で env を取り違えても既定値で「動いてしまう」状態は CLAUDE.md の FailFast 方針に反する |
| 2026-07-24 | package 内の相対 import は**拡張子付き**（`./env.ts`）にし、`allowImportingTsExtensions` を packages/storage と apps/web の tsconfig に追加 | worker は Next のバンドルを介さず node が直接 `.ts` を実行するため、ESM の完全指定子が要る。web の型チェックは package のソースも辿るので web 側にも許可が要る |
| 2026-07-24 | `infra/Dockerfile.worker` の `pnpm deploy` をやめ、workspace 構造のまま image に載せる | `deploy` は workspace package を node_modules 配下の実体としてコピーするが、Node は node_modules 内の TS を type-stripping しない（`ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING` を実測で確認）。symlink のままなら realpath が packages/ に解決され dev と同じ経路で動く |
| 2026-07-24 | worker の `start` を `node --env-file-if-exists=.env src/main.ts` にする | web と違い worker には env の読み込み経路が無く、認証情報の既定値を撤廃すると dev で起動できなくなるため |
| 2026-07-24 | endpoint の検証に `^https?://` の regex を追加 | valibot の `v.url()` は `new URL()` 準拠で `localhost:9000` を「protocol=localhost:」として通してしまう。S3 endpoint として使えるのは http(s) のみ |
| 2026-07-24 | web の内部通信（Head / Delete / bucket 作成）は internal client、署名のみ公開 endpoint の client に分離した | 公開ホスト経由の内部往復（nginx 二重通過）を避けるため。`ensureBucket` は bucket ごとの Map キャッシュに変更し、client を 2 つ持っても二重作成しない |

## 未確定事項（任意・未決のみ）

- `packages/db/seed/20_sample.sql`（RLS テスト兼デモの SQL フィクスチャ）の扱い。CSV 側へ寄せるか、pgTAP 用フィクスチャとして
  `seed/fixtures/` に残すか。今回は現状維持（`seed/` 直下）とし、投入経路の一本化とあわせて判断する
- `db:seed` と `provision:*` の 2 経路を 1 本にするか。参照元は provision 一系統に統一しているが、wanonwan は
  dev（gotrue_id 固定 CSV）と stg/prod（GoTrue 発行）で前提が異なるため、統合可否は別途検討

## 残課題（任意）

- ルート直下の `db.zip` / `storage.zip`（untracked・計 3MB、`node_modules` 込み）は参照が済んだら削除する
- `packages/db` の pgTAP 拡充は現状 9 本あり、参照元より充実しているため対応不要

## ステータス

- [x] 計画確定
- [x] 実装完了（PR 1: storage）
- [x] 実装完了（PR 2: db/seed）
- [x] レビュー完了 … → [storage](../reviews/2026-07-24-1531-storage-package-review.md) / [db-seed](../reviews/2026-07-24-1531-db-seed-layout-review.md)（APPROVE）
- [x] PR 作成 … #107 / #108（マージ済み）
- [ ] マージ後検証
  - [x] dev: 添付 GC 経路（MinIO put → attachments DELETE → トリガ enqueue → 実 worker ドレイン → DeleteObject → headObject=null / pgmq 残 0）
  - [x] dev: fresh init（`compose:dev:down -v` → `up` → `db:migrate` → `db:seed` → pgTAP 9 通過）
  - [x] dev: `seed:gotrue:dev` が dev ユーザ 5 名作成（新 seed レイアウトの回帰）
  - [ ] stg: 添付の up/down と worker GC（`STORAGE_INTERNAL_ENDPOINT` 経由）… 稼働中 stg 環境が必要。CD deploy 再開時に実施
