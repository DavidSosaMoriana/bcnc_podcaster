import React from 'react';
import { render, renderHook, act } from '@testing-library/react';
import { AppProvider, useAppContext } from '../AppContext';
import { AppState, AppAction } from '@/types';

// Mock data para tests
const mockPodcasts = [
  {
    id: '1',
    name: 'Test Podcast 1',
    artist: 'Test Artist 1',
    image: 'https://example.com/image1.jpg',
    summary: 'Test summary 1',
  },
  {
    id: '2',
    name: 'Test Podcast 2',
    artist: 'Test Artist 2',
    image: 'https://example.com/image2.jpg',
    summary: 'Test summary 2',
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

describe('AppContext', () => {
  describe('Reducer Actions', () => {
    it('should handle SET_LOADING action', () => {
      const { result } = renderWithProvider(() => useAppContext());

      act(() => {
        result.current.dispatch({ type: 'SET_LOADING', payload: true });
      });

      expect(result.current.state.loading).toBe(true);

      act(() => {
        result.current.dispatch({ type: 'SET_LOADING', payload: false });
      });

      expect(result.current.state.loading).toBe(false);
    });

    it('should handle SET_ERROR action', () => {
      const { result } = renderWithProvider(() => useAppContext());

      // Set loading first
      act(() => {
        result.current.dispatch({ type: 'SET_LOADING', payload: true });
      });

      expect(result.current.state.loading).toBe(true);

      // Set error
      act(() => {
        result.current.dispatch({ type: 'SET_ERROR', payload: 'Test error' });
      });

      expect(result.current.state.error).toBe('Test error');
      expect(result.current.state.loading).toBe(false);
    });

    it('should handle SET_PODCASTS action', () => {
      const { result } = renderWithProvider(() => useAppContext());

      // Set loading and error first
      act(() => {
        result.current.dispatch({ type: 'SET_LOADING', payload: true });
        result.current.dispatch({ type: 'SET_ERROR', payload: 'Some error' });
      });

      // Set podcasts
      act(() => {
        result.current.dispatch({
          type: 'SET_PODCASTS',
          payload: mockPodcasts,
        });
      });

      expect(result.current.state.podcasts).toEqual(mockPodcasts);
      expect(result.current.state.loading).toBe(false);
      expect(result.current.state.error).toBe(null);
    });

    it('should handle SET_PODCAST_DETAIL action', () => {
      const { result } = renderWithProvider(() => useAppContext());

      act(() => {
        result.current.dispatch({
          type: 'SET_PODCAST_DETAIL',
          payload: { id: '1', detail: mockPodcastDetail },
        });
      });

      expect(result.current.state.podcastsDetail['1']).toEqual(
        mockPodcastDetail
      );
      expect(result.current.state.loading).toBe(false);
      expect(result.current.state.error).toBe(null);
    });

    it('should handle SET_FILTER action', () => {
      const { result } = renderWithProvider(() => useAppContext());

      act(() => {
        result.current.dispatch({ type: 'SET_FILTER', payload: 'test filter' });
      });

      expect(result.current.state.filter).toBe('test filter');
    });

    it('should handle CLEAR_ERROR action', () => {
      const { result } = renderWithProvider(() => useAppContext());

      // Set error first
      act(() => {
        result.current.dispatch({ type: 'SET_ERROR', payload: 'Test error' });
      });

      expect(result.current.state.error).toBe('Test error');

      // Clear error
      act(() => {
        result.current.dispatch({ type: 'CLEAR_ERROR' });
      });

      expect(result.current.state.error).toBe(null);
    });
  });

  describe('useAppContext Hook', () => {
    it('should throw error when used outside provider', () => {
      // Suppress console error for this test
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => {
        renderHook(() => useAppContext());
      }).toThrow('useAppContext debe ser usado dentro de un AppProvider');

      consoleSpy.mockRestore();
    });
  });

  describe('AppProvider', () => {
    it('should render children and provide context value', () => {
      const TestComponent = () => {
        const { state } = useAppContext();
        return (
          <div data-testid="context-consumer">
            Loading: {state.loading.toString()}
          </div>
        );
      };

      const { getByTestId } = render(
        <AppProvider>
          <TestComponent />
        </AppProvider>
      );

      const element = getByTestId('context-consumer');
      expect(element).toBeInTheDocument();
      expect(element).toHaveTextContent('Loading: false');
    });
  });
});
