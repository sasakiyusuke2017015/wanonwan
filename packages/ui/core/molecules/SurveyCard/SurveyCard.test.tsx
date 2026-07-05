import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SurveyCard } from './SurveyCard';

const defaultProps = {
  id: 'survey-1',
  title: 'テストアンケート',
  period: '2026/01/01 〜 2026/01/31',
  status: '実施中',
  statusColor: 'green' as const,
  headerColor: '#3b82f6',
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

  it('headerColor が期間ヘッダーの背景色に反映される', () => {
    render(<SurveyCard {...defaultProps} />);
    expect(screen.getByText(/期間:/)).toHaveStyle({ backgroundColor: '#3b82f6' });
  });

  it('締切バッジが表示される', () => {
    render(<SurveyCard {...defaultProps} deadlineLabel="本日締切" deadlineColor="red" />);
    expect(screen.getByText('本日締切')).toBeInTheDocument();
  });

  it('deadlineLabel 未指定なら締切バッジは出ない', () => {
    render(<SurveyCard {...defaultProps} />);
    expect(screen.queryByText('本日締切')).not.toBeInTheDocument();
  });
});
