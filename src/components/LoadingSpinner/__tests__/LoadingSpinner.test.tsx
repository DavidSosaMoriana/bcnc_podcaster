import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('should render with default props (medium size, visible)', () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('loading-spinner', 'loading-spinner--medium');
    expect(screen.getByText('Loading...')).toHaveClass('visually-hidden');
  });

  it('should render with different sizes', () => {
    const { rerender } = render(<LoadingSpinner size="small" />);
    expect(screen.getByRole('status')).toHaveClass('loading-spinner--small');

    rerender(<LoadingSpinner size="large" />);
    expect(screen.getByRole('status')).toHaveClass('loading-spinner--large');
  });

  it('should not render when show is false', () => {
    const { container } = render(<LoadingSpinner show={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('should have proper accessibility attributes', () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render spinner circle element', () => {
    const { container } = render(<LoadingSpinner />);
    const circle = container.querySelector('.loading-spinner__circle');
    expect(circle).toBeInTheDocument();
  });
});
