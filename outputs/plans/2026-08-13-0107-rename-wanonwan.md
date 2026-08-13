# Plan: プロジェクト名を waoon → wanonwan に全面改称

| 項目 | 値 |
|---|---|
| 概要 | プロジェクト名 waoon を **Wanonwan** へ全面改称。npm パッケージ名 / env 変数 / DB 名 / MinIO バケット / compose project / Cookie / コンテナイメージ / 全ドキュメント（`outputs/` 履歴含む）を一括置換 |
| ステータス | 🟡 実装中 |
| 前提 Plan | [provision-steps](2026-07-07-1412-provision-steps.md)（**マージ完了が着手条件**） |
| PR | |
| Review | [計画レビュー](../reviews/2026-08-13-0113-rename-wanonwan-review.md) |

## 目的

プロジェクトの呼称を `waoon` から `Wanonwan` に変更する。リポジトリ内に残る `waoon` 表記を
機械的に一掃し、識別子（パッケージ名・env・DB・バケット・compose project・Cookie）まで
含めて新名称に統一する。

## スコープ

### やること

- **表記の正規形を確定**: 表示名 `Wanonwan` / 識別子 `wanonwan` / env 接頭辞 `WANONWAN`
- リポジトリ内 197 ファイル・788 箇所の `waoon` / `WAOON` を一括置換
- npm ワークスペース名 `@waoon/*` → `@wanonwan/*`（7 パッケージ）+ `pnpm-lock.yaml` 再生成
- env 変数 `WAOON_DOMAIN` / `WAOON_STORAGE_DOMAIN` → `WANONWAN_*`
- **DB 名** `waoon` → `wanonwan`（[`infra/data/Dockerfile.db`](../../infra/data/Dockerfile.db) の
  `cron.database_name` を含む。**DB イメージ再ビルド + ボリューム作り直しが必須**）
- **MinIO バケット** `waoon` → `wanonwan`
- **compose project / network / container / image 名** 全て（dev / stg / prod）
- **Cookie 名** `waoon-access` / `waoon-refresh` / `waoon-active-role` → `wanonwan-*`
- GHCR イメージ `ghcr.io/<owner>/waoon-{web,worker}` → `wanonwan-{web,worker}`
- ドキュメント全般（[CLAUDE.md](../../CLAUDE.md) / [README.md](../../README.md) /
  [docs/](../../docs/) / [.claude/](../../.claude/) / [infra/](../../infra/) README）
- **`outputs/` 配下の履歴文書 73 ファイルも一括置換**（判断ログ参照）

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

## 現状コンテキスト（2026-08-13 時点）

`git grep` 実測: **197 ファイル / 788 箇所**（`waoon` 739 + `WAOON` 49。他の大小混在表記は無し）。

