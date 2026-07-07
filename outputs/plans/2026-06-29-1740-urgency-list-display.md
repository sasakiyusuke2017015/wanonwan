# Plan: 緊急度の一覧表示（admin surveys / answers）

| 項目 | 値 |
|---|---|
| ステータス | 🟣 コードレビュー APPROVE（PR 前・笹木さんマージ承認待ち） |
| slug | `urgency-list-display` |
| 作成 | 2026-06-29 17:40 JST |
| 更新 | 2026-07-06 JST（色付き Badge / 両画面で確定、前提を最新 develop に更新） |
| 担当 | Claude Code + 笹木さん |
| ブランチ | `feature/urgency-list-display`（TBD） |
| 関連 PR | TBD |
| レビュー | [コードレビュー](../reviews/2026-07-06-0739-urgency-list-display-review.md)（APPROVE）+ security レビュー（APPROVE） |
| 前提 Plan | [緊急度マスタ](2026-06-29-1537-urgency-master.md)（#62/#63 マージ済み） |
| git repo | `https://github.com/sasakiyusuke2017015/waoon.git` |

---

## 目的

緊急度（高/中/低）は #62/#63 で設定できるようになったが、**一覧では見えない**。
管理者が `/admin/surveys`・`/admin/answers` の一覧を見て**緊急度でトリアージ**できるよう、
一覧に緊急度を **色付き Badge** で表示する。

## スコープ

### やること
1. **一覧 API に urgency を返す**
   - `GET /api/v1/surveys`: `left join urgency_levels` で `s.urgency_id` を解決し、
     `urgencyName`（name）と `urgencyCode`（並び順・ソート用）を返す。
   - `GET /api/v1/answers`: 同様に `a.urgency_id` を解決して返す。
   - いずれも未設定は null。
2. **一覧ページに緊急度カラムを追加（色付き Badge）**
   - `admin/surveys/page.tsx`・`admin/answers/page.tsx` の `COLUMNS` に「緊急度」列を追加。
   - セルは `Column.render` で **`@waoon/ui` の `Badge` atom** を描画（高=red / 中=yellow / 低=green、
     未設定は薄い "—" テキスト）。
   - ソート可能にする（`urgencyCode` 基準）。検索は緊急度名（`urgencyName`）に乗せる。

### やらないこと（スコープ外）
- 緊急度での絞り込み UI（専用フィルタ）。ソートのみ対応。検索ボックスには名前で乗る。
- 回答者向け画面・ダッシュボード集計への緊急度表示。
- スキーマ / マスタ / 書き手 UI の変更（#62/#63 で完了済み）。
- `Badge` / `AdminListTable` / `DataTable` 本体の改修（**改修不要**。後述の前提更新参照）。

## 現状コンテキスト（2026-07-06 develop 反映）

