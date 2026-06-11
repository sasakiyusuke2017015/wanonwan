import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { GradientOverlay } from './GradientOverlay';

describe('GradientOverlay', () => {
  it('data-component属性が設定される', () => {
    const { container } = render(
      <GradientOverlay background="linear-gradient(135deg, red, blue)" maxOpacity={1} delay={0} />
    );
    expect(container.querySelector('[data-component="gradient-overlay"]')).toBeInTheDocument();
  });

  it('animationType=noneの場合、data-animation-type="none"が設定される', () => {
    const { container } = render(
      <GradientOverlay background="linear-gradient(135deg, red, blue)" maxOpacity={1} delay={0} animationType="none" />
    );
    const el = container.querySelector('[data-component="gradient-overlay"]');
    expect(el).toHaveAttribute('data-animation-type', 'none');
  });

  it('animationType=waveの場合、data-animation-type="wave"が設定される', () => {
    const { container } = render(
      <GradientOverlay background="linear-gradient(135deg, red, blue)" maxOpacity={1} delay={0} animationType="wave" />
    );
    const el = container.querySelector('[data-component="gradient-overlay"]');
    expect(el).toHaveAttribute('data-animation-type', 'wave');
  });
});
