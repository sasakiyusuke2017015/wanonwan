# CONTRIBUTING — Wanonwan 開発ガイド

Wanonwan をローカルで動かし、変更を PR にするまでの手順。AI 駆動開発の流れ・ブランチ戦略の
一次情報は [.claude/rules/git-workflow.md](../.claude/rules/git-workflow.md) と
[.claude/rules/plan-review-workflow.md](../.claude/rules/plan-review-workflow.md)。

## 0. 開発環境（前提）

第一級の開発環境は **Windows + PowerShell 5.1 + Rancher Desktop（Docker）**。
Linux（stg サーバ）/ macOS は補助的。ドキュメントのコマンド例も PowerShell でそのまま
動く形で書く（`&&` チェーンを避ける等の作法は [docs-style.md](../.claude/rules/docs-style.md)）。

| 必要なもの | バージョン |
|---|---|
| Docker | Rancher Desktop（dockerd/moby）|
| Node.js | >= 22 |
| pnpm | 10.x（`corepack enable` で `package.json` の `packageManager` に追従）|

## 1. セットアップ

```bash
pnpm install
```

env は未設定でも既定値で dev 動作する（[apps/web/.env.example](../apps/web/.env.example) /
[infra/.env.example](../infra/.env.example)）。上書きしたいときだけ
`apps/web/.env.local` / `infra/.env` を作る。

## 2. 起動（2 コマンド）

起動（DB + web）と seed（データ + ユーザ投入）を分けて回す。

**端末 1 — インフラ + スキーマ + web を前面起動:**

```bash
pnpm compose:dev:up
```

`compose:dev:up` は次を順に実行する:

1. `docker compose up -d --wait` — postgres + gotrue + minio を起動し healthy まで待つ
2. `db:migrate` — スキーマ適用（空 DB は snapshot で高速初期化、既存は未適用 migration のみ増分。[packages/db/README.md](../packages/db/README.md)）
3. `dev` — web を前面起動 → http://localhost:3000（端末を専有する）

**端末 2 — 組織マスタ + ユーザを投入:**

```bash
pnpm provision:dev
```

`provision:dev` は 4 ステップ（`master` → `user` → `demo` → `fixture`）をまとめて流す。
ステップだけを流したいときは `pnpm provision:dev:demo` のように指定でき、依存ステップは
自動で先行実行される。別の人員 CSV を使うなら `pnpm provision:dev --users-csv <path>`。

| ステップ | 内容 | 再実行時 |
|---|---|---|
| `master` | 組織マスタ 5 表（divisions / departments / sections / positions / urgency_levels） | テーブルが非空ならスキップ |
| `user` | 人員 CSV → GoTrue 発行 + `public.users` / `user_roles` | 行単位で skip（CSV に足した行だけ入る） |
| `demo` | 画面確認用のアンケート / 回答 / スケジュール一式 | 番兵行（`users.code='demo01'`）があればスキップ |
| `fixture` | pgTAP が前提にする最小データ（`packages/db/seed/*.sql`） | SQL 自体が冪等 |

### dev ログイン一覧（固定パスワード・dev 限定）

権限は 管理者(admin) / 面談担当(interviewer) / メンバー(member) のマルチロール
（member は全員が暗黙保有。複数保有者はヘッダーメニューで視点を切り替えられる）。
stg/prod はランダム PW + 初回変更強制で別管理（この表は dev のみ）。

`pnpm provision:dev` が発行する 36 アカウント（各ロール 1〜9）。**PW は全員 `Password1!` 固定**。
一次ソースは [packages/db/seed/users/users.csv](../packages/db/seed/users/users.csv) の `roles` 列。

| email | 権限 | 備考 |
|---|---|---|
| `admin1`〜`admin9`@example.com | 管理者 | `admin1` は pgTAP が admin として使う |
| `interviewer1`〜`interviewer9`@example.com | 面談担当 | `interviewer1` はサンプル回答の閲覧者 |
| `member1`〜`member9`@example.com | メンバー | `member1` はサンプル回答の回答者 / `member2` は無関係ユーザー（否定テスト用） |
| `multi1`〜`multi9`@example.com | 管理者 + 面談担当 | 視点切替メニューの確認に使える |

`admin1` / `interviewer1` / `member1` / `member2` は **固定 `gotrue_id`** を持つ。pgTAP が
`SET LOCAL app.user_id` にこの UUID を直接埋め込むため、CSV の該当行の `gotrue_id` は変更しない。

### 個別に回す

| コマンド | 用途 |
|---|---|
| `pnpm db:migrate` | スキーマ適用 |
| `pnpm provision:dev` | 全ステップ投入（master → user → demo → fixture） |
| `pnpm provision:dev:{master,user,demo,fixture}` | 1 ステップだけ投入（依存は自動で先行） |
| `pnpm deprovision:dev:{master,user,demo} --yes` | 1 ステップだけ削除（`--yes` 無しは件数表示のみ。[seed/README.md](../packages/db/seed/README.md)） |
| `pnpm dev` | web のみ（DB は起動済み前提） |
| `pnpm compose:dev:down` | 停止（web も止める。データは保持。`-v` でボリュームも削除） |
| `pnpm compose:dev:logs` | コンテナログ追従 |

ポート: web `3000` / postgres `5432` / gotrue `9999`。

データを消して作り直したい・起動がおかしいときは
[troubleshooting.md](troubleshooting.md) を参照。

## 3. テスト・チェック

| コマンド | 内容 |
|---|---|
| `pnpm typecheck` | 全パッケージの型チェック（`turbo run typecheck`） |
| `pnpm lint` | 全パッケージの ESLint（`turbo run lint`。web + ui） |
| `pnpm build` | ビルド（`turbo run build`） |
| `pnpm test` | 全パッケージの Vitest（`turbo run test`。web + worker。unit） |
| `pnpm test:db` | pgTAP（RLS / SQL）。DB スタック起動が前提（turbo 外） |
| `pnpm format` | Prettier |
| `pnpm clean:build` | ビルド成果物 + turbo キャッシュを削除 |

`typecheck` / `lint` / `build` / `test` は Turborepo 経由で実行され、変更のない
パッケージはキャッシュからスキップされる。

CI（[.github/workflows/ci.yml](../.github/workflows/ci.yml)）は PR / push 時に
`turbo run typecheck lint build test`・pgTAP を回す。

## 4. ブランチ & PR

3 層 `feature/* → develop → main`。マージ先は常に `develop`、Squash Merge。
詳細は [git-workflow.md](../.claude/rules/git-workflow.md)。

```bash
git switch develop; git pull
git switch -c feature/xxx
# 実装 → commit
git rebase develop
git push -u origin feature/xxx
gh pr create --base develop --title "feat: xxx" --reviewer sasakiyusuke2017015
```

> commit / push / PR 作成は、リアルタイムに追えない操作のため Claude Code は
> 明示確認を取ってから実行する（[git-workflow.md の自律範囲](../.claude/rules/git-workflow.md)）。
