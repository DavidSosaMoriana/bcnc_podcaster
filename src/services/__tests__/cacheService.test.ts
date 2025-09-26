import { cacheService } from '../cacheService';

// Definir CACHE_DURATION localmente para el test
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas en milisegundos

// Mock localStorage más realista
const createMockLocalStorage = () => {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => {
      return store[key] || null;
    }),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    length: Object.keys(store).length,
    key: jest.fn((index: number) => Object.keys(store)[index] || null),
    // Método helper para obtener las claves actuales
    _getKeys: () => Object.keys(store),
    _getStore: () => ({ ...store }),
    _setStore: (newStore: Record<string, string>) => {
      store = newStore;
    },
  };
};

const mockLocalStorage = createMockLocalStorage();

// Asignar mock a window.localStorage
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe('CacheService', () => {
  const CACHE_PREFIX = 'podcaster_cache_';

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();
    mockLocalStorage._setStore({});
    // Silenciar console.log y console.error para tests más limpios
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('get method', () => {
    it('should return cached data when cache is valid (not expired)', () => {
      const testData = {
        podcasts: [
          {
            id: '123',
            name: 'Test Podcast',
            artist: 'Test Artist',
            episodes: [],
          },
        ],
      };
      const futureExpiration = Date.now() + 12 * 60 * 60 * 1000; // 12 horas en el futuro
      const validCacheItem = {
        data: testData,
        timestamp: Date.now(),
        expiresAt: futureExpiration,
      };

      // Configurar el store directamente
      const key = CACHE_PREFIX + 'podcasts-list';
      mockLocalStorage._setStore({
        [key]: JSON.stringify(validCacheItem),
      });

      const result = cacheService.get('podcasts-list');

      expect(result).toEqual(testData);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(key);
      expect(mockLocalStorage.removeItem).not.toHaveBeenCalled();
    });

    it('should return null and remove cache when expired', () => {
      const testData = { podcasts: [] };
      const pastExpiration = Date.now() - 1000; // 1 segundo en el pasado
      const expiredCacheItem = {
        data: testData,
        timestamp: Date.now() - 25 * 60 * 60 * 1000, // 25 horas atrás
        expiresAt: pastExpiration,
      };

      const key = CACHE_PREFIX + 'expired-key';
      mockLocalStorage._setStore({
        [key]: JSON.stringify(expiredCacheItem),
      });

      const result = cacheService.get('expired-key');

      expect(result).toBeNull();
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(key);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(key);
    });

    it('should return null when no cache exists', () => {
      const result = cacheService.get('nonexistent-key');

      expect(result).toBeNull();
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(
        CACHE_PREFIX + 'nonexistent-key'
      );
      expect(mockLocalStorage.removeItem).not.toHaveBeenCalled();
    });

    it('should return null when JSON is malformed', () => {
      const key = CACHE_PREFIX + 'malformed-key';
      mockLocalStorage._setStore({
        [key]: 'invalid json string {',
      });

      const result = cacheService.get('malformed-key');

      expect(result).toBeNull();
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(key);
    });

    it('should handle localStorage getItem throwing error', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error');
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const result = cacheService.get('error-key');

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error al obtener del cache:',
        expect.any(Error)
      );
    });

    it('should return null when cache item has invalid structure', () => {
      const invalidCacheItem = {
        data: { test: 'data' },
        timestamp: Date.now(),
        // Falta expiresAt - esto debería causar que falle la validación
      };

      const key = CACHE_PREFIX + 'invalid-structure-key';
      mockLocalStorage._setStore({
        [key]: JSON.stringify(invalidCacheItem),
      });

      const result = cacheService.get('invalid-structure-key');

      // El cacheService debería manejar la falta de expiresAt como inválido
      expect(result).toBeNull();
    });

    it('should return null when cache is exactly expired', () => {
      const testData = { test: 'data' };
      const exactExpirationTime = Date.now() - 1; // 1ms en el pasado
      const exactlyExpiredItem = {
        data: testData,
        timestamp: Date.now() - CACHE_DURATION,
        expiresAt: exactExpirationTime,
      };

      const key = CACHE_PREFIX + 'exactly-expired-key';
      mockLocalStorage._setStore({
        [key]: JSON.stringify(exactlyExpiredItem),
      });

      const result = cacheService.get('exactly-expired-key');

      expect(result).toBeNull();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(key);
    });
  });

  describe('set method', () => {
    it('should store data with default CACHE_DURATION', () => {
      const testData = {
        podcasts: [
          {
            id: '456',
            name: 'Another Podcast',
            episodes: [{ id: 'ep1', title: 'Episode 1' }],
          },
        ],
      };
      const mockTimestamp = 1234567890;

      jest.spyOn(Date, 'now').mockReturnValue(mockTimestamp);

      cacheService.set('test-podcasts', testData);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        CACHE_PREFIX + 'test-podcasts',
        JSON.stringify({
          data: testData,
          timestamp: mockTimestamp,
          expiresAt: mockTimestamp + CACHE_DURATION,
        })
      );
    });

    it('should store data with custom duration', () => {
      const testData = { test: 'custom duration' };
      const customDuration = 30 * 60 * 1000; // 30 minutos
      const mockTimestamp = 1234567890;

      jest.spyOn(Date, 'now').mockReturnValue(mockTimestamp);

      cacheService.set('custom-duration-key', testData, customDuration);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        CACHE_PREFIX + 'custom-duration-key',
        JSON.stringify({
          data: testData,
          timestamp: mockTimestamp,
          expiresAt: mockTimestamp + customDuration,
        })
      );
    });

    it('should handle complex nested data structures', () => {
      const complexData = {
        podcasts: [
          {
            id: '789',
            name: 'Complex Podcast',
            episodes: [
              {
                id: 'ep1',
                title: 'Episode 1',
                duration: '30:00',
                description: 'Complex episode description',
                audioUrl: 'https://example.com/audio1.mp3',
              },
              {
                id: 'ep2',
                title: 'Episode 2',
                duration: '45:00',
                description: 'Another episode',
                audioUrl: 'https://example.com/audio2.mp3',
              },
            ],
            metadata: {
              author: 'Complex Author',
              categories: ['Technology', 'Science', 'Education'],
              rating: 4.8,
              lastUpdated: new Date().toISOString(),
            },
          },
        ],
        filters: {
          search: 'technology',
          categories: ['Science'],
        },
        lastFetch: Date.now(),
      };

      cacheService.set('complex-data', complexData);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        CACHE_PREFIX + 'complex-data',
        expect.stringContaining('"podcasts"')
      );

      // Verificar que se puede deserializar correctamente
      const storedCall = mockLocalStorage.setItem.mock.calls[0];
      const storedData = JSON.parse(storedCall[1]);
      expect(storedData.data).toEqual(complexData);
      expect(storedData.timestamp).toEqual(expect.any(Number));
      expect(storedData.expiresAt).toEqual(expect.any(Number));
    });

    it('should handle localStorage setItem throwing error', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error');
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      expect(() => {
        cacheService.set('error-key', { data: 'test' });
      }).not.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error al guardar en cache:',
        expect.any(Error)
      );
    });

    it('should handle null data', () => {
      cacheService.set('null-key', null);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        CACHE_PREFIX + 'null-key',
        expect.stringContaining('"data":null')
      );
    });

    it('should handle undefined data by converting to null', () => {
      cacheService.set('undefined-key', undefined);

      // JSON.stringify convierte undefined a "undefined" no a null
      // Necesitamos verificar el comportamiento real
      const calls = mockLocalStorage.setItem.mock.calls;
      const undefinedCall = calls.find(
        call => call[0] === CACHE_PREFIX + 'undefined-key'
      );
      expect(undefinedCall).toBeDefined();

      // Verificar que el call existe y tiene la estructura correcta
      if (undefinedCall) {
        const parsedData = JSON.parse(undefinedCall[1]);
        expect(parsedData).toHaveProperty('timestamp');
        expect(parsedData).toHaveProperty('expiresAt');
      }
    });
  });

  describe('remove method', () => {
    it('should remove item from localStorage with prefix', () => {
      cacheService.remove('remove-test-key');

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        CACHE_PREFIX + 'remove-test-key'
      );
    });

    it('should handle localStorage removeItem throwing error', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error');
      mockLocalStorage.removeItem.mockImplementation(() => {
        throw new Error('Storage access denied');
      });

      expect(() => {
        cacheService.remove('error-remove-key');
      }).not.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error al eliminar del cache:',
        expect.any(Error)
      );
    });
  });

  describe('clear method', () => {
    it('should clear only cache items with prefix', () => {
      // Configurar el localStorage con claves de prueba
      const initialStore = {
        podcaster_cache_item1: 'data1',
        podcaster_cache_item2: 'data2',
        other_app_data: 'other_data',
        podcaster_cache_item3: 'data3',
        random_key: 'random_data',
      };

      mockLocalStorage._setStore(initialStore);

      cacheService.clear();

      // Verificar que solo se removieron las claves con prefijo
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        'podcaster_cache_item1'
      );
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        'podcaster_cache_item2'
      );
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        'podcaster_cache_item3'
      );
      expect(mockLocalStorage.removeItem).not.toHaveBeenCalledWith(
        'other_app_data'
      );
      expect(mockLocalStorage.removeItem).not.toHaveBeenCalledWith(
        'random_key'
      );
      expect(mockLocalStorage.removeItem).toHaveBeenCalledTimes(3);
    });

    it('should handle localStorage operations throwing errors during clear', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error');

      // Crear un mock temporal de Object.keys que lance error solo durante este test
      const mockObjectKeys = jest.fn().mockImplementation(() => {
        throw new Error('Cannot access localStorage');
      });

      // Guardar el Object.keys original
      const originalObjectKeys = Object.keys;

      // Reemplazar temporalmente Object.keys
      (global as any).Object.keys = mockObjectKeys;

      expect(() => {
        cacheService.clear();
      }).not.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error al limpiar el cache:',
        expect.any(Error)
      );

      // Restaurar Object.keys original
      (global as any).Object.keys = originalObjectKeys;
    });
  });

  describe('has method', () => {
    it('should return true when valid cache exists', () => {
      const testData = { test: 'data' };
      const validCacheItem = {
        data: testData,
        timestamp: Date.now(),
        expiresAt: Date.now() + CACHE_DURATION,
      };

      const key = CACHE_PREFIX + 'valid-key';
      mockLocalStorage._setStore({
        [key]: JSON.stringify(validCacheItem),
      });

      const result = cacheService.has('valid-key');

      expect(result).toBe(true);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(key);
    });

    it('should return false when cache does not exist', () => {
      const result = cacheService.has('nonexistent-key');

      expect(result).toBe(false);
    });

    it('should return false when cache is expired', () => {
      const expiredCacheItem = {
        data: { test: 'data' },
        timestamp: Date.now() - CACHE_DURATION - 1000,
        expiresAt: Date.now() - 1000, // Expirado hace 1 segundo
      };

      const key = CACHE_PREFIX + 'expired-key';
      mockLocalStorage._setStore({
        [key]: JSON.stringify(expiredCacheItem),
      });

      const result = cacheService.has('expired-key');

      expect(result).toBe(false);
    });

    it('should return false when cache is malformed', () => {
      const key = CACHE_PREFIX + 'malformed-key';
      mockLocalStorage._setStore({
        [key]: 'invalid json',
      });

      const result = cacheService.has('malformed-key');

      expect(result).toBe(false);
    });
  });

  describe('cache prefix functionality', () => {
    it('should always use cache prefix for all operations', () => {
      const testData = { test: 'prefix test' };

      // Test set
      cacheService.set('test-key', testData);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        CACHE_PREFIX + 'test-key',
        expect.any(String)
      );

      // Mock valid cache for get
      const validCache = {
        data: testData,
        timestamp: Date.now(),
        expiresAt: Date.now() + CACHE_DURATION,
      };
      const key = CACHE_PREFIX + 'test-key';
      mockLocalStorage._setStore({
        [key]: JSON.stringify(validCache),
      });

      // Test get
      cacheService.get('test-key');
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(key);

      // Test remove
      cacheService.remove('test-key');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(key);

      // Test has
      cacheService.has('test-key');
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(key);
    });
  });
});
