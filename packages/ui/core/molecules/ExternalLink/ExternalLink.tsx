'use client'

import { FC, ReactNode, AnchorHTMLAttributes } from 'react';

import { useOperationLog } from '../../../infra/devtools';
import { Icon } from '../../atoms/Icon';

type ExternalLinkVariant = 'default' | 'primary' | 'secondary';

interface ExternalLinkProps
  extends Omit<
    AnchorHTMLAttributes<HTMLAnchorElement>,
    'href' | 'target' | 'rel'
  > {
  href: string;
  children: ReactNode;
  className?: string;
  variant?: ExternalLinkVariant;
  /** borderRadius（形状設定用） - Layout から props で渡す */
  borderRadius?: string;
}

export const ExternalLink: FC<ExternalLinkProps> = ({
  href,
  children,
  className = '',
  variant = 'default',
  borderRadius = '0.375rem', // デフォルト値
}) => {
  const log = useOperationLog('ExternalLink');

  const handleClick = () => {
    log('click', { href });
  };

  // 基本スタイル
  const baseClasses =
    'block w-full py-2 px-4 font-medium text-left text-white flex items-center justify-start gap-2 no-underline hover:underline transition-all duration-200 hover:scale-105 hover:shadow-lg hover:-translate-y-0.5 transform-gpu group';

  // バリアント別スタイル
  const variantClasses = {
    default: 'bg-blue-700 hover:bg-blue-800',
    primary: 'bg-blue-700 hover:bg-blue-800',
    secondary: 'bg-gray-600 hover:bg-gray-700',
  };

  const combinedClass = [baseClasses, variantClasses[variant], className]
    .filter(Boolean)
    .join(' ');

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={combinedClass}
      style={{ borderRadius }}
      onClick={handleClick}
      data-component="external-link"
      data-variant={variant}
    >
      <Icon
        name="arrow-up-right"
        size={20}
        className="transition-transform duration-200 group-hover:-translate-y-1 group-hover:translate-x-1"
      />
      {children}
    </a>
  );
};
