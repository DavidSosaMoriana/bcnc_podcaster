import { useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { podcastService } from '../services/podcastService';

/**
 * Hook personalizado para cargar la lista inicial de podcasts
 * Se ejecuta automáticamente al montar el componente
 */
export const useLoadPodcasts = (): void => {
  const { state, dispatch } = useAppContext();

  useEffect(() => {
    const loadPodcasts = async (): Promise<void> => {
      // Si ya tenemos podcasts cargados, no hacer nueva petición
      if (state.podcasts.length > 0) {
        console.log(
          'useLoadPodcasts: Ya hay podcasts cargados, omitiendo petición'
        );
        return;
      }

      console.log('useLoadPodcasts: Iniciando carga de podcasts...');

      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'CLEAR_ERROR' }); // Limpiar errores previos

        const podcasts = await podcastService.getPopularPodcasts();
        console.log(
          'useLoadPodcasts: Podcasts cargados exitosamente:',
          podcasts.length
        );

        dispatch({ type: 'SET_PODCASTS', payload: podcasts });
      } catch (error) {
        console.error('useLoadPodcasts: Error al cargar podcasts:', error);

        const errorMessage =
          error instanceof Error
            ? `Error al cargar los podcasts: ${error.message}`
            : 'No se pudo cargar la lista de podcasts. Por favor, intenta más tarde.';

        dispatch({
          type: 'SET_ERROR',
          payload: errorMessage,
        });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadPodcasts();
  }, [state.podcasts.length, dispatch]);
};

/**
 * Hook para limpiar errores de la aplicación
 */
export const useClearError = (): (() => void) => {
  const { dispatch } = useAppContext();

  return (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };
};
