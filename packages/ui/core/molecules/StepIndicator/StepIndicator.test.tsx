import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';



import { StepIndicator, type Step } from './StepIndicator';

describe('StepIndicator', () => {
  const mockSteps: Step[] = [
    { label: 'ステップ1', status: 'completed' },
    { label: 'ステップ2', status: 'in_progress' },
    { label: 'ステップ3', status: 'pending' },
  ];

  it('基本的なレンダリングができる', () => {
    render(<StepIndicator steps={mockSteps} />);
    expect(screen.getByText('ステップ1')).toBeInTheDocument();
    expect(screen.getByText('ステップ2')).toBeInTheDocument();
    expect(screen.getByText('ステップ3')).toBeInTheDocument();
  });

  it('title が表示される', () => {
    render(<StepIndicator steps={mockSteps} title="進捗状況" />);
    expect(screen.getByText('進捗状況')).toBeInTheDocument();
  });

  it('title が省略可能', () => {
    render(<StepIndicator steps={mockSteps} />);
    // タイトルなしでもレンダリングできることを確認
    expect(screen.getByText('ステップ1')).toBeInTheDocument();
  });

  it('completed ステップにチェックマークが表示される', () => {
    const { container } = render(<StepIndicator steps={mockSteps} />);
    // completed ステップは '✓' または completedIcon を表示
    expect(container.textContent).toContain('✓');
  });

  it('in_progress ステップにローディングアイコンが表示される', () => {
    const { container } = render(<StepIndicator steps={mockSteps} />);
    // ローディングアイコン（Icon コンポーネント）が存在することを確認
    const icons = container.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThan(0);
  });

  it('pending ステップに番号が表示される', () => {
    render(<StepIndicator steps={mockSteps} />);
    // pending ステップは番号 (index + 1) を表示
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('completedIcon をカスタマイズできる', () => {
    const stepsWithCustomIcon: Step[] = [
      { label: 'カスタム', status: 'completed', completedIcon: 'gear' },
    ];
    const { container } = render(<StepIndicator steps={stepsWithCustomIcon} />);
    // カスタムアイコンが存在することを確認（svg要素）
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('loadingIcon をカスタマイズできる', () => {
    const stepsWithCustomLoading: Step[] = [
      {
        label: 'ローディング',
        status: 'in_progress',
        loadingIcon: 'spinner',
      },
    ];
    const { container } = render(<StepIndicator steps={stepsWithCustomLoading} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('completedColor が適用される', () => {
    const { container } = render(
      <StepIndicator steps={mockSteps} completedColor="green" />
    );
    // green の bg クラスが適用されることを確認
    expect(container.querySelector('.bg-green-500')).toBeInTheDocument();
  });

  it('activeColor が適用される', () => {
    const { container } = render(
      <StepIndicator steps={mockSteps} activeColor="orange" />
    );
    // orange の bg クラスが適用されることを確認
    expect(container.querySelector('.bg-orange-500')).toBeInTheDocument();
  });

  it('className が適用される', () => {
    const { container } = render(
      <StepIndicator steps={mockSteps} className="custom-class" />
    );
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('animated=false の場合、アニメーションなしでレンダリングされる', () => {
    render(<StepIndicator steps={mockSteps} animated={false} />);
    // animated=false でもレンダリングは成功することを確認
    expect(screen.getByText('ステップ1')).toBeInTheDocument();
  });
});
