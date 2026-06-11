import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SurveyCard } from './SurveyCard';

const defaultProps = {
  id: 'survey-1',
  title: 'テストアンケート',
  period: '2026/01/01 〜 2026/01/31',
  status: '実施中',
  statusColor: 'green' as const,
  headerColor: 'bg-blue-500',
  buttonVariant: 'primary' as const,
  buttonText: '回答する',
};

describe('SurveyCard', () => {
  it('タイトルが表示される', () => {
    render(<SurveyCard {...defaultProps} />);
    expect(screen.getByText('テストアンケート')).toBeInTheDocument();
  });

  it('期間が表示される', () => {
    render(<SurveyCard {...defaultProps} />);
    expect(screen.getByText(/2026\/01\/01/)).toBeInTheDocument();
  });

  it('ボタンテキストが表示される', () => {
    render(<SurveyCard {...defaultProps} />);
    expect(screen.getByText('回答する')).toBeInTheDocument();
  });

  it('data-component属性が設定される', () => {
    const { container } = render(<SurveyCard {...defaultProps} />);
    expect(container.querySelector('[data-component="survey-card"]')).toBeInTheDocument();
  });

  it('説明文が表示される', () => {
    render(<SurveyCard {...defaultProps} description="アンケートの説明" />);
    expect(screen.getByText('アンケートの説明')).toBeInTheDocument();
  });
});
