import { ExternalLink } from './ExternalLink';

export default {
  title: 'ナビゲーション/リンク/ExternalLink',
  component: ExternalLink,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '外部リンクを新しいタブで開くためのリンクコンポーネント。アイコン付きで外部サイトへの遷移を明示的に表現します。',
      },
      source: {
        transform: (code: string, storyContext: { args: Record<string, unknown> }) => {
          const { args } = storyContext;
          const props = [];

          if (args.href) {
            props.push(`href="${args.href}"`);
          }

          if (args.variant && args.variant !== 'default') {
            props.push(
              `className="sdt-external-link sdt-external-link--${args.variant}"`
            );
          } else {
            props.push(`className="sdt-external-link"`);
          }

          const propsString = props.length > 0 ? ' ' + props.join(' ') : '';
          const children = args.children || 'External Link';

          return `import ExternalLink from './components/atoms/ExternalLink/ExternalLink';

<ExternalLink${propsString}>${children}</ExternalLink>`;
        },
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    href: { control: 'text', description: 'リンク先のURL' },
    children: { control: 'text', description: 'リンクのテキスト内容' },
    variant: {
      control: {
        type: 'select',
        options: [
          'default', // blue
          'wordpress', // blue
          'api', // amber
          'catalog', // orange
          'source', // slate
          'dify', // emerald
          'pleasanter', // rose
        ],
      },
      description: `カラーバリエーション(修飾クラス)：
    - **default**: 青(blue-700)
    - **wordpress**: 青(blue-700)
    - **api**: アンバー(amber-600)
    - **catalog**: オレンジ(orange-600)
    - **source**: スレート(slate-600)
    - **dify**: エメラルド(emerald-600)
    - **pleasanter**: ローズ(rose-600)`,
      table: { defaultValue: { summary: 'default' } },
    },
    className: { table: { disable: true } }, // 非表示にする
  },
};

// Story wrapper
const Template = ({
  variant,
  href,
  children,
  ...args
}: {
  variant?: string;
  href: string;
  children: string;
  [key: string]: unknown;
}) => {
  const variantClass =
    variant && variant !== 'default'
      ? `sdt-external-link sdt-external-link--${variant}`
      : 'sdt-external-link';

  return (
    <ExternalLink href={href} className={variantClass} {...args}>
      {children}
    </ExternalLink>
  );
};

export const Default = {
  args: {
    href: 'https://example.com',
    children: 'External Link',
    variant: 'default',
  },
  render: Template,
};

export const WordPress = {
  args: {
    href: 'http://192.168.10.64/wordpress',
    children: 'WordPress',
    variant: 'wordpress',
  },
  render: Template,
};

export const APIDocument = {
  args: {
    href: 'http://192.168.10.63:8080/docs#',
    children: 'APIドキュメント',
    variant: 'api',
  },
  render: Template,
};

export const ComponentCatalog = {
  args: {
    href: 'http://192.168.10.64:7006/',
    children: 'コンポーネントカタログ',
    variant: 'catalog',
  },
  render: Template,
};

export const SourceControl = {
  args: {
    href: 'http://192.168.10.64:5000/',
    children: 'ソース管理',
    variant: 'source',
  },
  render: Template,
};

export const Dify = {
  args: {
    href: 'http://192.168.10.66/apps',
    children: 'Dify',
    variant: 'dify',
  },
  render: Template,
};

export const Pleasanter = {
  args: {
    href: 'http://192.168.10.64/items/1/index',
    children: 'Pleasanter',
    variant: 'pleasanter',
  },
  render: Template,
};
