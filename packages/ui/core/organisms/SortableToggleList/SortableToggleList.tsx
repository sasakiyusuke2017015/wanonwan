'use client'

// src/components/common/organisms/SortableToggleList.tsx
import { useCallback } from 'react';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Switch } from '../../atoms/Switch';
import { cn } from '../../utils/cn';

// 並び替え対象アイテムの型
export interface SortableItem {
  id: string;
  label: string;
  checked: boolean;
  disabled?: boolean;
}

// コンポーネントのProps
export interface SortableToggleListProps {
  /** 並び替え対象のアイテムリスト */
  items: SortableItem[];
  /** 現在の表示順序（id配列） */
  order: string[];
  /** 順序変更時のコールバック */
  onOrderChange: (newOrder: string[]) => void;
  /** トグル切り替え時のコールバック */
  onItemToggle: (id: string) => void;
  /** 並べる向き。'horizontal'（既定・折り返し）/ 'vertical'（1 列・全幅行） */
  direction?: 'horizontal' | 'vertical';
  /** ドラッグ開始時のコールバック（オプション） */
  onDragStart?: (id: string) => void;
  /** ドラッグ終了時のコールバック（オプション） */
  onDragEnd?: () => void;
  /** カスタムクラス名 */
  className?: string;
  /** アイテムコンテナの角丸（例: '8px'） */
  itemRadius?: string;
  /** トグルスイッチの角丸（例: '8px'） */
  toggleRadius?: string;
}

// 個別のSortableToggleアイテム
interface SortableToggleItemProps {
  id: string;
  label: string;
  checked: boolean;
  disabled: boolean;
  onToggle: () => void;
  /** アイテムコンテナの角丸 */
  itemRadius?: string;
  /** トグルスイッチの角丸 */
  toggleRadius?: string;
  /** 並べる向き */
  direction?: 'horizontal' | 'vertical';
}

const SortableToggleItem = ({ id, label, checked, disabled, onToggle, itemRadius, toggleRadius, direction = 'horizontal' }: SortableToggleItemProps) => {
  const isVertical = direction === 'vertical';
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  // dnd-kitのtransformスタイル（ドラッグ中のみ適用）+ アイテム角丸
  const dndStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    ...(itemRadius ? { borderRadius: itemRadius } : {}),
  };

  // ドラッグハンドルの角丸（左側のみ）
  const handleStyle: React.CSSProperties = itemRadius
    ? { borderTopLeftRadius: itemRadius, borderBottomLeftRadius: itemRadius }
    : {};

  // トグル部分の角丸（右側のみ）
  const toggleContainerStyle: React.CSSProperties = itemRadius
    ? { borderTopRightRadius: itemRadius, borderBottomRightRadius: itemRadius }
    : {};

  return (
    <div
      ref={setNodeRef}
      style={dndStyle}
      className={cn(
        'flex items-center border border-gray-300 bg-white shadow-sm select-none',
        !itemRadius && 'rounded-lg',
        isVertical && 'w-full',
        isDragging && 'z-50'
      )}
    >
      {/* ドラッグハンドル部分 */}
      <div
        {...attributes}
        {...listeners}
        className={cn(
          'px-2 py-2 cursor-grab hover:bg-gray-100 border-r border-gray-200',
          !itemRadius && 'rounded-l-lg'
        )}
        style={handleStyle}
      >
        <span className="text-gray-400">⋮⋮</span>
      </div>
      {/* トグル部分。縦並びはラベルを左・スイッチを右端へ広げる。 */}
      <div
        className={cn(
          'px-3 py-2 hover:bg-gray-50',
          isVertical && 'flex-1 min-w-0',
          !itemRadius && 'rounded-r-lg'
        )}
        style={toggleContainerStyle}
      >
        <Switch
          label={label}
          checked={checked}
          onChange={onToggle}
          disabled={disabled}
          size="small"
          variant="primary"
          toggleRadius={toggleRadius}
          containerClassName={isVertical ? 'w-full justify-between' : undefined}
        />
      </div>
    </div>
  );
};

/**
 * ドラッグ&ドロップで並び替え可能なトグルリスト
 *
 * 特徴:
 * - dnd-kitによるドラッグ&ドロップ
 * - framer-motionによるアニメーション（リセット時も含む）
 * - localStorageの制御は親側で行う（再利用性のため）
 */
export function SortableToggleList({
  items,
  order,
  onOrderChange,
  onItemToggle,
  onDragStart,
  onDragEnd,
  className,
  itemRadius,
  toggleRadius,
  direction = 'horizontal',
}: SortableToggleListProps) {
  const isVertical = direction === 'vertical';
  // DnDセンサー設定
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // ドラッグ開始時のハンドラー
  const handleDragStart = useCallback((event: DragStartEvent) => {
    onDragStart?.(event.active.id as string);
  }, [onDragStart]);

  // ドラッグ中のハンドラー（リアルタイムで順序変更）
  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = order.indexOf(active.id as string);
      const newIndex = order.indexOf(over.id as string);
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        onOrderChange(arrayMove(order, oldIndex, newIndex));
      }
    }
  }, [order, onOrderChange]);

  // ドラッグ終了時のハンドラー
  const handleDragEnd = useCallback(() => {
    onDragEnd?.();
  }, [onDragEnd]);

  // アイテムをMapに変換（高速ルックアップ用）
  const itemsMap = new Map(items.map(item => [item.id, item]));

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={order}
        strategy={isVertical ? verticalListSortingStrategy : horizontalListSortingStrategy}
      >
        <div
          className={cn(isVertical ? 'flex flex-col gap-2' : 'flex flex-wrap gap-3', className)}
          data-component="sortable-toggle-list"
        >
          {order.map((id) => {
            const item = itemsMap.get(id);
            if (!item) return null;
            return (
              <SortableToggleItem
                key={id}
                id={id}
                label={item.label}
                checked={item.checked}
                disabled={item.disabled ?? false}
                onToggle={() => onItemToggle(id)}
                itemRadius={itemRadius}
                toggleRadius={toggleRadius}
                direction={direction}
              />
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
}
