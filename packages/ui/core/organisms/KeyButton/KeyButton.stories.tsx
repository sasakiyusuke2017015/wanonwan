import { KeyButton } from './KeyButton';

/**
 * キーボタンコンポーネント
 *
 * アプリケーションの状態に応じてアクションが切り替わるインテリジェントボタン。
 * 状態管理とアクションの有効/無効を自動化します。
 */
export default {
  title: '入力/ボタン/KeyButton',
  component: KeyButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
状態に応じてアクションが変化するインテリジェントボタン。以下の機能をサポート:

- **状態管理**: アプリケーションの現在状態に応じたアクション表示
- **自動有効化**: アクションの状態と現在状態が一致した場合のみ有効
- **複数アクション**: スラッシュ区切りで複数アクション表示
- **カスタマイズ**: サイズ、色、バリアントの設定

フォームやダッシュボードの状態依存アクションに最適化されています。
        `,
      },
      source: {
        transform: (
          code: string,
          storyContext: { args: Record<string, unknown> }
        ) => {
          const { args } = storyContext;
          const props = [];

          type ActionType = {
            label: string;
            state: string | string[];
            onClick: () => void;
          };

          // action
          if (args.action) {
            if (Array.isArray(args.action)) {
              props.push(`action={[
  ${(args.action as ActionType[])
    .map(
      (a: ActionType) => `{
    label: "${a.label}",
    state: ${Array.isArray(a.state) ? `["${a.state.join('", "')}"]` : `"${a.state}"`},
    onClick: handleClick
  }`
    )
    .join(',\n  ')}
]}`);
            } else {
              const action = args.action as ActionType;
              props.push(`action={{
  label: "${action.label}",
  state: ${Array.isArray(action.state) ? `["${action.state.join('", "')}"]` : `"${action.state}"`},
  onClick: handleClick
}}`);
            }
          }

          // currentState
          if (args.currentState) {
            props.push(`currentState="${args.currentState}"`);
          }

          // variant (デフォルトと異なる場合のみ)
          if (args.variant && args.variant !== 'primary') {
            props.push(`variant="${args.variant}"`);
          }

          // disabled
          if (args.disabled) {
            props.push(`disabled={${args.disabled}}`);
          }

          // buttonSize (デフォルトと異なる場合のみ)
          if (args.buttonSize && args.buttonSize !== 'w-20') {
            props.push(`buttonSize="${args.buttonSize}"`);
          }

          // textSize (デフォルトと異なる場合のみ)
          if (args.textSize && args.textSize !== 'text-fluid-xs') {
            props.push(`textSize="${args.textSize}"`);
          }

          const propsString =
            props.length > 0 ? '\n  ' + props.join('\n  ') + '\n' : '';

          return `import KeyButton from './components/molecules/KeyButton';

<KeyButton${propsString} />`;
        },
      },
    },
  },
  argTypes: {
    action: {
      description: 'ボタンのアクション設定(単一または複数)',
      control: false,
    },
    currentState: {
      description: 'アプリケーションの現在状態',
      control: 'select',
      options: ['default', 'edit', 'confirm'],
    },
    variant: {
      description: 'ボタンのバリアント',
      control: 'select',
      options: ['primary', 'secondary', 'danger', 'outline'],
    },
    disabled: {
      description: 'ボタンの強制無効化',
      control: 'boolean',
    },
    buttonSize: {
      description: 'ボタンのサイズ(Tailwindクラス)',
      control: 'text',
    },
    textSize: {
      description: 'テキストのサイズ(Tailwindクラス)',
      control: 'text',
    },
  },
};

// 基本的なアクション
const simpleAction = {
  label: '保存',
  state: 'default',
  onClick: () => window.alert('保存しました'),
};

export const Default = {
  args: {
    action: simpleAction,
    currentState: 'default',
  },
  parameters: {
    docs: {
      description: {
        story:
          '基本的なキーボタンの表示例。状態が一致しているためボタンが有効です',
      },
      source: {
        code: `import KeyButton from './components/molecules/KeyButton';

const action = {
  label: "保存",
  state: "default",
  onClick: () => window.alert("保存しました")
};

<KeyButton 
  action={action} 
  currentState="default" 
/>`,
      },
    },
  },
};

export const Disabled = {
  args: {
    action: simpleAction,
    currentState: 'edit', // currentStateがactionのstateと一致しないため無効
  },
  parameters: {
    docs: {
      description: {
        story: '状態が一致しないためボタンが自動的に無効化された例',
      },
      source: {
        code: `import KeyButton from './components/molecules/KeyButton';

const action = {
  label: "保存",
  state: "default", // 現在状態と不一致
  onClick: () => window.alert("保存しました")
};

<KeyButton 
  action={action} 
  currentState="edit" // 状態が不一致のため無効
/>`,
      },
    },
  },
};

export const ForceDisabled = {
  args: {
    action: simpleAction,
    currentState: 'default',
    disabled: true, // 強制的に無効化
  },
  parameters: {
    docs: {
      description: {
        story: 'disabledプロプで強制的に無効化された例',
      },
      source: {
        code: `import KeyButton from './components/molecules/KeyButton';

const action = {
  label: "保存",
  state: "default",
  onClick: () => window.alert("保存しました")
};

<KeyButton 
  action={action} 
  currentState="default" 
  disabled={true} // 強制的に無効化
/>`,
      },
    },
  },
};

// 複数の状態で有効なアクション
const multiStateAction = {
  label: '戻る',
  state: ['default', 'edit', 'confirm'],
  onClick: () => window.alert('前の画面に戻ります'),
};

export const MultiState = {
  args: {
    action: multiStateAction,
    currentState: 'edit',
  },
  parameters: {
    docs: {
      description: {
        story: '複数の状態で有効なアクションの例',
      },
      source: {
        code: `import KeyButton from './components/molecules/KeyButton';

const action = {
  label: "戻る",
  state: ["default", "edit", "confirm"], // 複数状態で有効
  onClick: () => window.alert("前の画面に戻ります")
};

<KeyButton 
  action={action} 
  currentState="edit" 
/>`,
      },
    },
  },
};

// 複数のアクション(スラッシュ区切り)
const multipleActions = [
  {
    label: '保存',
    state: 'edit',
    onClick: () => window.alert('保存しました'),
  },
  {
    label: '確認',
    state: 'default',
    onClick: () => window.alert('確認しました'),
  },
];

export const MultipleActions = {
  args: {
    action: multipleActions,
    currentState: 'default',
  },
  parameters: {
    docs: {
      description: {
        story: '複数のアクションをスラッシュ区切りで表示する例',
      },
      source: {
        code: `import KeyButton from './components/molecules/KeyButton';

const actions = [
  {
    label: "保存",
    state: "edit",
    onClick: () => window.alert("保存しました")
  },
  {
    label: "確認",
    state: "default",
    onClick: () => window.alert("確認しました")
  }
];

<KeyButton 
  action={actions} 
  currentState="default" 
/>`,
      },
    },
  },
};

export const Large = {
  args: {
    action: {
      label: 'スペースキー',
      state: 'default',
      onClick: () => window.alert('スペースキーが押されました'),
    },
    currentState: 'default',
    buttonSize: 'w-48',
  },
  parameters: {
    docs: {
      description: {
        story: 'サイズをカスタマイズした大きなボタンの例',
      },
      source: {
        code: `import KeyButton from './components/molecules/KeyButton';

const action = {
  label: "スペースキー",
  state: "default",
  onClick: () => window.alert("スペースキーが押されました")
};

<KeyButton 
  action={action} 
  currentState="default" 
  buttonSize="w-48" 
/>`,
      },
    },
  },
};

export const CustomStyle = {
  args: {
    action: {
      label: '削除',
      state: 'default',
      onClick: () => window.alert('削除しました'),
    },
    currentState: 'default',
    variant: 'danger',
    textSize: 'text-fluid-lg',
  },
  parameters: {
    docs: {
      description: {
        story: 'バリアントとテキストサイズをカスタマイズした例',
      },
      source: {
        code: `import KeyButton from './components/molecules/KeyButton';

const action = {
  label: "削除",
  state: "default",
  onClick: () => window.alert("削除しました")
};

<KeyButton 
  action={action} 
  currentState="default" 
  variant="danger" 
  textSize="text-fluid-lg" 
/>`,
      },
    },
  },
};
