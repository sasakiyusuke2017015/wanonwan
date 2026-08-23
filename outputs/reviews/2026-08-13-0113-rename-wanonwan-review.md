# Review: プロジェクト名を waoon → wanonwan に全面改称（計画レビュー）

| 項目 | 値 |
|---|---|
| 対象 Plan | [`plans/2026-08-13-0107-rename-wanonwan.md`](../plans/2026-08-13-0107-rename-wanonwan.md) |
| 種別 | 計画レビュー |
| 対象 | branch `refactor/rename-wanonwan`（未作成）/ 起点 `develop@eaa08b3` |
| レビュアー | Claude Code |
| verdict | **APPROVE** |

## サマリ

全面改称 Plan の計画妥当性をレビューした。影響範囲の棚卸し・破壊的操作の順序・検証手順は
実地の `git grep` / ファイル確認と一致しており概ね健全。ただし **env キー改名が
`check-secrets.mjs` の fail-closed ガードを fail-open に変える**点の緩和策が欠けている。
他に CI の snapshot drift 検査、自動生成ダッシュボードの再生成など 4 件の軽微な補強がある。

## 判定スコープ

| 軸 | 判定 |
|---|---|
| 最終判定 | APPROVE |
| Plan 判定 | APPROVE |
| 実装判定 | N/A |
| 記録整理 | OK |

> **初回判定（2026-08-13 01:13 JST・履歴）**: `NEEDS WORK`（BLOCKER 1 + NICE-TO-HAVE 5）。
> 2026-08-14 に Plan 側で全件反映されたため `APPROVE` に更新した。反映内容は末尾の
> 「フォローアップ」を参照。

## Findings

### [BLOCKER] env キー改名で `check-secrets.mjs` のプレースホルダ検知が fail-open になる

**位置**: Plan `## 実装計画` Step 7 / `## リスク`

