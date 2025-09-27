import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchFilter from '../SearchFilter';

describe('SearchFilter', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with initial value', () => {
    render(
      <SearchFilter
        value="test search"
        onChange={mockOnChange}
        totalCount={10}
      />
    );

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('test search');
  });

  it('should display total count correctly', () => {
    render(<SearchFilter value="" onChange={mockOnChange} totalCount={25} />);

    expect(screen.getByText('25')).toBeInTheDocument();
  });

  it('should handle input changes', () => {
    render(<SearchFilter value="" onChange={mockOnChange} totalCount={0} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'new search' } });

    expect(mockOnChange).toHaveBeenCalledWith('new search');
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('should have correct accessibility attributes', () => {
    render(<SearchFilter value="" onChange={mockOnChange} totalCount={0} />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute(
      'aria-label',
      'Filtrar podcasts por nombre o autor'
    );
    expect(input).toHaveAttribute('type', 'text');
  });

  it('should display correct placeholder text', () => {
    render(<SearchFilter value="" onChange={mockOnChange} totalCount={0} />);

    const input = screen.getByPlaceholderText('Filter podcasts...');
    expect(input).toBeInTheDocument();
  });

  it('should apply correct CSS classes', () => {
    const { container } = render(
      <SearchFilter value="" onChange={mockOnChange} totalCount={5} />
    );

    expect(container.firstChild).toHaveClass('search-filter');
    expect(screen.getByText('5')).toHaveClass('search-filter__counter');
    expect(screen.getByRole('textbox')).toHaveClass('search-filter__input');
  });

  it('should update display when count changes', () => {
    const { rerender } = render(
      <SearchFilter value="" onChange={mockOnChange} totalCount={10} />
    );

    expect(screen.getByText('10')).toBeInTheDocument();

    rerender(<SearchFilter value="" onChange={mockOnChange} totalCount={0} />);

    expect(screen.getByText('0')).toBeInTheDocument();
  });
});
