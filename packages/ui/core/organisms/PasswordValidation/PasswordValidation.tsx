'use client'

import { FC, useMemo } from 'react';

import styles from './PasswordValidation.module.scss';

interface PasswordValidationProps {
  password: string;
  confirmPassword?: string;
  /** バリデーション表示を開始するかどうか（入力が始まったら true） */
  showValidation?: boolean;
}

interface ValidationRule {
  label: string;
  check: (password: string, confirmPassword?: string) => boolean;
}

const RULES: ValidationRule[] = [
  { label: '8文字以上', check: (pw) => pw.length >= 8 },
  { label: '30文字以下', check: (pw) => pw.length <= 30 && pw.length > 0 },
];

const CONFIRM_RULE: ValidationRule = {
  label: 'パスワードが一致',
  check: (pw, confirm) => pw.length > 0 && confirm !== undefined && confirm.length > 0 && pw === confirm,
};

/**
 * パスワードバリデーション表示コンポーネント
 * リアルタイムで条件の達成状況を表示
 */
export const PasswordValidation: FC<PasswordValidationProps> = ({
  password,
  confirmPassword,
  showValidation = false,
}) => {
  const rules = useMemo(() => {
    const allRules = [...RULES];
    if (confirmPassword !== undefined) {
      allRules.push(CONFIRM_RULE);
    }
    return allRules;
  }, [confirmPassword !== undefined]);

  if (!showValidation) return null;

  return (
    <div className={styles.passwordValidation} data-component="password-validation">
      {rules.map((rule) => {
        const passed = rule.check(password, confirmPassword);
        const ruleClasses = [
          styles.passwordValidation__rule,
          passed ? styles['passwordValidation__rule--passed'] : styles['passwordValidation__rule--pending'],
        ].join(' ');

        return (
          <span key={rule.label} className={ruleClasses}>
            {passed ? '✓' : '○'} {rule.label}
          </span>
        );
      })}
    </div>
  );
};

