import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { usePodcasts } from '../usePodcasts';
import { useLoadPodcasts, useClearError } from '../useLoadPodcasts';
import { usePodcastDetail } from '../usePodcastDetail';
import { AppProvider, useAppContext } from '@/context/AppContext';
import { podcastService } from '@/services/podcastService';

// Mock del podcastService
jest.mock('@/services/podcastService');
const mockPodcastService = podcastService as jest.Mocked<typeof podcastService>;

// Mock data
const mockPodcasts = [
  {
    id: '1',
    name: 'Test Podcast 1',
    artist: 'Test Artist 1',
    image: 'https://example.com/image1.jpg',
    imageSmall: 'https://example.com/image1-small.jpg',
    imageLarge: 'https://example.com/image1-large.jpg',
    summary: 'Test summary 1',
  },
  {
    id: '2',
    name: 'Another Show',
    artist: 'Different Artist',
    image: 'https://example.com/image2.jpg',
    imageSmall: 'https://example.com/image2-small.jpg',
    imageLarge: 'https://example.com/image2-large.jpg',
    summary: 'Different summary',
  },
];

const mockPodcastDetail = {
  id: '1',
  name: 'Test Podcast 1',
  artist: 'Test Artist 1',
  image: 'https://example.com/image1.jpg',
  summary: 'Test summary 1',
  description: 'Full description',
  episodes: [],
};

// Helper para renderizar hooks con provider
const renderWithProvider = (hook: () => any) => {
  return renderHook(hook, {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <AppProvider>{children}</AppProvider>
    ),
  });
};

describe('Custom Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('usePodcasts', () => {
    it('should return initial state and filter function', () => {
      const { result } = renderWithProvider(() => usePodcasts());

      expect(result.current.podcasts).toEqual([]);
      expect(result.current.filteredPodcasts).toEqual([]);
      expect(result.current.filter).toBe('');
      expect(typeof result.current.setFilter).toBe('function');
    });

    it('should filter podcasts when filter is set', () => {
      const { result } = renderWithProvider(() => {
        const context = useAppContext();
        const podcasts = usePodcasts();
        return { context, podcasts };
      });

      // Set up podcasts first
      act(() => {
        result.current.context.dispatch({
          type: 'SET_PODCASTS',
          payload: mockPodcasts,
        });
      });

      // Apply filter
      act(() => {
        result.current.podcasts.setFilter('Test');
      });

      expect(result.current.podcasts.filter).toBe('Test');
      expect(result.current.podcasts.filteredPodcasts).toHaveLength(1);
      expect(result.current.podcasts.filteredPodcasts[0].name).toBe(
        'Test Podcast 1'
      );
    });
  });

  describe('useLoadPodcasts', () => {
    it('should load podcasts successfully', async () => {
      mockPodcastService.getPopularPodcasts.mockResolvedValue(mockPodcasts);

      const { result } = renderWithProvider(() => {
        const context = useAppContext();
        useLoadPodcasts();
        return context;
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(mockPodcastService.getPopularPodcasts).toHaveBeenCalled();
      expect(result.current.state.podcasts).toEqual(mockPodcasts);
      expect(result.current.state.loading).toBe(false);
      expect(result.current.state.error).toBe(null);
    });

    it('should handle loading errors', async () => {
      mockPodcastService.getPopularPodcasts.mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderWithProvider(() => {
        const context = useAppContext();
        useLoadPodcasts();
        return context;
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.state.error).toContain(
        'Error al cargar los podcasts: Network error'
      );
      expect(result.current.state.loading).toBe(false);
    });
  });

  describe('useClearError', () => {
    it('should clear error when called', () => {
      const { result } = renderWithProvider(() => {
        const context = useAppContext();
        const clearError = useClearError();
        return { context, clearError };
      });

      // Set error first
      act(() => {
        result.current.context.dispatch({
          type: 'SET_ERROR',
          payload: 'Test error',
        });
      });

      expect(result.current.context.state.error).toBe('Test error');

      // Clear error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.context.state.error).toBe(null);
    });
  });

  describe('usePodcastDetail', () => {
    it('should load podcast detail successfully', async () => {
      mockPodcastService.getPodcastDetail.mockResolvedValue(mockPodcastDetail);

      const { result } = renderWithProvider(() => {
        const context = useAppContext();
        const detail = usePodcastDetail('1');
        return { context, detail };
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(mockPodcastService.getPodcastDetail).toHaveBeenCalledWith('1');
      expect(result.current.detail.podcast).toEqual(mockPodcastDetail);
    });

    it('should handle loading errors', async () => {
      mockPodcastService.getPodcastDetail.mockRejectedValue(
        new Error('Not found')
      );

      const { result } = renderWithProvider(() => {
        const context = useAppContext();
        const detail = usePodcastDetail('1');
        return { context, detail };
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.context.state.error).toBe('Not found');
      expect(result.current.detail.podcast).toBe(null);
    });

    it('should return null for empty podcastId', () => {
      const { result } = renderWithProvider(() => usePodcastDetail(''));

      expect(result.current.podcast).toBe(null);
      expect(mockPodcastService.getPodcastDetail).not.toHaveBeenCalled();
    });
  });
});
