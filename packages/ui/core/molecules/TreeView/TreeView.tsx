'use client'

import type { ReactNode, DragEvent, MouseEvent, KeyboardEvent } from 'react'
import { cn } from '../../utils/cn'
import styles from './TreeView.module.scss'

export interface TreeNode<T = unknown> {
  id: string | number
  label: string
  icon?: ReactNode
  indicator?: ReactNode
  /** hover 時に表示するアクション要素 */
  actions?: ReactNode
  children: TreeNode<T>[]
  data?: T
  /** プロジェクトカラー（ドット表示用） */
  color?: string
  /** 子がなくてもシェブロンを表示する */
  forceChevron?: boolean
}

/** ノードごとのドラッグ状態 */
export interface NodeDragState {
  isDragging?: boolean
  isDragOver?: boolean
  isDropTarget?: boolean
}

/** 挿入インジケーターの位置 */
export interface InsertIndicator {
  parentId: string | number | null
  insertIndex: number
}

export interface TreeViewProps<T = unknown> {
  nodes: TreeNode<T>[]
  expandedIds: Set<string | number>
  selectedId: string | number | null
  onToggle: (id: string | number) => void
  onSelect: (node: TreeNode<T>) => void
  indent?: number
  rowHeight?: number
  showGuides?: boolean
  className?: string

  // === Drag & Drop ===
  draggable?: boolean
  onDragStart?: (node: TreeNode<T>, e: DragEvent) => void
  onDragOver?: (node: TreeNode<T>, e: DragEvent) => void
  onDrop?: (node: TreeNode<T>, e: DragEvent) => void
  onDragEnd?: (e: DragEvent) => void
  onDragLeave?: (e: DragEvent) => void
  /** ノードごとのドラッグ状態を返す関数 */
  getDragState?: (node: TreeNode<T>) => NodeDragState

  // === Context Menu ===
  onContextMenu?: (node: TreeNode<T>, e: MouseEvent) => void

  // === Edit Mode ===
  editingId?: string | number | null
  onDoubleClick?: (node: TreeNode<T>) => void
  onKeyDown?: (node: TreeNode<T>, e: KeyboardEvent) => void
  /** 編集モード時のカスタムレンダリング */
  renderEditMode?: (node: TreeNode<T>) => ReactNode

  // === Insert Indicator ===
  insertIndicator?: InsertIndicator | null
}

/** ガイド線の X 座標基準（indent の中央） */
const LINE_OFFSET = 7
/** シェブロンの幅 (w-3.5 = 14px) */
const CHEVRON_W = 14

/**
 * SVG ガイド線 — 祖先の縦線 + 現在ノードへの ├ / └ 接続線
 */
function TreeGuides({
  depth,
  parentLines,
  isLast,
  isFirst,
  hasChildren,
  indent,
  rowHeight,
}: {
  depth: number
  parentLines: boolean[]
  isLast: boolean
  isFirst: boolean
  hasChildren: boolean
  indent: number
  rowHeight: number
}) {
  const lineX = depth * indent + LINE_OFFSET
  // リーフノードは三角がない分、横線をアイコンまで伸ばす
  const hLineEnd = (depth + 1) * indent + (hasChildren ? 0 : CHEVRON_W)

  return (
    <svg
      className={styles.guides}
      width={hLineEnd}
      height={rowHeight}
    >
      {/* 祖先レベルの縦線（│） */}
      {parentLines.map((show, i) =>
        show ? (
          <line
            key={i}
            className={styles.guideLine}
            x1={i * indent + LINE_OFFSET}
            y1={0}
            x2={i * indent + LINE_OFFSET}
            y2={rowHeight}
          />
        ) : null,
      )}

      {/* 現在ノードの縦線（├ の縦 or └ の縦） */}
      <line
        className={styles.guideLine}
        x1={lineX}
        y1={isFirst ? -8 : 0}
        x2={lineX}
        y2={isLast ? rowHeight / 2 : rowHeight}
      />

      {/* 横線 */}
      <line
        className={styles.guideLine}
        x1={lineX}
        y1={rowHeight / 2}
        x2={hLineEnd}
        y2={rowHeight / 2}
      />
    </svg>
  )
}

