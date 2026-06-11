import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PasswordValidation } from './PasswordValidation';

describe('PasswordValidation', () => {
  it('showValidation=falseの場合、何も表示されない', () => {
    const { container } = render(<PasswordValidation password="test" showValidation={false} />);
    expect(container.querySelector('[data-component="password-validation"]')).not.toBeInTheDocument();
  });

  it('showValidation=trueの場合、バリデーションルールが表示される', () => {
    render(<PasswordValidation password="test" showValidation={true} />);
    expect(screen.getByText(/8文字以上/)).toBeInTheDocument();
    expect(screen.getByText(/30文字以下/)).toBeInTheDocument();
  });

  it('8文字以上のパスワードで条件が満たされる', () => {
    render(<PasswordValidation password="12345678" showValidation={true} />);
    expect(screen.getByText(/✓ 8文字以上/)).toBeInTheDocument();
  });

  it('confirmPasswordが指定された場合、一致ルールが表示される', () => {
    render(<PasswordValidation password="12345678" confirmPassword="12345678" showValidation={true} />);
    expect(screen.getByText(/パスワードが一致/)).toBeInTheDocument();
  });
});
