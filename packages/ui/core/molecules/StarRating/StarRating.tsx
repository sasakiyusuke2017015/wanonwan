// src/components/molecules/StarRating.tsx
// 0.5単位で星評価を表示するコンポーネント
import { FC } from 'react';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: number;
  className?: string;
  showValue?: boolean;
}

// 0.5単位に四捨五入する関数
const roundToHalf = (value: number): number => {
  return Math.round(value * 2) / 2;
};

export const StarRating: FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  size = 20,
  className = '',
  showValue = false
}) => {
  const roundedRating = roundToHalf(rating);
  const stars = [];

  for (let i = 1; i <= maxStars; i++) {
    if (i <= roundedRating) {
      // フル星
      stars.push(
        <span
          key={i}
          className="text-yellow-400"
          style={{ fontSize: `${size}px` }}
        >
          ★
        </span>
      );
    } else if (i - 0.5 <= roundedRating) {
      // ハーフ星
      stars.push(
        <span
          key={i}
          className="relative inline-block"
          style={{ fontSize: `${size}px` }}
        >
          <span className="text-gray-300">★</span>
          <span 
            className="absolute inset-0 overflow-hidden text-yellow-400"
            style={{ width: '50%' }}
          >
            ★
          </span>
        </span>
      );
    } else {
      // 空星
      stars.push(
        <span
          key={i}
          className="text-gray-300"
          style={{ fontSize: `${size}px` }}
        >
          ★
        </span>
      );
    }
  }

  return (
    <div className={`flex items-center gap-1 ${className}`} data-component="star-rating">
      <div className="flex items-center">
        {stars}
      </div>
      {showValue && (
        <span className="ml-2 text-fluid-sm text-gray-600">
          ({roundedRating.toFixed(1)})
        </span>
      )}
    </div>
  );
};

export { roundToHalf };