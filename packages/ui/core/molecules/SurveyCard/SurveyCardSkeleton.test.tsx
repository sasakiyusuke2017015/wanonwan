import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { SurveyCardSkeleton } from './SurveyCardSkeleton';

describe('SurveyCardSkeleton', () => {
  it('data-component属性が設定される', () => {
    const { container } = render(<SurveyCardSkeleton />);
    expect(container.querySelector('[data-component="survey-card-skeleton"]')).toBeInTheDocument();
  });

  it('aria-hidden で支援技術から隠される', () => {
    const { container } = render(<SurveyCardSkeleton />);
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('cardRadius が角丸に反映される', () => {
    const { container } = render(<SurveyCardSkeleton cardRadius="1rem" />);
    const card = container.querySelector('[data-component="survey-card-skeleton"] > div');
    expect(card).toHaveStyle({ borderRadius: '1rem' });
  });
});
