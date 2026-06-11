'use client'

/**
 * renderCellContent - セルコンテンツ描画関数
 *
 * セルタイプ（text / link / internal）に応じた描画ロジックを担当。
 * InteractiveTable / VirtualizedTableBody から呼ばれる。
 */
import type React from 'react';
import type { ReactNode } from 'react';

import { Icon } from '../../atoms/Icon';
import { InternalLink } from '../../molecules/InternalLink';

import { isNullish } from '../../utils';

import type {
  Column,
  FocusedCell,
  LinkData,
  InternalLinkData,
  TableRowData,
} from './types';
import styles from './InteractiveTable.module.scss';

interface CreateRenderCellContentParams {
  actualFocusedCell: FocusedCell | null;
  onLinkClick?: (linkData: LinkData, rowIndex: number, colIndex: number) => void;
  onInternalLinkClick?: (linkData: InternalLinkData, rowIndex: number, colIndex: number) => void;
}

/**
 * renderCellContent 関数を生成するファクトリ。
 * 親が保持する focusedCell や onLinkClick をクロージャでキャプチャし、
 * (column, row, rowIndex, colIndex) => ReactNode 形式の関数を返す。
 */
export const createRenderCellContent = ({
  actualFocusedCell,
  onLinkClick,
  onInternalLinkClick,
}: CreateRenderCellContentParams) => {

  const handleLinkClick = (
    e: React.MouseEvent,
    linkData: LinkData,
    rowIndex: number,
    colIndex: number
  ) => {
    e.stopPropagation(); // テーブルセルのクリックイベントを防ぐ

    if (onLinkClick) {
      onLinkClick(linkData, rowIndex, colIndex);
    } else {
      // デフォルトの動作: 新しいタブでリンクを開く
      window.open(linkData.url, linkData.target || '_blank');
    }
  };

  return (
    column: Column,
    row: TableRowData,
    rowIndex: number,
    colIndex: number
  ): ReactNode => {
    const cellValue = row[column.accessor];
    const isFocusedCell =
      actualFocusedCell &&
      actualFocusedCell.row === rowIndex &&
      actualFocusedCell.col === colIndex;

    // renderフィールドが定義されている場合は優先的に使用
    if (column.render) {
      return column.render(cellValue, row, rowIndex);
    }

    // Null/undefined/空文字の統一表示
    if (isNullish(cellValue)) {
      return <span className={styles.nullishText}>-</span>;
    }

    if (column.cellType === 'link' && cellValue) {
      // リンクデータの形式を判定
      let linkData: LinkData;

      if (typeof cellValue === 'string') {
        // 文字列の場合はURLとして扱う
        linkData = {
          text: cellValue,
          url: cellValue,
          target: '_blank' as const,
        };
      } else if (typeof cellValue === 'object' && (cellValue as LinkData).url) {
        const cellObj = cellValue as LinkData;
        // オブジェクトの場合はLinkData形式として扱う
        linkData = {
          text: cellObj.text || cellObj.url,
          url: cellObj.url,
          target: cellObj.target || ('_blank' as const),
        };
      } else {
        // 無効なデータの場合は通常のテキストとして表示
        return String(cellValue);
      }

      return (
        <button
          className={styles.linkButton}
          onClick={(e) => handleLinkClick(e, linkData, rowIndex, colIndex)}
          title={`リンクを開く: ${linkData.url}`}
        >
          <Icon
            name={'arrow-up-right'}
            size={12}
            className={styles.linkIcon}
          />
          {linkData.text}
        </button>
      );
    }

    if (column.cellType === 'internal' && cellValue) {
      // 内部リンクデータの形式を判定
      let internalLinkData: InternalLinkData;

      if (typeof cellValue === 'string') {
        // 文字列の場合は単純なテキストリンクとして扱う
        internalLinkData = {
          text: cellValue,
          to: `/${cellValue}`, // デフォルトのパス
          variant: 'text',
          color: 'primary',
        };
      } else if (typeof cellValue === 'object' && (cellValue as InternalLinkData).to) {
        const cellObj = cellValue as InternalLinkData;
        // オブジェクトの場合はInternalLinkData形式として扱う
        internalLinkData = {
          text: cellObj.text || cellObj.to,
          to: cellObj.to,
          variant: cellObj.variant || 'text',
          size: cellObj.size || 'medium',
          color: cellObj.color || 'primary',
        };
      } else {
        // 無効なデータの場合は通常のテキストとして表示
        return String(cellValue);
      }

      const handleInternalLinkClick = (
        event: React.MouseEvent<HTMLAnchorElement>
      ) => {
        if (onInternalLinkClick) {
          event.preventDefault();
          onInternalLinkClick(internalLinkData, rowIndex, colIndex);
        }
      };

      return (
        <InternalLink
          href={internalLinkData.to}
          variant={internalLinkData.variant}
          size={internalLinkData.size}
          color={internalLinkData.color}
          onClick={handleInternalLinkClick}
          className={isFocusedCell ? styles.internalLinkFocused : ''}
        >
          {internalLinkData.text}
        </InternalLink>
      );
    }

    // プリミティブ値やReactNodeはそのまま返す。オブジェクト型はテキストに変換
    return typeof cellValue === 'object' && cellValue !== null && !('$$typeof' in cellValue)
      ? String(cellValue)
      : cellValue as ReactNode;
  };
};
