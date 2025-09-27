import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PodcastSidebar from '../PodcastSidebar';

// Mock data
const mockPodcast = {
  id: '1',
  name: 'Test Podcast',
  artist: 'Test Artist',
  image: 'https://example.com/image.jpg',
  summary: 'Test summary',
  description:
    'This is a detailed description of the test podcast with multiple sentences. It provides comprehensive information about the podcast content and what listeners can expect from it.',
  episodes: [],
};

// Helper para renderizar con Router
const renderPodcastSidebar = (podcast = mockPodcast) => {
  return render(
    <BrowserRouter>
      <PodcastSidebar podcast={podcast} />
    </BrowserRouter>
  );
};

describe('PodcastSidebar', () => {
  it('should render podcast information correctly', () => {
    renderPodcastSidebar();

    expect(screen.getByText('Test Podcast')).toBeInTheDocument();
    expect(screen.getByText('by Test Artist')).toBeInTheDocument();
    expect(screen.getByText('Descripción:')).toBeInTheDocument();
    expect(screen.getByText(mockPodcast.description)).toBeInTheDocument();
  });

  it('should render podcast image with correct attributes', () => {
    renderPodcastSidebar();

    const image = screen.getByAltText('Portada de Test Podcast');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
    expect(image).toHaveClass('podcast-sidebar__image');
  });

  it('should render navigation links correctly', () => {
    renderPodcastSidebar();

    const titleLinks = screen.getAllByRole('link');
    const imageLink = titleLinks.find(link => link.querySelector('img'));
    const titleLink = screen.getByText('Test Podcast').closest('a');
    const artistLink = screen.getByText('by Test Artist').closest('a');

    expect(imageLink).toHaveAttribute('href', '/podcast/1');
    expect(titleLink).toHaveAttribute('href', '/podcast/1');
    expect(artistLink).toHaveAttribute('href', '/podcast/1');
  });

  it('should have correct CSS classes and structure', () => {
    renderPodcastSidebar();

    const sidebar = document.querySelector('.podcast-sidebar');
    const imageContainer = document.querySelector(
      '.podcast-sidebar__image-container'
    );
    const info = document.querySelector('.podcast-sidebar__info');
    const description = document.querySelector('.podcast-sidebar__description');

    expect(sidebar).toBeInTheDocument();
    expect(imageContainer).toBeInTheDocument();
    expect(info).toBeInTheDocument();
    expect(description).toBeInTheDocument();
  });

  it('should render as semantic aside element', () => {
    renderPodcastSidebar();

    const aside = screen.getByRole('complementary');
    expect(aside).toBeInTheDocument();
    expect(aside).toHaveClass('podcast-sidebar');
  });

  it('should handle long podcast names correctly', () => {
    const longNamePodcast = {
      ...mockPodcast,
      name: 'This is a very long podcast name that should be handled correctly by the component without breaking the layout or causing display issues',
    };

    renderPodcastSidebar(longNamePodcast);

    expect(screen.getByText(longNamePodcast.name)).toBeInTheDocument();
  });

  it('should handle long artist names correctly', () => {
    const longArtistPodcast = {
      ...mockPodcast,
      artist:
        'This is a very long artist name that should also be handled properly by the component',
    };

    renderPodcastSidebar(longArtistPodcast);

    expect(
      screen.getByText(
        'by This is a very long artist name that should also be handled properly by the component'
      )
    ).toBeInTheDocument();
  });

  it('should handle empty or minimal description', () => {
    const minimalPodcast = {
      ...mockPodcast,
      description: 'Short description',
    };

    renderPodcastSidebar(minimalPodcast);

    expect(screen.getByText('Short description')).toBeInTheDocument();
  });

  it('should maintain accessibility attributes', () => {
    renderPodcastSidebar();

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('alt', 'Portada de Test Podcast');

    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);

    // Verificar que todos los enlaces son accesibles
    links.forEach(link => {
      expect(link).toBeVisible();
    });
  });
});