| 分類 | 実体 | 箇所 | 破壊性 |
|---|---|---|---|
| npm パッケージ名 | `@waoon/web` 72 / `domain` 61 / `ui` 47 / `storage` 26 / `auth` 17 / `db` 11 / `worker` 5 | 239 | 低 |
| 履歴文書 | [outputs/](../) 配下 73 ファイル（Plan / Review / ダッシュボード） | — | 低 |
| ドキュメント | CLAUDE / README / docs / .claude / infra README | — | 低 |
| env 変数 | `WAOON_DOMAIN` 31 / `WAOON_STORAGE_DOMAIN` 18 | 49 | 中 |
| DB 名 | `PG_DATABASE=waoon`。[`Dockerfile.db:26`](../../infra/data/Dockerfile.db) が `cron.database_name='waoon'` を `postgresql.conf.sample` にベイク。[`scripts/db-snapshot.mjs`](../../scripts/db-snapshot.mjs) / [`db-migrate.mjs`](../../scripts/db-migrate.mjs) / [`db-test.mjs`](../../scripts/db-test.mjs) / [`ci.yml:54`](../../.github/workflows/ci.yml) / `db:psql` alias が既定値 `waoon` を直書き | — | **高** |
| MinIO バケット | `STORAGE_BUCKET=waoon`（[.env.example](../../infra/.env.example) / stg / prod） | — | **高** |
| compose | project `waoon` / `waoon-stg` / `waoon-prod`、network 同名、container `waoon-postgres` `-gotrue` `-minio` `-embeddings` `-web` `-worker` `-nginx` `-certbot`、image `waoon-postgres:15` | — | **高** |
| Cookie | [`apps/web/lib/auth/constants.ts:2-4`](../../apps/web/lib/auth/constants.ts#L2-L4) | 3 | 中 |
| GHCR | [`cd.yml:15-16`](../../.github/workflows/cd.yml) + stg/prod `.env.example` | 6 | 中 |
| 使い捨てコンテナ | [`db-snapshot.mjs:22`](../../scripts/db-snapshot.mjs) `waoon-snapshot-tmp`、`provision.mjs` の network 名 `waoon` / `waoon-stg` / `waoon-prod` | — | 中 |

**前提ブランチの状態**: 現在の `feature/provision-steps` は **develop から 0 commit**（全て
未コミットの作業ツリー変更 21 files `+515/-995` + untracked 6 パス、リモートブランチ未作成）。
この rename は 788 箇所の機械置換で `scripts/` を含む全域に触れるため、provision 側の
変更と混ざるとレビュー不能かつ大規模コンフリクトになる。

### 表記の正規形

| 文脈 | 旧 | 新 |
|---|---|---|
| 表示名（散文・見出し） | waoon | **Wanonwan** |
| 識別子（パッケージ・DB・バケット・compose・container・Cookie・イメージ） | `waoon` | `wanonwan` |
| env 変数接頭辞 | `WAOON_` | `WANONWAN_` |

> 散文中の `waoon` も機械置換では `wanonwan`（小文字）になる。文頭・見出し等で
> `Wanonwan` にすべき箇所は Step 4 で目視補正する。

## 実装計画

### Step 0: 着手条件（前提）

- [ ] `feature/provision-steps` の作業を commit → PR → **develop にマージ済み**
- [ ] `git switch develop && git pull` でクリーンな状態

### Step 1: 破壊的インフラの事前撤去（**rename コミットより先に実行**）

compose の project 名が変わると、旧 project (`waoon`) のコンテナ・ボリュームは
`docker compose down` の対象から外れて**孤児化する**。必ず**旧名のまま**先に落とす。

```bash
pnpm compose:dev:down -v      # 旧 project 'waoon' のコンテナ + volume(waoon_db-data, waoon_minio-data 等) を破棄
docker image rm waoon-postgres:15
```

### Step 2: ブランチ作成と機械置換

```bash
git switch -c refactor/rename-wanonwan develop

# pnpm-lock.yaml は sed せず後で再生成するため除外
git ls-files -z ':!pnpm-lock.yaml' \
  | xargs -0 grep -lZ -e waoon -e WAOON \
  | xargs -0 sed -i 's/waoon/wanonwan/g; s/WAOON/WANONWAN/g'
```

### Step 3: lockfile と依存の再生成

```bash
pnpm install          # @wanonwan/* の workspace link と pnpm-lock.yaml を再生成
```

### Step 4: 目視補正

- 散文・見出しの `wanonwan` → `Wanonwan`（[CLAUDE.md](../../CLAUDE.md) /
  [README.md](../../README.md) / [docs/CONTRIBUTING.md](../../docs/CONTRIBUTING.md) の
  タイトル行など）
- [`git-workflow.md`](../../.claude/rules/git-workflow.md) の worktree 例
  `../waoon-wip` → `../wanonwan-wip`
- 置換で不自然になった箇所の確認（`git diff` 全読み）

### Step 5: dev 環境の再構築と検証

```bash
pnpm compose:dev:build        # wanonwan-postgres:15 を cron.database_name='wanonwan' で再ビルド
pnpm compose:dev:up           # 新 project 'wanonwan' で起動 + db:migrate
pnpm provision:dev            # マスタ + ユーザ + fixture 投入
```

### Step 6: 検証（下記「検証」節）→ commit → PR

### Step 7: マージ後の運用作業（笹木さん）

- GitHub リポジトリを `waoon` → `wanonwan` へ rename、`git remote set-url` を更新
- GHCR に旧 `waoon-web` / `waoon-worker` パッケージが残るので削除（新名で再 push される）
- stg: 旧スタック `docker compose -p waoon-stg ... down -v` で破棄 → `.env.stg` を
  新 env 名（`WANONWAN_DOMAIN` 等）に差し替え → 再構築 → `provision:stg`
- prod: 未稼働のため作業なし（初回構築時に新名で立てる）

## 検証

| 項目 | コマンド | 期待 |
|---|---|---|
| 残存ゼロ | `git grep -i waoon \| wc -l` | `0` |
| 型 | `pnpm -r typecheck` | pass |
| Lint | `pnpm -r lint` | pass |
| ビルド | `pnpm --filter @wanonwan/web build` | pass |
| DB / RLS | `pnpm test:db` | pgTAP 全 pass |
| unit | `pnpm -r test` | pass |
| pg_cron | `pnpm db:psql -c "select current_database(); select count(*) from cron.job;"` | `wanonwan` / job が登録済み |
| バケット | 添付を 1 件アップロードし MinIO に `wanonwan` バケットが冪等作成される | 成功 |
| Cookie | dev でログインし DevTools で `wanonwan-access` / `wanonwan-refresh` を確認 | 新名で発行 |
| CI | PR で GitHub Actions 全ジョブ | green |

## リスク

| リスク | 影響 | 緩和策 |
|---|---|---|
| 旧 compose project のコンテナ/ボリュームが孤児化 | dev のディスク占有・ポート衝突 | Step 1 で **rename 前に** `down -v` を実行。取り逃したら `docker compose -p waoon -f <旧 compose file> down -v` |
| `cron.database_name` はイメージにベイク済み | DB 名だけ変えると `0001_initial` の `cron.schedule()` が失敗 | Step 5 で `compose:dev:build` による**イメージ再ビルドを必須手順化**。検証で `cron.job` を確認 |
| MinIO 旧バケット `waoon` のオブジェクトが取り残される | dev は再作成で消える。stg は添付が参照不能に | dev は volume ごと破棄。stg は Step 7 で再構築（stg の添付は検証データのみ） |
| 全セッション無効化 | dev / stg の利用者が要再ログイン | dev は provision で再作成、stg は検証用途のみ。事前周知不要と判断 |
| provision-steps とのコンフリクト | 大規模衝突 | Step 0 でマージ完了を着手条件にする（前提 Plan） |
| 機械置換の巻き込み事故 | 意図しない文字列破壊 | `waoon` は他語の部分文字列にならない固有語。Step 4 で `git diff` 全読み + 残存ゼロ検証 |
| `outputs/` 履歴の書き換え | 当時存在しなかった名称で過去記録が記述される | ユーザー判断で受容（判断ログ）。旧 PR URL は GitHub の rename リダイレクトで解決 |

## 判断ログ

| 日付 | 判断 | 理由 |
|---|---|---|
| 2026-08-13 | 状態を持つ識別子（DB 名 / MinIO バケット / compose project / Cookie）も**全て**変更する | ユーザー判断。prod 未稼働・stg は検証データのみで、破壊的変更のコストが最も低い今が実施の適期 |
| 2026-08-13 | `outputs/` 配下の履歴文書 73 ファイルも一括置換する | ユーザー判断。evergreen ルール上は「当時の記録」として据え置く選択肢もあったが、検索性と表記統一を優先 |
| 2026-08-13 | `feature/provision-steps` のマージ完了を着手条件とする | ユーザー判断。788 箇所の機械置換と provision の機能変更が同一 PR に混ざるとレビュー不能。provision は現在 0 commit の作業ツリー状態のため、先に締める |
| 2026-08-13 | GitHub リポジトリ名・ローカルディレクトリ名の変更はスコープ外 | Claude Code の操作範囲外（GitHub 設定 / ローカル FS）。Step 7 で笹木さんの作業として明示 |

## ステータス

- [ ] 計画確定
- [ ] Step 0: provision-steps マージ完了（着手条件）
- [ ] Step 1: dev の旧スタック撤去（`down -v` + 旧イメージ削除）
- [ ] Step 2–4: 機械置換 + lockfile 再生成 + 目視補正
- [ ] Step 5: dev 再構築（build / up / migrate / provision）
- [ ] Step 6: 検証（残存ゼロ / typecheck / lint / build / test:db / pg_cron / バケット / Cookie）
- [ ] レビュー完了 … → Review リンク
- [ ] PR 作成 … → PR リンク
- [ ] マージ後検証
  - [ ] CI green
  - [ ] GitHub リポジトリ rename + `git remote set-url`（笹木さん）
  - [ ] GHCR 旧パッケージ削除 + 新名で image push 成功（笹木さん）
  - [ ] stg 再構築 + `provision:stg`（笹木さん）
