import { useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { UsePodcastDetailReturn } from '@/types';
// Update the import path below if the actual location is different
import { podcastService } from '../services/podcastService';

/**
 * Hook personalizado para manejar los detalles de un podcast específico
 * Incluye cache automático y manejo de estados de carga
 */
export const usePodcastDetail = (podcastId: string): UsePodcastDetailReturn => {
  const { state, dispatch } = useAppContext();

  useEffect(() => {
    const fetchPodcastDetail = async (): Promise<void> => {
      // Si ya tenemos los detalles en el estado, no hacer nueva petición
      if (state.podcastsDetail[podcastId]) {
        return;
      }

      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const podcastDetail = await podcastService.getPodcastDetail(podcastId);

        dispatch({
          type: 'SET_PODCAST_DETAIL',
          payload: {
            id: podcastId,
            detail: podcastDetail,
          },
        });
      } catch (error) {
        dispatch({
          type: 'SET_ERROR',
          payload:
            error instanceof Error
              ? error.message
              : 'Error al cargar los detalles del podcast',
        });
      }
    };

    if (podcastId) {
      fetchPodcastDetail();
    }
  }, [podcastId, state.podcastsDetail, dispatch]);

  return {
    podcast: state.podcastsDetail[podcastId] || null,
    loading: state.loading,
    error: state.error,
  };
};