function TreeRow<T>({
  node,
  depth,
  expandedIds,
  selectedId,
  onToggle,
  onSelect,
  indent,
  rowHeight,
  showGuides,
  parentLines,
  isLast,
  isFirst,
  siblingIndex,
  // D&D
  draggable,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onDragLeave,
  getDragState,
  // Context Menu
  onContextMenu,
  // Edit Mode
  editingId,
  onDoubleClick,
  onKeyDown,
  renderEditMode,
  // Insert Indicator
  insertIndicator,
  parentId,
}: {
  node: TreeNode<T>
  depth: number
  expandedIds: Set<string | number>
  selectedId: string | number | null
  onToggle: (id: string | number) => void
  onSelect: (node: TreeNode<T>) => void
  indent: number
  rowHeight: number
  showGuides: boolean
  parentLines: boolean[]
  isLast: boolean
  isFirst: boolean
  siblingIndex: number
  // D&D
  draggable?: boolean
  onDragStart?: (node: TreeNode<T>, e: DragEvent) => void
  onDragOver?: (node: TreeNode<T>, e: DragEvent) => void
  onDrop?: (node: TreeNode<T>, e: DragEvent) => void
  onDragEnd?: (e: DragEvent) => void
  onDragLeave?: (e: DragEvent) => void
  getDragState?: (node: TreeNode<T>) => NodeDragState
  // Context Menu
  onContextMenu?: (node: TreeNode<T>, e: MouseEvent) => void
  // Edit Mode
  editingId?: string | number | null
  onDoubleClick?: (node: TreeNode<T>) => void
  onKeyDown?: (node: TreeNode<T>, e: KeyboardEvent) => void
  renderEditMode?: (node: TreeNode<T>) => ReactNode
  // Insert Indicator
  insertIndicator?: InsertIndicator | null
  parentId: string | number | null
}) {
  const hasChildren = node.children.length > 0
  const showChevron = hasChildren || !!node.forceChevron
  const isExpanded = expandedIds.has(node.id)
  const isSelected = selectedId === node.id
  const isEditing = editingId === node.id
  const childParentLines = [...parentLines, !isLast]

  // ドラッグ状態を取得
  const dragState = getDragState?.(node) ?? {}
  const { isDragging, isDragOver, isDropTarget } = dragState

  // 挿入インジケーターを表示するか（このノードの前）
  const showInsertBefore =
    insertIndicator &&
    insertIndicator.parentId === parentId &&
    insertIndicator.insertIndex === siblingIndex

  // 挿入インジケーターを表示するか（このノードの後ろ、最後の兄弟のみ）
  const showInsertAfter =
    isLast &&
    insertIndicator &&
    insertIndicator.parentId === parentId &&
    insertIndicator.insertIndex === siblingIndex + 1

  return (
    <>
      {/* 挿入インジケーター（前） */}
      {showInsertBefore && (
        <div
          className={styles.insertIndicator}
          style={{ marginLeft: 6 + depth * indent }}
        />
      )}

      {isEditing && renderEditMode ? (
        // 編集モード
        <div
          className={styles.editRow}
          style={{ paddingLeft: (depth + 1) * indent + 2 }}
        >
          {renderEditMode(node)}
        </div>
      ) : (
        // 通常表示
        <div
          className={cn(
            styles.row,
            isSelected && styles.rowSelected,
            isDragging && styles.rowDragging,
            isDragOver && styles.rowDragOver,
            isDropTarget && styles.rowDropTarget,
          )}
          style={{
            height: rowHeight,
            paddingLeft: (depth + 1) * indent + 2,
          }}
          onClick={() => {
            if (showChevron && hasChildren) onToggle(node.id)
            onSelect(node)
          }}
          onDoubleClick={() => onDoubleClick?.(node)}
          onKeyDown={(e) => onKeyDown?.(node, e)}
          onContextMenu={(e) => {
            if (onContextMenu) {
              e.preventDefault()
              onContextMenu(node, e)
            }
          }}
          // Drag & Drop
          draggable={draggable}
          onDragStart={(e) => onDragStart?.(node, e)}
          onDragOver={(e) => {
            e.preventDefault()
            onDragOver?.(node, e)
          }}
          onDrop={(e) => onDrop?.(node, e)}
          onDragEnd={onDragEnd}
          onDragLeave={onDragLeave}
          tabIndex={0}
          data-component="tree-view-row"
        >
          {/* SVG ガイド線 */}
          {showGuides && depth >= 0 && (
            <TreeGuides
              depth={depth}
              parentLines={parentLines}
              isLast={isLast}
              isFirst={isFirst}
              hasChildren={showChevron}
              indent={indent}
              rowHeight={rowHeight}
            />
          )}

          {/* Expand/collapse chevron (SVG) */}
          {showChevron ? (
            <button
              type="button"
              className={styles.chevron}
              onClick={(e) => {
                e.stopPropagation()
                if (hasChildren) onToggle(node.id)
              }}
            >
              <svg width="8" height="8" viewBox="0 0 8 8">
                {isExpanded ? (
                  <polygon className={styles.chevronFill} points="0,2 8,2 4,7" />
                ) : (
                  <polygon className={styles.chevronFill} points="2,0 7,4 2,8" />
                )}
              </svg>
            </button>
          ) : (
            <span className={styles.leafSpacer} />
          )}

          {/* Color dot */}
          {node.color && (
            <span
              className={styles.colorDot}
              style={{ backgroundColor: node.color }}
            />
          )}

          {/* Icon */}
          {node.icon && <span className={styles.icon}>{node.icon}</span>}

          {/* Label */}
          <span className={styles.label}>{node.label}</span>

          {/* Indicator */}
          {node.indicator && (
            <span
              className={styles.indicator}
              style={node.actions ? { marginRight: 22 } : undefined}
            >
              {node.indicator}
            </span>
          )}

          {/* Hover actions */}
          {node.actions && (
            <span className={styles.actions}>{node.actions}</span>
          )}
        </div>
      )}

      {/* 挿入インジケーター（後ろ、最後の兄弟のみ） */}
      {showInsertAfter && (
        <div
          className={styles.insertIndicator}
          style={{ marginLeft: 6 + depth * indent }}
        />
      )}

      {/* Children */}
      {hasChildren &&
        isExpanded &&
        node.children.map((child, i) => (
          <TreeRow<T>
            key={child.id}
            node={child}
            depth={depth + 1}
            expandedIds={expandedIds}
            selectedId={selectedId}
            onToggle={onToggle}
            onSelect={onSelect}
            indent={indent}
            rowHeight={rowHeight}
            showGuides={showGuides}
            parentLines={childParentLines}
            isLast={i === node.children.length - 1}
            isFirst={i === 0}
            siblingIndex={i}
            // D&D
            draggable={draggable}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onDragEnd={onDragEnd}
            onDragLeave={onDragLeave}
            getDragState={getDragState}
            // Context Menu
            onContextMenu={onContextMenu}
            // Edit Mode
            editingId={editingId}
            onDoubleClick={onDoubleClick}
            onKeyDown={onKeyDown}
            renderEditMode={renderEditMode}
            // Insert Indicator
            insertIndicator={insertIndicator}
            parentId={node.id}
          />
        ))}
    </>
  )
}

