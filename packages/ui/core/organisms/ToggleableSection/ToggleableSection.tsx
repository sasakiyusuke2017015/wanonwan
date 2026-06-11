'use client'

import { useState, ReactNode } from 'react';

import { Animated } from '../../atoms/Animated';
import { Icon } from '../../atoms/Icon';
import { useOperationLog } from '../../../infra/devtools';

import styles from './ToggleableSection.module.scss';

interface ToggleableSectionProps {
  /** タイトル文字列、またはカスタムヘッダー要素 */
  title: string | ReactNode;
  /** ボーダー色（CSS色値） */
  borderColor: string;
  /** 初期表示状態（非制御モード用） */
  defaultOpen?: boolean;
  /** 開閉状態（制御モード用：指定するとcontrolled componentになる） */
  isOpen?: boolean;
  children: ReactNode;
  onToggle?: (isOpen: boolean) => void;
  /** ホバー時の背景色（CSS色値） */
  hoverBgColor?: string;
  /** ボタン（タイトル）部分の背景色（CSS色値） */
  buttonBgColor?: string;
  /** コンテンツ（開いた時の中身）部分の背景色（CSS色値） */
  contentBgColor?: string;
  /** カードの角丸設定 */
  cardRadius?: string;
  /** カスタムマージン className（指定時はデフォルトマージン無効） */
  marginClassName?: string;
  /** カスタムコンテンツパディング className（指定時はデフォルトパディング無効） */
  contentPaddingClassName?: string;
}

export const ToggleableSection: React.FC<ToggleableSectionProps> = ({
  title,
  borderColor,
  defaultOpen = true,
  isOpen: controlledIsOpen,
  children,
  onToggle,
  hoverBgColor,
  buttonBgColor,
  contentBgColor,
  cardRadius = '0.5rem',
  marginClassName,
  contentPaddingClassName,
}) => {
  // 制御モード（isOpen prop が指定されている場合）か非制御モードかを判定
  const isControlled = controlledIsOpen !== undefined;
  const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;
  const [contentKey, setContentKey] = useState(0);
  const log = useOperationLog('ToggleableSection');

  const handleToggle = () => {
    const newIsOpen = !isOpen;
    const titleText = typeof title === 'string' ? title : 'section';
    log(newIsOpen ? 'expand' : 'collapse', { title: titleText });
    if (!isControlled) {
      setInternalIsOpen(newIsOpen);
    }
    if (newIsOpen) {
      setContentKey((prev) => prev + 1);
    }
    onToggle?.(newIsOpen);
  };

  // タイトルがstring型かどうかで aria-label を決定
  const ariaLabel = typeof title === 'string' ? `${title}セクションの表示を切り替える` : 'セクションの表示を切り替える';

  const sectionClasses = [
    styles.toggleableSection,
    !marginClassName && styles['toggleableSection--defaultMargin'],
    marginClassName,
  ].filter(Boolean).join(' ');

  const collapseClasses = [
    styles.toggleableSection__collapse,
    isOpen ? styles['toggleableSection__collapse--open'] : styles['toggleableSection__collapse--closed'],
  ].join(' ');

  const contentClasses = [
    styles.toggleableSection__content,
    !contentPaddingClassName && styles['toggleableSection__content--defaultPadding'],
    isOpen ? styles['toggleableSection__content--open'] : styles['toggleableSection__content--closed'],
    contentPaddingClassName,
  ].filter(Boolean).join(' ');

  return (
    <section className={sectionClasses} data-component="ToggleableSection">
      <button
        className={styles.toggleableSection__button}
        style={{
          borderLeftColor: borderColor,
          borderRadius: cardRadius,
          backgroundColor: buttonBgColor,
        }}
        onClick={handleToggle}
        onMouseEnter={(e) => {
          if (hoverBgColor) {
            e.currentTarget.style.backgroundColor = hoverBgColor;
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = buttonBgColor || '';
        }}
        aria-expanded={isOpen}
        aria-label={ariaLabel}
      >
        <Animated type="rotate" show={isOpen} className={styles.toggleableSection__icon}>
          <Icon
            name="chevron-down"
            size={24}
            style={{ color: borderColor }}
          />
        </Animated>
        {typeof title === 'string' ? <span>{title}</span> : title}
      </button>
      <div className={collapseClasses}>
        <div
          key={contentKey}
          className={contentClasses}
          style={{
            backgroundColor: contentBgColor,
            borderBottomLeftRadius: cardRadius,
            borderBottomRightRadius: cardRadius,
          }}
        >
          {children}
        </div>
      </div>
    </section>
  );
};

