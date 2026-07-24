# CONTRIBUTING — waoon 開発ガイド

waoon をローカルで動かし、変更を PR にするまでの手順。AI 駆動開発の流れ・ブランチ戦略の
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
2. `db:migrate` — スキーマ適用（冪等）
3. `dev` — web を前面起動 → http://localhost:3000（端末を専有する）

**端末 2 — 組織マスタ + ユーザを投入:**

```bash
pnpm provision:dev
```

`provision:dev` は組織マスタ seed と人員 CSV（既定 [infra/provision-users.example.csv](../infra/provision-users.example.csv)）の
ユーザ発行を行う（行単位で冪等。再実行は skip）。別 CSV を使うなら
`pnpm provision:dev --users-csv <path>`。

### dev ログイン一覧（固定パスワード・dev 限定）

権限は 管理者(admin) / 面談担当(interviewer) / メンバー(member) のマルチロール
（member は全員が暗黙保有。複数保有者はヘッダーメニューで視点を切り替えられる）。
stg/prod はランダム PW + 初回変更強制で別管理（この表は dev のみ）。

**provision ユーザー**（`pnpm provision:dev` が発行。PW は全員 `Password1!` 固定。
各ロール 1〜9 の 36 アカウント）:

| email | 権限 |
|---|---|
| `admin1`〜`admin9`@example.com | 管理者 |
| `interviewer1`〜`interviewer9`@example.com | 面談担当 |
| `member1`〜`member9`@example.com | メンバー |
| `multi1`〜`multi9`@example.com | 管理者 + 面談担当（視点切替メニューの確認に使える） |

**seed ユーザー**（CI / RLS テスト兼デモ用。`pnpm db:seed` の後に `pnpm seed:gotrue:dev` で
ログイン可能になる。**PW は全員 `Password1!` 固定**（一次ソース:
[scripts/seed-gotrue-dev.mjs](../scripts/seed-gotrue-dev.mjs)）。メール名は pgTAP fixture が
参照するため固定。権限は [packages/db/seed/users/users.csv](../packages/db/seed/users/users.csv) の roles 列:

| email | 権限 | 備考 |
|---|---|---|
| `admin@example.com` | 管理者 + 面談担当 | |
| `alice@example.com` | メンバー | サンプル回答の回答者 |
| `bob@example.com` | 面談担当 | アリスの回答の閲覧者でもある |
| `carol@example.com` | メンバー | 無関係ユーザー（否定テスト用） |
| `dave@example.com` | メンバー | |

### 個別に回す

| コマンド | 用途 |
|---|---|
| `pnpm db:migrate` | スキーマ適用 |
| `pnpm provision:dev` | 組織マスタ + ユーザ投入 |
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
