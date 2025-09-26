// Tipos principales de la aplicación

// Respuesta de la API de iTunes para la lista de podcasts
export interface ITunesResponse {
  feed: {
    author: {
      name: { label: string };
      uri: { label: string };
    };
    entry: ITunesPodcastEntry[];
    updated: { label: string };
    rights: { label: string };
    title: { label: string };
    icon: { label: string };
    link: Array<{
      attributes: {
        rel: string;
        type?: string;
        href: string;
      };
    }>;
    id: { label: string };
  };
}

// Entrada individual de podcast en la lista
export interface ITunesPodcastEntry {
  'im:name': { label: string };
  'im:image': Array<{
    label: string;
    attributes: { height: string };
  }>;
  summary: { label: string };
  'im:price': {
    label: string;
    attributes: { amount: string; currency: string };
  };
  'im:contentType': {
    attributes: { term: string; label: string };
  };
  rights?: { label: string };
  title: { label: string };
  link: {
    attributes: {
      rel: string;
      type: string;
      href: string;
    };
  };
  id: {
    label: string;
    attributes: { 'im:id': string };
  };
  'im:artist': {
    label: string;
    attributes?: { href: string };
  };
  category: {
    attributes: {
      'im:id': string;
      term: string;
      scheme: string;
      label: string;
    };
  };
  'im:releaseDate': {
    label: string;
    attributes: { label: string };
  };
}

// Modelo interno simplificado de podcast
export interface Podcast {
  id: string;
  name: string;
  artist: string;
  summary: string;
  image: string;
  imageSmall: string;
  imageLarge: string;
}

// Respuesta de la API de detalle de podcast
export interface PodcastDetailResponse {
  resultCount: number;
  results: PodcastDetailResult[];
}

export interface PodcastDetailResult {
  wrapperType: string;
  kind: string;
  collectionId?: number;
  trackId: number;
  artistName?: string;
  collectionName: string;
  trackName: string;
  collectionCensoredName?: string;
  trackCensoredName?: string;
  collectionViewUrl?: string;
  feedUrl?: string;
  trackViewUrl?: string;
  artworkUrl30?: string;
  artworkUrl60?: string;
  artworkUrl100?: string;
  collectionPrice?: number;
  trackPrice?: number;
  trackRentalPrice?: number;
  collectionHdPrice?: number;
  trackHdPrice?: number;
  trackHdRentalPrice?: number;
  releaseDate: string;
  collectionExplicitness?: string;
  trackExplicitness?: string;
  trackCount?: number;
  country: string;
  currency?: string;
  primaryGenreName?: string;
  contentAdvisoryRating?: string;
  artworkUrl600?: string;
  genreIds?: string[];
  genres: string[];
  description?: string;
  shortDescription?: string;
  closedCaptioning?: string;
  episodeUrl?: string;
  episodeFileExtension?: string;
  episodeContentType?: string;
  trackTimeMillis?: number;
  previewUrl?: string;
}

// Modelo interno del detalle de podcast
export interface PodcastDetail {
  id: string;
  name: string;
  artist: string;
  description: string;
  image: string;
  episodes: Episode[];
}

// Modelo de episodio
export interface Episode {
  id: string;
  title: string;
  description: string;
  releaseDate: string;
  duration: number; 
  audioUrl: string;
  episodeUrl: string;
}

// Tipos para el cache
export interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

// Tipos para el estado de la aplicación
export interface AppState {
  podcasts: Podcast[];
  podcastsDetail: { [id: string]: PodcastDetail };
  loading: boolean;
  error: string | null;
  filter: string;
}

// Tipos para acciones del reducer
export type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PODCASTS'; payload: Podcast[] }
  | {
      type: 'SET_PODCAST_DETAIL';
      payload: { id: string; detail: PodcastDetail };
    }
  | { type: 'SET_FILTER'; payload: string }
  | { type: 'CLEAR_ERROR' };

// Tipos para el contexto
export interface AppContextType {
  state: AppState;
  dispatch: (action: AppAction) => void;
}

// Tipos para los hooks personalizados
export interface UsePodcastsReturn {
  podcasts: Podcast[];
  loading: boolean;
  error: string | null;
  filter: string;
  setFilter: (filter: string) => void;
  filteredPodcasts: Podcast[];
}

export interface UsePodcastDetailReturn {
  podcast: PodcastDetail | null;
  loading: boolean;
  error: string | null;
}

// Tipos para props de componentes
export interface PodcastCardProps {
  podcast: Podcast;
  onClick: () => void;
}

export interface EpisodeListProps {
  episodes: Episode[];
  onEpisodeClick: (episode: Episode) => void;
}

export interface AudioPlayerProps {
  episode: Episode;
}

export interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  show?: boolean;
}

export interface PodcastSidebarProps {
  podcast: PodcastDetail;
}

// Tipos de utilidades
export interface ApiError {
  message: string;
  status?: number;
}

export interface RouteParams {
  podcastId: string;
  episodeId?: string;
}

// Constantes de tiempo
export const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas en milisegundos
