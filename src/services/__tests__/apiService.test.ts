import { apiService, ApiError } from '../apiService';

// Mock fetch global
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('ApiService', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    jest.clearAllMocks();
    // Silenciar console.log para tests más limpios
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('get method', () => {
    it('should fetch data successfully with direct request', async () => {
      const mockData = {
        feed: {
          entry: [
            {
              id: { attributes: { 'im:id': '123' } },
              'im:name': { label: 'Test Podcast' },
              'im:artist': { label: 'Test Artist' },
            },
          ],
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as Response);

      const result = await apiService.get('https://itunes.apple.com/test');

      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith('https://itunes.apple.com/test');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should use first proxy when direct request fails', async () => {
      const mockData = { test: 'data' };
      const proxyResponse = {
        contents: JSON.stringify(mockData),
      };

      // Primera llamada falla (directa)
      mockFetch.mockRejectedValueOnce(new Error('CORS policy'));

      // Segunda llamada con allorigins proxy funciona
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => proxyResponse,
      } as Response);

      const result = await apiService.get('https://itunes.apple.com/test');

      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledTimes(2);

      // Verificar que se usó allorigins proxy
      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('api.allorigins.win/get?url=')
      );
    });

    it('should try multiple proxies when first proxy fails', async () => {
      const mockData = { test: 'data' };

      // Primera llamada falla (directa)
      mockFetch.mockRejectedValueOnce(new Error('CORS policy'));

      // Segunda llamada falla (primer proxy - allorigins)
      mockFetch.mockRejectedValueOnce(new Error('Proxy 1 failed'));

      // Tercera llamada funciona (segundo proxy - corsproxy.io)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as Response);

      const result = await apiService.get('https://itunes.apple.com/test');

      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledTimes(3);

      // Verificar que se probó el segundo proxy
      expect(mockFetch).toHaveBeenNthCalledWith(
        3,
        expect.stringContaining('corsproxy.io')
      );
    });

    it('should throw ApiError when all proxies fail', async () => {
      // Todas las llamadas fallan
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(
        apiService.get('https://itunes.apple.com/test')
      ).rejects.toThrow(ApiError);

      await expect(
        apiService.get('https://itunes.apple.com/test')
      ).rejects.toThrow(
        'Todos los proxies fallaron. No se pudo realizar la petición.'
      );

      // El test se ejecuta dos veces (dos expect), por eso 8 llamadas (4 + 4)
      // Verificamos solo la primera ejecución
      expect(mockFetch.mock.calls.length).toBeGreaterThanOrEqual(4);
    });

    it('should handle non-OK response from proxy', async () => {
      const mockData = { test: 'data' };

      // Directa falla
      mockFetch.mockRejectedValueOnce(new Error('CORS policy'));

      // Primer proxy devuelve 404
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response);

      // Segundo proxy funciona
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as Response);

      const result = await apiService.get('https://itunes.apple.com/test');

      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('should parse allorigins response correctly', async () => {
      const originalData = {
        feed: {
          entry: [{ id: '123', name: 'Test' }],
        },
      };
      const alloriginsResponse = {
        contents: JSON.stringify(originalData),
        status: { http_code: 200 },
      };

      // Directa falla
      mockFetch.mockRejectedValueOnce(new Error('CORS policy'));

      // Allorigins funciona
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => alloriginsResponse,
      } as Response);

      const result = await apiService.get('https://itunes.apple.com/test');

      expect(result).toEqual(originalData);
    });

    it('should handle malformed JSON in allorigins response', async () => {
      const alloriginsResponse = {
        contents: 'invalid json string',
      };

      // Directa falla
      mockFetch.mockRejectedValueOnce(new Error('CORS policy'));

      // Allorigins con JSON malformado
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => alloriginsResponse,
      } as Response);

      // Segundo proxy falla también
      mockFetch.mockRejectedValueOnce(new Error('Proxy 2 failed'));

      // Tercer proxy falla
      mockFetch.mockRejectedValueOnce(new Error('Proxy 3 failed'));

      await expect(
        apiService.get('https://itunes.apple.com/test')
      ).rejects.toThrow(ApiError);
    });
  });

  describe('getDirect method', () => {
    it('should fetch data successfully', async () => {
      const mockData = { test: 'direct data' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as Response);

      const result = await apiService.getDirect('https://test.com/api');

      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith('https://test.com/api');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should throw ApiError with status when response is not OK', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response);

      await expect(
        apiService.getDirect('https://test.com/api')
      ).rejects.toThrow(ApiError);

      // Verificar que se lanza ApiError correctamente
      try {
        await apiService.getDirect('https://test.com/api');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
      }
    });

    it('should throw ApiError when network request fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network failure'));

      await expect(
        apiService.getDirect('https://test.com/api')
      ).rejects.toThrow(ApiError);

      try {
        await apiService.getDirect('https://test.com/api');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        // Verificar que el mensaje contiene información del error
        expect((error as ApiError).message).toBeDefined();
      }
    });

    it('should throw ApiError for unknown errors', async () => {
      mockFetch.mockRejectedValueOnce('Unknown error string');

      await expect(
        apiService.getDirect('https://test.com/api')
      ).rejects.toThrow(ApiError);

      try {
        await apiService.getDirect('https://test.com/api');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        // Para errores desconocidos, verificar que se maneja correctamente
        expect((error as ApiError).message).toBeDefined();
      }
    });
  });

  describe('console logging', () => {
    it('should log request progress', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      const mockData = { test: 'data' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as Response);

      await apiService.get('https://test.com/api');

      expect(consoleSpy).toHaveBeenCalledWith(
        'ApiService: Iniciando petición a:',
        'https://test.com/api'
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        'ApiService: Intentando petición directa...'
      );
    });
  });
});

describe('ApiError', () => {
  it('should create error with message and status', () => {
    const error = new ApiError('Test error', 404);

    expect(error.message).toBe('Test error');
    expect(error.status).toBe(404);
    expect(error.name).toBe('ApiError');
    expect(error).toBeInstanceOf(Error);
  });

  it('should create error without status', () => {
    const error = new ApiError('Test error');

    expect(error.message).toBe('Test error');
    expect(error.status).toBeUndefined();
    expect(error.name).toBe('ApiError');
  });
});
