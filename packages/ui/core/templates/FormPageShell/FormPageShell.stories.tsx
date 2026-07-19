import type { Meta, StoryObj } from '@storybook/react'

import { Button } from '../../molecules/Button'
import { FormGrid } from '../../molecules/FormGrid'
import { TextField, NumberField, TextareaField } from '../../molecules/FormFields'

import { FormPageShell } from './FormPageShell'

const meta: Meta<typeof FormPageShell> = {
  title: 'Templates/FormPageShell',
  component: FormPageShell,
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj<typeof FormPageShell>

const noop = () => undefined

/** フォームページ（右上に戻るアイコン + 下部フッター + FormGrid 本体）。 */
export const FormPage: Story = {
  render: () => (
    <div className="p-6">
      <FormPageShell
        title="コースカテゴリを編集"
        subtitle="コースの分類マスタ。コース作成・編集のカテゴリ選択に反映されます。"
        nav={[{ icon: 'arrow-left', label: '一覧に戻る', href: '#' }]}
        footer={
          <>
            <Button variant="outline">やめる</Button>
            <Button variant="primary">保存する</Button>
          </>
        }
      >
        <div className="max-w-3xl">
          <FormGrid>
            <FormGrid.Item width="wide">
              <TextField label="コースカテゴリ名" required value="生成AI基礎" onChange={noop} />
            </FormGrid.Item>
            <FormGrid.Item width="short">
              <TextField label="コード" value="GEN-AI" onChange={noop} />
            </FormGrid.Item>
            <FormGrid.Item width="short">
              <NumberField label="表示順" value="10" onChange={noop} />
            </FormGrid.Item>
            <FormGrid.Item width="full">
              <TextareaField label="説明" value="" onChange={noop} />
            </FormGrid.Item>
          </FormGrid>
        </div>
      </FormPageShell>
    </div>
  ),
}

/** 対象ユーザーアイコン付き（試験 / コース edit 相当）。 */
export const WithTargetsNav: Story = {
  render: () => (
    <div className="p-6">
      <FormPageShell
        title="認定試験を編集"
        nav={[
          { icon: 'users', label: '対象ユーザー', href: '#targets' },
          { icon: 'arrow-left', label: '一覧に戻る', href: '#' },
        ]}
        footer={<Button variant="primary">保存する</Button>}
      >
        <p className="text-sm text-gray-500">フォーム本体</p>
      </FormPageShell>
    </div>
  ),
}

/** 閲覧ページ（footer なし。問題バンク詳細 / 認定管理相当）。 */
export const ReadOnlyPage: Story = {
  render: () => (
    <div className="p-6">
      <FormPageShell
        title="問題の詳細 (Q-0001)"
        subtitle="version 3 · 最終更新 2026/07/03"
        nav={[{ icon: 'arrow-left', label: '一覧に戻る', href: '#' }]}
      >
        <p className="text-sm text-gray-500">閲覧コンテンツ</p>
      </FormPageShell>
    </div>
  ),
}
