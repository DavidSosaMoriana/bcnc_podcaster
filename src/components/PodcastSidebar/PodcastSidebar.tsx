import React from 'react';
import { Link } from 'react-router-dom';
import { PodcastSidebarProps } from '@/types';
import './PodcastSidebar.css';

/**
 * Componente sidebar con información del podcast
 * Se usa en las vistas de detalle del podcast y del episodio
 */
const PodcastSidebar: React.FC<PodcastSidebarProps> = ({ podcast }) => {
  return (
    <aside className="podcast-sidebar">
      <div className="podcast-sidebar__image-container">
        <Link to={`/podcast/${podcast.id}`}>
          <img
            src={podcast.image}
            alt={`Portada de ${podcast.name}`}
            className="podcast-sidebar__image"
          />
        </Link>
      </div>

      <div className="podcast-sidebar__info">
        <Link to={`/podcast/${podcast.id}`} className="podcast-sidebar__title">
          {podcast.name}
        </Link>

        <Link to={`/podcast/${podcast.id}`} className="podcast-sidebar__artist">
          by {podcast.artist}
        </Link>
      </div>

      <div className="podcast-sidebar__description">
        <h4>Descripción:</h4>
        <p>{podcast.description}</p>
      </div>
    </aside>
  );
};

export default PodcastSidebar;
