import type { ReactNode } from 'react'

import type { TableAnimationVariant } from './tableMotion'

/**
 * rowActions から自動生成される操作列の安定キー。
 * 列順の保存 (URL `cols` allowlist / localStorage known-set) で操作列の位置を
 * 通すために、app 側の `allKeys` / `extraValidKeys` でも参照する。
 */
export const ROW_ACTIONS_KEY = '__rowActions'

/** toolbar の filter select 1 つ分の選択肢 */
export interface FilterOption {
  value: string
  label: string
}

interface FilterDefBase {
  /** フィルタ対象キー (主に react key / 識別用。client モードでは row フィールド名) */
  key: string
  /** フィルタカードの見出しラベル */
  label: string
  /**
   * この filter を特定の列の表示/非表示に連動させる場合の対応列 key (`Column.key`)。
   * 指定すると、その列が column picker (列ピッカー) で **非表示のとき filter 入力も隠れる**。
   * 列を表示すると filter も現れる (列ピッカーとフィルタの連動)。
   * 未指定の filter は列の表示状態に関わらず常時表示 (後方互換)。
   * 値が入ったままの filter は、列を隠しても適用中チップとしては残り解除できる。
   */
  columnKey?: string
}

/** select 系フィルタ共通 (既存互換のため判別子 `type` を持たない = undefined)。 */
interface SelectFilterDefBase extends FilterDefBase {
  type?: undefined
  options: FilterOption[]
  /** 先頭に空(未選択)選択肢を出す (default: true) */
  allowEmpty?: boolean
  /** 空(未選択)オプションのラベル (default: DataTable 側で「すべて」) */
  emptyLabel?: string
}

/** 単一選択フィルタ */
export interface SingleFilterDef extends SelectFilterDefBase {
  multiple?: false
  /** 現在値 (null = 未選択) */
  value: string | null
  onChange: (value: string | null) => void
}

/** 複数選択フィルタ (Select の multiple UI を使う。選択中はチェックマーク表示) */
export interface MultiFilterDef extends SelectFilterDefBase {
  multiple: true
  value: string[]
  onChange: (values: string[]) => void
}

/**
 * テキストフィルタ。client モードでは対象フィールドの小文字部分一致で絞り込む。
 * server モードでは表示のみ (絞り込みは呼び出し側が API param 等で実装する)。
 */
