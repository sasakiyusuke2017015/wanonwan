'use client'

import { FC, ReactNode } from 'react';

import { Input } from '../../molecules/Input';
import { Text } from '../../atoms/Text';

interface FormFieldProps {
  id?: string;
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  variant?: 'default' | 'question';
  children?: ReactNode;
  className?: string;
  // Input-related props for backward compatibility
  type?: string;
  value?: string;
  onChange?: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  placeholder?: string;
  // Div attributes (manually added to avoid conflicts)
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  onMouseEnter?: React.MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLDivElement>;
}

export const FormField: FC<FormFieldProps> = ({
  id,
  label,
  description,
  error,
  required = false,
  variant = 'default',
  children,
  className = '',
  type,
  value,
  onChange,
  placeholder,
  ...props
}) => {
  const { style, onClick, onMouseEnter, onMouseLeave } = props;
  const inputProps = { type, value, onChange, placeholder };

  if (variant === 'question') {
    return (
      <div
        id={id}
        className={`mb-6 rounded border border-gray-200 bg-white p-3 shadow-sm ${className}`}
        style={style}
        data-component="form-field"
        data-variant="question"
      >
        {/* タイトル（必須/任意バッジ付き） */}
        {label && (
          <p className="mb-2 font-semibold text-gray-900">
            {required ? (
              <span className="mr-2 inline rounded px-1.5 py-0.5 text-xs font-semibold text-red-800 bg-red-100">
                必須
              </span>
            ) : (
              <span className="mr-2 inline rounded px-1.5 py-0.5 text-xs font-semibold text-white bg-blue-400">
                任意
              </span>
            )}
            {label}
          </p>
        )}
        {/* 説明文 */}
        {description && (
          <p className="mb-4 whitespace-pre-wrap text-sm text-gray-700">{description}</p>
        )}
        {/* 入力エリア */}
        <div className={`rounded p-3 ${error ? 'border-2 border-red-400 bg-red-50' : 'bg-gray-50'}`}>
          {children || <Input {...inputProps} />}
          {error && (
            <Text as="p" variant="error" weight="semibold" size="sm" className="mt-2">
              {error}
            </Text>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      id={id}
      className={`mb-4 ${className}`}
      style={style}
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick(e as unknown as React.MouseEvent<HTMLDivElement>);
        }
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      data-component="form-field"
    >
      {label && (
        <label className="mb-2 block text-fluid-sm font-medium text-gray-700">
          {label}
          {required && <span className="ml-2 inline rounded px-1.5 py-0.5 text-xs font-semibold text-red-800 bg-red-100">必須</span>}
        </label>
      )}

      {children || <Input {...inputProps} />}

      {error && <Text as="p" variant="error" size="sm" className="mt-1">{error}</Text>}
    </div>
  );
};
