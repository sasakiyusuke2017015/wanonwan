# Plan: seed の CSV 化 + マスタ管理基盤（管理画面 / provision 投入 / 順序ローダー）

| 項目 | 値 |
|---|---|
| ステータス | 🟦 コードレビュー待ち（Phase 1-3 実装 + ローカル検証完了。PR 未作成） |
| slug | `seed-csv-master-admin` |
| 作成 | 2026-06-25 10:25 JST |
| 担当 | Claude Code + 笹木さん |
| ブランチ | `feature/seed-csv-master-admin` |
| 関連 PR | TBD |
| レビュー | [計画レビュー](../reviews/2026-06-25-1031-seed-csv-master-admin-review.md)（計画は APPROVE 相当に収束。BLOCKER 7 + C-1/C-2 反映済み） |
| git repo | `https://github.com/sasakiyusuke2017015/waoon.git` |

---

## 目的

seed データの持ち方を **手書き INSERT SQL から CSV** に移行し、組織マスタ（本部 / 部 / 課 / 役職）と
ユーザーを **CSV を単一ソース**として、**FK 依存順に投入する .mjs ローダー**経由で
dev / stg / prod すべてに入れられるようにする。あわせて組織・役職マスタを
**管理画面（CRUD UI + 書き込み API）から運用できる実体**にし、`00_org.sql` の
「編集 UI は Phase 2」を解消する。

## スコープ

### やること

1. **CSV 化（マスタ + ユーザーのみ）**
   - `divisions` / `departments` / `sections` / `positions` / `users` を CSV ファイル化。
   - 現状の手書き SQL `00_org.sql` / `10_users.sql` を CSV へ移行し、両 SQL は削除。
2. **順序投入 .mjs ローダー**
   - CSV を **FK 依存順**（divisions → departments → sections → positions → users）に投入する
     `scripts/seed-from-csv.mjs`（仮）を新設。冪等（`ON CONFLICT` 相当）。
   - `db:seed` と `provision` の両方がこのローダーを共用する。
3. **provision でのマスタ投入**
   - `provision.mjs` を「`00_org.sql` のみ適用 + admin 1 名」から
     「**CSV マスタ全投入 + users.csv を GoTrue 一括発行**」へ拡張（dev / stg / prod）。
4. **マスタ管理画面（4 マスタまとめて 1 セット）**
   - `admin/org`（本部 / 部 / 課）と `admin/positions`（役職）の **一覧 / 新規 / 編集 / 削除** UI。
   - 対応する書き込み API（write はエンティティ別ルートに分割。集約 GET は `/api/v1/org` に残す）。
   - 既存 `admin/users` の CRUD パターンを踏襲。
   - **admin 帯（positions.code 990-999）の昇格防止ガード**を API 層 + RLS `WITH CHECK` の二重で実装（B-1）。

### やらないこと（非ゴール）

- **RLS テスト用フィクスチャ（`20_sample.sql`: surveys / answers / answer_viewers）の CSV 化はしない**。
  SQL のまま残す（FK が「メール基準の動的紐付け」で CSV 表現が複雑なため）。
- マスタテーブルの **基本 RLS（認証済み=SELECT / admin=write）の追加実装は不要**（既に
  [99_rls.sql](../../packages/db/schema/99_rls.sql) に実装済み）。ただし **admin 帯の昇格防止 `WITH CHECK`
  は新規追加する**（基本 RLS とは別物。B-1）。
- 組織階層に基づく RLS 可視範囲（課長→部下が見える等）の実装はしない（別 Plan）。
- マスタの import/export（管理画面から CSV ダウンロード等）は今回やらない。
- **利用者自力の forgot/recover 画面・API（GoTrue `/recover` + SMTP 配線）は本 Plan ではやらない**（別 Plan）。
  stg/prod の初期ログインは「一時 PW + mustChange」で成立させる（R-B2）。
- **VCS にコミットする `users.csv` は dev テストユーザーのみ**。stg/prod の人員 CSV はコミットしない
  （`.gitignore` 追加 + リポジトリ外パスを `--users-csv` で渡す。B-5）。

