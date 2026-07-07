# Plan: DB レイヤを outputs/infra-data → packages/db に移す

| 項目 | 値 |
|---|---|
| 概要 | DDL / RLS / seed / pgTAP の実体が `outputs/infra-data/` に置かれているが、`outputs/` は本来 |
| ステータス | 🟢 マージ済み（検証中） |
| PR | TBD |
| Review | [コードレビュー](../reviews/2026-06-22-1951-db-layer-to-packages-review.md) |

## 目的

DDL / RLS / seed / pgTAP の実体が `outputs/infra-data/` に置かれているが、`outputs/` は本来
Plan / Review / 検証ドキュメントの置き場であり、**現役のソース（DB スキーマ）がそこにあるのは
構造的に不適切**。技術選定メモの `output/infra-data/` 命名の名残。これを workspace の
`packages/db/` に移し、DB をドメインの一部として正しい場所に置く。

## スコープ

### やること
- `outputs/infra-data/{schema,seed,tests}/**` を `packages/db/{schema,seed,tests}/**` に移動（git mv）
- `packages/db/package.json` を新設（`@waoon/db`、private。workspace の正規メンバーにする）
- 現役の参照を全て新パスへ更新:
  - `scripts/db-migrate.mjs` / `db-seed.mjs` / `db-test.mjs` / `provision.mjs`
  - `infra/docker-compose.yml` / `.stg.yml` / `.prod.yml` の bootstrap マウントパス
  - `README.md` のディレクトリ説明
- `.dockerignore` を調整（SQL が web/worker image に混入しないように）
- 必要なら CLAUDE.md のディレクトリ言及を更新

### やらないこと
- SQL の中身の変更（純粋な移動 + パス更新のみ）
- root の `db:migrate` / `db:seed` / `test:db` スクリプト名の変更（パス先だけ変える）
- 過去 Plan / Review 内の `outputs/infra-data` 参照の書き換え（[evergreen](../../.claude/rules/evergreen.md):
  履歴は当時の事実として残す。リンク切れは許容）
- postgres image（`infra/data/Dockerfile.db`）の変更（schema を COPY しておらず無関係）

## 現状コンテキスト

`outputs/infra-data/` の現役参照（調査済み）:

| 参照元 | 参照内容 |
|---|---|
| `scripts/db-migrate.mjs:33` | `outputs/infra-data/schema/*.sql` |
| `scripts/db-seed.mjs:9` | `outputs/infra-data/seed/*.sql` |
| `scripts/db-test.mjs:9` | `outputs/infra-data/tests/*.test.sql` |
| `scripts/provision.mjs:100` | `outputs/infra-data/seed/00_org.sql` |
| `infra/docker-compose.yml:20` / `.stg.yml:25` / `.prod.yml:25` | `../outputs/infra-data/schema/00_bootstrap.sql` を initdb にマウント |
| `README.md:49` | ディレクトリ図 |

確認済みの事実:
- `00_bootstrap.sql` のみ compose の volume マウント（initdb）。残りは `db:migrate` で適用。
- SQL 間に `\i` / `\ir` の相互参照なし → ディレクトリ移動で内部は壊れない。
- postgres image は schema を COPY しない（bootstrap は volume）→ image ビルド無影響。
- `pnpm-workspace.yaml` は `packages/*` を glob → `packages/db` を拾う。
- `.dockerignore` は現在 `outputs` を丸ごと除外（= infra-data も build context 外）。`infra/Dockerfile.web:16`
  は `COPY packages/ packages/` を行うため、`packages/db` 移動後は **SQL が web image に入りうる**。
- CI は `pnpm db:migrate` / `db:seed` / `test:db`（= スクリプト経由）なので、スクリプト更新で CI も追従。

## 実装計画

1. `git mv outputs/infra-data/schema packages/db/schema`（seed / tests も同様）。
2. `packages/db/package.json` を新設:
   ```json
   { "name": "@waoon/db", "version": "0.1.0", "private": true }
   ```
   （turbo タスクは持たない＝turbo は無視。将来 db:* スクリプトをここへ寄せる余地）
