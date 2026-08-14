# Plan: プロジェクト名を waoon → wanonwan に全面改称

| 項目 | 値 |
|---|---|
| 概要 | プロジェクト名 waoon を **Wanonwan** へ全面改称。npm パッケージ名 / env 変数 / DB 名 / MinIO バケット / compose project / Cookie / コンテナイメージ / 全ドキュメント（`outputs/` 履歴含む）を一括置換し、env キー改名で fail-open する `check-secrets.mjs` を fail-closed 化する |
| ステータス | 🟦 コードレビュー待ち |
| 前提 Plan | [provision-steps](2026-07-07-1412-provision-steps.md)（マージ済み） |
| PR | |
| Review | [計画レビュー](../reviews/2026-08-13-0113-rename-wanonwan-review.md) |

## 目的

プロジェクトの呼称を `waoon` から `Wanonwan` に変更する。リポジトリ内に残る `waoon` 表記を
機械的に一掃し、識別子（パッケージ名・env・DB・バケット・compose project・Cookie）まで
含めて新名称に統一する。

## スコープ

### やること

- **表記の正規形を確定**: 表示名 `Wanonwan` / 識別子 `wanonwan` / env 接頭辞 `WANONWAN`
- リポジトリ内 203 ファイル・910 箇所の `waoon` / `WAOON` / `Waoon` を一括置換
- npm ワークスペース名 `@waoon/*` → `@wanonwan/*`（7 パッケージ）+ `pnpm-lock.yaml` 再生成
- env 変数 `WAOON_DOMAIN` / `WAOON_STORAGE_DOMAIN` → `WANONWAN_*`
- **[`scripts/check-secrets.mjs`](../../scripts/check-secrets.mjs) の fail-closed 化** —
  `WANONWAN_DOMAIN` 未設定をエラーにする（計画レビュー BLOCKER。理由は後述のリスク表）
