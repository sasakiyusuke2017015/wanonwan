"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  InteractiveTable,
  type Column,
  type TableRowData,
} from "@ui-catalog/core/organisms/InteractiveTable";
import { Input, Select, Button } from "@ui-catalog/core/molecules";
import { useTheme } from "@ui-catalog/core/infra/theme";
import { getThemeConfig } from "@ui-catalog/core/constants";
import { DEFAULT_GLOBAL_THEME } from "@ui-catalog/core/infra/theme";
import { filterRows, sortRows, type SortDir } from "@/lib/table/filter-sort";

// SSR/初回描画を既定テーマに揃え、mount 後に保存テーマへ（hydration mismatch 回避。AppLayout と同方針）。
const DEFAULT_THEME = getThemeConfig(
  DEFAULT_GLOBAL_THEME.colorTheme,
  DEFAULT_GLOBAL_THEME.shapeTheme,
);

type SortOption = { key: string; label: string };

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
  /** 与えると検索ボックスを表示し、これらの列を横断 client フィルタする。 */
  searchKeys?: (keyof T & string)[];
  /** 与えるとソート UI（列選択 + 昇順/降順）を表示し client ソートする。 */
  sortable?: SortOption[];
  /** 検索ボックスの placeholder。 */
  searchPlaceholder?: string;
};

// 管理画面の一覧の定石ラッパ。@ui-catalog の InteractiveTable をテーマ適用して使う。
// 各ページは列定義(columns)と行データ(data)を渡すだけ。任意で searchKeys / sortable を
// 渡すと client-side のフィルタ/ソート UI が付く（データ量が小さい前提）。
export function AdminListTable<T extends TableRowData>({
  columns,
  data,
  loading = false,
  error = null,
  emptyMessage,
  onRowClick,
  heightOffsetCss = "16rem",
  searchKeys,
  sortable,
  searchPlaceholder = "検索",
}: Props<T>) {
  const [mounted, setMounted] = useState(false);
  const liveTheme = useTheme();
  useEffect(() => setMounted(true), []);
  const { colors, shapes } = mounted ? liveTheme : DEFAULT_THEME;

  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const view = useMemo(() => {
    const filtered = searchKeys ? filterRows(data, query, searchKeys) : data;
    return sortable ? sortRows(filtered, sortKey as keyof T | null, sortDir) : filtered;
  }, [data, query, sortKey, sortDir, searchKeys, sortable]);

  const toolbar = searchKeys || sortable ? (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      {searchKeys && (
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={searchPlaceholder}
          borderRadius={shapes.inputRadius}
        />
      )}
      {sortable && (
        <>
          <Select
            options={sortable.map((s) => ({ value: s.key, label: s.label }))}
            value={sortKey ?? undefined}
            onChange={(v) => setSortKey(v == null ? null : String(v))}
            allowEmpty
            placeholder="並び替え"
            borderRadius={shapes.inputRadius}
          />
          <Button
            variant="secondary"
            onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
            disabled={!sortKey}
            borderRadius={shapes.buttonRadius}
          >
            {sortDir === "asc" ? "昇順 ↑" : "降順 ↓"}
          </Button>
        </>
      )}
    </div>
  ) : null;

  let body: ReactNode;
  if (error) {
    body = <p className="text-sm text-red-600">{error}</p>;
  } else if (!loading && view.length === 0) {
    body = (
      <div
        className="rounded border border-dashed p-6 text-center text-sm text-gray-400"
        style={{ borderRadius: shapes.cardRadius }}
      >
        {query ? "条件に一致する項目がありません" : emptyMessage}
      </div>
    );
  } else {
    body = (
      <InteractiveTable
        columns={columns}
        data={view}
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

  return (
    <div>
      {toolbar}
      {body}
    </div>
  );
}