export interface TextFilterDef extends FilterDefBase {
  type: 'text'
  /** 現在値 ('' = 未適用) */
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

/**
 * 数値範囲フィルタ。client モードでは `min <= Number(値) <= max` で絞り込む。
 * min / max は非負数を前提とする (URL 直列化が `min-max` 形式のため)。
 * server モードでは表示のみ (絞り込みは呼び出し側が実装する)。
 */
export interface NumberRangeFilterDef extends FilterDefBase {
  type: 'numberRange'
  /**
   * 現在値。**未適用は必ず null で表現する** (全範囲タプル [min, max] を渡すと
   * 「適用中」扱いになり、数値化できない行の除外とチップ表示が走る)。
   * Toolbar はユーザーが全範囲へ戻した操作を null に畳んで onChange する。
   */
  value: [number, number] | null
  onChange: (value: [number, number] | null) => void
  /** 範囲の下限 (default: 0) */
  min?: number
  /** 範囲の上限 (default: 5) */
  max?: number
}

/**
 * 日付フィルタ (YYYY-MM-DD テキスト入力)。client モードでは ISO 文字列の
 * date-only 前方一致で絞り込む。server モードでは表示のみ。
 */
export interface DateFilterDef extends FilterDefBase {
  type: 'date'
  /** 現在値 ('' = 未適用) */
  value: string
  onChange: (value: string) => void
}

/**
 * toolbar の filter 定義。
 * 値の保持と実際の絞り込みは mode で分岐するが、UI 生成 (FilterField カード) は
 * DataTable が引き受ける。client / server どちらでも `value` / `onChange` は
 * controlled (必須)。select 系 (単一/複数) は既存互換のため `type` を持たず、
 * `multiple` で判別する。
 */
export type FilterDef =
  | SingleFilterDef
  | MultiFilterDef
  | TextFilterDef
  | NumberRangeFilterDef
  | DateFilterDef

/**
 * toolbar の検索 box 定義。debounce は呼び出し側 hook で吸収する。
 * - `onChange`: 入力のたびに発火 (即時反映 / debounce 用)
 * - `onSubmit`: Enter / 検索ボタン押下で発火 (ボタン確定 UX 用、任意)
 */
export interface SearchDef {
  value: string
  onChange: (value: string) => void
  onSubmit?: () => void
  placeholder?: string
}

/** 1 つの active ソートキー (複数キーソートの 1 要素) */
export interface ServerSortItem {
  columnKey: string
  order: 'asc' | 'desc'
}

/**
 * server モード用の controlled ソート定義。複数列の優先順ソートに対応する。
 * 値の保持・並べ替えは呼び出し側 (URL + サーバ ORDER BY) が担い、ヘッダ UI 生成と
 * onSortClick 発火を DataTable が担う。`Column.sortable=true` の列だけクリック可能。
 */
export interface ServerSortDef {
  /** 優先順の active ソートキー (先頭が第1キー = ①)。未ソートは空配列 */
  items: ServerSortItem[]
  /** ヘッダクリック。三段トグル (なし→asc→desc→解除) は呼び出し側で実装 */
  onSortClick: (columnKey: string) => void
  /**
   * sort 配列をまるごと差し替える。列ピッカーで非表示にした列をソートからも外すために
   * DataTable が呼ぶ。未指定の場合は列を隠してもソートは維持される (後方互換)。
   */
  onSortItemsChange?: (items: ServerSortItem[]) => void
}

/**
 * server モード用の controlled ページャ定義 (1-based)。
 * フィールド名は `@ui-catalog/core/molecules/Pagination` の `PaginationProps`
 * (`currentPage` / `totalPages` / `onPageChange`) に揃えてある。
 */
export interface PaginationDef {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

/**
 * Toolbar の filter row を funnel アイコンボタンで開閉可能にする collapse オプション。
 * `collapsible: true` で default (defaultOpen=true) を使う。
 * 細かく指定したい場合は object 形を渡す。
 */
export interface CollapsibleOptions {
  /** 初期表示状態 (default: true = 展開) */
  defaultOpen?: boolean
}

/**
 * toolbar 系の共通 props。client / server 双方の BaseProps に乗る。
 * いずれも optional で、渡されたものだけ UI を生成する。
 */
export interface ToolbarOptions {
  /** 検索 box を出す */
  search?: SearchDef
  /** filter select 群を出す */
  filters?: FilterDef[]
  /** server 用 controlled ページャを出す (client は内蔵ページャを使う) */
  pagination?: PaginationDef
  /** 「全 N 件」表示 (server は rows.length と別に総件数を渡す) */
  totalCount?: number
  /** toolbar 右端のアクション (新規作成ボタン等) */
  actions?: ReactNode
  /** リセットボタンを表示。クリック時の callback (フィルタ値クリア処理は呼び出し側で実装) */
  onReset?: () => void
  /** Toolbar の filter section を collapse 可能にする。`true` で default 値、object で細かく指定 (default: undefined = collapse 無効) */
  collapsible?: boolean | CollapsibleOptions
  /**
   * @deprecated `collapsible.defaultOpen=false` を使ってください。両方指定された場合は `collapsible.defaultOpen` が優先されます。
   */
  defaultCollapsed?: boolean
}

/**
 * DataTable の行操作アクション定義。
 * `rowActions` prop に配列で渡すと操作列が自動生成される。
 * 削除アクションは ConfirmDialog を内包し、確認後に `onDelete` を呼ぶ。
 */
/**
 * `default: true` を付けた action は「行クリックの既定操作」になる。行全体をクリック
 * すると onClick が走り、その行はホバーで上昇ポップ + 色変化する (クリック可の affordance)。
 * 誤操作防止のため delete には付けられない。1 つだけ付ける運用。
 */
export type RowActionDef<TRow> =
  | {
      type: 'detail'
      label?: string
      default?: boolean
      onClick: (row: TRow) => void
      /**
       * 遷移先 URL。渡すと操作ボタンを `<a href>` で描画し、Ctrl/⌘/中クリックでの
       * 別タブ・ホバー URL・右クリックメニューといったブラウザのネイティブ動作を有効化する。
       * 通常クリックは `onClick` で従来どおり SPA 遷移する (catalog 側で preventDefault)。
       */
      href?: (row: TRow) => string
    }
  | {
      type: 'edit'
      label?: string
      default?: boolean
      onClick: (row: TRow) => void
      /** 遷移先 URL。詳細は `detail` の `href` を参照。 */
      href?: (row: TRow) => string
    }
  | { type: 'duplicate'; label?: string; default?: boolean; onClick: (row: TRow) => void }
  | {
      type: 'delete'
      label?: string
      confirmTitle?: string
      confirmMessage?: (row: TRow) => string
      onDelete: (row: TRow) => Promise<void> | void
      /**
       * true を返す行は削除ボタンを disabled にし、確認ダイアログを開かない。
       * 「使用中で消せない」等、押す前に不可と分かる行を無駄に確認させないため。
       */
      disabled?: (row: TRow) => boolean
      /** disabled 時にボタンへ出す理由 (title / aria-label に使う)。 */
      disabledReason?: (row: TRow) => string
    }
  | {
      type: 'custom'
      icon: ReactNode
      label: string
      danger?: boolean
      default?: boolean
      onClick: (row: TRow) => void
      /** 遷移先 URL。詳細は `detail` の `href` を参照。 */
      href?: (row: TRow) => string
    }
  | {
      /**
       * 有効/無効トグル。active 状態に応じて catalog 側で icon / label / danger を出し分ける
       * (既定: 有効時=ban + 無効化 + danger、無効時=check-circle-2 + 有効化)。
       * 状態を変える操作なので行クリックの default にはできない。
       */
      type: 'toggle'
      active: (row: TRow) => boolean
      onToggle: (row: TRow) => void
      activeLabel?: string
      inactiveLabel?: string
      activeIcon?: ReactNode
      inactiveIcon?: ReactNode
    }

export interface Column<TRow> {
  /** セルアクセサ + react key */
  key: string
  /** ヘッダ表示名 */
  label: string
  /** セルの水平揃え (default: 'left') */
  align?: 'left' | 'right' | 'center'
  /** 列幅。数値は px。'30%' のような文字列も可 */
  width?: number | string
  /** ヘッダ <th> に追加する class */
  headerClassName?: string
  /** セル <td> に追加する class (column 単位の上書き) */
  cellClassName?: string
  /** セル描画関数。省略時は `String(row[key])` を表示 */
  render?: (row: TRow) => ReactNode
  /** client モードでクリックソート可能にする (server モードでは無視) */
  sortable?: boolean
  /**
   * client ソート時の比較キーを行から導出する (省略時は `String(row[key])`)。
   * 数値を返すと数値比較、文字列なら ja localeCompare。配列や render 由来で
   * `row[key]` が直接ソートに使えない列を代表値で並べたいときに使う
   * (例: role_codes を `Math.max` で「最高権限」順にソート)。
   */
  sortValue?: (row: TRow) => string | number
  /**
   * column picker での表示/非表示トグルを許可するか (default: true)。
   * `false` の列は常時表示で、picker 上では切替コントロールを持たず「常に表示」の鍵バッジで示す。
   * ID や操作列など「消されると困る」列に付ける (rowActions の操作列は自動で `false`)。
   */
  hideable?: boolean
  /**
   * 初期状態で非表示にする (default: false)。picker から再表示できる。
   * `visibleColumns` を明示指定した場合はそちらが優先される。
   */
  defaultHidden?: boolean
}

interface BaseProps<TRow> {
  columns: Column<TRow>[]
  rows: TRow[]
  /** 行クリックで呼ばれる (selection の checkbox クリックは伝播しない) */
  onRowClick?: (row: TRow, index: number) => void
  /** 行選択 (checkbox 列) を有効化 */
  selectable?: boolean
  /** 選択行の変更通知。Set の値は **現在ページ rows の index** (server モードでは表示中ページ内 index) */
  onSelectionChange?: (selected: Set<number>) => void
  /** データ 0 件時のメッセージ (default: 'データなし') */
  emptyMessage?: string
  /**
   * フィルタ / 検索を適用した結果 0 件のときのメッセージ。
   * 指定すると、フィルタが効いている状態の空表示だけこの文言に切り替わる
   * (「まだ無い」と「条件に一致しない」を出し分けたいとき)。未指定なら
   * フィルタ有無に関わらず `emptyMessage` を出す。
   */
  emptyFilteredMessage?: string
  /** wrapper <div> の追加 class */
  className?: string
  /**
   * 親のカード / パネル (folder タブのクリーム面等) に埋め込むとき true。
   * wrapper 自身の枠線・角丸を外し、上辺のヘアラインだけ残して親の面と一体化する
   * (default: false = 独立カードとして枠 + 角丸を持つ)。
   */
  flush?: boolean
  /** <table> の追加 class */
  tableClassName?: string
  /** <tr> の追加 class (関数の場合は row + index ごとに評価) */
  rowClassName?: string | ((row: TRow, index: number) => string)
  /** 列間の縦罫線を引く (default: true) */
  bordered?: boolean
  /** 偶数行を薄く塗る zebra ストライプ (default: true) */
  striped?: boolean
  /**
   * 見た目のバリアント (default: 'default')。
   * - `default`: ヘッダが濃色 (主要な一覧向け)。
   * - `plain`: ヘッダを淡色 + 通常文字にした軽量版。インポート結果など、
   *   主一覧の下に埋め込むサブテーブルで主役と差別化したいときに使う。
   */
  variant?: 'default' | 'plain'
  /**
   * 列ピッカー (gear) を無効化する (default: false)。
   * DataTable は列が 2 つ以上あれば既定でピッカーを表示する。表示列の固定や
   * 1 列だけのテーブルなど、ピッカーが不要な場合に true を渡す。
   */
  disableColumnPicker?: boolean
  /**
   * uncontrolled モードで表示列を localStorage に永続化するときのキー。
   * 未指定でも route の pathname + 列キーから自動キーを生成して永続化するが、
   * 同一ページに複数テーブルがある等で衝突を避けたいときに明示する。
   * `onColumnsChange` を渡す controlled モードでは無視される。
   */
  columnStorageKey?: string
  /**
   * 行操作アクション (編集 / 複製 / 削除 / カスタム)。
   * 渡すと列の末尾に操作列が自動生成される。削除は ConfirmDialog を内包する。
   */
  rowActions?: RowActionDef<TRow>[]
  /**
   * 「新規作成」操作。渡すと toolbar 右上 (gear の並び) に primary 強調の `＋`
   * IconButton を出す。全テーブルで新規作成導線をこの位置に統一するための既定 UI。
   * ラベル付きボタンを toolbar 右端へ自由配置したい場合は `actions` を使う。
   */
  onCreate?: () => void
  /** `onCreate` の `＋` ボタンの aria-label / tooltip (default: '新規作成') */
  createLabel?: string
  /**
   * 新規作成の遷移先 URL。渡すと `＋` ボタンを `<a href>` で描画し、Ctrl/⌘/中クリックでの
   * 別タブ等のブラウザネイティブ動作を有効化する。通常クリックは `onCreate` で SPA 遷移する
   * (catalog 側で preventDefault)。`onCreate` と併せて渡す。
   */
  createHref?: string
  /**
   * 行/列の表示・非表示を framer-motion でアニメーション化する (default: false)。
   * 列ピッカーでのトグル、行のフィルタ / ページ切替 / ソートに enter+exit が付く。
   */
  animated?: boolean
  /** アニメーションの種類 (default: 'slideDown')。`animated` が true のときのみ有効。 */
  animationVariant?: TableAnimationVariant
  /**
   * ボディ (tbody の行) だけをスケルトン表示にする (default: false)。
   * toolbar と ヘッダ (thead = 黒帯の列見出し) は保持したまま、行だけを待機
   * アニメーションに差し替える。タブ切替など「ページ内のサーバ再取得」中の
   * 待機表示に使う (テーブルの枠ごと消さない)。
   */
  loading?: boolean
  /**
   * toolbar の描画場所 (default: 'internal')。
   * 'external' は内蔵 toolbar を描画しない。検索 / フィルタ / 列ピッカー等の UI は
   * 呼び出し側が `SubHeaderToolbar` 等へ外出しして描画し、状態は controlled prop
   * (client: `queryState` + `filters` / server: `search` + `filters`) で共有する。
   * 絞り込み・ソート・ページングの計算と下部ページャは 'external' でも従来どおり動く。
   */
  toolbar?: 'internal' | 'external'
}

export type { TableAnimationVariant }

/**
 * client モードの「ソート / 検索 / ページ」を外部 (URL 等) で controlled にするための
 * 状態オブジェクト。`ClientDataTableProps.queryState` に丸ごと渡す。
 *
 * - 未指定 (undefined) のとき、ClientDataTable は内部 `useState` で従来どおり
 *   uncontrolled に動く (後方互換)。CompaniesClient や Storybook はこの経路。
 * - 指定したときは **all-or-nothing で fully controlled**。値の保持と URL 同期は
 *   呼び出し側 (`useClientTableUrlState` 等) が担い、絞り込み / ソート / ページングの
 *   計算自体は引き続き ClientDataTable が in-memory で行う。
 *
 * `page` は内部実装に合わせ **0-based**。`onSortItemsChange` は配列をまるごと
 * 受け取る (列ピッカーで非表示にした列をソートから外す処理も DataTable がこれを呼ぶ)。
 */
export interface ClientQueryState {
  sortItems: ServerSortItem[]
  /**
   * 既定ソート (URL に sort 指定が無いときの初期並び)。指定すると:
   * - `sortItems` がこの値のとき、ヘッダの該当列に矢印が出る (並びの根拠が UI で見える)。
   * - 既定ソート状態から *既定に含まれない* 列をクリックすると、既定を第1キーとして
   *   引きずらず、その列の単一ソートに切り替える (`handleSortClick` が使用)。
   *   既定列が全行ユニークだと他列クリックがタイブレークに埋もれて無反応に見えるのを防ぐ。
   * 主に `useClientTableUrlState({ sort: { defaultSort } })` が供給する。
   */
  defaultSort?: ServerSortItem[]
  onSortItemsChange: (items: ServerSortItem[]) => void
  search: string
  onSearchChange: (value: string) => void
  /** 0-based ページ index */
  page: number
  onPageChange: (page: number) => void
  pageSize: number
  onPageSizeChange: (size: number) => void
}

interface ClientDataTableBaseProps<TRow> extends BaseProps<TRow> {
  mode?: 'client'
  /** 行 key 関数 (省略時は index fallback)。key 選択 (`selectedKeys`) を使う場合は必須 (型で強制) */
  getRowKey?: (row: TRow, index: number) => string | number
  /** toolbar の検索ボックス表示 (default: true)。client は内蔵全文検索 */
  showSearch?: boolean
  /** 検索ボックスの placeholder (default: 'キーワードで検索') */
  searchPlaceholder?: string
  /** ページネーション表示 (default: true) */
  showPagination?: boolean
  /** 1 ページあたりの行数 (default: 100)。`queryState` 指定時は初期値としてのみ使われる */
  pageSize?: number
  /**
   * ソート / 検索 / ページ状態を外部 (URL 等) で controlled にする。
   * 未指定時は内部 `useState` で uncontrolled に動く (後方互換)。詳細は {@link ClientQueryState}。
   */
  queryState?: ClientQueryState
  /** 表示する column key の配列 (省略時は全 column 表示) */
  visibleColumns?: string[]
  /** column picker での表示変更通知 (undefined 時は picker UI 非表示) */
  onColumnsChange?: (columns: string[]) => void
  /** toolbar 右端のアクション (新規作成ボタン等) */
  actions?: ReactNode
  /** リセットボタンを表示。クリック時の callback (内蔵検索値クリアは別途実装する) */
  onReset?: () => void
  /**
   * toolbar の filter select 群。値の保持と絞り込みは呼び出し側で管理 (controlled)。
   * FilterDef の `key` は row フィールド名と一致させること (client モードの絞り込みに使用)。
   */
  filters?: FilterDef[]
  /** Toolbar の filter section を collapse 可能にする (ToolbarOptions と同じ意味、両モードで使える) */
  collapsible?: boolean | CollapsibleOptions
  /**
   * @deprecated `collapsible.defaultOpen=false` を使ってください。両方指定された場合は `collapsible.defaultOpen` が優先されます。
   */
  defaultCollapsed?: boolean
  /**
   * 絞り込み (検索 + filters) 後の件数変化の通知。`toolbar="external"` で
   * 件数表示を外出しするとき、絞り込み後件数は DataTable 内部にしか無いため
   * この callback で受け取る (`(絞り込み後件数, 全件数)`)。参照安定な関数を
   * 渡すこと (useCallback 推奨)。
   */
  onFilteredCountChange?: (filteredCount: number, totalCount: number) => void
}

/**
 * key 選択モード (client 限定) を有効化する props 群。`selectedKeys` を渡すなら
 * `getRowKey` / `onToggleRowKey` / `onToggleAllKeys` も **型レベルで必須** にして、
 * 「checkbox は出るが操作しても no-op」を防ぐ (all-or-nothing)。
 */
interface ClientKeySelectionProps<TRow> {
  /**
   * 行キー基準の controlled 選択。index 選択 (`selectable` + `onSelectionChange`) ではなく
   * **getRowKey の安定キー**で選択を管理し、ページ送り / 絞り込み / ソートを跨いで保持される
   * (受験対象ユーザー割り当て等)。`selectable` と併用する。
   */
  selectedKeys: Set<string | number>
  /**
   * 行 key 関数。**index 非依存の安定キー (行データ由来) を返すこと**。全選択キー算出 (filter 後 subset)
   * と行の checked 判定 (page 内) は別経路で `getRowKey` を呼ぶため、`(r, i) => i` のような index 依存
   * キーは両者を食い違わせ選択を壊す (server モードで index 依存が禁止なのと同じ理由)。
   */
  getRowKey: (row: TRow, index: number) => string | number
  /** 単一行トグル。選択キーと行を受け取る。 */
  onToggleRowKey: (key: string | number, row: TRow) => void
  /**
   * 全選択トグル。**現フィルタ結果 (現ページではなく全ページ) の選択可能キー配列**を受け取り、
   * 呼び出し側が現在値から「全選択 or 全解除」を判断する。
   */
  onToggleAllKeys: (filteredSelectableKeys: Array<string | number>) => void
  /** false を返す行は checkbox を disabled にする (例: コース修了済みは受講対象から外せない)。 */
  isRowSelectable?: (row: TRow) => boolean
}

/** key 選択を使わない通常 client モード。選択 props は型で禁止 (never)。 */
interface ClientNoKeySelectionProps {
  selectedKeys?: never
  onToggleRowKey?: never
  onToggleAllKeys?: never
  isRowSelectable?: never
}

/**
 * client モードの props。key 選択は all-or-nothing の判別 union:
 * `selectedKeys` を渡すなら handler 群と `getRowKey` が必須、渡さないなら選択 props は `never`。
 */
export type ClientDataTableProps<TRow> = ClientDataTableBaseProps<TRow> &
  (ClientKeySelectionProps<TRow> | ClientNoKeySelectionProps)

export interface ServerDataTableProps<TRow> extends BaseProps<TRow>, ToolbarOptions {
  mode: 'server'
  /** 行 key 関数 (server モードでは並び順揺れに耐えるため required) */
  getRowKey: (row: TRow, index: number) => string | number
  /**
   * key 選択 (`selectedKeys` 系) は **client モード限定**。server モードでは選択がページ跨ぎの
   * fetch を伴い意味が割れるため、型で弾く (`never`)。server で一括選択が要るなら別途設計する。
   */
  selectedKeys?: never
  onToggleRowKey?: never
  onToggleAllKeys?: never
  isRowSelectable?: never
  /** 検索 box を表示する (default: true)。`false` で `search` prop が渡っても非表示 */
  showSearch?: boolean
  /** フィルタ select 群を表示する (default: true)。`false` で `filters` prop が渡っても非表示 */
  showFilters?: boolean
  /** 列ソート (URL 駆動)。渡すと `Column.sortable=true` の列ヘッダがクリック可能になる */
  sort?: ServerSortDef
  /** 表示する column key の配列 (省略時は defaultHidden を除く全 column 表示) */
  visibleColumns?: string[]
  /** column picker での表示変更通知 (undefined 時は picker UI 非表示) */
  onColumnsChange?: (columns: string[]) => void
}

export type DataTableProps<TRow> = ClientDataTableProps<TRow> | ServerDataTableProps<TRow>
