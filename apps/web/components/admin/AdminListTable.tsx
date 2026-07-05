"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { DataTable, type Column } from "@ui-catalog/core/organisms/DataTable";
import { Button } from "@ui-catalog/core/molecules";
import { useTheme, DEFAULT_GLOBAL_THEME } from "@ui-catalog/core/infra/theme";
import { getThemeConfig } from "@ui-catalog/core/constants";

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
}: Props<T>) {
  const [mounted, setMounted] = useState(false);
  const liveTheme = useTheme();
  useEffect(() => setMounted(true), []);
  const { colors, shapes } = mounted ? liveTheme : DEFAULT_THEME;

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
      />
    </div>
  );
}
