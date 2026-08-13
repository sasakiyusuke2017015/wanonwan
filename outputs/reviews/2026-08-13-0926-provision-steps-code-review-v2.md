# Review: provision/seed 体系の 2 軸再編（コードレビュー v2・指摘反映後）

| 項目 | 値 |
|---|---|
| 作成日時 | 2026-08-13 09:26 JST |
| レビュアー | Claude Code |
| 対象 Plan | [`plans/2026-07-07-1412-provision-steps.md`](../plans/2026-07-07-1412-provision-steps.md) |
| ブランチ | `feature/provision-steps` |
| 関連 PR | 未作成 |
| レビュー種別 | 実装（[初回レビュー](2026-08-13-0120-provision-steps-review.md) の BLOCKED 対応確認 + 実走検証） |

## 判定

| 項目 | 判定 | スコープ / 意味 |
|---|---|---|
| 最終判定 | APPROVE | 初回 HIGH 2 件 + 実走で判明した新規 BLOCKER 1 件を修正し、dev で往復を実走確認 |
| Plan 判定 | N/A | 本 Review では Plan 妥当性は見ない |
| 実装判定 | APPROVE | BLOCKER 残なし。stg/prod 実環境の実走のみマージ後検証に残る |
| 記録整理 | OK | Plan の判断ログ・検証チェックへ反映済み |

> 初回判定は `BLOCKED`（[2026-08-13 01:20 のレビュー](2026-08-13-0120-provision-steps-review.md)）。本ファイルは対応後の再レビュー。

## 初回指摘への対応

| 重大度 | 指摘 | 対応 | 確認方法 |
|---|---|---|---|
| HIGH | `deprovision:{stg,prod}:master` が `readCsv(undefined)` でクラッシュ | 依存残存チェック専用に `residualSets()` を追加し、`user` は CSV を読まず `users.gotrue_id IS NOT NULL` で判定（demo の users 行は `gotrue_id` NULL なので混ざらない）。ディスパッチャは `residualSets ?? seedSets` を使う | `seedSets({options:{}})` が `ERR_INVALID_ARG_TYPE`、`residualSets()` が CSV なしで値を返すことを確認。`--env stg --remove --step master` が CSV ではなく DB 接続まで到達するようになった |
| HIGH | `deprovision:*:user` が GoTrue identity を残し、再 provision が全行 422 で失敗 | DELETE 前に `externalTargets()` で `gotrue_id` を控え、DB 削除の commit 後に `removeExternal()` で GoTrue から削除。失敗した identity は id を列挙して exit 1 | dev 実走: 削除後 `auth.users` = 0 件。続けて `provision:dev --step user` が **36 名すべて作成成功** |
| MEDIUM | 失敗時に未捕捉例外となり `created`/`skipped` 集計が失われる | user ステップは throw をやめて `{created, skipped, failed, credentials}` を返す。ディスパッチャが打ち切り、**発行済み一時 PW を書き出してから** 集計付き 1 行で exit 1 | コード上の経路確認（stg/prod の PW ロスは復旧手段が admin リセットのみのため、集計より PW 保全を優先） |
| MEDIUM | 複合 FK が列ごとに独立した 1 列 FK として扱われ誤判定する | `conname` で束ね、複合 FK を検出したら die（現行スキーマに複合 FK は無いため、対応より誤判定回避を優先） | 現行スキーマで die しないこと（dev の全 deprovision が通る）を確認 |
| LOW | `parseRoles` のラベルが `users.csv` 固定 | 実際に読んだファイルの basename を使う | コード確認 |
| LOW | `RAISE EXCEPTION` にテーブル名を JS 文字列補間 | `sqlStr()` 経由に変更 | コード確認 |

## 新規指摘（実走で判明）

| 重大度 | ファイル:行 | 指摘 | 対応 |
|---|---|---|---|
| HIGH [BLOCKER] | `packages/db/migrations/0001_initial.sql:529` × `scripts/lib/deprovision.mjs` | **`deprovision:{env}:user` が構造的に必ず失敗する**。`trg_prevent_last_admin_removal`（`BEFORE UPDATE OR DELETE ON user_roles FOR EACH ROW`）は「自分以外の admin 行が 0 なら拒否」なので、user ステップ全体の撤去（= admin 0 人が正しい終状態）と必ず衝突する。初回レビューは静的解析のみで、この経路は実行されていなかった | 削除と**同一トランザクション内でのみ** `ALTER TABLE ... DISABLE TRIGGER` → DELETE → `ENABLE TRIGGER`。ステップ側が `suspendedTriggers()` で宣言し、`deleteAll` が挟む。abort すれば無効化ごと巻き戻る |
| MEDIUM | `scripts/lib/deprovision.mjs` | 上記トリガー違反が Node の raw stack trace で出ていた（想定内の失敗が読めない） | `deleteAll` の catch に postgres の `ERROR:` 行を拾って die する分岐を追加 |
| MEDIUM | `scripts/provision.mjs` | stack 未起動時に docker compose のエラー + Node stack trace が出る（最も起きやすい失敗が最も読みにくい） | 冒頭で `SELECT 1;` の接続確認を 1 回行い、1 行で die |
| LOW [NICE-TO-HAVE] | `scripts/provision.mjs` | 残存依存の案内が、その環境で実行できないコマンド（`deprovision:stg:user`）を提示しうる | `removable` に無い依存は「この環境では削除できません（削除可: …）」に切り替え |

## 実施した検証

dev スタックを **ボリュームごと作り直して**（`down -v` → 起動 → migrate）実走。

| 項目 | 結果 |
|---|---|
| `provision:dev --step user`（master 依存を自動先行） | 36 名作成。`users` 36 / `auth.users` 36 / `user_roles` 36 |
| `deprovision:dev:user --yes` | `DELETE 36` × 2（users / user_roles）+ **GoTrue identity 36 件削除**。`users` 0 / `auth.users` 0 |
| トリガーの復旧 | `pg_trigger.tgenabled = 'O'`（有効）に戻っている |
| 再 `provision:dev --step user` | **36 名すべて作成成功**（修正前は全行 422 で失敗する経路） |
| `provision:dev`（全ステップ） | master → user → demo → fixture が通る |
| `deprovision:dev:demo --yes` → `provision:dev:demo` | 53 行削除 → 再投入成功 |
| `deprovision:dev:master --yes` | user 残存を検出して中断、`deprovision:dev:user --yes` を案内 |
| pgTAP | `node scripts/db-test.mjs` → **9 ファイル全通過** |
| 構文 | 変更 3 ファイルとも `node --check` OK |

### 検証していないこと

- **stg / prod での実走**（`provision:stg` / `deprovision:stg:master` 等）。実環境が必要なためマージ後検証に残す。
  特に `deprovision:{stg,prod}:master` は「CSV を読まなくなった」ところまでの確認で、実 DB での往復は未実施
- `pnpm lint` / `pnpm typecheck` — 本ブランチは `scripts/**` と `packages/db/**` のみ変更で TS を含まず、
  root に scripts 用の ESLint 設定も無いため対象外（CI で確認する）
- GoTrue 削除が部分失敗したときの表示経路（id 列挙 + exit 1）は実誘発していない

## 残課題

- `createUser` は既存 email の 422 を握らない。deprovision 側で identity を消すようにしたので通常運用では踏まないが、
  外部要因で GoTrue にだけ残った場合は依然として全行失敗する。`--force` 相当で既存 identity を引き当てる案は別 Plan
- 複合 FK は die する。実際に追加されたら `deprovision.mjs` の対応が必要（メッセージにその旨を明記済み）
