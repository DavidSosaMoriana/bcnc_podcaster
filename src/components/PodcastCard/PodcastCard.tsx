import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PodcastCardProps } from '@/types';
import './PodcastCard.css';

/**
 * Componente para mostrar una tarjeta individual de podcast
 */
const PodcastCard: React.FC<PodcastCardProps> = ({ podcast, onClick }) => {
  return (
    <div className="podcast-card" onClick={onClick} role="button" tabIndex={0}>
      <div className="podcast-card__image-container">
        <img
          src={podcast.imageLarge}
          alt={`Portada de ${podcast.name}`}
          className="podcast-card__image"
          loading="lazy"
        />
      </div>

      <div className="podcast-card__content">
        <h3 className="podcast-card__title">{podcast.name}</h3>
        <p className="podcast-card__author">{podcast.artist}</p>
      </div>
    </div>
  );
};

export default PodcastCard;
