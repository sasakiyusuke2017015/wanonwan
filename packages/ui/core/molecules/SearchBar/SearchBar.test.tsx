import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { SearchBar } from './SearchBar'

describe('SearchBar', () => {
  it('renders with default placeholder', () => {
    render(<SearchBar />)
    expect(screen.getByPlaceholderText('検索')).toBeInTheDocument()
  })

  it('renders with custom placeholder', () => {
    render(<SearchBar placeholder="名前で検索" />)
    expect(screen.getByPlaceholderText('名前で検索')).toBeInTheDocument()
  })

  it('displays controlled value', () => {
    render(<SearchBar value="test query" onChange={() => {}} />)
    expect(screen.getByDisplayValue('test query')).toBeInTheDocument()
  })

  it('calls onChange when value changes', () => {
    const handleChange = vi.fn()
    render(<SearchBar onChange={handleChange} />)
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'new query' } })
    expect(handleChange).toHaveBeenCalledWith('new query')
  })

  it('calls onSearch when Enter is pressed', () => {
    const handleSearch = vi.fn()
    render(<SearchBar value="search term" onSearch={handleSearch} onChange={() => {}} />)
    fireEvent.keyDown(screen.getByRole('searchbox'), { key: 'Enter' })
    expect(handleSearch).toHaveBeenCalledWith('search term')
  })

  it('shows clear button when value is present', () => {
    render(<SearchBar value="some text" onChange={() => {}} />)
    expect(screen.getByTestId('clear-button')).toBeInTheDocument()
  })

  it('does not show clear button when value is empty', () => {
    render(<SearchBar value="" onChange={() => {}} />)
    expect(screen.queryByTestId('clear-button')).not.toBeInTheDocument()
  })

  it('clears value when clear button is clicked (controlled)', () => {
    const handleChange = vi.fn()
    render(<SearchBar value="some text" onChange={handleChange} />)
    fireEvent.click(screen.getByTestId('clear-button'))
    expect(handleChange).toHaveBeenCalledWith('')
  })

  it('works in uncontrolled mode', () => {
    const handleChange = vi.fn()
    render(<SearchBar defaultValue="" onChange={handleChange} />)

    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'typed text' } })
    expect(handleChange).toHaveBeenCalledWith('typed text')
    expect(screen.getByDisplayValue('typed text')).toBeInTheDocument()
  })

  it('clears value when clear button is clicked (uncontrolled)', () => {
    const handleChange = vi.fn()
    render(<SearchBar defaultValue="initial" onChange={handleChange} />)

    fireEvent.click(screen.getByTestId('clear-button'))
    expect(handleChange).toHaveBeenCalledWith('')
    expect(screen.getByDisplayValue('')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<SearchBar className="custom-class" />)
    expect(screen.getByRole('searchbox').closest('[data-component="search-bar"]')).toHaveClass('custom-class')
  })

  it('has data-component attribute', () => {
    render(<SearchBar />)
    expect(screen.getByRole('searchbox').closest('[data-component="search-bar"]')).toBeInTheDocument()
  })
})
