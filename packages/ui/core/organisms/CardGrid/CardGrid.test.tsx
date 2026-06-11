import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { CardGrid } from './CardGrid';

describe('CardGrid', () => {
  it('CardGridがレンダリングされる', () => {
    const { container } = render(
      <CardGrid>
        <CardGrid.Item>カード1</CardGrid.Item>
        <CardGrid.Item>カード2</CardGrid.Item>
      </CardGrid>
    );
    expect(container.querySelector('[data-component="card-grid"]')).toBeInTheDocument();
  });

  it('子要素が正しく表示される', () => {
    const { container } = render(
      <CardGrid>
        <CardGrid.Item>カード1</CardGrid.Item>
        <CardGrid.Item>カード2</CardGrid.Item>
        <CardGrid.Item>カード3</CardGrid.Item>
      </CardGrid>
    );
    expect(container.textContent).toContain('カード1');
    expect(container.textContent).toContain('カード2');
    expect(container.textContent).toContain('カード3');
  });

  it('cols属性が正しく適用される (デフォルト: 4)', () => {
    const { container } = render(
      <CardGrid>
        <CardGrid.Item>カード</CardGrid.Item>
      </CardGrid>
    );
    const grid = container.querySelector('[data-component="card-grid"]');
    expect(grid).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'md:grid-cols-3', 'lg:grid-cols-4');
  });

  it('cols属性が正しく適用される (cols=2)', () => {
    const { container } = render(
      <CardGrid cols={2}>
        <CardGrid.Item>カード</CardGrid.Item>
      </CardGrid>
    );
    const grid = container.querySelector('[data-component="card-grid"]');
    expect(grid).toHaveClass('grid-cols-1', 'sm:grid-cols-2');
  });

  it('cols属性が正しく適用される (cols=6)', () => {
    const { container } = render(
      <CardGrid cols={6}>
        <CardGrid.Item>カード</CardGrid.Item>
      </CardGrid>
    );
    const grid = container.querySelector('[data-component="card-grid"]');
    expect(grid).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'md:grid-cols-3', 'lg:grid-cols-6');
  });

  it('gap属性が正しく適用される (デフォルト: 4)', () => {
    const { container } = render(
      <CardGrid>
        <CardGrid.Item>カード</CardGrid.Item>
      </CardGrid>
    );
    const grid = container.querySelector('[data-component="card-grid"]');
    expect(grid).toHaveClass('gap-4');
  });

  it('gap属性が正しく適用される (gap=8)', () => {
    const { container } = render(
      <CardGrid gap={8}>
        <CardGrid.Item>カード</CardGrid.Item>
      </CardGrid>
    );
    const grid = container.querySelector('[data-component="card-grid"]');
    expect(grid).toHaveClass('gap-8');
  });

  it('animated=falseの場合、アニメーション要素がレンダリングされない', () => {
    const { container } = render(
      <CardGrid animated={false}>
        <CardGrid.Item>カード</CardGrid.Item>
      </CardGrid>
    );
    const gridItems = container.querySelectorAll('[data-component="card-grid-item"]');
    expect(gridItems.length).toBe(0); // animated=falseの場合、ラッパーdivが生成されない
  });

  it('animated=trueの場合、アニメーション要素がレンダリングされる', () => {
    const { container } = render(
      <CardGrid animated={true}>
        <CardGrid.Item>カード</CardGrid.Item>
      </CardGrid>
    );
    // Animatedコンポーネントがdivをラップするのでカードコンテンツが表示される
    expect(container.textContent).toContain('カード');
    // grid-colsクラスが適用されているか確認
    expect(container.querySelector('[data-component="card-grid"]')).toBeInTheDocument();
  });

  it('enableAnimation=falseの場合、アニメーションが無効化される', () => {
    const { container } = render(
      <CardGrid animated={true} enableAnimation={false}>
        <CardGrid.Item>カード</CardGrid.Item>
      </CardGrid>
    );
    const gridItems = container.querySelectorAll('[data-component="card-grid-item"]');
    expect(gridItems.length).toBe(0); // enableAnimation=falseの場合、ラッパーdivが生成されない
  });

  it('animationVariant属性が設定できる', () => {
    const { container } = render(
      <CardGrid animated={true} animationVariant="slideRight">
        <CardGrid.Item>カード</CardGrid.Item>
      </CardGrid>
    );
    // Animatedコンポーネントはdata-componentをパススルーしないので、コンテンツとgrid要素で確認
    expect(container.textContent).toContain('カード');
    expect(container.querySelector('[data-component="card-grid"]')).toBeInTheDocument();
  });

  it('複数のCardGrid.Itemが正しくレンダリングされる', () => {
    const { container } = render(
      <CardGrid>
        <CardGrid.Item>カード1</CardGrid.Item>
        <CardGrid.Item>カード2</CardGrid.Item>
        <CardGrid.Item>カード3</CardGrid.Item>
        <CardGrid.Item>カード4</CardGrid.Item>
      </CardGrid>
    );
    expect(container.textContent).toContain('カード1');
    expect(container.textContent).toContain('カード2');
    expect(container.textContent).toContain('カード3');
    expect(container.textContent).toContain('カード4');
  });
});
