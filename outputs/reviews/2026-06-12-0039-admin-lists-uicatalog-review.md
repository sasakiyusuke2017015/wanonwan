# コードレビュー: 管理画面3一覧の InteractiveTable 定石化

- 対応 Plan: [outputs/plans/2026-06-11-1730-pleasanter-exit-1on1-rebuild.md](../plans/2026-06-11-1730-pleasanter-exit-1on1-rebuild.md)
- slug: `admin-lists-uicatalog`
- ブランチ: `feature/admin-lists-uicatalog`
- レビュー対象: 作業ツリー差分（未コミット）。`develop..HEAD` は空のため `git diff` / `git status` で確認。

## 変更ファイル

| ファイル | 種別 | 内容 |
|---|---|---|
| `apps/web/components/admin/AdminListTable.tsx` | 新規 | InteractiveTable をテーマ適用して包む再利用ラッパ |
| `apps/web/app/(admin)/admin/users/page.tsx` | 変更 | 素 table → AdminListTable + COLUMNS + 行 map |
| `apps/web/app/(admin)/admin/surveys/page.tsx` | 変更 | 同上 |
| `apps/web/app/(admin)/admin/answers/page.tsx` | 変更 | 同上 |
| `packages/ui/package.json` | 変更 | `./organisms/InteractiveTable` deep export 追加 |
| `.claude/settings.json` | 変更 | 権限 allowlist 追記（機能外） |

---

## 依頼観点への回答

### 1. hydration 安全性（mounted ゲート） — 問題なし

- `InteractiveTable.tsx` を確認した結果、内部は **theme atom を一切読んでいない**（`useTheme` / `useAtomValue` / jotai の参照なし）。色・形状はすべて props 経由で受ける設計。したがってラッパの `mounted` ゲートが渡すテーマ値が描画を完全に支配する。
- ラッパの `DEFAULT_THEME = getThemeConfig(DEFAULT_GLOBAL_THEME.colorTheme, DEFAULT_GLOBAL_THEME.shapeTheme)` は、`themeConfigAtom`（= `getThemeConfig(colorThemeAtom, shapeThemeAtom)`、各 atom の既定は `DEFAULT_GLOBAL_THEME.*`）の SSR 値と一致する。よって SSR と初回クライアント描画の色は一致し、hydration mismatch は発生しない。mounted ゲートは localStorage 同期 atom の即時反映に対する belt-and-suspenders として正しく機能する。
- `useTheme()`（`useAtomValue`）はサーバ描画時も無条件に呼ばれるが、Hooks ルールに沿った正しい形（条件分岐は「値の採否」だけ）。

### 2. 行クリック遷移の妥当性 — 問題なし

- `useKeyboardNavigation.ts:99` で `onCellClick(rowIndex, colIndex, column, data[rowIndex])` と、各ページが渡した **元の Row オブジェクトそのもの** が第4引数で渡る。ラッパの `onCellClick={(_r,_c,_col,row) => onRowClick(row as T)}` 経由で `row.id`（API 由来 string）が読める。`id` を非表示フィールドとして row に載せる方式は正しく成立している。
- 遷移先は `router.push(\`/admin/users/${row.id}/edit\`)` 等。`id` は API レスポンス由来の string で、URL パスセグメントに使う。`renderCellContent.tsx` に `dangerouslySetInnerHTML` は無く、既定 `cellType`（text）は `String(value)` / React テキストノードで描画されるため **XSS シンクなし**。誤遷移リスクも、id が各 row に 1:1 で対応するため無い。

### 3. 型安全性 — 概ね良好（NICE-TO-HAVE あり）

- `Column` / `TableRowData` は deep export 型を正しく利用。`proportion: number` は `Column.proportion: string | number` に適合。`dataAlign` も型内 union に適合。
- `row as T` キャストは、`onCellClick` の第4引数が `TableRowData`（基底型）で返るのに対し、ラッパ内では `T extends TableRowData` の具象が来ると分かっているため実害なし。ただし下記 NICE-TO-HAVE 参照。

