import { FC, ReactNode, Children, cloneElement, isValidElement, ReactElement } from 'react';

import { Animated } from '../../atoms/Animated';
import type { CardAnimationVariant } from '../../constants';

export interface CardGridProps {
  children: ReactNode;
  animated?: boolean;
  cols?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: number;
  enableAnimation?: boolean;
  animationVariant?: CardAnimationVariant;
}

interface CardGridItemProps {
  children: ReactNode;
  index?: number;
  animated?: boolean;
  enableAnimation?: boolean;
  animationVariant?: CardAnimationVariant;
}

const CardGridItem: FC<CardGridItemProps> = ({
  children,
  index = 0,
  animated = false,
  enableAnimation = true,
  animationVariant = 'slideRight',
}) => {
  const isAnimated = animated && enableAnimation;

  if (!isAnimated) {
    return <>{children}</>;
  }

  return (
    <Animated
      show={true}
      category="card"
      variant={animationVariant}
      index={index}
      data-component="card-grid-item"
    >
      {children}
    </Animated>
  );
};

interface CardGridComponent extends FC<CardGridProps> {
  Item: typeof CardGridItem;
}

const CardGridBase: FC<CardGridProps> = ({
  children,
  animated = false,
  cols = 4,
  gap = 4,
  enableAnimation = true,
  animationVariant = 'slideRight',
}) => {
  // 子要素にindex、animated、enableAnimation、animationVariantを自動付与
  const processedChildren = Children.map(children, (child, index) => {
    if (isValidElement(child) && child.type === CardGridItem) {
      const childElement = child as ReactElement<CardGridItemProps>;
      return cloneElement(childElement, {
        index,
        animated,
        enableAnimation,
        animationVariant,
      });
    }
    return child;
  });

  // colsに応じたgridクラスを生成
  const gridColsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
  }[cols];

  const gapClass = `gap-${gap}`;

  return (
    <div className={`grid ${gridColsClass} ${gapClass}`} data-component="card-grid">
      {processedChildren}
    </div>
  );
};

// Compound Component パターン
export const CardGrid = CardGridBase as CardGridComponent;
CardGrid.Item = CardGridItem;
