import { cacheService } from '../cacheService';

// Mock localStorage simple
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    _setStore: (newStore: Record<string, string>) => {
      store = newStore;
    },
  };
})();

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
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should get cached data when not expired', () => {
    const testData = { podcasts: [{ id: '123', name: 'Test' }] };
    const validCache = {
      data: testData,
      timestamp: Date.now(),
      expiresAt: Date.now() + 1000000, // Future expiration
    };

    mockLocalStorage._setStore({
      [CACHE_PREFIX + 'test-key']: JSON.stringify(validCache),
    });

    const result = cacheService.get('test-key');
    expect(result).toEqual(testData);
  });

  it('should return null and remove expired cache', () => {
    const expiredCache = {
      data: { test: 'data' },
      timestamp: Date.now() - 1000000,
      expiresAt: Date.now() - 1000, // Past expiration
    };

    mockLocalStorage._setStore({
      [CACHE_PREFIX + 'expired-key']: JSON.stringify(expiredCache),
    });

    const result = cacheService.get('expired-key');
    expect(result).toBeNull();
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
      CACHE_PREFIX + 'expired-key'
    );
  });

  it('should return null for non-existent cache', () => {
    const result = cacheService.get('nonexistent-key');
    expect(result).toBeNull();
  });

  it('should store data with expiration', () => {
    const testData = { test: 'data' };
    const mockTimestamp = 1234567890;
    const customDuration = 30000;

    jest.spyOn(Date, 'now').mockReturnValue(mockTimestamp);

    cacheService.set('test-key', testData, customDuration);

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      CACHE_PREFIX + 'test-key',
      expect.stringContaining('"data":{"test":"data"}')
    );
  });

  it('should remove item from cache', () => {
    cacheService.remove('test-key');
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
      CACHE_PREFIX + 'test-key'
    );
  });

  it('should call clear method without errors', () => {
    // Test que el método clear se ejecute sin errores
    expect(() => cacheService.clear()).not.toThrow();
  });

  it('should check if cache exists and is valid', () => {
    // Test has() method with valid cache
    const validCache = {
      data: { test: 'data' },
      timestamp: Date.now(),
      expiresAt: Date.now() + 1000000,
    };

    mockLocalStorage._setStore({
      [CACHE_PREFIX + 'valid-key']: JSON.stringify(validCache),
    });

    expect(cacheService.has('valid-key')).toBe(true);
    expect(cacheService.has('nonexistent-key')).toBe(false);
  });

  it('should handle localStorage errors gracefully', () => {
    mockLocalStorage.getItem.mockImplementation(() => {
      throw new Error('localStorage error');
    });

    const result = cacheService.get('error-key');
    expect(result).toBeNull();
  });
});
