'use client';

import React from 'react';

import { useLink } from '../../hooks/router/RouterContext';
import { useOperationLog } from '../../../infra/devtools';
import { Icon } from '../../atoms/Icon';

interface InternalLinkProps {
  /** リンク先のパス */
  href?: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  variant?: 'button' | 'text' | 'link';
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  disabled?: boolean;
  showIcon?: boolean;
  disableScale?: boolean;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  /** borderRadius（形状設定用） - Layout から props で渡す */
  borderRadius?: string;
}

export const InternalLink: React.FC<InternalLinkProps> = ({
  href,
  children,
  className = '',
  style,
  variant = 'link',
  size = 'medium',
  color = 'primary',
  disabled = false,
  showIcon = true,
  disableScale = false,
  onClick,
  borderRadius = '0.375rem', // デフォルト値
}) => {
  const Link = useLink();
  const log = useOperationLog('InternalLink');

  const linkHref = href ?? '/';

  const scaleClass = disableScale ? '' : 'hover:scale-105';

  const getVariantClasses = () => {
    switch (variant) {
      case 'button':
        return `inline-flex items-center justify-center font-medium border border-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ${scaleClass} hover:shadow-lg hover:-translate-y-0.5 transform-gpu group gap-2`;
      case 'text':
        return `inline-flex items-center font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ${scaleClass} transform-gpu group gap-2`;
      case 'link':
      default:
        return `inline-flex items-center text-blue-600 hover:underline focus:bg-blue-600 focus:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-200 ${scaleClass} transform-gpu group gap-2 px-2 py-1`;
    }
  };

  const getSizeClasses = () => {
    if (variant === 'button') {
      switch (size) {
        case 'small':
          return 'px-2 py-1 text-fluid-xs';
        case 'large':
          return 'px-6 py-3 text-fluid-base';
        case 'medium':
        default:
          return 'px-4 py-2 text-fluid-sm';
      }
    }

    switch (size) {
      case 'small':
        return 'text-fluid-xs';
      case 'large':
        return 'text-fluid-base';
      case 'medium':
      default:
        return 'text-fluid-sm';
    }
  };

  const getColorClasses = () => {
    if (variant === 'button') {
      switch (color) {
        case 'secondary':
          return 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500';
        case 'success':
          return 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500';
        case 'warning':
          return 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500';
        case 'danger':
          return 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500';
        case 'primary':
        default:
          return 'bg-blue-600 text-white hover:bg-white hover:text-blue-600 focus:ring-blue-500';
      }
    }

    switch (color) {
      case 'secondary':
        return 'text-gray-600 hover:text-gray-700 focus:ring-gray-500';
      case 'success':
        return 'text-green-600 hover:text-green-700 focus:ring-green-500';
      case 'warning':
        return 'text-yellow-600 hover:text-yellow-700 focus:ring-yellow-500';
      case 'danger':
        return 'text-red-600 hover:text-red-700 focus:ring-red-500';
      case 'primary':
      default:
        return 'text-blue-600 hover:underline focus:bg-blue-600 focus:text-white focus:ring-blue-500';
    }
  };

  const getDisabledClasses = () => {
    if (variant === 'button') {
      return 'bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300';
    }
    return 'text-gray-400 cursor-not-allowed hover:text-gray-400 hover:no-underline';
  };

  const baseClasses = getVariantClasses();
  const sizeClasses = getSizeClasses();
  const colorClasses = disabled ? getDisabledClasses() : getColorClasses();

  const finalClassName =
    `${baseClasses} ${sizeClasses} ${colorClasses} ${className}`.trim();

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    log('click', { href: linkHref });
    onClick?.(event);
  };

  if (disabled) {
    return <span className={finalClassName}>{children}</span>;
  }

  const combinedStyle: React.CSSProperties = {
    ...style,
    borderRadius,
  };

  return (
    <Link
      href={linkHref}
      className={finalClassName}
      style={combinedStyle}
      onClick={handleClick}
      data-component="internal-link"
      data-variant={variant}
    >
      {showIcon && (
        <Icon
          name={'arrow-in'}
          size={20}
          className="transition-transform duration-200 group-hover:translate-x-1"
        />
      )}
      {children}
    </Link>
  );
};