- **スキーマ**: `urgency_levels(id, code, name)`。`surveys.urgency_id` / `answers.urgency_id` は
  既に存在（nullable, FK → urgency_levels）。
  → [35_urgency.sql](../../packages/db/schema/35_urgency.sql)・
  [40_surveys.sql:20-22](../../packages/db/schema/40_surveys.sql#L20-L22)・
  [60_answers.sql:28-30](../../packages/db/schema/60_answers.sql#L28-L30)。
- **一覧 API**:
  - [surveys/route.ts:9-19](../../apps/web/app/api/v1/surveys/route.ts#L9-L19) GET: `id, title, status, capacity, requiresAuth, usesAi, publicationCount`（urgency なし）。
  - [answers/route.ts:7-21](../../apps/web/app/api/v1/answers/route.ts#L7-L21) GET: `id, status, healthStatus, interviewAt, respondentName, surveyTitle, publicationTitle`（既に users / survey_publications / surveys を join 済み。urgency なし）。
  - マスタ取得 [urgencies/route.ts](../../apps/web/app/api/v1/urgencies/route.ts) は `id, code, name` を code 昇順で返す（既存）。
- **一覧ページ**: 両者とも `AdminListTable`（`columns` / `sortable`）。現状は `Row` を**文字列化**して渡し、
  `render` は未使用（[surveys/page.tsx:43-64](../../apps/web/app/(admin)/admin/surveys/page.tsx#L43-L64)・
  [answers/page.tsx:28-59](../../apps/web/app/(admin)/admin/answers/page.tsx#L28-L59)）。
- **列単位カスタムセル描画は既に可能（前提が変わった点）**:
  今回 develop に取り込まれた `DataTable` で `Column<TRow>` に
  **`render?: (row) => ReactNode`** が入り（[types.ts:219-247](../../packages/ui/core/organisms/DataTable/types.ts#L219-L247)）、
  `renderCellContent` が `render` を優先描画する（[tableCells.tsx:26-31](../../packages/ui/core/organisms/DataTable/tableCells.tsx#L26-L31)）。
  `AdminListTable → DataTable → ClientDataTable → DataTableContent → renderCellContent` の全経路で有効。
  → **行内 Badge に共有改修は不要**（旧 Plan の「スコープ外」前提は解消）。
- **Badge**: [Badge.tsx](../../packages/ui/core/atoms/Badge/Badge.tsx) に `color`（red/yellow/green/…）/
  `variant`（error/warning/success/…）/ `styleVariant` / `size` があり export 済み。緊急度に直結。
  正確な props 名は実装時に `Badge.tsx` で最終確認する。

## 実装計画

1. **API**
   - surveys GET に `left join public.urgency_levels ul on ul.id = s.urgency_id` を足し、
     `ul.name as "urgencyName"`, `ul.code::int as "urgencyCode"` を返す。
   - answers GET も同様に `a.urgency_id` を join して返す。
2. **色マッピング関数**
   - 緊急度の**相対的な高さ**で色を決める（高=red / 中=yellow / 低=green）。
     詳細方針は「未確定事項1」と「リスク」参照。共通ユーティリティとして切り出す
     （例: `lib/urgency/color.ts`）。
3. **surveys 一覧ページ**
   - `SurveyRow` に `urgencyName/urgencyCode` を追加。`Row` に `urgencyName`（表示名）と
     ソート用 `urgencyCode`（null は末尾へ正規化）を持たせる。
   - `COLUMNS` に「緊急度」列を追加し、`render` で `Badge` を返す（未設定は "—"）。
     `key` は `urgencyCode`（数値でソートが効く）にし、`SORTABLE` に追加。検索名は `urgencyName`。
4. **answers 一覧ページ**: 同様にカラム追加。
5. typecheck / build / lint / 関連テスト。

## 検証
- `pnpm -r typecheck` / `pnpm --filter @waoon/web build` / lint。
- 手動（dev 実機）:
  - surveys/answers 一覧に緊急度列が出る（設定済みは 高=赤 / 中=黄 / 低=緑 の Badge、未設定は "—"）。
  - 緊急度でソートできる（昇順/降順で 低↔高、未設定は端に寄る）。
  - 検索ボックスに緊急度名を入れて絞れる。
- DB 変更なしのため pgTAP 追加は不要（既存回帰のみ）。色マッピング関数には unit test を付ける。

## リスク
- **色マッピングとマスタ可変性**: `urgency_levels` はマスタで段数（行数）が可変。色を `code` の
  固定値（1/2/3）にハードコードすると、マスタの増減や code 振り直しで破綻する。
  → **相対順位ベース**（マスタ全体で並べたときの相対位置）で色を決める設計にし、
  想定外・未取得時は gray にフォールバックする。既定の段数割当は未確定事項1で確定する。
- **render 列のソート挙動**: `render` を使う列でも `DataTable` のソート/検索が `row[key]` を
  参照する前提。`key` をソート用の数値（`urgencyCode`）にし、表示は `render` の `Badge` で出す。
  実装時に `DataTable` のソート実装（`sortable` の key 解決）を確認して整合させる。
- **join のパフォーマンス**: `urgency_levels` は数行の極小マスタで left join の影響は無視できる。
- **未設定（null）の並び順**: `urgencyCode` を null→大値等で正規化し、端に寄せる。

## 未確定事項
1. **色マッピングの段数割当ルール**（既定案あり）:
   - 既定案: 一覧ページで `/api/v1/urgencies` を fetch して code 昇順の相対順位を出し、
     3 段階なら 低=green / 中=yellow / 高=red。2 段階なら green/red、4 段階以上は
     下位=green・上位=red・中間=yellow に寄せる。マスタ未取得や不明は gray。
   - シンプル案: マスタは実務上 高/中/低 の 3 段階固定とみなし、code 昇順の index で
     green→yellow→red を割当（追加 fetch なし。API が返す `urgencyCode` だけで決定）。
   - → どちらでも動く。既定は「シンプル案（追加 fetch なし）」で進め、将来マスタを増やす予定が
     あれば相対順位案に上げる。ここは実装レビューで最終確定してよい。
   - **【決着 2026-07-06】相対順位案を採用**。`/api/v1/urgencies`（既存・軽量）を一覧ページで
     fetch し、code 昇順の相対位置で色を割当（`lib/urgency/color.ts`）。追加 fetch は 1 本のみで、
     マスタ段数の増減に耐える方を採った。

## 判断ログ
| 日付 | 判断 | 理由 |
|---|---|---|
| 2026-06-29 | まずテキストラベル表示に留める（当時の既定） | 行内色付き Badge は共有 AdminListTable 改修が必要でスコープが膨らむと判断していた |
| 2026-06-29 | ソートは urgencyCode 基準 | name の文字列ソートでなく緊急度の順序（低→高）で並べるため |
| 2026-07-06 | 表示を**色付き Badge** に格上げ（テキストラベルから変更） | pull した develop で `DataTable` の `Column` に `render?:(row)=>ReactNode` が追加され、`AdminListTable` の共有改修なしで行内 Badge を描画可能になった。旧 Plan の「スコープ外」前提が解消したため |
| 2026-07-06 | 対象は surveys / answers **両方** | 笹木さん確定 |
| 2026-07-06 | Badge は既存 `@waoon/ui` の `Badge` atom を使用（新規部品なし） | `color=red/yellow/green` が揃い緊急度 高/中/低 に直結。ui-catalog 吸収方針とも整合 |
| 2026-07-06 | 色は `code` 固定値でなく**相対順位**で決める | マスタ段数が可変で、code ハードコードは増減・振り直しで破綻するため |
| 2026-07-06 | 緊急度列の**名前検索は非対応**にする | `DataTable` は列の生値でソート/検索する（[ClientDataTable.tsx:190-240](../../packages/ui/core/organisms/DataTable/ClientDataTable.tsx#L190-L240)）。ソート順（code）を優先し `key="urgencyCode"`（数値）にしたため名前検索は効かない。緊急度は少数値でソートすれば足りるため許容 |
| 2026-07-06 | 未設定はソート用 code を `9999` に正規化 | `render` は表示専用でソートは生値依存。未設定（null）を数値ソートで末尾へ寄せるための番兵。表示は `urgencyName` の null で "—" 判定（`9999` は表示に出さない） |

## 残課題（NICE-TO-HAVE / 後追い）

コードレビュー / security レビューで挙がった非ブロッキング項目。差し戻し不要、後続タスク化。

- **2 ページ間のロジック重複**: `UrgencyLevel` 型 / `urgencies` useQuery / `sortedCodes` / 緊急度列 render が
  surveys・answers でほぼ同一。3 画面目が出るなら `lib/urgency/` に列 factory / フック抽出を検討（現状 2 箇所なので必須でない）。
- **フロント型 `UrgencyLevel.id: string` とスキーマ `bigint` の不一致**: `id` は色算出（code ベース）に未使用で実害なし。
- **番兵 `9999` が全文検索にヒットしうる**: 全文検索が可視列の生値（`String(urgencyCode)`）を対象にするため
  `9` 検索で未設定行が付随ヒット。既存の `publicationCount` 数値列も同挙動で一貫。名前検索非対応は合意済みのトレードオフ範囲内。

## ステータス
- [x] 未確定事項（表示方法 / 対象画面）を確定 → 色付き Badge / surveys・answers 両方
- [x] API（surveys / answers GET に urgency join）
- [x] 色マッピング関数（+ unit test）
- [x] surveys 一覧ページに緊急度カラム（Badge）
- [x] answers 一覧ページに緊急度カラム（Badge）
- [x] 検証: typecheck / lint / build / vitest すべて green、self-review 済み
- [x] コードレビュー（code-reviewer / security-reviewer エージェント）→ 両者 APPROVE
- [ ] PR 作成 → 笹木さんマージ承認
- [ ] マージ後検証（dev 実機）
  - [ ] surveys/answers 一覧に緊急度 Badge が出る（高=赤 / 中=黄 / 低=緑、未設定は "—"）
  - [ ] 緊急度でソートできる（低↔高、未設定は端）
  - [ ] マスタ段数を変えても色が破綻しない（相対順位）
