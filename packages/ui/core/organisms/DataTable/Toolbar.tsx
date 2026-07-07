'use client'

import { useMemo, type ReactNode } from 'react'

import { Animated } from '../../atoms/Animated'
import { Tooltip } from '../../atoms/Tooltip'
import { Input } from '../../molecules/Input'
import { Select } from '../../molecules/Select'
import { IconButton } from '../../molecules/IconButton'
import { Toggleable } from '../../molecules/Toggleable'

import type { CollapsibleOptions, FilterDef, SearchDef } from './types'
import styles from './DataTable.module.scss'

interface ToolbarProps {
  search?: SearchDef
  filters?: FilterDef[]
  /**
   * 現在表示中の列 key の集合。`FilterDef.columnKey` を持つ filter は、
   * その列がこの集合に無いとき入力を隠す (列ピッカーとフィルタの連動)。
   * 未指定なら連動しない (全 filter を常時表示)。
   */
  visibleColumnKeys?: Set<string>
  /** 「N 件」表示 (totalCount or 内蔵 rowCount テキスト) */
  rowCountLabel?: ReactNode
  /** 列表示ピッカー (gear)。リセットボタンの左隣に並べる */
  columnPicker?: ReactNode
  actions?: ReactNode
  /** 「新規作成」操作。渡すと gear の並びに primary 強調の `＋` ボタンを出す */
  onCreate?: () => void
  /** `＋` ボタンの aria-label / tooltip (default: '新規作成') */
  createLabel?: string
  /** 渡すと `＋` ボタンを `<a href>` で描画し、Ctrl/⌘/中クリックの別タブ等を有効化する */
  createHref?: string
  /** リセットボタンを表示。クリック時の callback (フィルタ値クリア処理は呼び出し側で実装) */
  onReset?: () => void
  /** Toolbar の filter row を funnel アイコンボタンで開閉可能にする (default: false) */
  collapsible?: boolean | CollapsibleOptions
  /**
   * @deprecated `collapsible.defaultOpen=false` を使ってください。両方指定された場合は `collapsible.defaultOpen` が優先されます。
   */
  defaultCollapsed?: boolean
}

interface NormalizedCollapsible {
  defaultOpen: boolean
}

function normalizeCollapsible(
  collapsible: ToolbarProps['collapsible'],
  defaultCollapsed: ToolbarProps['defaultCollapsed']
): NormalizedCollapsible | null {
  if (!collapsible) return null
  const opts: CollapsibleOptions = typeof collapsible === 'object' ? collapsible : {}
  const defaultOpen =
    opts.defaultOpen !== undefined
      ? opts.defaultOpen
      : defaultCollapsed === true
        ? false
        : true
  return { defaultOpen }
}

/** filter に有効な絞り込み値が入っているか (multiple は 1 件以上、single は非空)。 */
function filterHasValue(f: FilterDef): boolean {
  if (f.multiple) return f.value.length > 0
  return f.value !== null && f.value !== undefined && f.value !== ''
}

interface ActiveChip {
  key: string
  label: string
  onRemove: () => void
}

/** 適用中の検索 / フィルタを「{ラベル}: {選択肢ラベル}」のチップに要約する。 */
function buildActiveChips(search?: SearchDef, filters?: FilterDef[]): ActiveChip[] {
  const chips: ActiveChip[] = []
  if (search?.value && search.value.trim().length > 0) {
    chips.push({
      key: '__search',
      label: `検索: "${search.value}"`,
      onRemove: () => search.onChange(''),
    })
  }
  if (filters) {
    for (const f of filters) {
      if (f.multiple) {
        if (!f.value || f.value.length === 0) continue
        const labels = f.value.map((v) => f.options.find((o) => o.value === v)?.label ?? v)
        chips.push({
          key: f.key,
          label: `${f.label}: ${labels.join(', ')}`,
          onRemove: () => f.onChange([]),
        })
        continue
      }
      if (f.value === null || f.value === undefined || f.value === '') continue
      const optionLabel = f.options.find((o) => o.value === f.value)?.label ?? f.value
      chips.push({
        key: f.key,
        label: `${f.label}: ${optionLabel}`,
        onRemove: () => f.onChange(null),
      })
    }
  }
  return chips
}

/**
 * DataTable の toolbar UI を一本化するコンポーネント。
 *
 * client / server どちらのモードからも使われる。検索 box / filter select は
 * `@ai-education/ui` の Input / Select を内部採用し、見た目をここに集約する。
 * 値の保持・絞り込み実行はモードによって DataTable 内部 / 呼び出し側に分かれるが、
 * このコンポーネントは渡された値を表示し onChange を発火するだけ (presentational)。
 *
 * `onReset` が渡されたら「リセット」ボタンを並べる。
 *
 * `collapsible` が指定されたら Toolbar 左端に funnel アイコンボタンを置き、
 * クリックで検索 + filter 入力を open/close する。**最小化 (close) しても、
 * funnel ボタン・適用中フィルタのチップ要約・件数・リセットは常時表示** する。
 */
