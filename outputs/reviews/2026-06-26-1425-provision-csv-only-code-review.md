# Review: provision を --users-csv 一括投入専用にする（コードレビュー）

| 項目 | 値 |
|---|---|
| 作成日時 | 2026-06-26 14:25 JST |
| レビュアー | Claude Code（security-reviewer） |
| 対象 Plan | なし（チャット内計画・小規模 refactor） |
| ブランチ | `feature/provision-csv-only` |
| 関連 PR | TBD |
| レビュー種別 | 実装（コード） |
| 対象差分 | `git diff develop...HEAD`（92bc6d0 撤去 / cf7248b レビュー対応 / e78a5bf dev サンプル CSV 同梱） |

## 判定

| 項目 | 判定 | スコープ / 意味 |
|---|---|---|
| 最終判定 | **APPROVE** | BLOCKER ゼロ |
| 実装判定 | APPROVE | dead code なし・ガード温存・攻撃面縮小 |

## 背景

笹木さんの方針: provision は **人員 CSV（--users-csv）の一括投入だけ**使う。単一 admin モード（--email）は使わないため dead code として撤去し、provision を CSV 専用に簡素化する（[evergreen](../../.claude/rules/evergreen.md)）。dev の固定ユーザーは `seed:gotrue:dev` が担うため役割の重複もない。

## 変更点

- `scripts/provision.mjs` から単一 admin モード（`--email`/`--name`/`--code` の flag 読みと `!isBulk` 経路）を撤去
- `--users-csv` 未指定で die（必須化）。admin は CSV の `role` 列='admin' で指定
- ヘッダコメント / 使い方を CSV 専用に更新
- レビュー対応: 行ループで `role ∈ {admin,member}` を投入前検証（DB CHECK 手前で typo を明示）/ INSERT の冗長 role フォールバック除去

## レビュー結果（security-reviewer）

| 重大度 | ラベル | ファイル:行 | 指摘 | 対応 |
|---|---|---|---|---|
| 低 | NICE | `provision.mjs`（role） | 不正 role 値は DB CHECK で落ちるが「静かに failed 計上」になり分かりにくい | **修正済み**: ループ手前で role を明示検証し email 付きで弾く |
| 低 | NICE | `provision.mjs`（INSERT role） | `sqlStr(t.role \|\| "member")` は map 時点で確定済みで二重フォールバック | **修正済み**: `sqlStr(t.role)` に簡素化 |

確認済み（いずれも問題なし）:
- **dead code / 参照漏れなし**: `email`/`name`/`code`/`isBulk` の浮き参照ゼロ、対応 `flag()` 読みも完全撤去。`flag`/`hasFlag` は他フラグで使用継続
- **bulk 経路の温存**: 行単位冪等 / 一時 PW を 0600 ファイル / GoTrue orphan cleanup / `must_change_password` すべて無傷
- **provision ガード温存**: JWT_SECRET の dev/stg/prod 取り違え防止、`--dev`⇔compose 整合、network 判定すべて無変更
- **セキュリティ**: 攻撃面は縮小（後退なし）。role は `sqlStr` エスケープ + DB CHECK の二重防御
- **ドキュメント**: package.json scripts は `--email` 等を渡しておらず矛盾なし。コメントも新仕様に更新済み

## 追記（e78a5bf: dev サンプル CSV 同梱）

security review 後に、毎回 CSV を手書きしなくて済むよう以下を追加（dev 限定の利便性・機微情報なし）:
- `infra/provision-users.example.csv`（`padmin=admin` / `pmember=member`、`@example.com` のサンプル・秘密情報なし）を同梱
- dev は `--users-csv` 未指定なら同サンプルを既定使用（`isDev` 判定）。`--users-csv` 指定で上書き。**stg/prod は引き続き必須**（die）

セキュリティ影響: なし（既定適用は dev のみ・サンプルは公開可能なダミー・stg/prod の必須化は不変）。

## 検証

- [x] `node --check scripts/provision.mjs` OK
- [x] `pnpm provision:dev`（引数なし）→ 既定サンプルで padmin/pmember 作成、再実行は skip（冪等）
- [x] stg/prod 相当（非 dev）は `--users-csv` 未指定で die（既定は dev のみ）
- [x] 引数なし → `--users-csv は必須です` で die
- [x] `--users-csv` で一括投入（padmin=admin / pmember=member、role 列が反映）
- [x] role typo（`Admin`）の行を投入前に弾く（failed 計上）/ 正常 role は created
- [x] クリーン再構築で正規 5 ユーザーに復帰
