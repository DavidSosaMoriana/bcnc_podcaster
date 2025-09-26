import {
  ITunesResponse,
  PodcastDetailResponse,
  Podcast,
  PodcastDetail,
  Episode,
} from '@/types';
import { apiService } from './apiService';
import { cacheService } from './cacheService';
import { mockPodcasts, mockEpisodes } from './mockData';

/**
 * Servicio para manejar las operaciones relacionadas con podcasts
 * Incluye cache automático y transformación de datos de la API
 */
class PodcastService {
  private readonly ITUNES_TOP_PODCASTS_URL =
    'https://itunes.apple.com/us/rss/toppodcasts/limit=100/genre=1310/json';
  private readonly ITUNES_LOOKUP_URL = 'https://itunes.apple.com/lookup';

  /**
   * Obtiene la lista de los 100 podcasts más populares
   * Implementa cache de 24 horas
   */
  async getPopularPodcasts(): Promise<Podcast[]> {
    const cacheKey = 'popular_podcasts';

    // Intentar obtener del cache primero
    const cachedPodcasts = cacheService.get<Podcast[]>(cacheKey);
    if (cachedPodcasts) {
      return cachedPodcasts;
    }

    try {
      console.log('PodcastService: Intentando obtener podcasts de la API...');
      const response = await apiService.get<ITunesResponse>(
        this.ITUNES_TOP_PODCASTS_URL
      );

      // Transformar los datos de la API al formato interno
      const podcasts: Podcast[] = response.feed.entry.map(entry => ({
        id: entry.id.attributes['im:id'],
        name: entry['im:name'].label,
        artist: entry['im:artist'].label,
        summary: entry.summary.label,
        image: entry['im:image'][2]?.label || entry['im:image'][0]?.label || '',
        imageSmall: entry['im:image'][0]?.label || '',
        imageLarge:
          entry['im:image'][2]?.label ||
          entry['im:image'][1]?.label ||
          entry['im:image'][0]?.label ||
          '',
      }));

      console.log(
        'PodcastService: Podcasts obtenidos de la API:',
        podcasts.length
      );

      // Guardar en cache
      cacheService.set(cacheKey, podcasts);

      return podcasts;
    } catch (error) {
      console.error(
        'PodcastService: Error al obtener podcasts de la API:',
        error
      );

      // Como fallback, usar datos de prueba
      console.log('PodcastService: Usando datos de prueba como fallback...');

      // Guardar los datos de prueba en cache también
      cacheService.set(cacheKey, mockPodcasts);

      return mockPodcasts;
    }
  }

  /**
   * Obtiene los detalles de un podcast específico y sus episodios
   * Implementa cache de 24 horas
   */
  async getPodcastDetail(podcastId: string): Promise<PodcastDetail> {
    const cacheKey = `podcast_detail_${podcastId}`;

    // Intentar obtener del cache primero
    const cachedDetail = cacheService.get<PodcastDetail>(cacheKey);
    if (cachedDetail) {
      return cachedDetail;
    }

    try {
      const url = `${this.ITUNES_LOOKUP_URL}?id=${podcastId}&media=podcast&entity=podcastEpisode&limit=20`;
      const response = await apiService.get<PodcastDetailResponse>(url);

      if (response.results.length === 0) {
        throw new Error('Podcast no encontrado');
      }

      // El primer resultado es información del podcast
      const podcastInfo = response.results[0];
      // Los resultados restantes son episodios
      const episodeResults = response.results.slice(1);

      // Transformar episodios
      const episodes: Episode[] = episodeResults.map(result => ({
        id: result.trackId.toString(),
        title: result.trackName,
        description: this.extractEpisodeDescription(result),
        releaseDate: result.releaseDate,
        duration: result.trackTimeMillis || 0,
        audioUrl: result.episodeUrl || result.previewUrl || '',
        episodeUrl: result.trackViewUrl || '',
      }));

      // Crear el detalle del podcast
      const podcastDetail: PodcastDetail = {
        id: podcastId,
        name: podcastInfo.collectionName,
        artist: podcastInfo.artistName || '',
        description: this.extractPodcastDescription(podcastInfo),
        image: podcastInfo.artworkUrl600 || podcastInfo.artworkUrl100 || '',
        episodes: episodes,
      };

      // Guardar en cache
      cacheService.set(cacheKey, podcastDetail);

      return podcastDetail;
    } catch (error) {
      console.error(
        'PodcastService: Error al obtener detalles del podcast:',
        error
      );

      // Como fallback, crear un detalle de podcast de prueba
      console.log(
        'PodcastService: Usando datos de prueba para detalle del podcast...'
      );

      const mockDetail: PodcastDetail = {
        id: podcastId,
        name: 'Podcast de Prueba',
        artist: 'Artista de Prueba',
        description:
          'Este es un podcast de prueba para verificar que la UI funciona correctamente cuando no se puede acceder a las APIs externas. Incluye episodios de ejemplo con descripciones completas para demostrar todas las funcionalidades de la aplicación, incluyendo el reproductor de audio y la navegación entre vistas.',
        image:
          'https://via.placeholder.com/600x600/007bff/ffffff?text=Podcast+Test',
        episodes: mockEpisodes,
      };

      // Guardar en cache
      cacheService.set(cacheKey, mockDetail);

      return mockDetail;
    }
  }

  /**
   * Extrae la descripción del podcast de múltiples campos posibles
   */
  private extractPodcastDescription(podcastInfo: any): string {
    // Intentar obtener la descripción de diferentes campos disponibles
    return (
      podcastInfo.description ||
      podcastInfo.longDescription ||
      podcastInfo.shortDescription ||
      podcastInfo.summary ||
      (podcastInfo.genres && podcastInfo.genres.length > 0
        ? `Podcast de ${podcastInfo.genres.join(', ')}.`
        : '') ||
      `Podcast de ${
        podcastInfo.primaryGenreName || 'entretenimiento'
      } presentado por ${podcastInfo.artistName || 'diversos artistas'}.`
    );
  }

  /**
   * Extrae la descripción del episodio de múltiples campos posibles
   */
  private extractEpisodeDescription(episodeInfo: any): string {
    return (
      episodeInfo.description ||
      episodeInfo.longDescription ||
      episodeInfo.shortDescription ||
      episodeInfo.summary ||
      episodeInfo.collectionName ||
      `Episodio: ${episodeInfo.trackName || 'Sin título'}`
    );
  }

  /**
   * Busca un episodio específico en los detalles de un podcast
   */
  findEpisode(podcastDetail: PodcastDetail, episodeId: string): Episode | null {
    return (
      podcastDetail.episodes.find(episode => episode.id === episodeId) || null
    );
  }
}

export const podcastService = new PodcastService();
