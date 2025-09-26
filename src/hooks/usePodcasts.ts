import { useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import { UsePodcastsReturn } from '@/types';

/**
 * Hook personalizado para manejar la lista de podcasts
 * Incluye funcionalidad de filtrado en tiempo real
 */
export const usePodcasts = (): UsePodcastsReturn => {
  const { state, dispatch } = useAppContext();

  // Función para actualizar el filtro
  const setFilter = (filter: string): void => {
    dispatch({ type: 'SET_FILTER', payload: filter });
  };

  // Podcasts filtrados basados en el filtro actual
  const filteredPodcasts = useMemo(() => {
    if (!state.filter.trim()) {
      return state.podcasts;
    }

    const filterLower = state.filter.toLowerCase();
    return state.podcasts.filter(
      podcast =>
        podcast.name.toLowerCase().includes(filterLower) ||
        podcast.artist.toLowerCase().includes(filterLower)
    );
  }, [state.podcasts, state.filter]);

  return {
    podcasts: state.podcasts,
    loading: state.loading,
    error: state.error,
    filter: state.filter,
    setFilter,
    filteredPodcasts,
  };
};
