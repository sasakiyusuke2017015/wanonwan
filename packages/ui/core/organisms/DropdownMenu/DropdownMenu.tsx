'use client'

import { useEffect, useRef, useState, ReactNode, FC, CSSProperties } from 'react';

import { useOperationLog } from '../../../infra/devtools';
import { Button } from '../../molecules/Button';
import { Icon } from '../../atoms/Icon';
import { type ColorTheme, IconName } from '../../constants';
import { cn } from '../../utils/cn';

type DropdownMenuVariant = 'default' | 'outline';

interface DropdownMenuProps {
  variant?: DropdownMenuVariant; // ボタンのスタイルバリアント
  label?: string;
  icon?: ReactNode | IconName;
  iconShake?: boolean; // アイコンに shake アニメーションを適用
  menuContent: ReactNode | ((closeMenu: () => void) => ReactNode);
  className?: string;
  menuWidth?: string; // メニューの横幅 (例: 'w-72', 'w-auto', 'w-96')
  buttonClassName?: string; // ボタンのカスタムクラス
  /** カラーテーマ（未指定時はグローバルテーマを使用） - 現在は未使用 */
  colorTheme?: ColorTheme;
  /** プライマリコントラストテキスト色 - Layout から props で渡す */
  primaryContrastText?: string;
  /** プライマリオーバーレイアクティブ色 - Layout から props で渡す */
  primaryOverlayActive?: string;
  /** プライマリオーバーレイホバー色 - Layout から props で渡す */
  primaryOverlayHover?: string;
}

export const DropdownMenu: FC<DropdownMenuProps> = ({
  variant = 'default',
  label,
  icon,
  iconShake = false,
  menuWidth = 'w-72',
  menuContent,
  className = '',
  buttonClassName = '',
  primaryContrastText = '#ffffff', // デフォルト値（white）
  primaryOverlayActive = 'rgba(255, 255, 255, 0.2)', // デフォルト値
  primaryOverlayHover = 'rgba(255, 255, 255, 0.1)', // デフォルト値
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [shakeKey, setShakeKey] = useState(0); // アニメーション再トリガー用のキー
  const dropdownRef = useRef<HTMLDivElement>(null);
  const log = useOperationLog('DropdownMenu');

  const toggleMenu = () => {
    const newState = !isOpen;
    log(newState ? 'open' : 'close', { label });
    setIsOpen(newState);

    // クリック時に shake アニメーションを再生（keyを変更して再マウント）
    if (iconShake) {
      setShakeKey((prev) => prev + 1);
    }
  };

  // iconが文字列の場合はIconコンポーネントに変換
  const renderIcon = (
    iconProp?: ReactNode | IconName,
    size: number = 20,
    filled: boolean = false,
    _hovered: boolean = false
  ) => {
    if (!iconProp) return null;
    if (typeof iconProp === 'string') {
      return (
        <Icon
          key={iconShake ? shakeKey : undefined} // keyを変更してアニメーションを再トリガー
          name={iconProp as IconName}
          size={size}
          fill={filled ? 'white' : 'none'}
          animation={iconShake ? 'shake' : undefined}
          hover="auto"
        />
      );
    }
    return iconProp;
  };

  // クリック外で閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // バリアント別のインラインスタイル
  const getButtonStyle = (): CSSProperties => {
    if (variant === 'default') {
      return {
        color: primaryContrastText,
        backgroundColor: isOpen
          ? primaryOverlayActive
          : isHovered
            ? primaryOverlayHover
            : 'transparent',
      };
    }
    // outline variant uses Button component
    return {};
  };

  // ボタンのレンダリング
  const renderButton = () => {
    switch (variant) {
      case 'outline':
        return (
          <Button
            variant="outline"
            onClick={toggleMenu}
            leftIcon={typeof icon === 'string' ? (icon as IconName) : undefined}
            enableHopEffect={false}
            className={buttonClassName}
          >
            {label || ''}
          </Button>
        );
      case 'default':
      default:
        return (
          <Button
            variant="ghost"
            onClick={toggleMenu}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={cn(
              'rounded-full',
              buttonClassName
            )}
            style={getButtonStyle()}
            enableHopEffect={false}
          >
            <span className="relative z-10 flex items-center gap-2">
              {renderIcon(icon, 20, isOpen, isHovered)}
              {label && <span>{label}</span>}
            </span>
          </Button>
        );
    }
  };

  return (
    <div className={cn('relative', className)} ref={dropdownRef} data-component="dropdown-menu">
      {renderButton()}

      {isOpen && (
        <div
          className={cn(
            'absolute right-0 mt-2 animate-in slide-in-from-top-2 fade-in z-50 transform overflow-hidden rounded-xl border-2 border-gray-300 bg-white shadow-2xl backdrop-blur-sm transition-all duration-200 ease-out',
            menuWidth
          )}
        >
          {typeof menuContent === 'function'
            ? menuContent(() => setIsOpen(false))
            : menuContent}
        </div>
      )}
    </div>
  );
};

