import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePodcasts, useLoadPodcasts } from '@/hooks';
import PodcastCard from '@/components/PodcastCard';
import SearchFilter from '@/components/SearchFilter';
import LoadingSpinner from '@/components/LoadingSpinner';
import './HomeView.css';

/**
 * Vista principal de la aplicación
 * Muestra la lista de podcasts con filtrado
 */
const HomeView: React.FC = () => {
  const navigate = useNavigate();
  const { filteredPodcasts, loading, error, filter, setFilter } = usePodcasts();

  // Cargar podcasts al montar el componente
  useLoadPodcasts();

  const handlePodcastClick = (podcastId: string): void => {
    navigate(`/podcast/${podcastId}`);
  };

  if (loading && filteredPodcasts.length === 0) {
    return (
      <div className="home-view__loading">
        <LoadingSpinner size="large" />
        <p>Loading podcasts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-view__error">
        <h2>Error al cargar podcasts</h2>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="home-view__retry-button"
        >
          Reintentar
        </button>
        <details className="home-view__error-details">
          <summary>Información técnica</summary>
          <p>Si el problema persiste, verifica:</p>
          <ul>
            <li>Tu conexión a internet</li>
            <li>Que no hay bloqueadores de contenido activos</li>
            <li>Revisa la consola del navegador para más detalles</li>
          </ul>
        </details>
      </div>
    );
  }

  return (
    <div className="home-view">
      <SearchFilter
        value={filter}
        onChange={setFilter}
        totalCount={filteredPodcasts.length}
      />

      {filteredPodcasts.length === 0 && filter ? (
        <div className="home-view__no-results">
          <h2>No se encontraron podcasts</h2>
          <p>
            No hay podcasts que coincidan con tu búsqueda "{filter}". Intenta
            con otros términos.
          </p>
        </div>
      ) : (
        <div className="home-view__grid">
          {filteredPodcasts.map(podcast => (
            <PodcastCard
              key={podcast.id}
              podcast={podcast}
              onClick={() => handlePodcastClick(podcast.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomeView;