3. スクリプト 4 本のパス文字列を `outputs/infra-data` → `packages/db` に更新（先頭コメントも）。
4. compose 3 本のマウントを `../packages/db/schema/00_bootstrap.sql` に更新。
5. `.dockerignore` に SQL を除外追加（package.json は残す）:
   ```
   packages/db/schema
   packages/db/seed
   packages/db/tests
   ```
   （web/worker image に SQL を入れない。`pnpm install --frozen-lockfile` のため package.json は context に残す）
6. `README.md` のディレクトリ図を更新（`outputs/` から infra-data 行を消し、`packages/db/` を追記）。
7. CLAUDE.md にディレクトリ言及があれば更新。
8. `pnpm install` で `@waoon/db` が workspace に認識され lockfile が更新されることを確認。

## 検証

- [x] `pnpm install` 後 `@waoon/db` が workspace に出る（6 メンバーに表示）
- [x] `pnpm compose:dev:down -v` → `compose:dev:up` で **initdb（bootstrap 新パス）が効き、gotrue まで Healthy**
      （bootstrap が新パスからマウントされ auth role/schema が作られた証拠 = 最重要項目クリア）
- [x] `pnpm db:migrate`（14 file）/ `pnpm db:seed`（3 file）が新パスで冪等に通る
- [x] `pnpm test:db`（pgTAP 5 file）が新パスで全 pass
- [x] turbo verify（typecheck/lint/build/test）10 タスク green（@waoon/db 追加後も無影響）
- [x] `git grep infra-data` の残りは技術選定メモ（履歴）のみ。現役ファイルに残存なし
- [ ] CD: `docker build -f infra/Dockerfile.web .` で web image に `packages/db/schema` 等が含まれない
      （`.dockerignore` 追加済み。bootstrap は volume マウントで image 非依存のため breakage ではなく bloat 確認。CI/笹木さんで確認）
- [ ] CI green（migrate/seed/pgTAP がスクリプト経由で新パスを叩く。PR 後に確認）

## リスク

| リスク | 影響 | 緩和 |
|---|---|---|
| compose の bootstrap マウントパス更新漏れ | 新環境の initdb で role 作成が走らず DB 起動失敗 | 検証で `compose:dev:down -v` から作り直して確認。dev/stg/prod 3 本すべて更新 |
| `.dockerignore` 未対応で web image に SQL 混入 | image 肥大（機能影響は無） | SQL サブディレクトリを dockerignore。検証で image 内を確認 |
| pnpm-workspace が package.json 無しの `packages/db` を拾い警告 | install 時 warning | `@waoon/db` の package.json を置いて正規メンバー化（本 Plan で対応） |
| 過去 Plan のリンク切れ | ドキュメントの参照切れ | evergreen 方針で許容（履歴は当時の事実）。README/CLAUDE など現役 docs のみ更新 |
| #51（turbo）と並行でのコンフリクト | rebase 衝突 | #51 が package.json/CLAUDE を触る。**#51 マージ後に develop 起点で着手**（または rebase で吸収） |

## 判断ログ

| 日付 | 判断 | 理由 |
|---|---|---|
| 2026-06-22 | 移動先を `packages/db` にする（笹木さん選択） | DB をドメインの一部として packages に集約。CLAUDE.md / docs-style が既に `packages/db` を前提にした記述あり |
| 2026-06-22 | `packages/db` を package.json 付きの workspace メンバーにする | `packages/*` glob に拾われるため、plain dir だと pnpm 警告の懸念。正規メンバー化が最もクリーン。将来 db:* スクリプトの収容先にもなる |
| 2026-06-22 | 過去 Plan/Review の `outputs/infra-data` 参照は書き換えない | evergreen: 履歴は当時の事実。現役 docs（README/CLAUDE）のみ現在形に更新 |
| 2026-06-22 | #51（turbo）マージ後に着手 | package.json / CLAUDE.md の同時編集衝突を避ける |

## ステータス

- [x] Plan 承認（笹木さん）
- [x] 実装（#51 マージ後 develop 起点。git mv + 参照更新）
- [x] コードレビュー（[APPROVE](../reviews/2026-06-22-1951-db-layer-to-packages-review.md)。Claude Code + code-reviewer agent。BLOCKER なし / NICE-TO-HAVE 2 件 LOW）
- [ ] PR 作成 → 笹木さんマージ承認
- [ ] PR merge
- [ ] マージ後検証（CD で image SQL 非混入 / CI green）
