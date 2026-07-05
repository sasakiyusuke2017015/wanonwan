# Plan: DataTable 移植（ai_edu 版）+ admin 一覧の乗り換え

> ステータス: 🔵 計画レビュー待ち（Codex 計画レビューは笹木さんが手動起動）

| 項目 | 値 |
|---|---|
| 作成日時 | 2026-07-05 09:20 JST |
| 担当 | Claude Code + 笹木さん |
| ブランチ | PR-A: `feature/datatable-port` / PR-B: `feature/datatable-adoption` |
| 関連 PR | TBD |
| レビュー | TBD |
| 前提 | **#66（カタログ堅牢化）マージ後に実装着手**（同じ catalog organisms を触るため） |

## 目的

UI/UX 改善テーマ3「一覧 UX」。監査 High/Medium（H-4 ページネーション皆無・M-1 キーボード操作不可・
M-2 列ヘッダ非連動ソート・M-3 リトライ導線なし）を、ai_edu フォークで実戦検証済みの
**DataTable システムを移植**して一挙に解消する。

事前調査（2026-07-05 チャット内）の要点:

- ai_edu の `DataTable` は 21 ファイル・約 5,600 行 + **テスト 1,593 行**の汎用一覧システムで、
  ai_edu 実アプリの 16 テーブルで稼働中。列ヘッダソート（多列）/ 内蔵ページネーション /
  全文検索 + select フィルタ / ColumnPicker（列表示切替・永続化）/ 行アクション（ConfirmDialog 内包）/
  安定キー行選択 / `aria-sort` / skeleton / 空状態出し分けを持つ。
- waoon の同名 `DataTable` organism は **未使用の死蔵コード**（string[][] 簡易版）。置き換えても
  壊れる参照がない。
- 実運用の [AdminListTable](../../apps/web/components/admin/AdminListTable.tsx) は表計算用
  `InteractiveTable`（657 行）の流用で、列ヘッダソート・フィルタ・ページネーション・行アクションが無い。
- 依存（framer-motion / @tanstack/react-virtual / @dnd-kit）は**バージョンまで両 catalog で一致**。
  SCSS Modules + CSS 変数の基盤も共通。

### 非目標（このテーマではやらない）

- ServerDataTable（server モード）の**アプリ側採用**（organism としては移植するが、現行データ規模では
  client モードで足りる。API 側の limit/offset 対応はデータ増加時の別 Plan）
- InteractiveTable のリファクタ・**DataTable への機能吸収（部品レベルの一本化）**。
  セル選択・列リサイズ・仮想化は表計算用の機能で、一覧用 DataTable にオプションとして
  足すと ai_edu が意図的に分けた役割分担を壊して肥大化する。アプリ利用の一本化（上記 PR-B）で
  目的は達成される。PR-B 後に InteractiveTable のアプリ利用がゼロになるため、
  **catalog から削除するか（evergreen）Storybook 資産として残すかは別途判断**（残課題）
- 公開側一覧（`/surveys`）のカード UI 変更（テーマ5 以降）
- ui テストスイート既存破損の全体修復（テーマ2 の残課題のまま。ただし移植テストが
  `__tests__/helpers` を要する場合、**helpers の移植は本 Plan に含める**＝残課題の一部が自然解消）

## スコープ（2 PR 構成）

### PR-A: catalog 移植（`feature/datatable-port`）

| 対象 | 変更 |
|---|---|
| `packages/ui/core/organisms/DataTable/` | ai_edu 版で**丸ごと置き換え**（旧 string[][] 版は削除。evergreen: 未使用 dead code）。import パスを `@ai-education/ui` → 相対 / `@ui-catalog/core` に書き換え |
| `packages/ui/core/molecules/Pagination/`（新規） | ai_edu 版を移植（server モード・将来の一覧でも使う汎用部品） |
| `packages/ui/core/molecules/Toggleable/`（新規） | ai_edu 版を移植（collapsible toolbar が依存） |
| `packages/ui/core/utils/isModifiedClick`（新規） | 数行の util（href 行アクションが依存） |
| tokens / Tailwind 定義 | ai_edu 特有トークン（`text-muted-foreground` / `bg-muted` / `--color-surface` 等）の waoon 側定義を確認し、未定義なら補完 |
| barrel / exports | organisms・molecules の index 更新 + `./organisms/DataTable` subpath 追加 |
| テスト / stories | `DataTable.test.tsx`（1,593 行）・`columnVisibility.test.ts`・`useDragAutoScroll.test.ts`・stories を移植。**移植分のテストが waoon の vitest で green になること**を PR-A の完了条件にする |

### PR-B: admin 一覧の乗り換え = **アプリのテーブル UI を DataTable に一本化**（`feature/datatable-adoption`）

アプリの InteractiveTable 参照は **AdminListTable / MasterListView 経由 + 型 import
（`Column` / `TableRowData`）のみ**であることを確認済み（2026-07-05）。したがって
AdminListTable のアダプタ化で、admin 4 一覧 + マスタ画面（org×3 / positions / urgencies /
設問マスタ）が**すべて DataTable に乗り換わり、apps/web の InteractiveTable 参照はゼロ**になる。
これを PR-B の完了条件とする。

