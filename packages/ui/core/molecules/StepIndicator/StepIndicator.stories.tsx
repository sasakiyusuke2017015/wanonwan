// src/components/common/molecules/StepIndicator.stories.tsx
import { useState, useEffect } from 'react';



import { StepIndicator, type Step, type StepStatus } from './StepIndicator';

import type { Meta, StoryObj } from '@storybook/react';


const meta: Meta<typeof StepIndicator> = {
  title: 'レイアウト/StepIndicator',
  component: StepIndicator,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    steps: {
      description: 'ステップの配列（label, status, loadingIcon, completedIcon）',
      control: 'object',
    },
    title: {
      description: 'タイトル（省略可）',
      control: 'text',
    },
    completedColor: {
      description: '完了ステップの色',
      control: 'select',
      options: ['green', 'blue', 'purple', 'teal'],
    },
    activeColor: {
      description: '進行中ステップの色',
      control: 'select',
      options: ['green', 'blue', 'purple', 'teal', 'orange'],
    },
    className: {
      description: 'カスタムクラス',
      control: 'text',
    },
    animated: {
      description: 'アニメーションを有効にする',
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof StepIndicator>;

// 基本的なステップ
const basicSteps: Step[] = [
  { label: '回答', status: 'completed' },
  { label: '分析中', status: 'in_progress', loadingIcon: 'loading-dna' },
  { label: '確認', status: 'pending' },
  { label: '完了', status: 'pending' },
];

// すべて完了
const allCompletedSteps: Step[] = [
  { label: '注文受付', status: 'completed' },
  { label: '処理中', status: 'completed' },
  { label: '発送済', status: 'completed' },
  { label: '配達完了', status: 'completed' },
];

// 最初のステップ
const firstStepSteps: Step[] = [
  { label: '入力', status: 'in_progress', loadingIcon: 'spinner' },
  { label: '確認', status: 'pending' },
  { label: '完了', status: 'pending' },
];

/** 基本的な使用例 */
export const Default: Story = {
  args: {
    steps: basicSteps,
  },
};

/** タイトル付き */
export const WithTitle: Story = {
  args: {
    steps: basicSteps,
    title: '🔢 ステップインジケーター',
  },
};

/** すべて完了 */
export const AllCompleted: Story = {
  args: {
    steps: allCompletedSteps,
    title: '📦 配送状況',
  },
};

/** 最初のステップが進行中 */
export const FirstStep: Story = {
  args: {
    steps: firstStepSteps,
    title: '📝 入力フォーム',
  },
};

/** カスタムカラー - Purple/Orange */
export const CustomColors: Story = {
  args: {
    steps: basicSteps,
    title: '🎨 カスタムカラー',
    completedColor: 'purple',
    activeColor: 'orange',
  },
};

/** カスタムカラー - Teal/Blue */
export const TealBlue: Story = {
  args: {
    steps: basicSteps,
    title: '🌊 Teal/Blue',
    completedColor: 'teal',
    activeColor: 'blue',
  },
};

/** 様々なローディングアイコン */
export const VariousLoadingIcons: Story = {
  render: () => (
    <div className="space-y-8">
      <StepIndicator
        title="🧬 DNA"
        steps={[
          { label: '完了', status: 'completed' },
          { label: '分析中', status: 'in_progress', loadingIcon: 'loading-dna' },
          { label: '待機', status: 'pending' },
        ]}
      />
      <StepIndicator
        title="🌀 Orbit"
        steps={[
          { label: '完了', status: 'completed' },
          { label: '処理中', status: 'in_progress', loadingIcon: 'loading-orbit' },
          { label: '待機', status: 'pending' },
        ]}
      />
      <StepIndicator
        title="⚛️ Atom"
        steps={[
          { label: '完了', status: 'completed' },
          { label: '計算中', status: 'in_progress', loadingIcon: 'loading-atom' },
          { label: '待機', status: 'pending' },
        ]}
      />
      <StepIndicator
        title="⚙️ Gears"
        steps={[
          { label: '完了', status: 'completed' },
          { label: '構築中', status: 'in_progress', loadingIcon: 'loading-gears' },
          { label: '待機', status: 'pending' },
        ]}
      />
      <StepIndicator
        title="📡 Ripple"
        steps={[
          { label: '完了', status: 'completed' },
          { label: '送信中', status: 'in_progress', loadingIcon: 'loading-ripple' },
          { label: '待機', status: 'pending' },
        ]}
      />
    </div>
  ),
};

/** 実践的なユースケース */
export const UseCases: Story = {
  render: () => (
    <div className="space-y-8">
      {/* 注文プロセス */}
      <StepIndicator
        title="📦 注文状況"
        steps={[
          { label: '注文受付', status: 'completed' },
          { label: '決済完了', status: 'completed' },
          { label: '発送準備', status: 'in_progress', loadingIcon: 'loading-gears' },
          { label: '配送中', status: 'pending' },
          { label: '配達完了', status: 'pending' },
        ]}
        completedColor="teal"
        activeColor="orange"
      />

      {/* フォームウィザード */}
      <StepIndicator
        title="📝 アカウント作成"
        steps={[
          { label: '基本情報', status: 'completed' },
          { label: '詳細情報', status: 'in_progress', loadingIcon: 'spinner' },
          { label: '確認', status: 'pending' },
          { label: '完了', status: 'pending' },
        ]}
        completedColor="blue"
        activeColor="blue"
      />

      {/* データ処理 */}
      <StepIndicator
        title="🔬 データ分析"
        steps={[
          { label: 'データ取得', status: 'completed' },
          { label: '前処理', status: 'completed' },
          { label: '分析中', status: 'in_progress', loadingIcon: 'loading-dna' },
          { label: 'レポート生成', status: 'pending' },
        ]}
        completedColor="purple"
        activeColor="blue"
      />

      {/* タスク進捗 */}
      <StepIndicator
        title="📋 タスク進捗"
        steps={[
          { label: '要件定義', status: 'completed' },
          { label: '設計', status: 'completed' },
          { label: '実装中', status: 'in_progress', loadingIcon: 'loading-cube3d' },
          { label: 'テスト', status: 'pending' },
          { label: 'リリース', status: 'pending' },
        ]}
        completedColor="green"
        activeColor="blue"
      />
    </div>
  ),
};

/** アニメーションデモ - 自動進行 */
export const AnimationDemo: Story = {
  render: function AnimationDemoStory() {
    const stepLabels = ['データ取得', '前処理', '分析中', 'レポート生成', '完了'];
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentStep((prev) => (prev + 1) % (stepLabels.length + 1));
      }, 2000);
      return () => clearInterval(interval);
    }, []);

    const steps: Step[] = stepLabels.map((label, index) => {
      let status: StepStatus = 'pending';
      if (index < currentStep) {
        status = 'completed';
      } else if (index === currentStep) {
        status = 'in_progress';
      }
      return {
        label,
        status,
        loadingIcon: 'loading-dna',
      };
    });

    return (
      <div className="space-y-4">
        <p className="text-fluid-sm text-gray-600">
          自動的にステップが進行します（2秒ごと）
        </p>
        <StepIndicator
          title="🎬 アニメーションデモ"
          steps={steps}
          completedColor="green"
          activeColor="blue"
          animated={true}
        />
        <button
          onClick={() => setCurrentStep(0)}
          className="px-4 py-2 text-fluid-sm bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          リセット
        </button>
      </div>
    );
  },
};

/** アニメーション無効 */
export const NoAnimation: Story = {
  args: {
    steps: basicSteps,
    title: '⏸️ アニメーション無効',
    animated: false,
  },
};
