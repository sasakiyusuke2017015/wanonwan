# Code Review: 緊急度の一覧表示（admin surveys / answers）

| 項目 | 値 |
|---|---|
| slug | `urgency-list-display` |
| 対象 | `feature/urgency-list-display`（`git diff develop...HEAD`, HEAD=c39a032） |
| レビュー作成 | 2026-07-06 07:39 JST |
| レビュアー | Claude Code（code-reviewer） |
| 関連 Plan | [2026-06-29-1740-urgency-list-display.md](../plans/2026-06-29-1740-urgency-list-display.md) |

## 最終判定

- **Plan 判定**: 対象外（本レビューはコードレビュー）
- **実装判定**: ✅ APPROVE — BLOCKER なし。NICE-TO-HAVE のみ。
- **記録整理**: 下記 NICE-TO-HAVE は Plan の残課題として後追い可。差し戻し不要。

---

## 対象ファイル

- `apps/web/app/api/v1/surveys/route.ts`（+3）
- `apps/web/app/api/v1/answers/route.ts`（+3）
- `apps/web/lib/urgency/color.ts`（新規）
- `apps/web/lib/urgency/color.test.ts`（新規）
- `apps/web/app/(admin)/admin/surveys/page.tsx`
- `apps/web/app/(admin)/admin/answers/page.tsx`

---

## 検証した観点と結論

### API SQL（LEFT JOIN / null 安全性 / ::int）
- `left join public.urgency_levels ul on ul.id = s.urgency_id`（surveys）/ `= a.urgency_id`（answers）は
  nullable FK に対し正しく LEFT JOIN で、未設定は `urgencyName=null` / `urgencyCode=null` を返す。null 安全。
- `ul.code::int` は `urgency_levels.code`（`int`, `35_urgency.sql`）に対し冗長だが無害。
  node-postgres の int4→JS number を明示する意図として `publicationCount::int` と一貫。問題なし。
- LEFT JOIN の追加で既存の他 select 列（`requiresAuth`/`usesAi`/`healthStatus` 等）に影響なし。

### 色マッピング関数（`lib/urgency/color.ts`）
- 相対順位ロジックは境界含め正しい。unit test（6 ケース）green を実行確認済み。
  - 3 段 `[1,2,3]` → green/yellow/red、4 段 `[1,2,3,4]` → green/yellow/red/red、2 段 → green/red。
  - 飛び番 `[10,50,90]` でも相対順位で決まる。
  - 未知 code / 段数 1 以下 / 空配列 → `gray` フォールバック。
  - 境界 `position >= 2/3`・`>= 1/3` は `index/(length-1)` と定数が同一 double に評価されるため
    浮動小数の取りこぼしなし（4 段の index2=2/3 が red 側に入る）。
- 5 段以上でも green→…→red に単調に広がり破綻しない。
- `BadgeColor` は `green/yellow/red/gray` を含む（`Badge.tsx:15`）ので返り値は型安全。

### 一覧ページ（surveys / answers）
- 番兵 `UNSET_URGENCY_CODE=9999`: 表示は `urgencyName==null` 判定で "—" を出し、9999 は画面に出ない。
  ソートは `cellTextValue`（`row[key]` の `String`）→ `Number` 数値比較（`ClientDataTable.tsx:222-240`）
  のため、未設定が昇順で末尾に寄る挙動は意図通り。
- ソート整合: 列 `key="urgencyCode"`（数値）＋ `SORTABLE` 追加で緊急度順（低→高）ソートが効く。
  `render` は表示専用でソートは生値依存という DataTable の仕様に正しく合わせている。
- `useMemo` 依存: `sortedCodes`（dep=`urgencyData`）→ `columns`（dep=`sortedCodes`）で妥当。
  render クロージャが参照する `Badge`/`urgencyBadgeColor` は安定 import。
- イミュータビリティ: `(urgencyData?.data ?? []).map(...).sort(...)` は map の新規配列に対する sort で
  元データを破壊しない。問題なし。
- TanStack Query 追加 fetch: `queryKey:["urgencies"]` は両ページ共有・小マスタでキャッシュされ、N+1 なし。
- 既存 answers/surveys ページの記法（rows 非メモ化・STATUS_COLOR 等）と一貫。

---

## 指摘

### [NICE-TO-HAVE] 2 ページ間のロジック重複
ファイル: `admin/surveys/page.tsx` / `admin/answers/page.tsx`
`type UrgencyLevel`、`urgencies` の `useQuery`、`sortedCodes` の `useMemo`、緊急度列の `render` ブロックが
両ページでほぼ同一。将来 3 画面目が出るなら `lib/urgency/` に「緊急度列 factory」または
`useUrgencyColors()` フックとして抽出すると DRY。現状 2 箇所なので必須ではない。

### [NICE-TO-HAVE] 番兵 9999 が全文検索にヒットしうる
ファイル: `admin/*/page.tsx`（緊急度列 `key="urgencyCode"`）
`ClientDataTable` の全文検索は可視列すべての生値（`String(urgencyCode)`）を対象にするため、
検索ボックスに `9` 等を入れると未設定行（code=9999）が付随ヒットする。
既存の数値列（`publicationCount`）も同様に検索対象で挙動は一貫しており実害は小さいが、
気になるなら緊急度列を検索対象から外す（DataTable 側に searchable フラグがあれば利用）余地あり。
Plan で「名前検索は非対応」と合意済みのトレードオフ範囲内。

---

## verdict

APPROVE