### 4. 高さ（heightPercent=100 + heightOffsetCss="16rem"） — SSR 安全

- `InteractiveTable.tsx:123-138` の高さ計算 `useEffect` は `if (heightOffsetCss) return;` で **即 return**。`window.innerHeight` 等の JS 計測パスを通らない。
- `InteractiveTable.tsx:257-259` で `cssHeight = calc((100vh - (16rem)) * 1)` という純 CSS 式を採用。`window` 非依存・SSR 安定。シェルの chrome（header56+subheader44+footer36+タイトル）合計が約 16rem 弱に収まる前提なら破綻しない（実機スモークで 200・クラッシュ無し確認済みとのこと）。

### 5. 既存挙動の維持 — 維持されている

- 編集/詳細導線: 旧「編集」「面談記録」リンク → 行クリック遷移へ置換。遷移先 URL は同一（users `/edit`、surveys `/edit`、answers 詳細）。導線は失われていない。
- 空表示: `!loading && data.length === 0` でラッパ側が破線ボックス + emptyMessage を表示。
- ローディング: `loading` を InteractiveTable に委譲。
- エラー: `error` 文字列をラッパ側で赤字表示。
- surveys の「新規作成」ボタンは `Link` で温存。`Link` import も使用継続で未使用なし。

---

## 指摘

### [NICE-TO-HAVE] 行クリックの a11y（キーボード到達性）

行クリック遷移はマウス前提で、`<td onClick>` ベース。キーボード単独ユーザーは行遷移にたどり着けない（InteractiveTable のセル選択キーボードは遷移とは別系統）。本 PR は「定石化のみの増分」で、フィルタ/ソート等と同様にインタラクション拡充は後続スコープと解釈できるため BLOCKER にしない。後続でキーボード Enter での遷移、または各行に編集リンクを併設する案を残課題に。

### [NICE-TO-HAVE] `row as T` キャストの明示コメント

`onCellClick` の第4引数が基底 `TableRowData` で来るため `as T` が必要、という非自明な事情は `evergreen.md` の「Why コメントは残してよい」に該当する。1 行コメントがあると次の読者がキャストの安全性を再検証せずに済む。

### [NICE-TO-HAVE] users の行 map が実質コピー

`const rows: Row[] = (data?.data ?? []).map((u) => ({ ...u }));` は `Row = TableRowData & UserRow` への適合のためだけのシャローコピー。`data?.data ?? []` をそのまま `data={...}` に渡しても型は通る（`UserRow` は `TableRowData` の構造を満たす）。機能上は無害なので任意。

### [NICE-TO-HAVE] `.claude/settings.json` の権限追記が混在

本 PR の差分に `.claude/settings.json` への allowlist 追記（`Bash(git commit *)` 等を含む）が含まれる。機能変更と無関係なツール権限の蓄積で、`git-workflow.md` の「1 ブランチ = 1 テーマ」観点では別コミット/別 PR が望ましい。特に `Bash(git commit *)` は広いワイルドカード許可で、レビューなし commit を実質許してしまう点に留意（このリポジトリの運用判断に委ねる）。コミット分離か、少なくとも commit 時にこのファイルを含めるか確認を。

---

## 検証状況

- typecheck/build green、実機スモーク（admin ログイン→/admin/users,surveys,answers が 200・SSR クラッシュ無し、API 7/4/3 行）確認済みとの申告。レビュー側ではコード静的確認のみ実施（再実行はしていない）。

---

## 最終判定

- **実装判定: APPROVE**

[BLOCKER] は無し。hydration・行クリック遷移・XSS・SSR 高さ・既存導線維持のいずれも問題なし。指摘はすべて [NICE-TO-HAVE]（a11y のキーボード遷移、`as T` の Why コメント、users の冗長 map、`.claude/settings.json` の混在）で、差し戻し理由にはしない。a11y と settings.json 混在は後続/コミット整理時に拾うことを推奨。

verdict: APPROVE