## 現状コンテキスト

| 項目 | 現状 | 出典 |
|---|---|---|
| マスタテーブル | `divisions/departments/sections/positions` 定義済み。FK で階層 | [schema/20_org.sql](../../packages/db/schema/20_org.sql) |
| マスタ RLS | **実装済み**: 認証済み=SELECT / admin=write（DO ループで一括付与） | [schema/99_rls.sql:33-49](../../packages/db/schema/99_rls.sql#L33-L49) |
| seed | 手書き SQL 3 本（`00_org`=組織/役職, `10_users`=5 役職ユーザー, `20_sample`=回答フィクスチャ） | [packages/db/seed/](../../packages/db/seed/) |
| seed ローダー | `db-seed.mjs` が `seed/*.sql` を昇順 psql 適用（冪等前提） | [scripts/db-seed.mjs](../../scripts/db-seed.mjs) |
| provision | `00_org.sql` 適用 + admin 1 名を GoTrue 発行 → `public.users` 紐付け（ランダム PW 一度表示） | [scripts/provision.mjs](../../scripts/provision.mjs) |
| dev GoTrue seed | 固定 UUID で 5 ユーザー作成（admin/alice/bob/carol/dave）。`dev:up` 組込み | [scripts/seed-gotrue-dev.mjs](../../scripts/seed-gotrue-dev.mjs) |
| 既存 admin UI | `admin/users` `admin/surveys` `admin/answers` が CRUD 実装済み（雛形になる） | [apps/web/app/(admin)/](../../apps/web/app/(admin)/) |
| org API | `/api/v1/org` は **read-only GET**（フォーム選択肢用）。書き込み無し | [apps/web/app/api/v1/org/route.ts](../../apps/web/app/api/v1/org/route.ts) |
| API 認可パターン | `withActiveUser` + `withUser(claims.sub)` + `app.is_admin()` ゲート + RLS 最終ガード | [apps/web/app/api/v1/users/route.ts](../../apps/web/app/api/v1/users/route.ts) |

### dev / stg / prod でのユーザー投入の差（重要）

ユーザーは **GoTrue identity（gotrue_id）が必須**で、環境ごとに振る舞いが分かれる:

- **dev**: `users.csv`（dev のみ・VCS commit 可）に固定 `gotrue_id` を持たせ、`seed-gotrue-dev.mjs` が
  **その CSV を読んで**同 UUID で GoTrue 側を作る（N-1: 二重管理を解消し単一ソース化）。PW は dev 固定値（CSV には書かず .mjs 側のマップに持つ）。
- **stg / prod**: `gotrue_id` を事前固定できない（GoTrue が発行）。**コミットしない人員 CSV**（`--users-csv` で外部パス指定、B-5）の各行を
  **GoTrue admin API で発行 → 返った id を `public.users` に紐付け → 一時 PW + `mustChange` 付きで作成**。
  一時 PW は **0600 ファイルに書き出し**（stdout/CI に出さない）admin が安全配布、利用者は初回ログインで PW 変更（B-4/R-B2）。
  → 現行 provision の「admin 1 名」処理を **CSV の N 名一括（行単位で冪等）**へ一般化する（確定方針）。

## 実装計画

> 1 ブランチ = 1 PR（`develop` 向け Squash Merge）。下記は PR 内のステップ順。

### Phase 1: CSV + 順序ローダー（データ基盤）

1. **CSV ファイルを用意**（`packages/db/seed/csv/`）
   - `divisions.csv` `departments.csv` `sections.csv` `positions.csv` `users.csv`。
   - 親参照は **code 基準**（`departments.csv` は `division_code` 列を持つ等）。id は IDENTITY 任せ。
   - **commit する `users.csv` は dev テストユーザー 5 役職のみ**（admin/alice/bob/carol/dave）。`gotrue_id` 列は dev 固定 UUID（B-5）。
2. **`scripts/seed-from-csv.mjs` を新設**
   - CSV パースは **`csv-parse` を採用**（自前は RFC 4180 のクオート/改行を取りこぼすため。N-2/R3 確定）。
   - **初回投入専用ガード（R-B1）**: 投入前に各対象テーブルの行数を確認し、**非空ならそのテーブルをスキップ**（ログ出力）。
     CSV が真実の源になるのは **空 DB の初回のみ**。運用開始後の再 provision は no-op になり、
     **画面で DELETE した行が CSV 残存でゾンビ復活しない**（`DO NOTHING` だけでは消えた行が再 INSERT される穴を塞ぐ）。
   - 空テーブルへの投入時は FK 依存順にループし、code 基準で親 id を解決して `INSERT`。
     念のため `ON CONFLICT (code) DO NOTHING` も併用（同一実行内の重複 CSV 行対策）。
   - **全カラムに `sqlStr()` 相当のエスケープを適用**（psql heredoc は prepared statement 不可。N-2）。
   - `--compose-file` / `--env-file` / `--users-csv`（外部パス）を受け、dev/stg/prod 共通で動く。
3. **`db-seed.mjs` をローダー利用に切替**
   - マスタ + dev users は `seed-from-csv.mjs` 経由。`20_sample.sql` は従来どおり SQL 適用。
   - `00_org.sql` / `10_users.sql` を削除（[evergreen](../../.claude/rules/evergreen.md): 移行後の旧ソースは残さない）。
4. **`seed-gotrue-dev.mjs` を CSV 駆動に変更**（N-1）: ハードコード USERS 配列を廃し、dev `users.csv` の
   `gotrue_id`/`email`/`name` を読んで GoTrue 発行。PW はメール→PW マップを .mjs 側に残す（CSV に PW を置かない）。
5. **検証**: `compose:dev:down -v` → `dev:up` で 5 役職 + 回答フィクスチャが入り実ログイン可、`pnpm test:db` が緑。

### Phase 2: provision の CSV マスタ投入化

6. `provision.mjs` の「`00_org.sql` 適用」を **`seed-from-csv.mjs`（マスタのみ・非空スキップ）呼び出し**に置換。
7. `provision.mjs` の admin 1 名発行を **人員 CSV の N 名一括 GoTrue 発行（行単位で冪等）**へ拡張（B-3/B-4）:
   - **ガード（JWT_SECRET 検査・localhost 制限・dev/stg/prod 取り違え）は発行ループの前で 1 回**実行（弱めない）。
   - 各行で: email/code 既存なら **die せず skip して continue**。新規なら GoTrue 発行 → DB insert。
   - **DB insert 失敗時のみ当該行の GoTrue を cleanup**（orphan を残さない）。
   - **初期 PW は一時 PW 方式（R-B2 確定）**: provision が per-user の一時 PW を生成し、`mustChange` 付きで GoTrue 作成。
     PW は **stdout/CI に出さず、0600 権限のファイル**（例: `provision-credentials-<ts>.txt`、リポジトリ外/`.gitignore`）に書き出す。
     admin がそのファイルで安全配布 → 利用者は初回ログインで mustChange により PW 変更。
     利用者自力の forgot/recover 導線（GoTrue `/recover` + SMTP）は**本 Plan のスコープ外**（別 Plan。recover() SDK はあるが画面/ルート未実装）。
   - 全行後に「**成功 / スキップ / 失敗**」を集計表示。失敗が 1 件でもあれば**非ゼロ終了**。
   - → 2 回目実行は「残りだけ発行」になり冪等。
8. **検証**: dev で `provision:dev` がマスタ + ユーザーを冪等投入（2 回流して重複・orphan ゼロ）。stg compose でドライ確認。

### Phase 3: マスタ管理画面（4 マスタ）

9. **書き込み API**: write はエンティティ別ルートに分割（`/api/v1/divisions` `/departments` `/sections` `/positions`、N-3）。
   集約 GET（フォーム選択肢用）は現 `/api/v1/org` に残す。
   - `app.is_admin()` ゲート → RLS（admin write）最終ガード。`users` ルートの POST パターン踏襲。
   - **B-1: admin 帯昇格防止**。positions の `code` 990-999 の **作成・更新**を API 層 Zod + RLS `WITH CHECK`
     の二重で拒否。`users.position_id` への 990-999 付与は専用ゲート（自己昇格不可・最後の admin を割らない）。
   - 入力バリデーションは `@waoon/domain` に Zod スキーマ追加（`positions.code` は int・一意・990-999 を一般作成不可）。
   - 削除時の FK 参照は 409 で弾く（**子マスタ + `users` 参照 + admin position 削除禁止 + 自己所属削除**を対象。N-4/R6）。
10. **RLS 追加**: `99_rls.sql` に positions の admin 帯 `WITH CHECK`（990-999 の write を別途制限）を追加し、pgTAP で昇格不可を検証（B-1）。
11. **UI**: `admin/org`（本部/部/課のツリー or タブ）と `admin/positions` の一覧/新規/編集/削除。
    - `AdminListTable` / `UserForm` / `FormActions` を再利用。新規部品は `@waoon/ui` 吸収を検討。
12. **検証**: admin で一般役職 CRUD 成功 / **admin 帯の作成・付与は admin でも拒否** / 非 admin で 403・RLS 拒否。Vitest + pgTAP + 必要なら Playwright。

### 影響ファイル（想定）

- 追加: `packages/db/seed/csv/*.csv`, `scripts/seed-from-csv.mjs`,
  `apps/web/app/api/v1/{divisions,departments,sections,positions}/route.ts`,
  `apps/web/app/(admin)/admin/org/*`, `.../admin/positions/*`, pgTAP（admin 昇格不可）
- 変更: `scripts/db-seed.mjs`, `scripts/provision.mjs`, `scripts/seed-gotrue-dev.mjs`（CSV 駆動化）,
  `packages/db/schema/99_rls.sql`（admin 帯 WITH CHECK）, `@waoon/domain`（Zod）, `package.json`（`csv-parse`）, `.gitignore`（stg/prod 人員 CSV）
- 削除: `packages/db/seed/00_org.sql`, `packages/db/seed/10_users.sql`
- 影響注意: dev `users.csv` の固定 UUID は唯一のソース。`seed-gotrue-dev.mjs` がこれを読む（不一致で login 不能 orphan）

## 検証

- `pnpm test:db`（pgTAP / RLS）が緑。**admin 帯昇格不可の pgTAP を新規追加**（admin でも 990-999 を作成/付与できない。B-1）。
- `compose:dev:down -v` → `dev:up` でクリーン投入 → DB で 5 役職ユーザー + マスタを確認し、**実ログイン可**（dev users.csv 経路）。
- `provision:dev` の**行単位冪等性**: 2 回流して重複発行ゼロ・**GoTrue orphan ゼロ**・集計（成功/スキップ/失敗）が正しい（B-3）。
- 途中失敗注入テスト: N 名中 1 名で DB insert を失敗させ、当該行の GoTrue が cleanup される（orphan ゼロ。B-3）。
- **ゾンビ復活防止（R-B1）**: マスタ 1 行を画面で DELETE → 再 `provision`/`db:seed` → **非空スキップで復活しない**。空 DB では正しく投入される。
- **一時 PW の非漏洩（R-B2）**: PW が stdout/CI ログに出ない。0600 ファイルにのみ出力され、`git ls-files` に乗らない。mustChange 初回変更が機能。
- マスタ管理画面: admin で一般役職 CRUD 成功 / **admin 帯（990-999）の作成・付与は admin でも 4xx 拒否**（B-1）/ 非 admin で 403・RLS 拒否。
- 削除 409: 子マスタ参照・`users` 参照・admin position 削除・自己所属削除がいずれも弾かれる（N-4）。
- CSV エスケープ: `name` にカンマ/引用符/改行/`'); DROP` を含む行が安全に投入される（N-2）。
- stg/prod: 人員 CSV が VCS に commit されていない（`git ls-files` で確認。B-5）。一時 PW ファイル配布 → 初回ログイン → mustChange で PW 変更可（R-B2）。
- `pnpm -r typecheck` / `pnpm --filter @waoon/web build` 通過（CI 相当）。

## リスク

| # | リスク | 対策 |
|---|---|---|
| R1 | dev `users.csv` の `gotrue_id` と GoTrue 発行の不一致 → login 不能 orphan | dev users.csv を**唯一のソース**にし seed-gotrue-dev.mjs が読む（N-1）。検証で実ログイン確認 |
| R2（B-4/R-B2） | stg/prod 一括発行で N 名分の初期 PW が stdout/ログに残留 → 漏洩 | **一時 PW + `mustChange`**。PW は 0600 ファイルにのみ出力（stdout/CI に出さない）、CSV にも書かない。利用者は初回ログインで PW 変更。recover 導線は別 Plan |
| R3（B-1） | positions マスタ CRUD で admin が 990-999 を付与し自己昇格 | API Zod + RLS `WITH CHECK` の二重で 990-999 作成/付与を拒否。pgTAP で昇格不可を検証 |
| R4（B-2/R-B1） | CSV / 画面 / DB の真実の源が衝突（編集巻き戻り・DELETE ゾンビ復活） | **初回投入=CSV / 運用編集=画面(DB)**。ローダーは**非空テーブルをスキップ**（`DO NOTHING` だけでは消えた行が復活するため、行数ガードで初回のみ投入） |
| R5（B-3） | N 名一括発行の部分失敗で中間状態（orphan / 再実行で die） | 行単位で skip/cleanup/集計。途中失敗注入テストで orphan ゼロを確認 |
| R6（B-5） | stg/prod 実メール（PII）を VCS commit | commit する users.csv は dev のみ。stg/prod は `--users-csv` 外部パス + `.gitignore` |
| R7 | `00_org.sql`/`10_users.sql` 削除で他参照が壊れる | provision の参照を先に切替。grep で残参照ゼロを確認してから削除 |
| R8 | マスタ削除 API の FK 整合（子マスタ/users 参照/admin position/自己所属） | いずれも 409 で拒否（N-4）。UI で参照件数を表示 |
| R9 | PR が大きい（データ基盤 + 管理画面）→ レビュー負荷 | Phase 1→3 の順で commit を分ける。必要なら Phase3 を別 PR に分割（笹木さんと相談） |
| R10 | CSV 値の SQL インジェクション（psql heredoc は prepared 不可） | 全カラムに `sqlStr()` 相当を適用。`csv-parse` 採用。悪意ある値でテスト（N-2） |

## 判断ログ

| 日時 | 決定 | 理由 |
|---|---|---|
| 2026-06-25 | CSV 範囲は「マスタ + ユーザーのみ」。`20_sample.sql` は SQL 維持 | 回答フィクスチャはメール基準の動的 FK で CSV 表現が複雑。provision の責務（マスタ）と分離 |
| 2026-06-25 | stg/prod は `users.csv` を一括 GoTrue 発行（admin のみでなく N 名） | 初期人員を一気に投入したい要件。provision の admin 1 名処理を一般化 |
| 2026-06-25 | マスタ管理画面は 4 マスタまとめて 1 セットで実装 | 笹木さん指定。組織 + 役職を一度に運用可能にする |
| 2026-06-25 | マスタの**基本** RLS 追加は不要だが、admin 帯昇格防止の `WITH CHECK` は新規追加 | 基本 write は `99_rls.sql` で実装済み。ただし `is_admin()` の源が `positions.code 990-999` のため、CRUD 化で昇格面が開く（計画レビュー B-1） |
| 2026-06-25 | ~~真実の源 = 初回投入は CSV / 運用編集は管理画面（DB）。ローダーは `DO NOTHING`~~ → **撤回: 後続 R-B1 行で「非空テーブルはスキップ」に改訂** | `DO NOTHING` は DELETE 行のゾンビ復活を防げないため改訂（計画レビュー B-2 → R-B1） |
| 2026-06-25 | provision の N 名一括は**行単位で冪等**（skip/cleanup/集計） | 部分失敗時の orphan・再実行 die を防ぐ（計画レビュー B-3） |
| 2026-06-25 | ~~初期 PW は表示せず `mustChange` + リセット導線で初期化~~ → **撤回: 後続 R-B2 行で「一時 PW + 0600 ファイル配布」に改訂** | recover 導線が未実装で「自力リセット」が成立しないため改訂（計画レビュー B-4 → R-B2） |
| 2026-06-25 | commit する `users.csv` は **dev のみ**。stg/prod 人員 CSV は非 commit（外部パス + `.gitignore`） | 実メール（PII）を VCS に入れない（計画レビュー B-5） |
| 2026-06-25 | seed-gotrue-dev.mjs を **CSV 駆動化**（USERS 配列廃止） | dev users.csv を唯一のソースにし二重管理を解消（計画レビュー N-1） |
| 2026-06-25 | CSV パーサは **`csv-parse` を採用**（自前不可） | RFC 4180 のクオート/改行/エスケープ取りこぼし防止 + SQL インジェクション対策（計画レビュー N-2） |
| 2026-06-25 | ローダーは **`DO NOTHING` ではなく「非空テーブルはスキップ」**（行数ガード） | `DO NOTHING` は画面 DELETE で消えた行のゾンビ復活を防げない。CSV が真実の源になるのは空 DB の初回のみ（Codex 再レビュー R-B1） |
| 2026-06-25 | stg/prod 初期ログインは **一時 PW + mustChange + 0600 ファイル配布**。recover 導線は別 Plan | 利用者向け forgot/recover 画面・API が未実装（recover() SDK のみ）。PW 非表示の自力リセットは現状成立しないため、安全配布で成立させる（Codex 再レビュー R-B2） |

## ステータス

- [x] 計画レビュー（[2026-06-25-1031](../reviews/2026-06-25-1031-seed-csv-master-admin-review.md)・NEEDS WORK）→ BLOCKER 5 件（B-1〜B-5）を反映済み
- [x] Codex 再レビュー（同ファイルに追記）→ 追加 BLOCKER 2 件（R-B1 ゾンビ復活 / R-B2 初期 PW 導線）を反映済み
- [x] Codex 再々レビュー（同ファイルに追記・**追加 BLOCKER なし / C-1・C-2 の文言整理後 APPROVE 相当**）→ C-1（検証）/ C-2（判断ログ旧行撤回）を反映済み
- [x] 実装着手の承認（笹木さん）
- [x] Phase 1: CSV + 順序ローダー（+ seed-gotrue-dev CSV 駆動化）— commit `d013dfd`
- [x] Phase 2: provision の CSV マスタ投入化（行単位冪等）— commit `d013dfd`
- [x] Phase 3: マスタ管理画面（API + UI + admin 帯昇格防止 RLS）— commit `ceb2bb6`
- [x] ローカル検証
  - [x] クリーン投入（dev:up 相当）で 5 役職 + マスタ、実ログイン可
  - [x] ローダー冪等性 + ゾンビ復活防止（DELETE→再 seed で復活せず）
  - [x] provision 単一/bulk/行単位冪等/cleanup 注入/0600 PW/must_change
  - [x] pgTAP all passed（6 files・admin 帯昇格不可含む）
  - [x] typecheck 全パッケージ / web build 成功
  - [x] API 実機: admin CRUD / FK 削除 409 / admin帯 995 → 400 / 非admin → 403
- [ ] コードレビュー（`/pr-review` or Codex）
- [ ] PR 作成（`develop` 向け）

> Phase 1-3 実装 + ローカル検証まで完了。残課題: B-1 の「users.position_id への admin帯付与ガード」は
> 既存 users ルートの話で本スコープ外（後続タスク候補）。次はコードレビュー → PR。