- **DB 名** `waoon` → `wanonwan`（[`infra/data/Dockerfile.db:26`](../../infra/data/Dockerfile.db#L26) の
  `cron.database_name` を含む。**DB イメージ再ビルド + ボリューム作り直しが必須**）
- **MinIO バケット** `waoon` → `wanonwan`
- **compose project / network / container / image 名** 全て（dev / stg / prod）
- **Cookie 名** [`apps/web/lib/auth/constants.ts:2-4`](../../apps/web/lib/auth/constants.ts#L2-L4)
  `waoon-access` / `waoon-refresh` / `waoon-active-role` → `wanonwan-*`
- GHCR イメージ `ghcr.io/<owner>/waoon-{web,worker}` → `wanonwan-{web,worker}`
- ドキュメント全般（[CLAUDE.md](../../CLAUDE.md) / [README.md](../../README.md) /
  [docs/](../../docs/) / [.claude/](../../.claude/) / [infra/](../../infra/) README）
- **`outputs/` 配下の履歴文書 79 ファイルも一括置換**（判断ログ参照）
- ダッシュボード再生成（`node scripts/gen-outputs-readme.mjs`）

### やらないこと（スコープ外）

- **GitHub リポジトリ名の変更**（`sasakiyusuke2017015/waoon` → `wanonwan`）— 笹木さんの
  GitHub 操作。リポジトリ rename 後は旧 URL が自動リダイレクトされるため、`outputs/` の
  過去 PR リンクは置換後も解決する
- **ローカル作業ディレクトリ名の変更**（`~/projects/waoon`）— ユーザー操作。変更すると
  Claude Code のプロジェクト別メモリ格納先パスも変わる
- **stg / prod の既存データ移行**（stg は再構築、prod は未稼働。判断ログ参照）
- [`packages/ui`](../../packages/ui) のパッケージ名 `@ui-catalog/core`（上流ベンダリング名。
  内部の `waoon` 言及はコメント 2 箇所のみで、これは置換対象）
- ドメイン名の実値（`waoon.example.com` は example のプレースホルダ。`wanonwan.example.com`
  へ置換はするが、実運用ドメインの取得・DNS 変更は別作業）

## 現状コンテキスト（2026-08-14 時点）

`git grep` 実測: **203 ファイル / 910 箇所**（`waoon` 844 + `WAOON` 65 + `Waoon` 1）。
内訳は `outputs/` 79 ファイル / 現役 124 ファイル。

| 分類 | 実体 | 箇所 | 破壊性 |
|---|---|---|---|
| npm パッケージ名 | `@waoon/web` 76 / `domain` 61 / `ui` 47 / `storage` 26 / `auth` 17 / `db` 11 / `worker` 5 | 246 | 低 |
| 履歴文書 | [outputs/](../) 配下 79 ファイル（Plan / Review / ダッシュボード） | — | 低 |
| ドキュメント | CLAUDE / README / docs / .claude / infra README | — | 低 |
| env 変数 | `WAOON_DOMAIN` 38 / `WAOON_STORAGE_DOMAIN` 20 | 59 | 中 |
| DB 名 | `PG_DATABASE=waoon`。[`Dockerfile.db:26`](../../infra/data/Dockerfile.db#L26) が `cron.database_name='waoon'` を `postgresql.conf.sample` にベイク。[`db-snapshot.mjs`](../../scripts/db-snapshot.mjs) / [`db-migrate.mjs`](../../scripts/db-migrate.mjs) / [`db-test.mjs`](../../scripts/db-test.mjs) / [`ci.yml`](../../.github/workflows/ci.yml) / `db:psql` alias が既定値 `waoon` を直書き | — | **高** |
| MinIO バケット | `STORAGE_BUCKET=waoon`（[.env.example](../../infra/.env.example) / stg / prod） | — | **高** |
| compose | project `waoon` / `waoon-stg` / `waoon-prod`、network 同名、container `waoon-postgres` `-gotrue` `-minio` `-embeddings` `-web` `-worker` `-nginx` `-certbot`、image `waoon-postgres:15` | — | **高** |
| Cookie | [`constants.ts:2-4`](../../apps/web/lib/auth/constants.ts#L2-L4) | 3 | 中 |
| GHCR | [`cd.yml:15-16`](../../.github/workflows/cd.yml) + stg/prod `.env.example` | 6 | 中 |
| 使い捨てコンテナ | [`db-snapshot.mjs:21-22`](../../scripts/db-snapshot.mjs#L21-L22) `waoon-postgres:15` / `waoon-snapshot-tmp`、[`provision.mjs`](../../scripts/provision.mjs) の network 名 3 種 | — | 中 |

### 表記の正規形

| 文脈 | 旧 | 新 |
|---|---|---|
| 表示名（散文・見出し） | waoon | **Wanonwan** |
| 識別子（パッケージ・DB・バケット・compose・container・Cookie・イメージ） | `waoon` | `wanonwan` |
| env 変数接頭辞 | `WAOON_` | `WANONWAN_` |

> 散文中の `waoon` も機械置換では `wanonwan`（小文字）になる。文頭・見出し等で
> `Wanonwan` にすべき箇所は Step 5 で目視補正する。

### CI の既存ガード（置換が追随する必要のあるもの）

- [`ci.yml`](../../.github/workflows/ci.yml) は `Build DB image`（`pnpm compose:dev:build`）→
  `Snapshot drift check`（`pnpm db:snapshot` + `git diff --exit-code`）の順で実行する。
  イメージ名を変えても **build が先に走るため CI は追随する**（確認済み）。
- [`packages/db/snapshot/schema.sql`](../../packages/db/snapshot/schema.sql)（1705 行）は
  `waoon` も `cron.database_name` も `\connect` も含まず **DB 名非依存**。DB 名変更後も
  dump は同一になるはずだが、外れると CI が落ちるため Step 7 でローカル検証する。

## 実装計画

### Step 0: 着手条件（達成済み）

- [x] `feature/provision-steps` が develop にマージ済み（[PR #112](https://github.com/sasakiyusuke2017015/waoon/pull/112)）
- [x] `git switch develop && git pull` でクリーンな状態

### Step 1: 破壊的インフラの事前撤去（**rename コミットより先に実行**）

compose の project 名が変わると、旧 project (`waoon`) のコンテナ・ボリュームは
`docker compose down` の対象から外れて**孤児化する**。必ず**旧名のまま**先に落とす。

```bash
pnpm compose:dev:down -v
docker image rm waoon-postgres:15
```

取り逃した場合は `docker compose -p waoon -f infra/docker-compose.yml down -v` で回収する。

### Step 2: ブランチ作成と機械置換

```bash
git switch -c refactor/rename-wanonwan develop

git ls-files -z ':!pnpm-lock.yaml' \
  | xargs -0 grep -lZ -e waoon -e WAOON -e Waoon \
  | xargs -0 sed -i 's/waoon/wanonwan/g; s/WAOON/WANONWAN/g; s/Waoon/Wanonwan/g'
```

`pnpm-lock.yaml` は sed せず Step 4 で再生成する。

### Step 3: `check-secrets.mjs` の fail-closed 化

一括置換だけだと [`check-secrets.mjs:48`](../../scripts/check-secrets.mjs#L48) は
`env.WANONWAN_DOMAIN` を見るようになるが、旧キーのままの `.env.stg` / `.env.prod` に対して
**素通りする**（未設定 → `("").endsWith(...)` が false）。未設定をエラーにする。

```js
const domain = env.WANONWAN_DOMAIN ?? "";
if (!domain) {
  errors.push("WANONWAN_DOMAIN が未設定です（旧 WAOON_DOMAIN のままの可能性）");
} else if (domain.endsWith(".example.com")) {
  errors.push("WANONWAN_DOMAIN が example.com のプレースホルダのままです");
}
```

### Step 4: lockfile と依存の再生成

```bash
pnpm install
```

`node_modules/@waoon/` が残っていないことを確認する。残るなら
`rimraf node_modules` してからクリーンインストールする。

### Step 5: 目視補正とダッシュボード再生成

- 散文・見出しの `wanonwan` → `Wanonwan`（[CLAUDE.md](../../CLAUDE.md) /
  [README.md](../../README.md) / [docs/CONTRIBUTING.md](../../docs/CONTRIBUTING.md) の
  タイトル行など）
- [`git-workflow.md`](../../.claude/rules/git-workflow.md) の worktree 例
  `../waoon-wip` → `../wanonwan-wip`
- `node scripts/gen-outputs-readme.mjs` を実行する。
  [outputs/README.md](../README.md) は自動生成物（手編集禁止）のため、sed の結果ではなく
  **生成結果を採用する**
- `git diff` を全読みして、置換で不自然になった箇所を確認する

### Step 6: dev 環境の再構築

```bash
pnpm compose:dev:build
pnpm compose:dev:up
pnpm provision:dev
```

`pnpm db:snapshot` は `wanonwan-postgres:15` を要求するため、**必ず `compose:dev:build` の後**に
実行する（Step 1 で旧イメージを消しているので、build 前に走らせると失敗する）。

### Step 7: 検証（下記「検証」節）→ commit → PR

### Step 8: マージ後の運用作業（笹木さん）

- GitHub リポジトリを `waoon` → `wanonwan` へ rename、`git remote set-url` を更新
- GHCR の旧 `waoon-web` / `waoon-worker` パッケージを削除（新名で再 push される）
- stg: 旧スタックを `docker compose -p waoon-stg ... down -v` で破棄 →
  **旧キーのままの `.env.stg` で `pnpm compose:stg:up` が失敗することを確認**（Step 3 の
  fail-closed が効いている証拠）→ 新キーへ差し替え → 再構築 → `provision:stg`
- prod: 未稼働のため作業なし（初回構築時に新名で立てる）

## 検証

| 項目 | コマンド | 期待 |
|---|---|---|
| 残存ゼロ | `git grep -c -i waoon` | 本 Plan / 本 Review / ダッシュボードの 3 件のみ（判断ログ参照） |
| stale link | `node scripts/gen-outputs-readme.mjs` | 差分なし（Step 5 で生成済み） |
| 型 | `pnpm -r typecheck` | pass |
| Lint | `pnpm -r lint` | pass |
| ビルド | `pnpm --filter @wanonwan/web build` | pass |
| 依存の残骸 | `ls node_modules/@waoon` | 不在 |
| snapshot drift | `pnpm db:snapshot` の後に `git diff --exit-code -- packages/db/snapshot/schema.sql` | 差分なし |
| DB / RLS | `pnpm test:db` | pgTAP 全 pass |
| unit | `pnpm -r test` | pass |
| pg_cron | `pnpm db:psql -c "show cron.database_name;" -c "select extname from pg_extension where extname='pg_cron';"` | `wanonwan` / 拡張あり（不一致だと `CREATE EXTENSION pg_cron` 自体が失敗するため、これが改称成功の証明になる） |
| バケット | 添付を 1 件アップロードし MinIO に `wanonwan` バケットが冪等作成される | 成功 |
| Cookie | dev でログインし DevTools で `wanonwan-access` / `wanonwan-refresh` を確認 | 新名で発行 |
| fail-closed | 旧キーのままの env に `node scripts/check-secrets.mjs <file>` | 非 0 終了 |
| CI | PR で GitHub Actions 全ジョブ | green |

> PowerShell 5.1 では `&&` が使えないため、上表の連結コマンドは 1 行ずつ実行する。

## リスク

| リスク | 影響 | 緩和策 |
|---|---|---|
| env キー改名で `check-secrets.mjs` が fail-open | 旧キーのままの `.env.stg` を素通りさせ、nginx `server_name` が空のまま起動しうる | Step 3 で未設定をエラー化。Step 8 で「旧キーなら失敗する」ことを実地確認 |
| 旧 compose project のコンテナ/ボリュームが孤児化 | dev のディスク占有・ポート衝突 | Step 1 で **rename 前に** `down -v`。取り逃したら `-p waoon` を明示して回収 |
| `cron.database_name` はイメージにベイク済み | DB 名だけ変えると `0001_initial` の `cron.schedule()` が失敗 | Step 6 でイメージ再ビルドを必須手順化。検証で `cron.job` を確認 |
| snapshot が DB 名変更で drift | CI の drift 検査で落ちる | 検証表でローカル先行確認。drift したら `pnpm db:snapshot` で再生成してコミット |
| MinIO 旧バケット `waoon` のオブジェクトが取り残される | dev は再作成で消える。stg は添付が参照不能に | dev は volume ごと破棄。stg は Step 8 で再構築（stg の添付は検証データのみ） |
| 全セッション無効化 | dev / stg の利用者が要再ログイン | dev は provision で再作成、stg は検証用途のみ。事前周知不要と判断 |
| 旧 Cookie がブラウザに残存 | `waoon-access` 等は新コードのログアウト処理では削除されず expiry まで送られ続ける | dev（localhost）/ stg（検証用途）のため実害なしと判断。再調査を防ぐため記録のみ残す |
| [PR #116](https://github.com/sasakiyusuke2017015/waoon/pull/116)（docs 撤去）と衝突 | `CLAUDE.md` / `README.md` で軽微なコンフリクト | #116 のマージ後に着手するか、develop 起点で切って後で rebase する |
| 機械置換の巻き込み事故 | 意図しない文字列破壊 | `waoon` は他語の部分文字列にならない固有語。Step 5 で `git diff` 全読み + 残存ゼロ検証 |
| `outputs/` 履歴の書き換え | 当時存在しなかった名称で過去記録が記述される | ユーザー判断で受容（判断ログ）。旧 PR URL は GitHub の rename リダイレクトで解決 |

## 判断ログ

| 日付 | 判断 | 理由 |
|---|---|---|
| 2026-08-13 | 状態を持つ識別子（DB 名 / MinIO バケット / compose project / Cookie）も**全て**変更する | ユーザー判断。prod 未稼働・stg は検証データのみで、破壊的変更のコストが最も低い今が実施の適期 |
| 2026-08-13 | `outputs/` 配下の履歴文書も一括置換する | ユーザー判断。evergreen ルール上は「当時の記録」として据え置く選択肢もあったが、検索性と表記統一を優先 |
| 2026-08-13 | `feature/provision-steps` のマージ完了を着手条件とする | ユーザー判断。788 箇所の機械置換と provision の機能変更が同一 PR に混ざるとレビュー不能 |
| 2026-08-13 | GitHub リポジトリ名・ローカルディレクトリ名の変更はスコープ外 | Claude Code の操作範囲外（GitHub 設定 / ローカル FS）。Step 8 で笹木さんの作業として明示 |
| 2026-08-14 | `check-secrets.mjs` の fail-closed 化をスコープに追加 | 計画レビューの BLOCKER。env キー改名は旧キーを黙って無視するため、プレースホルダ検知が no-op 化する。同スクリプトの宣言目的（fail-closed で止める）に反する |
| 2026-08-14 | sed に `Waoon` の変換規則を追加 | 前回計測時は 2 種のみだったが、計画レビュー自身が本文に `Waoon` を書いたため 3 種になった。`git grep -i waoon` = 0 の検証を通すために必要 |
| 2026-08-14 | 着手条件を満たしたため ⚪ 実装待ちへ | provision-steps が PR #112 で develop にマージ済み。影響範囲は 788 → 910 箇所に増加（ダークモード対応の取り込み分） |
| 2026-08-14 | **本 Plan と本 Review は一括置換の対象から除外**する（`outputs/` 全置換の唯一の例外） | 実行すると「旧名 → 新名」の対が両側とも新名になり、`waoon → wanonwan` が `wanonwan → wanonwan` に崩壊して文書として成立しなくなった。改称を説明する文書は旧名を保持する必要がある。ダッシュボードは本 Plan の概要を投影するため 1 箇所だけ旧名が残る |
| 2026-08-14 | 検証項目「cron.job が登録済み」を「`cron.database_name` 一致 + 拡張の存在」に差し替え | 実測で `cron.job` は 0 件。`db:migrate` は空 DB に snapshot を適用する経路を選ぶが、snapshot は app スキーマの pg_dump で `cron.schedule()` を含まない。`snapshot/schema.sql` は本 PR で無変更のため **rename 前から同じ挙動**であり、スコープ外（残課題に記載） |
| 2026-08-14 | develop が #114 / #115 / #116 で進んだため rebase せず作り直した | 衝突は内容 10 件 + modify/delete 5 件。解決内容が「develop 側を採用して改称を当て直す」の繰り返しになり、新 develop で sed を流し直すのと同結果になる。#114 の新ダッシュボード生成器も自動で取り込める |

## 残課題

- **snapshot 経路では pg_cron ジョブが登録されない**（本 Plan の範囲外・既存の挙動）。
  [`db-migrate.mjs`](../../scripts/db-migrate.mjs) は空 DB に
  [`snapshot/schema.sql`](../../packages/db/snapshot/schema.sql) を 1 本適用するが、snapshot は
  app スキーマの pg_dump なので [`0001_initial.sql`](../../packages/db/migrations/0001_initial.sql) の
  `cron.schedule('gc-stale-attachments', ...)` を含まない。クリーンな dev では添付 GC の定期ジョブが動かない。
- `apps/web/.env.local` が無いと添付 API が 500 になる（[`apps/web/.env.example`](../../apps/web/.env.example)
  に「dev でも .env.local を作ること」と明記済み。本 Plan では検証時に env を明示して回避）。
- `outputs/verification/2026-06-20-merged-features-verification.md` が origin/develop に残存。
  [`plan-review-workflow.md`](../../.claude/rules/plan-review-workflow.md) は
  「`outputs/` 直下に置けるのは `plans/` / `reviews/` / `README.md` だけ」と定めており不整合。

## ステータス

- [x] 計画確定
- [x] 計画レビュー反映（BLOCKER 1 + NICE-TO-HAVE 5）
- [x] Step 0: 着手条件（provision-steps マージ済み）
- [x] Step 1: dev の旧スタック撤去（`down -v` + 旧イメージ削除）
- [x] Step 2–5: 機械置換 / check-secrets fail-closed 化 / lockfile 再生成 / 目視補正 + 再生成
- [x] Step 6: dev 再構築（build / up / provision）
- [x] Step 7: 検証
  - [x] 残存ゼロ（除外 3 件のみ）
  - [x] `pnpm turbo run typecheck lint build test` — 12 タスク全 pass
  - [x] snapshot drift なし
  - [x] `pnpm test:db` — pgTAP 9 ファイル全 pass
  - [x] `cron.database_name` = `wanonwan` / pg_cron 拡張あり
  - [x] MinIO に `wanonwan` バケットが冪等作成される
  - [x] ログインが `wanonwan-access` / `wanonwan-refresh` を発行
  - [x] check-secrets が旧キーで exit 1・新キーで exit 0
- [ ] コードレビュー完了 … → Review リンク
- [ ] PR 作成 … → PR リンク
- [ ] マージ後検証
  - [ ] CI green
  - [ ] GitHub リポジトリ rename + `git remote set-url`（笹木さん）
  - [ ] GHCR 旧パッケージ削除 + 新名で image push 成功（笹木さん）
  - [ ] stg 再構築 + `provision:stg`（笹木さん）
