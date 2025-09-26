import { CacheItem, CACHE_DURATION } from '@/types';

/**
 * Servicio para manejar el cache en localStorage
 * Implementa expiración automática de datos
 */
class CacheService {
  private readonly CACHE_PREFIX = 'podcaster_cache_';

  /**
   * Obtiene un item del cache si no ha expirado
   */
  get<T>(key: string): T | null {
    try {
      const cachedData = localStorage.getItem(this.CACHE_PREFIX + key);
      if (!cachedData) {
        return null;
      }

      const cacheItem: CacheItem<T> = JSON.parse(cachedData);
      const now = Date.now();

      // Verificar si el cache ha expirado
      if (now > cacheItem.expiresAt) {
        this.remove(key);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.error('Error al obtener del cache:', error);
      return null;
    }
  }

  /**
   * Guarda un item en el cache con tiempo de expiración
   */
  set<T>(key: string, data: T, duration: number = CACHE_DURATION): void {
    try {
      const now = Date.now();
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: now,
        expiresAt: now + duration,
      };

      localStorage.setItem(this.CACHE_PREFIX + key, JSON.stringify(cacheItem));
    } catch (error) {
      console.error('Error al guardar en cache:', error);
    }
  }

  /**
   * Elimina un item específico del cache
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(this.CACHE_PREFIX + key);
    } catch (error) {
      console.error('Error al eliminar del cache:', error);
    }
  }

  /**
   * Limpia todo el cache de la aplicación
   */
  clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.CACHE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error al limpiar el cache:', error);
    }
  }

  /**
   * Verifica si existe un item en el cache y no ha expirado
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }
}

export const cacheService = new CacheService();
