# Review: provision/seed 体系の 2 軸再編（(de)provision:{env}[:{step}]）

| 項目 | 値 |
|---|---|
| 作成日時 | 2026-08-13 01:20 JST |
| レビュアー | Claude Code |
| 対象 Plan | [`plans/2026-07-07-1412-provision-steps.md`](../plans/2026-07-07-1412-provision-steps.md) |
| ブランチ | `feature/provision-steps`（`dd9475c` / `fbc2967`） |
| 関連 PR | [#112](https://github.com/sasakiyusuke2017015/waoon/pull/112) |
| レビュー種別 | 実装（初回） |

## 判定

| 項目 | 判定 | スコープ / 意味 |
|---|---|---|
| 最終判定 | BLOCKED | HIGH 2 件が未修正。PR 前に対応が必要 |
| Plan 判定 | N/A | 本 Review では Plan 妥当性は見ない |
| 実装判定 | BLOCKED | stg/prod で deprovision が起動不能。dev で user 削除後に再投入が不能 |
| 記録整理 | FOLLOW-UP | Plan の「ファイル構成」「ステップの契約」が実装と乖離。実装安全性には影響しない |

> **本ファイルは初回レビューであり、上表の判定は履歴**。指摘はすべて
> [`da86d70`](https://github.com/sasakiyusuke2017015/waoon/pull/112/commits/da86d70) で対応済みで、
> 現在の判定は [コードレビュー v2](2026-08-13-0926-provision-steps-code-review-v2.md)（`APPROVE`）が持つ。

## 指摘事項

| 重大度 | ファイル:行 | 指摘 | 推奨修正 |
|---|---|---|---|
| HIGH [BLOCKER] | `scripts/provision.mjs:189` | **`deprovision:{stg,prod}:master` が必ずクラッシュする**。`DEPENDENTS.master` が `user` を含むため `user.seedSets({options})` を呼ぶが、stg/prod は `defaultUsersCsv` を持たず `--users-csv` も削除時は要求しないため `options.usersCsv` が `undefined`。`readCsv(undefined)` → `ERR_INVALID_ARG_TYPE` で raw stack trace。alias として提供済みのコマンドが動かない | 依存残存チェックを CSV 非依存にする。`user` の残存判定は「CSV の email 一致」ではなく `gotrue_id IS NOT NULL` な `users` 行の存在など CSV を読まない述語にするか、`seedSets` 呼び出しを try で包んで「`--users-csv` が必要」と die する |
| HIGH [BLOCKER] | `scripts/provision/user.mjs:104` / `scripts/lib/gotrue.mjs:60` | **`deprovision:*:user` が GoTrue identity を残す**。削除するのは `public.users` / `user_roles` のみで `auth.users` は残る。`createUser` は既存 email に対する 422 を握らず throw するため、削除後に `provision:dev:user` を流すと全行が失敗して `user ステップで N 行が失敗しました` になり、`compose down -v` 以外に復旧手段がない | `user` の deprovision で GoTrue identity も削除する（対象は dev のみなので `gotrue.deleteUser` をループ）。DB 削除と GoTrue 削除の順序・部分失敗時の扱いを Plan の判断ログに残す |
| MEDIUM [NICE-TO-HAVE] | `scripts/provision/user.mjs:114` | 失敗時に `throw` するだけで、ディスパッチャ側に catch が無い。旧実装は集計を出して `exit 1` していたが、現在は未捕捉例外の stack trace になり `created` / `skipped` の集計も失われる | ディスパッチャで catch して `✗` 付きの 1 行 + 集計を出して `exit 1` する |
| MEDIUM [NICE-TO-HAVE] | `scripts/lib/deprovision.mjs:22-42` | `referencingForeignKeys` は `confkey` / `conkey` を `unnest ... WITH ORDINALITY` で展開するため、**複合 FK が列ごとに独立した 1 列 FK として扱われる**。現行スキーマに複合 FK は無いので実害は無いが、将来追加されると誤判定する | 複合 FK は `conname` で束ねて `(col1, col2) IN (SELECT ...)` にするか、複合 FK を検出したら明示的に die する |
| LOW [NICE-TO-HAVE] | `scripts/provision/user.mjs:20` | `parseRoles` のラベルが `users.csv ${r.code}` 固定。`--users-csv` で別ファイルを渡した場合にエラーメッセージが実ファイルを指さない | `options.usersCsv` の basename を使う |
| LOW [NICE-TO-HAVE] | `scripts/lib/deprovision.mjs:150` | `RAISE EXCEPTION` のメッセージにテーブル名を JS 文字列補間している。値の出所はカタログと固定リストなので注入リスクは無いが、識別子に `'` が含まれると SQL が壊れる | `%L` プレースホルダ経由にするか、識別子を検証する |

## 実装レビュー

- **構成**: ディスパッチャ（env 定義 + ステップ解決）とステップ実装の分離は Plan どおりで、ステップ側が env を知らない設計になっている。`scripts/lib/` の分割（cli / psql / csv / gotrue / deprovision）も責務が明確。1 ファイル最大 200 行弱で `coding-style.md` の目安内。
- **SQL 生成**: CSV 由来の値はすべて `sqlStr` / `intLiteral` / `sqlInList` を通っており、psql の stdin 方式（prepared statement 不可）に対する対策として一貫している。`sqlInList([])` が `(SELECT NULL WHERE false)` を返すのも、`IN ()` 構文エラーと `IN (NULL)` の曖昧さの両方を避けていて妥当。
- **TOCTOU**: 参照チェックを `DO` ブロックとして DELETE と同一の SERIALIZABLE トランザクションに埋め込む形になっており、Plan の要求を満たしている。事前チェックが提示専用であることもコメントで明示されている。
- **seed 自身の CASCADE junction**（demo の `survey_questions`、user の `user_roles`）を削除計画に明示する判断は妥当。両端とも seed の行だけを対象にしているため、demo 設問を画面で別アンケートに紐付けた行は残り、非 seed 参照として検出される。
- **エラーハンドリング**: `psql` の `captureStderr` は失敗時に stderr を必ず再出力してから throw しており、握り潰しになっていない。一方で HIGH 2 件はいずれもエラー経路の詰めが甘い箇所（未定義値の伝播 / 外部システムの状態不整合）。
- **ログ**: スクリプト層なので `console.log` は既存踏襲で問題なし（`apps/web` の構造化ログ規約の対象外）。
- **テスト**: スクリプトの自動テストは無い（従来同様）。pgTAP 9 本が seed 構造の回帰を間接的に守っている。`rls_role_admin` を seed の admin 人数から独立させた変更は、テスト自体の堅牢性を上げており良い。

## 運用 / インフラ影響

- **DB スキーマ変更なし**。migration 追加も無く、既存データへの影響は無い。
- **CI**: Seed ステップが `db:seed`（psql 直 INSERT）→ `provision:dev`（GoTrue 発行込み）に変わる。ローカル実測で約 30 秒。GoTrue healthy は `up -d --wait` が担保しており、`curlimages/curl` はタグ固定（`8.11.1`）に変更されているため pull の非決定性も排除されている。**CI 実測は未取得**（PR 後に確認）。
- **compose / volume / env 変数の変更なし**。
- **stg/prod の運用手順が変わる**: `provision:stg` / `provision:prod` の引数体系が `--compose-file` / `--env-file` 直接指定から `--env {name}` へ変わった。既存の運用メモが手元にある場合は追随が必要。
- **破壊的コマンドの新設**: `deprovision:*` は `--yes` 必須・依存残存チェック・非 seed 参照チェックの 3 段で保護されている。ただし HIGH #1 により stg/prod では起動自体ができない。

## 検証

- [x] `pnpm -r typecheck` green
- [x] `pnpm lint` green
- [x] `pnpm test:db`（pgTAP 9 ファイル）green — クリーンボリュームからの fresh init 後
- [x] `provision:dev` 冪等（再実行で全 skip・行数不変）
- [x] 順序・番兵の回帰（`provision:dev:fixture` 先行後も demo が投入される）
- [x] env / step ガードの逆テスト 6 件
- [x] `deprovision:dev:demo` の `--yes` ゲート / 削除 / 再投入 / 依存残存チェック / 実データ混在時の中断
- [x] tx 内ガード単体で発火し全体 rollback（DB 無傷を実測）
- [x] HIGH #1 を worktree 上で再現（`ERR_INVALID_ARG_TYPE` at `provision.mjs:189`）
- [x] HIGH #2 の前提を実測（GoTrue が既存 email に `422 email_exists` を返し `createUser` が throw する）
- [ ] `pnpm test`（web / ui の Vitest）— 本差分はスクリプトと SQL のみで影響しないと判断し未実行
- [ ] Web ログイン確認（`admin1` / `member1` / `interviewer1` / `multi1`）
- [ ] `deprovision:dev:user` の実削除 → 再投入（HIGH #2 のため未実施）
- [ ] stg / prod での `provision` / `deprovision`（サーバ作業時）
- [ ] CI グリーンと Seed ステップ実測時間（PR 後）

## フォローアップ

- [x] Plan の「ファイル構成（目標）」を実装に追随させる: `cli.mjs` / `deprovision.mjs` が未記載、`csv.mjs` に「code→id 解決サブクエリ」とあるが実際は `psql.mjs`、ステップの契約は `provision()` / `deprovision()` ではなく `provision()` / `seedSets()`。
- [x] Plan の実装計画は commit を「provision 再編」→「deprovision 新規」に分けてレビュー分離する想定だったが、両者が `provision.mjs` / `package.json` / ステップ 4 本 / docs を共有するため 1 commit にまとめた。代わりに識別子の一本化を独立 commit に切り出した。判断ログへ追記済み。
- [ ] スクリプト層の unit テスト（`sqlInList` / `withDeps` / `notSeedRow` などの純関数）は現状ゼロ。別タスクで検討。