| 対象 | 変更 |
|---|---|
| `apps/web/components/admin/AdminListTable.tsx` | InteractiveTable 流用をやめ、**新 DataTable（client モード）への薄いアダプタ**に置換。既存の props 面（`searchKeys` / `sortable` / 行クリック）は互換を保ちつつ、列ヘッダソート・ページネーション・件数表示を解放 |
| `app/(admin)/admin/{users,surveys,answers,questions}/page.tsx` + `lib/admin/master-config.ts` | 列定義と型 import（`Column`/`TableRowData` → DataTable の `Column<TRow>`）を移行。マスタ画面は MasterListView → AdminListTable 経由のため自動で乗り換え |
| エラー時のリトライ導線（監査 M-3） | アダプタのエラー表示に「再試行」ボタン（`refetch`）を追加 |
| `lib/table/filter-sort.ts` | DataTable 内蔵の検索/ソートに置き換えられた場合は削除（unit test ごと。evergreen） |

## 実装計画

1. **PR-A**: DataTable 一式 + Pagination / Toggleable / isModifiedClick を移植 → import 書き換え →
   トークン差分の確認・補完 → テスト・stories を移植し green 化 → 旧 DataTable 削除。
   **アプリ側変更ゼロ**（純粋な catalog 追加/置換）なので、web の typecheck/build が通れば安全。
2. **PR-A の検証**: `pnpm -r typecheck` / `pnpm lint` / `pnpm --filter @ui-catalog/core test`
   （少なくとも DataTable 系は green）/ web build。**テーマ切替（色/形/テクスチャ）で DataTable の
   CSS 変数が追従するか**を ui-demo か Storybook で確認（事前調査で唯一の実質リスクと判定した点）。
3. **PR-B**: AdminListTable をアダプタ化 → 4 一覧の列定義移行 → リトライ導線 → 手動確認。
4. **PR-B の検証**: 上記 + `pnpm --filter @waoon/web test`。手動確認は下記。

## 検証（PR-B の手動確認 = マージ後検証）

- [ ] admin 4 一覧（users/surveys/answers/questions）が表示・検索・**列ヘッダクリックでソート**できる
- [ ] ページネーションが機能し、件数表示が出る（20 件超のデータで確認）
- [ ] 行クリックで従来どおり詳細/編集へ遷移する
- [ ] クエリ失敗時に「再試行」ボタンが出て、クリックで再取得する
- [ ] 空状態（0 件 / 検索 0 件）の文言が出し分けられる
- [ ] テーマ切替（色・形・テクスチャ）に DataTable の見た目が追従する
- [ ] キーボードで列ヘッダソート・ページ移動が操作できる

## リスク

| リスク | 対応 |
|---|---|
| **テーマ供給経路の違い**（ai_edu 版は CSS 変数任せ / waoon 現行は useTheme() の runtime props 注入） | PR-A の完了条件に「テーマ切替追従の確認」を含める。追従しない場合は DataTable ラッパで CSS 変数を注入する薄い層を挟む（判断ログに記録） |
| ai_edu 特有の Tailwind トークン未定義で色が出ない | 移植時に grep で全トークンを洗い出し、waoon の tokens/Tailwind preset に補完。フォールバック値（`var(--x, #fff)`）の有無も確認 |
| 移植テストが ai_edu の `__tests__/helpers` に依存 | helpers ごと移植（waoon で欠けている既存問題の一部解消を兼ねる） |
| 移植量が大きく PR レビューが重い | PR-A（catalog・アプリ影響ゼロ）と PR-B（アプリ乗り換え）に分割。PR-A は「移植そのまま + パス/トークン調整」を明記しレビュー観点を絞る |
| AdminListTable の互換が崩れて 4 一覧の挙動が変わる | 既存 AdminListTable のテスト（filter-sort unit）相当の観点を PR-B で担保。手動確認 7 項目 |

## 判断ログ

| 日付 | 判断 | 理由 |
|---|---|---|
| 2026-07-05 | ai_edu DataTable を organism ごと移植（部分移植・独自再実装は不採用） | waoon 側 DataTable は死蔵で置換リスクゼロ。依存一致・SCSS/CSS 変数基盤共通・16 テーブル + 1,593 行テストの実戦品質。InteractiveTable への機能追加は表計算と一覧の捻れを悪化させる |
| 2026-07-05 | 2 PR 分割（catalog 移植 → アプリ乗り換え） | 移植 5,600 行超を 1 PR にするとレビュー不能。PR-A はアプリ影響ゼロで安全に入れられる |
| 2026-07-05 | server モードは移植するがアプリ採用は見送り | 現行データ規模では client で足りる。API の limit/offset 対応はデータ増加時の別 Plan |
| 2026-07-05 | 「一本化」はアプリ利用レベルで実施（部品レベルの機能統合は不採用） | アプリの InteractiveTable 参照は AdminListTable/MasterListView 経由 + 型 import のみと確認。アダプタ置換で全一覧（admin 4 + マスタ 6 画面）が DataTable 化し参照ゼロになる。表計算機能を DataTable にオプション追加する統合は役割分担を壊すため不採用 |

## ステータス

- [ ] Plan 承認（計画レビュー）
- [ ] #66 マージ（実装着手の前提）
- [ ] PR-A 実装・レビュー・merge
- [ ] PR-B 実装・レビュー・merge
- [ ] マージ後検証（手動確認チェックを消化）
