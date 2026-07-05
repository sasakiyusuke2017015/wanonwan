# Plan: DataTable 移植（ai_edu 版）+ admin 一覧の乗り換え

> ステータス: 🟢 マージ済み（検証中）（PR-A #68 / PR-B #70 ともマージ済み・develop CI green。マージ後手動検証が残る）

| 項目 | 値 |
|---|---|
| 作成日時 | 2026-07-05 09:20 JST |
| 担当 | Claude Code + 笹木さん |
| ブランチ | PR-A: `feature/datatable-port` / PR-B: `feature/datatable-adoption` |
| 関連 PR | PR-A: [#68](https://github.com/sasakiyusuke2017015/waoon/pull/68)（merged）/ PR-B: [#70](https://github.com/sasakiyusuke2017015/waoon/pull/70)（merged） |
| レビュー | [計画レビュー](../reviews/2026-07-05-0925-datatable-port-review.md): APPROVE / [PR-A コードレビュー](../reviews/2026-07-05-1510-datatable-port-code-review.md): APPROVE（エージェント代行） |
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
| tokens / Tailwind 定義 | ai_edu 特有トークン（`text-muted-foreground` / `bg-muted` / `--color-surface` 等）の waoon 側定義を確認し、未定義なら補完。**補完は additive（未定義の追加）のみ**とし、既存トークンの差し替えが必要になった場合は判断ログに記録して個別判断（レビュー N-3） |
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
| エラー時のリトライ導線（監査 M-3） | AdminListTable に **`onRetry?: () => void` prop を追加**し、各一覧ページ / MasterListView から `useQuery` の `refetch` を渡す。error 表示に「再試行」ボタン（レビュー N-2: 表示だけで再取得できない形にしない） |
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

- [ ] **`rg -n "InteractiveTable" apps/web` が 0 件**（一本化の機械的確認。レビュー N-1）
- [ ] admin 4 一覧（users/surveys/answers/questions）が表示・検索・**列ヘッダクリックでソート**できる
- [ ] **マスタ 5 画面**（org 本部/部/課・positions・urgencies。設問マスタは admin 4 側で確認済みのため
      ユニークには計 9 画面）で表示・検索・行クリック遷移が退行していない（レビュー N-1）
- [ ] ページネーションが機能し、件数表示が出る（20 件超のデータで確認）
- [ ] 行クリックで従来どおり詳細/編集へ遷移する
- [ ] クエリ失敗時に「再試行」ボタンが出て、クリックで再取得する
- [ ] 空状態（0 件 / 検索 0 件）の文言が出し分けられる
- [ ] テーマ切替（色・形・テクスチャ）に DataTable の見た目が追従する
- [ ] キーボードで列ヘッダソート・ページ移動が操作できる
- [ ] **ヘッダメニュー / ユーザーメニューの開閉見た目に退行がない**（PR-A コードレビュー N-1: 新 DropdownMenu の既定アニメが `expandFromTrigger` に変わったため。退行があれば既定アニメを明示指定して修正）
- [ ] **列ピッカー（歯車）と件数セレクトの新規出現が意図どおり**（PR-B 代行レビュー: DataTable 既定で出現。不要なら `disableColumnPicker`。列表示の localStorage 永続が pathname 単位で効くか）

## リスク

| リスク | 対応 |
|---|---|
| **テーマ供給経路の違い**（ai_edu 版は CSS 変数任せ / waoon 現行は useTheme() の runtime props 注入） | PR-A の完了条件に「テーマ切替追従の確認」を含める。追従しない場合の CSS 変数注入は **catalog 側（infra/theme に theme→CSS 変数ブリッジ）で行うと事前に固定**（AdminListTable 側だと MasterListView 等の他利用者に効かないため。レビュー N-3、実施したら判断ログに記録） |
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
| 2026-07-05 | 計画レビュー APPROVE（[Review](../reviews/2026-07-05-0925-datatable-port-review.md)）。N-1〜N-3 を反映 | InteractiveTable 参照ゼロの機械確認 + マスタ画面の手動確認追加 / onRetry prop 明記 / トークン補完は additive 限定 + CSS 変数注入層は catalog 側と事前固定 |
| 2026-07-05 | PR-A 実装で判明した catalog API 乖離への対応方針 | IconButton は fork 版を移植（href/shimmer/primary variant。spinOnClick のみ Icon 全面刷新を要するため除外し DataTable 側 2 箇所から外した）/ DropdownMenu は prop 上位互換のため fork 版に置換（MenuItemList テストの失敗は baseline 比較で既存 stale と確認）/ Select は emptyLabel を additive 追加 / 不足アイコン 5 種（plus/pencil/copy/ban/grip）は lucide-react 依存を持ち込まず手書き SVG で追加 / animations.ts は純増のため fork 版に更新 |
| 2026-07-05 | 不足 CSS トークンは 7 種のみ additive 追加（hover-bg/selected-bg/bg-subtle/bg-surface/border-light/error/error-bg） | fork 設計では bg 系はフォールバック付きの任意トークン。--color-bg-surface はフォールバック無しで透明化するため waoon では #ffffff を定義。既存トークンの差し替えはゼロ |
| 2026-07-05 | PR-A コードレビュー APPROVE（[Review](../reviews/2026-07-05-1510-datatable-port-code-review.md)・エージェント代行）。NICE-TO-HAVE 2 件はコード変更せず残課題化 | N-1（DropdownMenu 既定アニメ変化）は移植の忠実性を優先し PR-B 手動確認へ / N-2（tableCells の `'use client'` 無し）は移植元と同一・実害ゼロのため将来の server import 時に対応 |
| 2026-07-05 | PR-B: AdminListTable を DataTable（client）の薄いアダプタに置換し、admin 4 一覧 + マスタ 5 画面を `Column<TRow>` へ移行。`InteractiveTable` 参照は apps/web で 0 件化 | 参照は AdminListTable / MasterListView + 型 import のみだったため、アダプタ置換で全一覧が乗り換わり機械的ゴール（`rg InteractiveTable apps/web` = 0）を達成。列ヘッダソート・全文検索・内蔵ページネーション・件数表示・空状態出し分けを解放 |
| 2026-07-05 | テーマ追従は **「アダプタに scoped 注入」方式を採用**（笹木さん選択。infra/theme グローバルブリッジ案は不採用） | アプリの DataTable 利用は全て AdminListTable 経由のため、ラッパ div への CSS 変数注入で全カバーでき、blast radius が最小。DataTable は CSS 変数駆動だがアプリのテーマは `useTheme()` の runtime prop 方式で、両者を繋ぐブリッジが無いことを実装前に確認した |
| 2026-07-05 | テーマ追従の実装で DataTable SCSS に **ヘッダ専用フック `--dt-header-bg` / `--dt-header-text` を additive 追加**（未注入時は従来の `--color-text(-inverse)` にフォールバック=既存利用に無影響） | `.th` の背景が `--color-text`（セル本文の文字色と同一トークン）を流用しているため、ラッパで `--color-text` を上書きすると light テーマ（ヘッダ背景が明色）でセル本文が不可視化する。ヘッダ専用フックで分離し、AdminListTable が `tableHeaderBgColor` / `tableHeaderTextColor` / `cardRadius` を注入して追従させる |
| 2026-07-05 | ページネーション既定 `pageSize=20`（overridable）/ 検索は client 全文検索で表示列横断 / `lib/table/filter-sort.ts`（+ test 7 件）は削除 | H-4（ページネーション皆無）を実データで可視化するため既定を小さめに。検索・ソートは DataTable 内蔵に置き換わったため filter-sort util は不要（evergreen）。web test は 69→62（削除した util の 7 件ぶん・退行なし） |
| 2026-07-05 | PR-B コードレビュー APPROVE（[Review](../reviews/2026-07-05-1720-datatable-port-code-review-prb.md)・エージェント代行 code-reviewer + architect 並列・BLOCKER なし）。NICE-TO-HAVE のうち API 誤読と memo を反映 | `searchKeys`（内容無視で誤読）→ `searchable?: boolean`・dead 定数削除 / `sortable` を key の `string[]` に簡素化（未使用 label 除去）/ `themeVars` を useMemo 化。残りの NICE-TO-HAVE は下記「残課題」へ |

## 残課題

PR-A コードレビューより:

- **N-2**: `packages/ui/core/organisms/DataTable/tableCells.tsx` に `'use client'` が無い（移植元 ai_edu と同一状態・実害ゼロ）。将来 server component から直接 import する場合に付与する。

PR-B コードレビュー（代行）より:

- テーマ写像（theme→`--dt-*`）を再利用可能な primitive（`useDataTableThemeVars()` フック or `ThemedDataTable` 薄ラッパ）に括り出す。2 人目の DataTable 直利用が出たときのコピペ再発防止。単一利用の現状は YAGNI で見送り可。
- `--dt-header-*` の注入契約を DataTable の stories / 型 doc に一行記載（catalog-only 消費者が発見できるように）。
- **列ピッカー（gear）と件数セレクトが admin 一覧に新規出現**（DataTable 既定）。意図どおりか要確認。不要なら `disableColumnPicker` を渡す。→ マージ後検証項目に含めた。
- portal 要素（列ピッカー popover 等）は wrapper の CSS 変数を継承せず角丸だけテーマ非追従（scoped 注入の既知の代償・実害軽微）。
- `.thSortable:hover` の白オーバーレイが light テーマ（明色ヘッダ）で視認弱い（PR-A 本体側・別 Issue）。
- InteractiveTable の catalog 残置/削除を無期限保留にせず期限付き yes/no へ格上げ（役割は DataTable と非冗長。需要が無ければ evergreen で削除）。

## ステータス

- [x] Plan 承認（計画レビュー APPROVE 2026-07-05）
- [x] #66 マージ済み（実装着手の前提）
- [x] PR-A 実装完了（typecheck / lint / 移植テスト 217 green・既存比の新規失敗ゼロ・web test 69 / build green）
- [x] PR-A コードレビュー APPROVE（2026-07-05・エージェント代行）・[PR #68](https://github.com/sasakiyusuke2017015/waoon/pull/68) 提出
- [x] PR-A merge（笹木さん承認・2026-07-05・develop 53e8533）
- [x] PR-B 実装完了（typecheck / lint / build green・web test 62・`InteractiveTable` 参照 0 件・self-review 済み）
- [x] PR-B コードレビュー APPROVE（2026-07-05・エージェント代行・[Review](../reviews/2026-07-05-1720-datatable-port-code-review-prb.md)）
- [x] PR-B merge（笹木さん承認・2026-07-05・[#70](https://github.com/sasakiyusuke2017015/waoon/pull/70)・develop ea6e139・CI green）
- [ ] マージ後検証（手動確認チェックを消化）
