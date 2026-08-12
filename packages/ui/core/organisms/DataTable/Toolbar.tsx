'use client'

import { useMemo, type ReactNode } from 'react'

import { Animated } from '../../atoms/Animated'
import { FilterField } from '../../molecules/FilterField'
import { Input } from '../../molecules/Input'
import { IconButton } from '../../molecules/IconButton'
import { Toggleable } from '../../molecules/Toggleable'

import { filterHasValue } from './filterDefs'
import type { CollapsibleOptions, FilterDef, SearchDef } from './types'
import styles from './DataTable.module.scss'

interface ToolbarProps {
  /**
   * 左端 (funnel の左 / 非 collapsible 時は入力群の左) に置く先頭要素。
   * SubHeaderToolbar が画面タイトルを差し込むためのスロット。
   */
  leading?: ReactNode
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
      if (!filterHasValue(f)) continue
      switch (f.type) {
        case 'text':
          chips.push({
            key: f.key,
            label: `${f.label}: "${f.value.trim()}"`,
            onRemove: () => f.onChange(''),
          })
          continue
        case 'date':
          chips.push({
            key: f.key,
            label: `${f.label}: ${f.value.trim()}`,
            onRemove: () => f.onChange(''),
          })
          continue
        case 'numberRange': {
          if (f.value === null) continue
          const [lo, hi] = f.value
          chips.push({
            key: f.key,
            label: `${f.label}: ${lo}〜${hi}`,
            onRemove: () => f.onChange(null),
          })
          continue
        }
        default:
          break
      }
      if (f.multiple) {
        const labels = f.value.map((v) => f.options.find((o) => o.value === v)?.label ?? v)
        chips.push({
          key: f.key,
          label: `${f.label}: ${labels.join(', ')}`,
          onRemove: () => f.onChange([]),
        })
        continue
      }
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
 * client / server どちらのモードからも使われる。検索 box と各フィルタは
 * `@ui-catalog/core` の Input / FilterField カードを内部採用し、見た目をここに集約する。
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
  leading,
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

  const searchKeyDown = search?.onSubmit
    ? (e: { key: string; preventDefault: () => void }) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          search.onSubmit?.()
        }
      }
    : undefined

  // 検索のカード化はフィルタ「定義」の有無で決める。visibleFilters (列ピッカー連動で
  // 増減する) に依らせると、列トグルのたびに検索の外形がカード⇔素の box で揺れる。
  const hasFilterDefs = (filters?.length ?? 0) > 0

  const inputs = (
    <div className={styles.toolbarInputs}>
      {/* フィルタカードが並ぶ行では、検索も同じカードに入れて高さを揃える (がたつき防止)。
          フィルタが無いテーブルは従来どおり軽い検索 box のまま。 */}
      {search && hasFilterDefs && (
        <FilterField
          type="text"
          label="キーワード検索"
          value={search.value}
          onChange={search.onChange}
          onKeyDown={searchKeyDown}
          placeholder={search.placeholder ?? 'キーワードで検索'}
          icon="magnifying-glass"
          className={styles.toolbarSearchCard}
        />
      )}
      {search && !hasFilterDefs && (
        <Input
          type="search"
          size="small"
          icon="magnifying-glass"
          iconPosition="left"
          placeholder={search.placeholder ?? 'キーワードで検索'}
          value={search.value}
          onChange={(e) => search.onChange(e.target.value)}
          onKeyDown={searchKeyDown}
        />
      )}

      {visibleFilters.map((f) => {
        switch (f.type) {
          case 'text':
            return (
              <FilterField
                key={f.key}
                type="text"
                label={f.label}
                value={f.value}
                onChange={f.onChange}
                placeholder={f.placeholder}
                className={styles.toolbarFilterCard}
              />
            )
          case 'date':
            return (
              <FilterField
                key={f.key}
                type="date"
                label={f.label}
                value={f.value}
                onChange={f.onChange}
                className={styles.toolbarFilterCard}
              />
            )
          case 'numberRange': {
            const min = f.min ?? 0
            const max = f.max ?? 5
            return (
              <FilterField
                key={f.key}
                type="numberRange"
                label={f.label}
                // 未適用 (null) は FilterField (非 null タプル前提) に渡す前に全範囲へ展開し、
                // 逆にユーザーが全範囲へ戻したら null (未適用) に畳む。
                value={f.value ?? [min, max]}
                onChange={(v) => f.onChange(v[0] <= min && v[1] >= max ? null : v)}
                min={min}
                max={max}
                className={styles.toolbarFilterCard}
              />
            )
          }
          default:
            break
        }
        const allowEmpty = f.allowEmpty !== false
        const emptyLabel = f.emptyLabel ?? 'すべて'
        if (f.multiple) {
          return (
            <FilterField
              key={f.key}
              type="multiSelect"
              label={f.label}
              options={f.options}
              value={f.value}
              onChange={(values) => f.onChange(values.map(String))}
              allowEmpty={allowEmpty}
              emptyLabel={emptyLabel}
              className={styles.toolbarFilterCard}
            />
          )
        }
        return (
          <FilterField
            key={f.key}
            type="select"
            label={f.label}
            options={f.options}
            value={f.value ?? ''}
            onChange={(value) => f.onChange(value ? String(value) : null)}
            allowEmpty={allowEmpty}
            emptyLabel={emptyLabel}
            className={styles.toolbarFilterCard}
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
    <IconButton
      icon="arrow-rotate"
      label="フィルタをリセット"
      variant="danger"
      size={16}
      onClick={onReset}
      shimmer
      className="border border-[var(--color-border)] bg-[var(--color-bg-surface)]"
    />
  ) : null

  // 新規作成は primary 強調の `＋` で、gear の並びの先頭に置く (全テーブル共通の導線)。
  const createButton = onCreate ? (
    <IconButton
      icon="plus"
      label={createLabel ?? '新規作成'}
      variant="primary"
      size={18}
      shimmer
      onClick={onCreate}
      href={createHref}
      className="rounded-md"
    />
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
              {leading}
              <div className={styles.filterToggleButton}>
                <IconButton
                  {...triggerProps}
                  icon="funnel"
                  label="フィルタを切り替える"
                  size={16}
                  shimmer
                  className="border border-[var(--color-border)] bg-[var(--color-bg-surface)]"
                />
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
        {leading}
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
