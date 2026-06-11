import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QACardList } from './QACardList';

const items = [
  { question: '質問1', answer: '回答1' },
  { question: '質問2', answer: '回答2' },
];

describe('QACardList', () => {
  it('質問と回答が表示される', () => {
    render(<QACardList items={items} />);
    expect(screen.getByText('質問1')).toBeInTheDocument();
    expect(screen.getByText('回答1')).toBeInTheDocument();
    expect(screen.getByText('質問2')).toBeInTheDocument();
    expect(screen.getByText('回答2')).toBeInTheDocument();
  });

  it('data-component属性が設定される', () => {
    const { container } = render(<QACardList items={items} />);
    expect(container.querySelector('[data-component="qa-card-list"]')).toBeInTheDocument();
  });

  it('infoMessageが表示される', () => {
    render(<QACardList items={items} infoMessage="注意事項です" />);
    expect(screen.getByText('注意事項です')).toBeInTheDocument();
  });

  it('aiCommentが表示される', () => {
    render(<QACardList items={items} aiComment="AIからの分析結果" />);
    expect(screen.getByText('AIからの分析結果')).toBeInTheDocument();
  });
});
