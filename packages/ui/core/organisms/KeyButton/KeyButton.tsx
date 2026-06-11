'use client'

// components/molecules/KeyButton.tsx
import { Button } from '../../molecules/Button';

interface ActionItem {
  label?: string;
  state?: string | string[];
  onClick?: () => void;
  disable?: boolean;
}

interface KeyButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  id: string;
  action: ActionItem | ActionItem[] | undefined;
  currentState: string;
  buttonSize?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  textSize?: string;
  disabled?: boolean;
}

export function KeyButton({
  id,
  action,
  currentState,
  buttonSize = "w-20",
  variant,
  textSize = "text-fluid-xs",
  disabled = false,
  ...props
}: KeyButtonProps) {
  // action.state が配列でなければ 1 要素の配列に変換
  const normalizeState = (stateValue: string | string[]): string[] =>
    Array.isArray(stateValue) ? stateValue : [stateValue];

  // 現在の状態に適合しているか判定
  const isActionEnabled = (action: ActionItem | ActionItem[] | undefined): boolean => {
    if (!action) return false;
    if (Array.isArray(action)) {
      // 配列の場合は全てのアクションをチェック
      return action.some(a => !a.state || normalizeState(a.state).includes(currentState));
    }
    if (!action.state) return true;
    return normalizeState(action.state).includes(currentState);
  };

  // アクションのラベル取得
  const getActionLabel = (action: ActionItem | ActionItem[] | undefined): string => {
    if (!action) return '';
    return Array.isArray(action) 
      ? action.map(a => a.label).join(' / ')
      : action.label || '';
  };

  // アクションの onClick 実行
  const handleClick = () => {
    if (!action) return;

    const actionsToExecute = Array.isArray(action) ? action : [action];
    
    actionsToExecute.forEach(a => {
      if (isActionEnabled(a) && typeof a.onClick === 'function') {
        a.onClick();
      }
    });
  };

  // ボタンの有効/無効状態
  const isEnabled = isActionEnabled(action) && !disabled;
  
  // 有効時のみラベル表示
  const label = isEnabled ? getActionLabel(action) : "";

  return (
    <Button
      id={id}
      variant={variant || (isEnabled ? 'primary' : 'secondary')}
      size="small"
      disabled={!isEnabled}
      onClick={isEnabled ? handleClick : undefined}
      className={`flex items-center justify-center ${buttonSize} h-8`}
      data-component="key-button"
      {...props}
    >
      <span className={`${textSize} mb-1`}>{label}</span>
    </Button>
  );
}