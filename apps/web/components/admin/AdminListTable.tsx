"use client";

import { useEffect, useState } from "react";
import {
  InteractiveTable,
  type Column,
  type TableRowData,
} from "@ui-catalog/core/organisms/InteractiveTable";
import { useTheme } from "@ui-catalog/core/infra/theme";
import { getThemeConfig } from "@ui-catalog/core/constants";
import { DEFAULT_GLOBAL_THEME } from "@ui-catalog/core/infra/theme";

// SSR/初回描画を既定テーマに揃え、mount 後に保存テーマへ（hydration mismatch 回避。AppLayout と同方針）。
const DEFAULT_THEME = getThemeConfig(
  DEFAULT_GLOBAL_THEME.colorTheme,
  DEFAULT_GLOBAL_THEME.shapeTheme,
);

type Props<T extends TableRowData> = {
  columns: Column[];
  data: T[];
  loading?: boolean;
  error?: string | null;
  emptyMessage: string;
  /** 行クリック時の遷移など。row はそのまま渡す（id 等の非表示フィールドも含む）。 */
  onRowClick?: (row: T) => void;
  /** ビューポート高からの差し引き（chrome 分）。既定はシェル(header+subheader+footer+タイトル)相当。 */
  heightOffsetCss?: string;
};

// 管理画面の一覧の定石ラッパ。@ui-catalog の InteractiveTable をテーマ適用して使う。
// 各ページは列定義(columns)と行データ(data)を渡すだけにする。
export function AdminListTable<T extends TableRowData>({
  columns,
  data,
  loading = false,
  error = null,
  emptyMessage,
  onRowClick,
  heightOffsetCss = "16rem",
}: Props<T>) {
  const [mounted, setMounted] = useState(false);
  const liveTheme = useTheme();
  useEffect(() => setMounted(true), []);
  const { colors, shapes } = mounted ? liveTheme : DEFAULT_THEME;

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (!loading && data.length === 0) {
    return (
      <div
        className="rounded border border-dashed p-6 text-center text-sm text-gray-400"
        style={{ borderRadius: shapes.cardRadius }}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <InteractiveTable
      columns={columns}
      data={data}
      loading={loading}
      enableRowHighlight
      onCellClick={onRowClick ? (_r, _c, _col, row) => onRowClick(row as T) : undefined}
      headerBgColor={colors.tableHeaderBgColor}
      headerTextColor={colors.tableHeaderTextColor}
      tableHeaderBgColor={colors.tableHeaderBgColor}
      tableHeaderTextColor={colors.tableHeaderTextColor}
      borderRadius={shapes.cardRadius}
      heightPercent={100}
      heightOffsetCss={heightOffsetCss}
    />
  );
}
