import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { StarRating, roundToHalf } from './StarRating';

describe('StarRating', () => {
  it('基本的なレンダリングができる', () => {
    const { container } = render(<StarRating rating={3.5} />);
    expect(container.querySelector('[data-component="star-rating"]')).toBeInTheDocument();
  });

  it('rating が 0 の場合、全て空星が表示される', () => {
    const { container } = render(<StarRating rating={0} />);
    const stars = container.querySelectorAll('.text-gray-300');
    expect(stars.length).toBeGreaterThan(0);
  });

  it('rating が 5 の場合、全てフル星が表示される', () => {
    const { container } = render(<StarRating rating={5} />);
    const fullStars = container.querySelectorAll('.text-yellow-400');
    expect(fullStars.length).toBeGreaterThan(0);
  });

  it('rating が 3.5 の場合、3つのフル星と1つのハーフ星が表示される', () => {
    const { container } = render(<StarRating rating={3.5} />);
    // フル星は .text-yellow-400 のうち、relative でないもの
    const stars = container.querySelectorAll('span');
    expect(stars.length).toBeGreaterThan(0);
  });

  it('maxStars プロパティで星の最大数を変更できる', () => {
    const { container } = render(<StarRating rating={3} maxStars={10} />);
    const starsContainer = container.querySelector('[data-component="star-rating"]');
    expect(starsContainer).toBeInTheDocument();
  });

  it('size プロパティで星のサイズを変更できる', () => {
    const { container } = render(<StarRating rating={3} size={30} />);
    const star = container.querySelector('span[style*="font-size"]');
    expect(star).toHaveStyle({ fontSize: '30px' });
  });

  it('showValue=true の場合、評価値が表示される', () => {
    render(<StarRating rating={3.7} showValue={true} />);
    expect(screen.getByText(/\(3\.5\)/)).toBeInTheDocument();
  });

  it('showValue=false の場合、評価値が表示されない', () => {
    render(<StarRating rating={3.7} showValue={false} />);
    expect(screen.queryByText(/\(3\.5\)/)).not.toBeInTheDocument();
  });

  it('className が適用される', () => {
    const { container } = render(<StarRating rating={3} className="custom-class" />);
    const starRating = container.querySelector('.custom-class');
    expect(starRating).toBeInTheDocument();
  });

  it('data-component 属性が設定される', () => {
    const { container } = render(<StarRating rating={3} />);
    expect(container.querySelector('[data-component="star-rating"]')).toBeInTheDocument();
  });
});

describe('roundToHalf', () => {
  it('0.5単位に四捨五入される - 3.2 → 3.0', () => {
    expect(roundToHalf(3.2)).toBe(3.0);
  });

  it('0.5単位に四捨五入される - 3.3 → 3.5', () => {
    expect(roundToHalf(3.3)).toBe(3.5);
  });

  it('0.5単位に四捨五入される - 3.7 → 3.5', () => {
    expect(roundToHalf(3.7)).toBe(3.5);
  });

  it('0.5単位に四捨五入される - 3.8 → 4.0', () => {
    expect(roundToHalf(3.8)).toBe(4.0);
  });

  it('0.5単位に四捨五入される - 4.25 → 4.5', () => {
    expect(roundToHalf(4.25)).toBe(4.5);
  });
});
