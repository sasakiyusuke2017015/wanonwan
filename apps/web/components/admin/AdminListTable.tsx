"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  DataTable,
  type Column,
  type ClientQueryState,
  type ServerSortItem,
} from "@ui-catalog/core/organisms/DataTable";
import { SubHeaderToolbar } from "@ui-catalog/core/templates/SubHeaderToolbar";
import { Button, DataCountDisplay } from "@ui-catalog/core/molecules";
import { useTheme, DEFAULT_GLOBAL_THEME } from "@ui-catalog/core/infra/theme";
import { getThemeConfig } from "@ui-catalog/core/constants";
import { SubHeaderPortal } from "@/components/layout/SubHeaderSlot";

// SSR/初回描画を既定テーマに揃え、mount 後に保存テーマへ（hydration mismatch 回避。AppLayout と同方針）。
const DEFAULT_THEME = getThemeConfig(
  DEFAULT_GLOBAL_THEME.colorTheme,
  DEFAULT_GLOBAL_THEME.shapeTheme,
);

type Props<T extends { id?: string }> = {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  error?: string | null;
  /** エラー時の再取得ハンドラ。渡すとエラー表示に「再試行」ボタンが出る（監査 M-3）。 */
  onRetry?: () => void;
  emptyMessage: string;
  /** 行クリック時の遷移など。row はそのまま渡す（id 等の非表示フィールドも含む）。 */
  onRowClick?: (row: T) => void;
  /** 検索ボックスを表示する（既定 true）。client 全文検索は表示中の全列を横断する（列は絞らない）。 */
  searchable?: boolean;
  /** ヘッダクリックソートを付与する列の key 群。 */
  sortable?: string[];
  /** 検索ボックスの placeholder。 */
  searchPlaceholder?: string;
  /** 1 ページあたりの行数（既定 20）。 */
  pageSize?: number;
  /**
   * 検索・件数・新規作成を SubHeader (画面上部の固定 chrome) へ外出しする。
   * 指定すると DataTable の内蔵 toolbar は消え、SubHeaderToolbar (funnel 開閉) に
   * 置き換わる。ページ側の見出し + 新規作成ボタンは不要になる。
   */
  subHeader?: {
    /** SubHeader 左端の見出し (画面名) */
    title?: ReactNode;
    /** 新規作成の遷移先 (Ctrl/⌘ クリック等のネイティブ動作用) */
    createHref?: string;
    /** 新規作成の通常クリック (SPA 遷移)。createHref と併せて渡す */
    onCreate?: () => void;
    /** `＋` ボタンの aria-label / tooltip */
    createLabel?: string;
  };
};

// 管理画面の一覧の定石ラッパ。@ui-catalog の DataTable（client モード）を薄く包み、
// テーマ追従（ヘッダ色・角丸）を scoped に注入する。各ページは列定義(columns)と
// 行データ(data)を渡すだけで、列ヘッダソート・全文検索・ページネーション・件数表示が付く
// （データ量が小さい前提の client モード）。
export function AdminListTable<T extends { id?: string }>({
  columns,
  data,
  loading = false,
  error = null,
  onRetry,
  emptyMessage,
  onRowClick,
  searchable = true,
  sortable,
  searchPlaceholder = "検索",
  pageSize = 20,
  subHeader,
}: Props<T>) {
  const [mounted, setMounted] = useState(false);
  const liveTheme = useTheme();
  useEffect(() => setMounted(true), []);
  const { colors, shapes } = mounted ? liveTheme : DEFAULT_THEME;

  // subHeader モード用の controlled query state。toolbar="external" では内蔵検索 UI が
  // 消えるため、検索値を SubHeaderToolbar と DataTable で共有する (queryState 経由)。
  const [sortItems, setSortItems] = useState<ServerSortItem[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [pageSizeState, setPageSizeState] = useState(pageSize);
  const queryState: ClientQueryState = {
    sortItems,
    onSortItemsChange: setSortItems,
    search,
    onSearchChange: setSearch,
    page,
    onPageChange: setPage,
    pageSize: pageSizeState,
    onPageSizeChange: setPageSizeState,
  };

  // 絞り込み後件数は DataTable 内部で計算されるため callback で受け取り、
  // SubHeader の件数表示 (絞り込み中は「M / N件」) に反映する。
  const [filteredCount, setFilteredCount] = useState<number | null>(null);
  const handleFilteredCountChange = useCallback(
    (filtered: number) => setFilteredCount(filtered),
    [],
  );
  const visibleCount = filteredCount ?? data.length;

  // sortable に挙げた列だけヘッダクリックソートを解放する。
  const sortableKeys = useMemo(() => new Set(sortable ?? []), [sortable]);
  const effectiveColumns = useMemo<Column<T>[]>(
    () =>
      sortableKeys.size === 0
        ? columns
        : columns.map((c) => (sortableKeys.has(c.key) ? { ...c, sortable: true } : c)),
    [columns, sortableKeys],
  );

  // DataTable は CSS 変数駆動。ヘッダ色・角丸を runtime テーマから scoped に注入して追従させる。
  // --dt-header-* は DataTable SCSS のヘッダ専用フックで、セル本文の --color-text とは分離されている
  // （light テーマ等でヘッダ背景が明色でも本文が壊れない）。
  const themeVars = useMemo(
    () =>
      ({
        "--dt-header-bg": colors.tableHeaderBgColor,
        "--dt-header-text": colors.tableHeaderTextColor,
        "--border-radius-default": shapes.cardRadius,
      }) as CSSProperties,
    [colors, shapes],
  );

  if (error) {
    return (
      <div
        className="rounded border border-dashed border-red-300 p-6 text-center"
        style={{ borderRadius: shapes.cardRadius }}
      >
        <p className="text-sm text-red-600">{error}</p>
        {onRetry && (
          <div className="mt-3">
            <Button variant="secondary" onClick={onRetry} borderRadius={shapes.buttonRadius}>
              再試行
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={themeVars}>
      {subHeader && (
        <SubHeaderPortal>
          <SubHeaderToolbar
            title={subHeader.title}
            search={
              searchable
                ? { value: search, onChange: setSearch, placeholder: searchPlaceholder }
                : undefined
            }
            rowCountLabel={
              <DataCountDisplay
                totalCount={visibleCount}
                outOf={visibleCount !== data.length ? data.length : undefined}
                loading={loading}
              />
            }
            onCreate={subHeader.onCreate}
            createHref={subHeader.createHref}
            createLabel={subHeader.createLabel}
            onReset={() => {
              setSearch("");
              setSortItems([]);
              setPage(0);
            }}
          />
        </SubHeaderPortal>
      )}
      <DataTable
        mode="client"
        columns={effectiveColumns}
        rows={data}
        loading={loading}
        emptyMessage={emptyMessage}
        emptyFilteredMessage="条件に一致する項目がありません"
        onRowClick={onRowClick ? (row) => onRowClick(row) : undefined}
        getRowKey={(row, i) => row.id ?? i}
        showSearch={searchable}
        searchPlaceholder={searchPlaceholder}
        showPagination
        pageSize={pageSize}
        toolbar={subHeader ? "external" : "internal"}
        queryState={subHeader ? queryState : undefined}
        onFilteredCountChange={subHeader ? handleFilteredCountChange : undefined}
      />
    </div>
  );
}
