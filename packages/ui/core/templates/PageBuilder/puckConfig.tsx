/**
 * Puck ページビルダー設定
 *
 * ui-catalog のコンポーネントを Puck のドラッグ＆ドロップエディタに登録
 */
import type { Config } from '@measured/puck'

import { Text } from '../../atoms/Text/Text'
import { Badge } from '../../atoms/Badge/Badge'
import { Stack } from '../../atoms/Stack/Stack'
import { Spinner } from '../../atoms/Spinner/Spinner'
import { Toggle } from '../../atoms/Toggle/Toggle'
import { Button } from '../../molecules/Button/Button'
import Card, { CardHeader, CardContent } from '../../molecules/Card/Card'
import { Input } from '../../molecules/Input/Input'
import { Banner } from '../../molecules/Banner/Banner'

type PuckProps = {
  HeadingBlock: { text: string; level: 'h1' | 'h2' | 'h3' | 'h4'; align: 'left' | 'center' | 'right' }
  TextBlock: { text: string; size: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl'; weight: 'normal' | 'medium' | 'semibold' | 'bold'; variant: 'default' | 'muted' | 'secondary' }
  ButtonBlock: { label: string; variant: 'primary' | 'secondary' | 'outline' | 'danger' | 'default' | 'success'; size: 'small' | 'medium' | 'large'; fullWidth: boolean }
  CardBlock: { title: string; content: string; padding: boolean }
  InputBlock: { placeholder: string; variant: 'default' | 'dark' | 'outlined'; size: 'small' | 'medium' | 'large'; type: string }
  BadgeBlock: { text: string; variant: 'default' | 'success' | 'warning' | 'error' | 'info'; size: 'small' | 'medium' | 'large' }
  StackBlock: { direction: 'row' | 'column'; gap: number; align: 'start' | 'center' | 'end' | 'stretch'; justify: 'start' | 'center' | 'end' | 'between' }
  BannerBlock: { message: string; variant: 'info' | 'success' | 'warning' | 'error' }
  SpinnerBlock: { size: 'sm' | 'md' | 'lg' }
  ToggleBlock: { label: string; size: 'small' | 'medium' | 'large' }
  SpacerBlock: { height: number }
  DividerBlock: Record<string, never>
}

export const puckConfig: Config<PuckProps> = {
  categories: {
    layout: {
      title: 'レイアウト',
      components: ['StackBlock', 'SpacerBlock', 'DividerBlock'],
    },
    typography: {
      title: 'テキスト',
      components: ['HeadingBlock', 'TextBlock'],
    },
    actions: {
      title: 'アクション',
      components: ['ButtonBlock', 'ToggleBlock'],
    },
    display: {
      title: '表示',
      components: ['CardBlock', 'BadgeBlock', 'BannerBlock', 'SpinnerBlock'],
    },
    form: {
      title: 'フォーム',
      components: ['InputBlock'],
    },
  },
  components: {
    HeadingBlock: {
      label: '見出し',
      fields: {
        text: { type: 'text' },
        level: {
          type: 'select',
          options: [
            { label: 'H1', value: 'h1' },
            { label: 'H2', value: 'h2' },
            { label: 'H3', value: 'h3' },
            { label: 'H4', value: 'h4' },
          ],
        },
        align: {
          type: 'radio',
          options: [
            { label: '左', value: 'left' },
            { label: '中央', value: 'center' },
            { label: '右', value: 'right' },
          ],
        },
      },
      defaultProps: {
        text: '見出しテキスト',
        level: 'h2',
        align: 'left',
      },
      render: ({ text, level, align }) => {
        const sizeMap = { h1: '4xl' as const, h2: '2xl' as const, h3: 'xl' as const, h4: 'lg' as const }
        return <Text as={level} size={sizeMap[level]} weight="semibold" align={align}>{text}</Text>
      },
    },

    TextBlock: {
      label: 'テキスト',
      fields: {
        text: { type: 'textarea' },
        size: {
          type: 'select',
          options: [
            { label: '極小', value: 'xs' },
            { label: '小', value: 'sm' },
            { label: '標準', value: 'base' },
            { label: '大', value: 'lg' },
            { label: '特大', value: 'xl' },
            { label: '2XL', value: '2xl' },
          ],
        },
        weight: {
          type: 'select',
          options: [
            { label: '通常', value: 'normal' },
            { label: '中', value: 'medium' },
            { label: '太', value: 'semibold' },
            { label: '極太', value: 'bold' },
          ],
        },
        variant: {
          type: 'select',
          options: [
            { label: '標準', value: 'default' },
            { label: '控えめ', value: 'muted' },
            { label: '副', value: 'secondary' },
          ],
        },
      },
      defaultProps: {
        text: 'テキストを入力',
        size: 'base',
        weight: 'normal',
        variant: 'default',
      },
      render: ({ text, size, weight, variant }) => (
        <Text as="p" size={size} weight={weight} variant={variant}>{text}</Text>
      ),
    },

    ButtonBlock: {
      label: 'ボタン',
      fields: {
        label: { type: 'text' },
        variant: {
          type: 'select',
          options: [
            { label: 'プライマリ', value: 'primary' },
            { label: 'セカンダリ', value: 'secondary' },
            { label: 'アウトライン', value: 'outline' },
            { label: '危険', value: 'danger' },
            { label: 'デフォルト', value: 'default' },
            { label: '成功', value: 'success' },
          ],
        },
        size: {
          type: 'select',
          options: [
            { label: '小', value: 'small' },
            { label: '中', value: 'medium' },
            { label: '大', value: 'large' },
          ],
        },
        fullWidth: { type: 'radio', options: [{ label: 'はい', value: true }, { label: 'いいえ', value: false }] },
      },
      defaultProps: {
        label: 'ボタン',
        variant: 'primary',
        size: 'medium',
        fullWidth: false,
      },
      render: ({ label, variant, size, fullWidth }) => (
        <Button variant={variant} size={size} fullWidth={fullWidth}>{label}</Button>
      ),
    },

    CardBlock: {
      label: 'カード',
      fields: {
        title: { type: 'text' },
        content: { type: 'textarea' },
        padding: { type: 'radio', options: [{ label: 'あり', value: true }, { label: 'なし', value: false }] },
      },
      defaultProps: {
        title: 'カードタイトル',
        content: 'カードの内容をここに記述します。',
        padding: true,
      },
      render: ({ title, content, padding }) => (
        <Card padding={padding}>
          <CardHeader>
            <Text as="h3" size="lg" weight="semibold">{title}</Text>
          </CardHeader>
          <CardContent>
            <Text as="p">{content}</Text>
          </CardContent>
        </Card>
      ),
    },

    InputBlock: {
      label: '入力欄',
      fields: {
        placeholder: { type: 'text' },
        variant: {
          type: 'select',
          options: [
            { label: 'デフォルト', value: 'default' },
            { label: 'ダーク', value: 'dark' },
            { label: 'アウトライン', value: 'outlined' },
          ],
        },
        size: {
          type: 'select',
          options: [
            { label: '小', value: 'small' },
            { label: '中', value: 'medium' },
            { label: '大', value: 'large' },
          ],
        },
        type: {
          type: 'select',
          options: [
            { label: 'テキスト', value: 'text' },
            { label: 'メール', value: 'email' },
            { label: 'パスワード', value: 'password' },
            { label: '数値', value: 'number' },
          ],
        },
      },
      defaultProps: {
        placeholder: '入力してください',
        variant: 'default',
        size: 'medium',
        type: 'text',
      },
      render: ({ placeholder, variant, size, type }) => (
        <Input placeholder={placeholder} variant={variant} size={size} type={type} />
      ),
    },

    BadgeBlock: {
      label: 'バッジ',
      fields: {
        text: { type: 'text' },
        variant: {
          type: 'select',
          options: [
            { label: 'デフォルト', value: 'default' },
            { label: '成功', value: 'success' },
            { label: '警告', value: 'warning' },
            { label: 'エラー', value: 'error' },
            { label: '情報', value: 'info' },
          ],
        },
        size: {
          type: 'select',
          options: [
            { label: '小', value: 'small' },
            { label: '中', value: 'medium' },
            { label: '大', value: 'large' },
          ],
        },
      },
      defaultProps: {
        text: 'ラベル',
        variant: 'default',
        size: 'medium',
      },
      render: ({ text, variant, size }) => (
        <Badge variant={variant} size={size}>{text}</Badge>
      ),
    },

    StackBlock: {
      label: 'スタック',
      fields: {
        direction: {
          type: 'radio',
          options: [
            { label: '横', value: 'row' },
            { label: '縦', value: 'column' },
          ],
        },
        gap: { type: 'number', min: 0, max: 64 },
        align: {
          type: 'select',
          options: [
            { label: '上', value: 'start' },
            { label: '中央', value: 'center' },
            { label: '下', value: 'end' },
            { label: '伸縮', value: 'stretch' },
          ],
        },
        justify: {
          type: 'select',
          options: [
            { label: '左', value: 'start' },
            { label: '中央', value: 'center' },
            { label: '右', value: 'end' },
            { label: '均等', value: 'between' },
          ],
        },
      },
      defaultProps: {
        direction: 'column',
        gap: 16,
        align: 'stretch',
        justify: 'start',
      },
      render: ({ direction, gap, align, justify }) => (
        <Stack direction={direction} gap={gap} align={align} justify={justify}>
          <Text as="p" variant="muted">スタック内にコンポーネントを配置</Text>
        </Stack>
      ),
    },

    BannerBlock: {
      label: 'バナー',
      fields: {
        message: { type: 'text' },
        variant: {
          type: 'select',
          options: [
            { label: '情報', value: 'info' },
            { label: '成功', value: 'success' },
            { label: '警告', value: 'warning' },
            { label: 'エラー', value: 'error' },
          ],
        },
      },
      defaultProps: {
        message: 'お知らせメッセージ',
        variant: 'info',
      },
      render: ({ message, variant }) => (
        <Banner variant={variant} message={message} />
      ),
    },

    SpinnerBlock: {
      label: 'スピナー',
      fields: {
        size: {
          type: 'select',
          options: [
            { label: '小', value: 'sm' },
            { label: '中', value: 'md' },
            { label: '大', value: 'lg' },
          ],
        },
      },
      defaultProps: { size: 'md' },
      render: ({ size }) => <Spinner size={size} />,
    },

    ToggleBlock: {
      label: 'トグル',
      fields: {
        label: { type: 'text' },
        size: {
          type: 'select',
          options: [
            { label: '小', value: 'small' },
            { label: '中', value: 'medium' },
            { label: '大', value: 'large' },
          ],
        },
      },
      defaultProps: { label: '有効にする', size: 'medium' },
      render: ({ label, size }) => (
        <Stack direction="row" gap={8} align="center">
          <Toggle size={size} />
          <Text as="span" size="sm">{label}</Text>
        </Stack>
      ),
    },

    SpacerBlock: {
      label: '余白',
      fields: {
        height: { type: 'number', min: 4, max: 128 },
      },
      defaultProps: { height: 24 },
      render: ({ height }) => <div style={{ height }} />,
    },

    DividerBlock: {
      label: '区切り線',
      fields: {},
      defaultProps: {},
      render: () => <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '8px 0' }} />,
    },
  },
}
