'use client'

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  ReactNode,
  FC,
  CSSProperties,
} from 'react';

import { useOperationLog } from '../../../infra/devtools';
import { Button } from '../../molecules/Button';
import { Icon } from '../../atoms/Icon';
import { ANIMATIONS, type ColorTheme, type DropMenuAnimationVariant, IconName } from '../../constants';
import { cn } from '../../utils/cn';

import {
  calculateDropdownPosition,
  transformOriginFromTrigger,
  type DropdownMenuPlacement,
  type TriggerRect,
} from './calculatePosition';

type DropdownMenuVariant = 'default' | 'outline';

interface MenuLayout {
  top: number;
  left: number;
  /** 'expandFromTrigger' variant のときだけ設定。`${x}px ${y}px` 形式 */
  transformOrigin?: string;
}

/**
 * trigger / menu の DOM rect から、menu の最終配置 (top / left) と
 * `expandFromTrigger` variant 用の transform-origin をまとめて計算する内部ヘルパー。
 *
 * viewport は `window.innerWidth / innerHeight` を読む。呼び出し元は
 * `useLayoutEffect` 内 (= ブラウザでのみ実行) で叩くので SSR 安全。
 */
function computeMenuLayout(
  triggerEl: HTMLDivElement,
  menuEl: HTMLDivElement,
  placement: DropdownMenuPlacement,
  offset: number,
  viewportMargin: number,
  animation: DropMenuAnimationVariant,
  crossOffset: number,
  avoidTriggerOverlap: boolean,
): MenuLayout {
  const triggerRect = triggerEl.getBoundingClientRect();
  const menuRect = menuEl.getBoundingClientRect();
  const trigger: TriggerRect = {
    top: triggerRect.top,
    left: triggerRect.left,
    right: triggerRect.right,
    bottom: triggerRect.bottom,
  };
  const viewport = { width: window.innerWidth, height: window.innerHeight };
  const pos = calculateDropdownPosition(
    trigger,
    { width: menuRect.width, height: menuRect.height },
    placement,
    offset,
    viewport,
    viewportMargin,
    crossOffset,
    avoidTriggerOverlap,
  );
  if (animation === 'expandFromTrigger') {
    return { ...pos, transformOrigin: transformOriginFromTrigger(trigger, pos) };
  }
  return pos;
}

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
  /** menu の表示位置 (default: 'bottom-end' で既存挙動と同一) */
  placement?: DropdownMenuPlacement;
  /**
   * Button molecule の wrapping をバイパスして任意の trigger を使う。
   * 引数: { onClick, isOpen, ariaProps }。trigger 自身が <button> をレンダリングする想定。
   * これを使う場合 `icon` / `label` / `variant` / `buttonClassName` は無視される。
   */
  customTrigger?: (args: {
    onClick: () => void;
    isOpen: boolean;
    ariaProps: {
      'aria-haspopup': 'true';
      'aria-expanded': boolean;
      'aria-controls': string;
      'aria-label'?: string;
    };
  }) => ReactNode;
  /** trigger ↔ menu の隙間 px (default: 8) */
  offset?: number;
  /**
   * placement の主軸と直交する方向への menu のずらし量 px (default: 0)。
   *   - 縦配置 (top-* / bottom-*): 横方向。正で右へ
   *   - 横配置 (left-* / right-*): 縦方向。正で下へ
   * trigger より広い menu の横位置を微調整したいとき (sidebar に食い込ませる等) に使う。
   */
  crossOffset?: number;
  /**
   * viewport clamp が menu を主軸方向に押し戻して trigger に被せるのを防ぐ (default: false)。
   * 画面端の trigger から開く縦長 menu が trigger に重ならないようにしたいとき true にする
   * (例: sidebar 下端のアカウントメニューを行の真上に固定)。menu が収まらないときは
   * trigger に被せず viewport 端を越えてはみ出す。
   */
  avoidTriggerOverlap?: boolean;
  /** icon-only trigger 用の accessible name。`label` 無しのときに渡す */
  ariaLabel?: string;
  /** メニューの登場アニメーション (default: 'expandFromTrigger' = 押した場所から拡大)。
   *  'none' でアニメーション無効。 */
  animation?: DropMenuAnimationVariant;
  /** menu が viewport 端に張り付かないようにする最小マージン px (default: 8)。
   *  trigger と menu のサイズ次第で `top` / `left` を viewport - margin の範囲で
   *  clamp する。0 を渡すと viewport 端ジャストまで許す。 */
  viewportMargin?: number;
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
  placement = 'bottom-end',
  offset = 8,
  crossOffset = 0,
  avoidTriggerOverlap = false,
  ariaLabel,
  customTrigger,
  animation = 'expandFromTrigger',
  viewportMargin = 8,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [shakeKey, setShakeKey] = useState(0); // アニメーション再トリガー用のキー
  const [layout, setLayout] = useState<MenuLayout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerWrapRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const log = useOperationLog('DropdownMenu');

  const closeMenu = () => {
    if (!isOpen) return;
    log('close', { label });
    setIsOpen(false);
    setLayout(null);
  };

  const toggleMenu = () => {
    if (isOpen) {
      closeMenu();
    } else {
      log('open', { label });
      setIsOpen(true);
    }

    // クリック時に shake アニメーションを再生（keyを変更して再マウント）
    if (iconShake) {
      setShakeKey((prev) => prev + 1);
    }
  };

  // 2 段階測定: open 時にまず off-screen で描画 → menu サイズ測定 → 位置確定
  useLayoutEffect(() => {
    if (!isOpen) return;
    if (!triggerWrapRef.current || !menuRef.current) return;
    setLayout(
      computeMenuLayout(
        triggerWrapRef.current,
        menuRef.current,
        placement,
        offset,
        viewportMargin,
        animation,
        crossOffset,
        avoidTriggerOverlap,
      ),
    );
  }, [isOpen, placement, offset, viewportMargin, animation, crossOffset, avoidTriggerOverlap]);

  // resize / scroll で位置を再計算 (passive listener)
  // useCapture (boolean) を変数化して add / remove で同一値を渡すことで cleanup 漏れを防ぐ
  useEffect(() => {
    if (!isOpen) return;
    const recompute = () => {
      if (!triggerWrapRef.current || !menuRef.current) return;
      setLayout(
        computeMenuLayout(
          triggerWrapRef.current,
          menuRef.current,
          placement,
          offset,
          viewportMargin,
          animation,
          crossOffset,
          avoidTriggerOverlap,
        ),
      );
    };
    const scrollOpts: AddEventListenerOptions = { passive: true, capture: true };
    window.addEventListener('resize', recompute, { passive: true });
    window.addEventListener('scroll', recompute, scrollOpts);
    return () => {
      window.removeEventListener('resize', recompute);
      // capture フラグだけ正しければ listener identity が一致するので removeEventListener できる
      window.removeEventListener('scroll', recompute, scrollOpts);
    };
  }, [isOpen, placement, offset, viewportMargin, animation, crossOffset, avoidTriggerOverlap]);

  // Esc キーで閉じる
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  // クリック外で閉じる。
  // event.target を contains() で判定するのは NG:
  //   trigger 内の子要素が mousedown と同時 setState で unmount/remount すると
  //   (例: NotificationBell の Bell key={shakeKey}), event.target は DOM から
  //   detach されており dropdownRef.contains(target) が false になる → 内側
  //   クリックなのに closeMenu が走り、続く Button click で再 open されて
  //   「閉じるはずのクリックが open になる」バグになる。
  //   event.composedPath() はイベント発火時のパスを保持するので detach されても
  //   正しく判定できる。
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!dropdownRef.current) return;
      const path = event.composedPath();
      if (path.includes(dropdownRef.current)) return;
      closeMenu();
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

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
            aria-haspopup="true"
            aria-expanded={isOpen}
            aria-controls={menuId}
            aria-label={ariaLabel}
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
            aria-haspopup="true"
            aria-expanded={isOpen}
            aria-controls={menuId}
            aria-label={ariaLabel}
          >
            <span className="relative z-10 flex items-center gap-2">
              {renderIcon(icon, 20, isOpen, isHovered)}
              {label && <span>{label}</span>}
            </span>
          </Button>
        );
    }
  };

  // animation prop から CSS animation 文字列を組み立てる。'none' なら undefined。
  // ANIMATIONS.dropMenu の config (keyframe 名 / duration / easing) を共通体系から
  // 引いて 'animation' shorthand 形式に直す。
  const animationConfig = animation !== 'none' ? ANIMATIONS.dropMenu[animation] : null;
  const animationStyle: string | undefined = animationConfig
    ? `${animationConfig.name} ${animationConfig.duration}ms ${animationConfig.easing} forwards`
    : undefined;

  // 第 1 パス: off-screen で描画して測定 (visibility: hidden で見せない)
  // 第 2 パス (layout 確定後): 正しい座標 + transform-origin + animation
  // animation は両パスで同じ値を渡すことで、フレーム差で animation-name が変わって
  // 再トリガーするのを防ぐ。visibility: hidden 中も animation は進行するが、
  // useLayoutEffect は paint 前に走るのでユーザーには連続して見える。
  const menuStyle: CSSProperties = layout
    ? {
        position: 'fixed',
        top: layout.top,
        left: layout.left,
        transformOrigin: layout.transformOrigin,
        animation: animationStyle,
      }
    : {
        position: 'fixed',
        top: -9999,
        left: -9999,
        visibility: 'hidden',
        animation: animationStyle,
      };

  // customTrigger が指定されたら Button molecule をバイパスして任意の trigger を使う
  const triggerNode = customTrigger
    ? customTrigger({
        onClick: toggleMenu,
        isOpen,
        ariaProps: {
          'aria-haspopup': 'true',
          'aria-expanded': isOpen,
          'aria-controls': menuId,
          'aria-label': ariaLabel,
        },
      })
    : renderButton()

  return (
    <div className={cn('relative', className)} ref={dropdownRef} data-component="dropdown-menu">
      <div
        ref={triggerWrapRef}
        className={customTrigger ? 'block' : 'inline-block'}
      >
        {triggerNode}
      </div>

      {isOpen && (
        <div
          ref={menuRef}
          id={menuId}
          style={menuStyle}
          className={cn(
            // アニメーションは style.animation 経由 (ANIMATIONS.dropMenu[variant])。
            // ここでは枠線・影・角丸など static な見た目だけを class で当てる。
            'z-50 overflow-hidden rounded-2xl border border-gray-200/60 bg-white/95 shadow-[0_20px_50px_-15px_rgba(15,23,42,0.35),0_8px_20px_-8px_rgba(15,23,42,0.25)] ring-1 ring-black/5 backdrop-blur-md',
            menuWidth
          )}
        >
          {typeof menuContent === 'function'
            ? menuContent(closeMenu)
            : menuContent}
        </div>
      )}
    </div>
  );
};
