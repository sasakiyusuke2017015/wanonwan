import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Segment } from './Segment';

const options = [
  { value: 'a', label: 'オプションA' },
  { value: 'b', label: 'オプションB' },
  { value: 'c', label: 'オプションC' },
];

describe('Segment', () => {
  it('全てのオプションラベルが表示される', () => {
    render(<Segment value="a" onChange={() => {}} options={options} />);
    expect(screen.getByText('オプションA')).toBeInTheDocument();
    expect(screen.getByText('オプションB')).toBeInTheDocument();
    expect(screen.getByText('オプションC')).toBeInTheDocument();
  });

  it('data-component属性が設定される', () => {
    const { container } = render(<Segment value="a" onChange={() => {}} options={options} />);
    expect(container.querySelector('[data-component="segment"]')).toBeInTheDocument();
  });

  it('オプションをクリックするとonChangeが呼ばれる', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<Segment value="a" onChange={handleChange} options={options} />);
    await user.click(screen.getByText('オプションB'));
    expect(handleChange).toHaveBeenCalledWith('b');
  });

  it('data-size属性が正しく設定される', () => {
    const { container } = render(<Segment value="a" onChange={() => {}} options={options} size="large" />);
    expect(container.querySelector('[data-size="large"]')).toBeInTheDocument();
  });
});
