import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PodcastCard from '../PodcastCard';

// Mock data
const mockPodcast = {
  id: '1',
  name: 'Test Podcast',
  artist: 'Test Artist',
  image: 'https://example.com/image.jpg',
  imageSmall: 'https://example.com/image-small.jpg',
  imageLarge: 'https://example.com/image-large.jpg',
  summary: 'Test summary',
};

// Helper para renderizar con Router (por si usa useNavigate internamente)
const renderPodcastCard = (props: any) => {
  return render(
    <BrowserRouter>
      <PodcastCard {...props} />
    </BrowserRouter>
  );
};

describe('PodcastCard', () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render podcast information correctly', () => {
    renderPodcastCard({
      podcast: mockPodcast,
      onClick: mockOnClick,
    });

    expect(screen.getByText('Test Podcast')).toBeInTheDocument();
    expect(screen.getByText('Test Artist')).toBeInTheDocument();
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('should display image with correct src and alt text', () => {
    renderPodcastCard({
      podcast: mockPodcast,
      onClick: mockOnClick,
    });

    const image = screen.getByRole('img') as HTMLImageElement;
    expect(image.src).toBe('https://example.com/image-large.jpg');
    expect(image.alt).toBe('Portada de Test Podcast');
    expect(image).toHaveAttribute('loading', 'lazy');
  });

  it('should handle click events', () => {
    renderPodcastCard({
      podcast: mockPodcast,
      onClick: mockOnClick,
    });

    const card = screen.getByRole('button');
    fireEvent.click(card);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('should have correct accessibility attributes', () => {
    renderPodcastCard({
      podcast: mockPodcast,
      onClick: mockOnClick,
    });

    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('role', 'button');
    expect(card).toHaveAttribute('tabIndex', '0');
  });

  it('should apply correct CSS classes', () => {
    renderPodcastCard({
      podcast: mockPodcast,
      onClick: mockOnClick,
    });

    const card = screen.getByRole('button');
    expect(card).toHaveClass('podcast-card');

    expect(screen.getByText('Test Podcast')).toHaveClass('podcast-card__title');
    expect(screen.getByText('Test Artist')).toHaveClass('podcast-card__author');

    const image = screen.getByRole('img');
    expect(image).toHaveClass('podcast-card__image');
  });
});