export function TreeView<T = unknown>({
  nodes,
  expandedIds,
  selectedId,
  onToggle,
  onSelect,
  indent = 14,
  rowHeight = 24,
  showGuides = false,
  className,
  // D&D
  draggable,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onDragLeave,
  getDragState,
  // Context Menu
  onContextMenu,
  // Edit Mode
  editingId,
  onDoubleClick,
  onKeyDown,
  renderEditMode,
  // Insert Indicator
  insertIndicator,
}: TreeViewProps<T>) {
  return (
    <div className={cn(styles.root, className)} data-component="tree-view">
      {nodes.map((node, i) => (
        <TreeRow<T>
          key={node.id}
          node={node}
          depth={0}
          expandedIds={expandedIds}
          selectedId={selectedId}
          onToggle={onToggle}
          onSelect={onSelect}
          indent={indent}
          rowHeight={rowHeight}
          showGuides={showGuides}
          parentLines={[]}
          isLast={i === nodes.length - 1}
          isFirst={i === 0}
          siblingIndex={i}
          // D&D
          draggable={draggable}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onDragEnd={onDragEnd}
          onDragLeave={onDragLeave}
          getDragState={getDragState}
          // Context Menu
          onContextMenu={onContextMenu}
          // Edit Mode
          editingId={editingId}
          onDoubleClick={onDoubleClick}
          onKeyDown={onKeyDown}
          renderEditMode={renderEditMode}
          // Insert Indicator
          insertIndicator={insertIndicator}
          parentId={null}
        />
      ))}
    </div>
  )
}
