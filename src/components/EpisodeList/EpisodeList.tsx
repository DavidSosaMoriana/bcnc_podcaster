import React from 'react';
import { useNavigate } from 'react-router-dom';
import { EpisodeListProps } from '@/types';
import './EpisodeList.css';

/**
 * Componente para mostrar la lista de episodios de un podcast
 */
const EpisodeList: React.FC<EpisodeListProps> = ({
  episodes,
  onEpisodeClick,
}) => {
  const navigate = useNavigate();

  const formatDuration = (milliseconds: number): string => {
    if (!milliseconds) return 'N/A';

    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div className="episode-list">
      <div className="episode-list__header">
        <h2>Episodes: {episodes.length}</h2>
      </div>

      <div className="episode-list__table-container">
        <table className="episode-list__table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Date</th>
              <th>Length</th>
            </tr>
          </thead>
          <tbody>
            {episodes.map(episode => (
              <tr
                key={episode.id}
                className="episode-list__row"
                onClick={() => onEpisodeClick(episode)}
              >
                <td className="episode-list__title">
                  <button
                    className="episode-list__title-button"
                    onClick={e => {
                      e.stopPropagation();
                      onEpisodeClick(episode);
                    }}
                  >
                    {episode.title}
                  </button>
                </td>
                <td className="episode-list__date">
                  {formatDate(episode.releaseDate)}
                </td>
                <td className="episode-list__duration">
                  {formatDuration(episode.duration)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EpisodeList;