export function Toolbar({
  search,
  filters,
  visibleColumnKeys,
  rowCountLabel,
  columnPicker,
  actions,
  onCreate,
  createLabel,
  createHref,
  onReset,
  collapsible,
  defaultCollapsed,
}: ToolbarProps) {
  const collapsibleOptions = useMemo(
    () => normalizeCollapsible(collapsible, defaultCollapsed),
    [collapsible, defaultCollapsed]
  )

  const chips = useMemo(() => buildActiveChips(search, filters), [search, filters])

  // columnKey を持つ filter は、対応列が非表示なら入力を隠す (列ピッカーと連動)。
  // ただし **値が入っている filter は隠さない**。隠すと適用中の絞り込みが
  // (collapse 非使用時はチップも出ないため) 見えなくなり silent filter になる。
  // 値が入ったままなら入力を残し、ユーザーがその場で確認・解除できるようにする。
  const visibleFilters = useMemo(
    () =>
      (filters ?? []).filter(
        (f) =>
          f.columnKey == null ||
          visibleColumnKeys == null ||
          visibleColumnKeys.has(f.columnKey) ||
          filterHasValue(f),
      ),
    [filters, visibleColumnKeys],
  )

  const inputs = (
    <div className={styles.toolbarInputs}>
      {search && (
        <Input
          type="search"
          size="small"
          icon="magnifying-glass"
          iconPosition="left"
          placeholder={search.placeholder ?? 'キーワードで検索'}
          value={search.value}
          onChange={(e) => search.onChange(e.target.value)}
          onKeyDown={
            search.onSubmit
              ? (e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    search.onSubmit?.()
                  }
                }
              : undefined
          }
        />
      )}

      {visibleFilters.map((f) => {
        const allowEmpty = f.allowEmpty !== false
        const emptyLabel = f.emptyLabel ?? 'すべて'
        if (f.multiple) {
          return (
            <Select
              key={f.key}
              multiple
              size="small"
              options={f.options}
              value={f.value}
              allowEmpty={allowEmpty}
              placeholder={f.label}
              emptyLabel={emptyLabel}
              selectedLabel={(count) => `${f.label}: ${count}件`}
              onChange={(values) => f.onChange(values.map(String))}
            />
          )
        }
        return (
          <Select
            key={f.key}
            size="small"
            options={f.options}
            value={f.value ?? ''}
            allowEmpty={allowEmpty}
            placeholder={f.label}
            emptyLabel={emptyLabel}
            onChange={(value) => f.onChange(value ? String(value) : null)}
          />
        )
      })}
    </div>
  )

  const chipList = chips.length > 0 && (
    <div className={styles.filterChips}>
      {chips.map((c) => (
        // framer パス (type API) を使う: CSS keyframes 版は @keyframes 定義
        // (styles/globals.css) を読み込まないアプリで opacity:0 のまま残るため。
        <Animated key={c.key} type="scale" show duration={0.15}>
          <span className={styles.filterChip}>
            <span className={styles.filterChipLabel}>{c.label}</span>
            <button
              type="button"
              className={styles.filterChipRemove}
              onClick={c.onRemove}
              aria-label={`${c.label} を解除`}
            >
              ×
            </button>
          </span>
        </Animated>
      ))}
    </div>
  )

  const rowCount =
    rowCountLabel != null ? <span className={styles.rowCount}>{rowCountLabel}</span> : null

  const resetButton = onReset ? (
    <Tooltip content="フィルタをリセット">
      <IconButton
        icon="arrow-rotate"
        label="フィルタをリセット"
        title=""
        variant="danger"
        size={16}
        onClick={onReset}
        shimmer
        className="border border-[var(--color-border)] bg-[var(--color-bg-surface)]"
      />
    </Tooltip>
  ) : null

  // 新規作成は primary 強調の `＋` で、gear の並びの先頭に置く (全テーブル共通の導線)。
  const createButton = onCreate ? (
    <Tooltip content={createLabel ?? '新規作成'}>
      <IconButton
        icon="plus"
        label={createLabel ?? '新規作成'}
        title=""
        variant="primary"
        size={18}
        shimmer
        onClick={onCreate}
        href={createHref}
        className="rounded-md"
      />
    </Tooltip>
  ) : null

  // ＋ → gear (列ピッカー) → リセット の順で右端に並べる。
  const rightControls =
    createButton || columnPicker || resetButton ? (
      <>
        {createButton}
        {columnPicker}
        {resetButton}
      </>
    ) : null

  const toolbarRight =
    actions != null ? <div className={styles.toolbarRight}>{actions}</div> : null

  if (collapsibleOptions) {
    return (
      <div className={styles.toolbar} data-dt-toolbar>
        <Toggleable
          defaultOpen={collapsibleOptions.defaultOpen}
          logLabel="datatable-filter"
          renderTrigger={({ triggerProps }) => (
            <div className={styles.toolbarSummary}>
              <div className={styles.filterToggleButton}>
                <Tooltip content="フィルタを切り替える">
                  <IconButton
                    {...triggerProps}
                    icon="funnel"
                    label="フィルタを切り替える"
                    title=""
                    size={16}
                    shimmer
                    className="border border-[var(--color-border)] bg-[var(--color-bg-surface)]"
                  />
                </Tooltip>
              </div>
              {/* 件数は funnel とチップ要約の間 */}
              {rowCount}
              {chipList}
              {/* gear + リセットは toolbar (DataTable) の右端へ寄せる */}
              {rightControls && (
                <div className={styles.toolbarResetControl}>{rightControls}</div>
              )}
            </div>
          )}
        >
          {inputs}
        </Toggleable>
        {toolbarRight}
      </div>
    )
  }

  return (
    <div className={styles.toolbar} data-dt-toolbar>
      <div className={styles.toolbarLeft}>
        {inputs}
        {(rowCount || rightControls) && (
          <div className={styles.toolbarFilterControls}>
            {rowCount}
            {rightControls}
          </div>
        )}
      </div>
      {toolbarRight}
    </div>
  )
}
