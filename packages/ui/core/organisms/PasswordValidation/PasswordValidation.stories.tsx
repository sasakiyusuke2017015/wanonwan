import { useState } from 'react';

import type { Meta } from '@storybook/react';

import { PasswordValidation } from './PasswordValidation';

const meta: Meta<typeof PasswordValidation> = {
  title: 'フォーム/フィールド/PasswordValidation',
  component: PasswordValidation,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;

export const AllPassed = {
  args: {
    password: 'MySecurePass123',
    showValidation: true,
  },
};

export const PartiallyPassed = {
  args: {
    password: 'short',
    showValidation: true,
  },
};

export const WithConfirmPassword = {
  args: {
    password: 'MySecurePass123',
    confirmPassword: 'MySecurePass123',
    showValidation: true,
  },
};

export const MismatchedPasswords = {
  args: {
    password: 'MySecurePass123',
    confirmPassword: 'DifferentPass',
    showValidation: true,
  },
};

const InteractiveExample = () => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  return (
    <div className="space-y-3 w-64">
      <input
        type="password"
        placeholder="パスワード"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border rounded px-3 py-2"
      />
      <input
        type="password"
        placeholder="確認用パスワード"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        className="w-full border rounded px-3 py-2"
      />
      <PasswordValidation
        password={password}
        confirmPassword={confirm}
        showValidation={password.length > 0}
      />
    </div>
  );
};

export const Interactive = {
  render: () => <InteractiveExample />,
};
