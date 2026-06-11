import type { Meta, StoryObj } from '@storybook/react';

import { MathView } from './MathView';

const meta: Meta<typeof MathView> = {
  title: 'データ表示/その他/MathView',
  component: MathView,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof MathView>;

export const Fraction: Story = {
  args: {
    latex: '\\frac{a}{b}',
  },
};

export const QuadraticFormula: Story = {
  args: {
    latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
  },
};

export const Inline: Story = {
  args: {
    latex: 'E = mc^2',
    inline: true,
  },
};

export const CustomStyle: Story = {
  args: {
    latex: '\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}',
    textColor: '#1a73e8',
    fontSize: 24,
  },
};

export const GreekLetters: Story = {
  args: {
    latex: '\\alpha + \\beta = \\gamma',
  },
};

export const Integral: Story = {
  args: {
    latex: '\\int_{0}^{\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}',
  },
};

export const Gallery = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <MathView latex="a^2 + b^2 = c^2" />
      <MathView latex="\\frac{d}{dx} e^x = e^x" />
      <MathView latex="\\nabla \\times \\mathbf{E} = -\\frac{\\partial \\mathbf{B}}{\\partial t}" />
      <MathView latex="\\lim_{n \\rightarrow \\infty} \\left(1 + \\frac{1}{n}\\right)^n = e" />
    </div>
  ),
};