[`scripts/check-secrets.mjs:48-50`](../../scripts/check-secrets.mjs#L48-L50) は
`env.WAOON_DOMAIN` が `.example.com` で終わるかだけを見る。

```js
if ((env.WAOON_DOMAIN ?? "").endsWith(".example.com")) {
  errors.push("WAOON_DOMAIN が example.com のプレースホルダのままです");
}
```

一括置換でこれは `env.WANONWAN_DOMAIN` になる。一方 `infra/.env.stg` / `.env.prod` は
**`.gitignore` 対象でサーバ上にしか無く、sed が届かない**（`git check-ignore` で確認済み）。
Step 7 で手動差し替えを忘れると:

- `env.WANONWAN_DOMAIN` は `undefined` → `("").endsWith(...)` は `false` → **チェックを素通り**
- compose の `${WANONWAN_DOMAIN}` は空に解決 → nginx `server_name` 空 / certbot 取得対象空

このスクリプトの宣言された目的は「dev の弱い既定値で本番が立ち上がる事故を
**fail-closed で止める**」（[`check-secrets.mjs:1-3`](../../scripts/check-secrets.mjs#L1-L3)）。
改名によってその 1 項目が黙って no-op 化するのは、[security.md](../../.claude/rules/security.md)
の趣旨に反する。Plan は Step 7 に「`.env.stg` を新 env 名に差し替え」と作業自体は書いているが、
**忘れたときに fail-open する**という性質と、その恒久的な緩和が書かれていない。

> なお `requireSecret()` が守る `JWT_SECRET` / `PG_SUPERUSER_PASSWORD` / `AUTH_ADMIN_PASSWORD` /
> `APP_DB_PASSWORD` / `MINIO_ROOT_PASSWORD` はキー名に `WAOON` を含まないため影響を受けない。
> 影響は `WAOON_DOMAIN` のプレースホルダ検知 1 項目に限定される。

**推奨修正**: 改名と同じ PR で `check-secrets.mjs` に「未設定はエラー」を足し、キー名の
取り違えが必ず fail-closed になるようにする。

```js
const domain = env.WANONWAN_DOMAIN ?? "";
if (!domain) {
  errors.push("WANONWAN_DOMAIN が未設定です（旧 WAOON_DOMAIN のままの可能性）");
} else if (domain.endsWith(".example.com")) {
  errors.push("WANONWAN_DOMAIN が example.com のプレースホルダのままです");
}
```

あわせて Plan の Step 7 に検証を 1 行追加する:
「旧キーのままの `.env.stg` に対して `pnpm compose:stg:up` が **失敗する**ことを確認してから、
新キーへ差し替える」。

### [NICE-TO-HAVE] CI の snapshot drift 検査がローカル検証表に無い

**位置**: Plan `## 検証`

[`ci.yml:40-46`](../../.github/workflows/ci.yml) は `pnpm db:snapshot` を再実行し
`packages/db/snapshot/schema.sql` の **byte 一致**を要求する。

確認したところ [`schema.sql`](../../packages/db/snapshot/schema.sql)（1705 行）には
`waoon` も `cron.database_name` も `\connect` も含まれず DB 名非依存なので、
理屈上 DB 名変更後も dump は同一になる。しかし Plan の検証表にこの項目が無く、
**外れていた場合に PR の CI で初めて落ちる**。ローカルで先に潰せる。

**推奨修正**: 検証表に 1 行追加。

| snapshot drift | `pnpm db:snapshot && git diff --exit-code -- packages/db/snapshot/schema.sql` | 差分なし |

> 参考: snapshot を生成物として扱う設計は
> [db-migrations-snapshot](../plans/2026-07-24-0210-db-migrations-snapshot.md) の判断。
> 「migrations が真実・snapshot は生成物」なので、差分が出たら再生成してコミットすればよい。

### [NICE-TO-HAVE] 自動生成ダッシュボードの再生成手順が抜けている

**位置**: Plan `## 実装計画` Step 4

[`outputs/README.md`](../README.md) は冒頭に「自動生成。手編集しない。再生成:
`node scripts/gen-outputs-readme.mjs`」と明記されている。一括 sed はこれを直接書き換える。
加えて **本 Plan 自身の行がダッシュボードに未追加**。
（`gen-outputs-readme.mjs` 自体に `waoon` は含まれないので、生成器側の改名は不要。）

**推奨修正**: Step 4 の末尾に `node scripts/gen-outputs-readme.mjs` を追加し、
sed 結果ではなく生成結果を採用する。

### [NICE-TO-HAVE] `db:snapshot` はイメージ再ビルド後でないと動かない（順序依存）

**位置**: Plan `## 実装計画` Step 1 / Step 5

[`scripts/db-snapshot.mjs:21-22`](../../scripts/db-snapshot.mjs#L21-L22) は
`waoon-postgres:15` イメージで使い捨てコンテナ `waoon-snapshot-tmp` を立てる。
Step 1 で旧イメージを `docker image rm` するため、**Step 5 の `compose:dev:build` より前に
`db:snapshot` を走らせると `wanonwan-postgres:15` 不在で失敗する**。

CI 側は `Build DB image` → `Snapshot drift check` の順になっており追随する（確認済み）。
ローカル手順にも同じ順序制約がある旨を Step 5 に一言書いておくと、
検証の実行順を間違えない。

### [NICE-TO-HAVE] 旧 Cookie がブラウザに残存する

**位置**: Plan `## リスク`

Cookie 名を変えると、既にブラウザが持つ `waoon-access` / `waoon-refresh` /
`waoon-active-role` は **新コードのログアウト処理では削除されない**まま expiry まで
同一ホストに送られ続ける。dev（localhost）/ stg（検証用途）では実害はないが、
リスク表に「旧 Cookie は削除されず残存する（実害なしと判断）」と 1 行残しておくと、
後日「消えない Cookie がある」と再調査する手間が省ける。

### [NICE-TO-HAVE] `node_modules` の stale link 確認

**位置**: Plan `## 実装計画` Step 3

7 パッケージすべてを改名するため、`pnpm install` 後に `node_modules/@waoon/` が
残っていないかの確認を検証に足しておくとよい（残っていると古い型解決を拾う）。
不安なら `rm -rf node_modules && pnpm install` のクリーンインストールで確実。

## 妥当性レビュー

以下は実地コマンドで裏を取り、Plan の記述が正しいことを確認した。

| Plan の主張 | 検証結果 |
|---|---|
| 197 ファイル / 788 箇所（`waoon` 739 + `WAOON` 49） | `git grep` で一致 ✅ |
| 大小混在表記（`Waoon` 等）は無い | `git grep -oh "[Ww][Aa][Oo][Oo][Nn]"` で 2 種のみ ✅ |
| CSV / バイナリに `waoon` を含むファイルは無い | 該当は yml / lock / workflow のみ ✅ |
| `waoon` は他語の部分文字列にならない固有語 | 機械置換の巻き込み事故リスクは低い ✅ |
| `Dockerfile.db` が `cron.database_name` をベイク | [`Dockerfile.db:26`](../../infra/data/Dockerfile.db) で一致 ✅ |
| `docs/技術選定` の decode 原本はスコープ外でよい | 原本 CSV / `_techmemo-decoded.md` に `waoon` なし ✅ |
| `packages/ui` の内部言及はコメント 2 箇所のみ | `core/molecules/index.ts:105` / `infra/version/registry.ts:165` ✅ |
| `feature/provision-steps` は develop から 0 commit | `git rev-list --count` = 0、リモートブランチ未作成 ✅ |

**影響範囲の見落とし確認**（Plan に無いが問題ないと判断したもの）:

- **E2E**: `playwright.config` 等の実体は未導入（`.claude/` の agent / command 定義のみ）。
  検証に E2E が無いのは妥当。
- **ローカル `infra/.env`**: 存在しない。dev は compose の `${PG_DATABASE:-waoon}` 既定値で
  動くため、git 管理外 env による sed 未到達問題は **dev には無い**（stg/prod は BLOCKER 参照）。
- **`pnpm-lock.yaml`**: sed 対象外にして `pnpm install` で再生成する判断は妥当。
  workspace 依存は `workspace:*` 指定なので、パッケージ名と依存参照が同時に置換されれば解決する。
- **`git ls-files` は untracked を含まない**: Step 2 はクリーンな `develop` 起点なので問題なし。

**スコープの境界**: GitHub リポジトリ名・ローカルディレクトリ名を対象外とし、Step 7 で
笹木さんの作業として明示している点は明確。リポジトリ rename 後の旧 URL 自動リダイレクトに
`outputs/` の過去 PR リンクの解決を委ねる判断も妥当。

**破壊的操作の順序**: 「compose project 名が変わると旧 project のコンテナ / ボリュームが
`down` の対象から外れる」ため Step 1 を rename コミットより前に置く設計は正しく、
本 Plan で最も価値のある判断。取り逃し時の復旧コマンド（`-p waoon` 明示）も
リスク表に書かれている。

## 過去事例からの教訓

- **[db-migrations-snapshot](../plans/2026-07-24-0210-db-migrations-snapshot.md)**:
  「migrations が真実・snapshot は生成物」という設計。本 Plan は snapshot に触れていないが、
  CI の drift 検査があるため検証に組み込むべき（NICE-TO-HAVE 1）。
- **[db-layer-to-packages](../plans/2026-06-22-1940-db-layer-to-packages.md)** /
  **[storage-package-db-seed-restructure](../plans/2026-07-24-0110-storage-package-db-seed-restructure.md)**:
  過去の大規模移設 Plan。いずれも「移設と機能変更を同一 PR に混ぜない」方針で進んでおり、
  本 Plan が provision-steps のマージ完了を着手条件にしている判断と整合する。
- **撤回 Plan [sidebar-nav-v2](../plans/2026-07-21-0224-sidebar-nav-v2.md)**（❌ 撤回）:
  撤回理由は「見た目が要件に届かず後継 Plan にスコープ吸収」であり、本 Plan とテーマの
  重複・矛盾はない。

## 検証（この Review 自体の）

- [x] 対象 Plan を全文 Read 済み
- [x] 関連ファイル（`check-secrets.mjs` / `db-snapshot.mjs` / `Dockerfile.db` / `ci.yml` /
      `cd.yml` / compose 3 種 / `constants.ts` / `snapshot/schema.sql` / `outputs/README.md`）を確認済み
- [x] `.gitignore` 対象の env 実ファイル有無を `git check-ignore` / `ls` で確認済み
- [x] 撤回された Plan との被り確認済み
- [x] 類似の大規模移設 Plan との方針整合を確認済み

## フォローアップ

Plan 側への反映結果（2026-08-14 時点・全件完了）:

- [x] **[BLOCKER]** `check-secrets.mjs` の fail-closed 化を Plan の「やること」と Step 3 に追加。
      Step 8 に「旧キーのままなら `compose:stg:up` が失敗すること」の実地確認を追加
- [x] 検証表に snapshot drift 検査を追加
- [x] Step 5 に `node scripts/gen-outputs-readme.mjs` を追加（生成結果を採用する旨も明記）
- [x] Step 6 に「`db:snapshot` は `compose:dev:build` の後」の順序制約を明記
- [x] リスク表に「旧 Cookie はブラウザに残存（実害なしと判断）」を追加
- [x] 検証表に `node_modules/@waoon/` の残存確認を追加

追加で Plan 側に反映された事項（本 Review の指摘外）:

- 影響範囲を再計測し 197 ファイル / 788 箇所 → **203 ファイル / 910 箇所** に更新
- 混在表記 `Waoon` が 1 件出現したため、sed に第 3 の変換規則を追加。
  出所は本 Review 本文の「大小混在表記（`Waoon` 等）は無い」という記述そのもの
- 着手条件（provision-steps のマージ）が [PR #112](https://github.com/sasakiyusuke2017015/wanonwan/pull/112) で達成
- [PR #116](https://github.com/sasakiyusuke2017015/wanonwan/pull/116) との衝突をリスク表に追加
