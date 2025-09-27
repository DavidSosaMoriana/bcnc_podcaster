import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePodcastDetail } from '@/hooks';
import PodcastSidebar from '@/components/PodcastSidebar';
import EpisodeList from '@/components/EpisodeList';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Episode } from '@/types';
import './PodcastDetailView.css';

/**
 * Vista de detalle de un podcast
 * Muestra sidebar con info del podcast y lista de episodios
 */
const PodcastDetailView: React.FC = () => {
  const { podcastId } = useParams<{ podcastId: string }>();
  const navigate = useNavigate();
  const { podcast, loading, error } = usePodcastDetail(podcastId!);

  const handleEpisodeClick = (episode: Episode): void => {
    navigate(`/podcast/${podcastId}/episode/${episode.id}`);
  };

  if (loading) {
    return (
      <div className="podcast-detail-view__loading">
        <LoadingSpinner size="large" />
        <p>Loading podcast...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="podcast-detail-view__error">
        <h2>There was an error loading the podcast</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!podcast) {
    return (
      <div className="podcast-detail-view__not-found">
        <h2>Podcast no encontrado</h2>
        <p>El podcast que buscas no existe o no se pudo cargar.</p>
      </div>
    );
  }

  return (
    <div className="podcast-detail-view">
      <div className="podcast-detail-view__layout">
        <PodcastSidebar podcast={podcast} />

        <main className="podcast-detail-view__main">
          <EpisodeList
            episodes={podcast.episodes}
            onEpisodeClick={handleEpisodeClick}
          />
        </main>
      </div>
    </div>
  );
};

export default PodcastDetailView;
