# Review: 緊急度マスタ PR-1 コードレビュー

| 項目 | 値 |
|---|---|
| 作成日時 | 2026-06-29 16:31 JST |
| レビュアー | Claude Code エージェント（code-reviewer + security-reviewer 並列）統合 |
| 対象 Plan | [`plans/2026-06-29-1537-urgency-master.md`](../plans/2026-06-29-1537-urgency-master.md)（PR-1） |
| 対象ブランチ | `feature/urgency-master` |
| 対象コミット | `30ed087`（+ レビュー反映 `0d2560c`） |
| レビュー種別 | コード |
| 備考 | Codex トークン枯渇のため code-reviewer / security-reviewer エージェントで実施 |

## 判定

| 項目 | 判定 | スコープ / 意味 |
|---|---|---|
| 最終判定 | **APPROVE** | BLOCKER / CRITICAL / HIGH なし。NICE-TO-HAVE は反映済み |
| Plan 判定 | N/A | 実装レビュー |
| 実装判定 | **APPROVE** | RLS・認可・injection・入力検証・seed いずれも positions の安全パターンを踏襲 |
| 記録整理 | OK | — |

## 指摘事項

| 重大度 | 箇所 | 指摘 | 対応 |
|---|---|---|---|
| NICE-TO-HAVE | `rls_urgency_levels.test.sql` | UPDATE 対象 code=3 / select 対象 code=1 が seed 投入前提。seed 未投入だと UPDATE 0 行でも lives_ok は通り「更新できた」を保証しない（positions テストも同じ seed 依存だが、より厳密にするなら自己完結化） | **反映済み**: admin で `INSERT … (1,'低'),(3,'高') ON CONFLICT DO NOTHING` を冒頭に入れ seed 非依存に（`0d2560c`） |

CRITICAL / HIGH / MEDIUM / BLOCKER: **なし**

## 確認した観点（両エージェント一致）

- **スキーマ / migration**: `urgency_levels` を `35_urgency.sql`（users 30〜surveys 40 の間）で新設。参照側 FK は本 PR に含まないため（PR-2 予定）番号順の不整合なし。`CREATE TABLE IF NOT EXISTS` で冪等。
- **RLS**: `99_rls.sql` に `ALTER TABLE public.urgency_levels ENABLE ROW LEVEL SECURITY`（ENABLE 漏れなし）+ マスタ系 FOREACH 配列に `urgency_levels` 追加 → `select=認証済み` / `write=admin`（`WITH CHECK app.is_admin()`）。GRANT ON ALL TABLES 下での無防備化を防げている。
- **認可**: 全エンドポイント（urgencies GET/POST・[id] GET/PUT/DELETE）が `withActiveUser` でラップ。write は RLS WITH CHECK(admin) で admin 限定（app 層 admin チェック無しでも非 admin write は 42501）。pgTAP test 4 で担保。
- **injection**: API は全て tagged template（`${input.code}` / `${Number(id)}`）+ `tx(set)`（postgres.js ヘルパ）。seed は `intLiteral`（非整数で exit）+ `sqlStr`（`'` エスケープ）。生値補間なし。
- **入力検証**: `parseBody` + `CreateUrgencySchema`（integer 1–9999 / name 非空）/ `UpdateUrgencySchema`（partial・空 set は 400）。
- **seed**: `MASTER_TABLES` に urgency_levels(code int + name)、`ON CONFLICT (code)`（schema の UNIQUE と一致）、CSV パス `urgency_levels.csv` / ヘッダ `code,name` 整合。
- **UI / 型**: `MASTER_CONFIGS.urgency` + 3 ページ + navItems は既存基盤利用。`iconName: "info-triangle"` は IconName union に実在（型チェック通過）。
- **情報露出 / 秘密情報**: urgency は code/name の非機微マスタ。ハードコード秘密なし。ミドルウェア（rate-limit/CSRF 前提）後退なし。

## 検証

- `pnpm -r typecheck` / `pnpm --filter @wanonwan/web build`（`/admin/urgencies{,/new,/[id]/edit}`・`/api/v1/urgencies{,/[id]}` 生成）/ `pnpm --filter @wanonwan/web lint` すべて green。
- `pnpm test:db`: **クリーン DB で全 8 ファイル pass**、`rls_urgency_levels`（plan 4: admin CRUD / 認証 select / 非 admin write 42501）pass。レビュー反映の seed 非依存化後も green。

## verdict

**APPROVE** — BLOCKER なし。NICE-TO-HAVE（pgTAP 自己完結化）反映済み。push + PR に進んでよい。
