/**
 * Servicio para realizar peticiones HTTP con manejo de errores
 * Incluye soporte para múltiples proxies CORS como fallback
 */
class ApiService {
  private readonly PROXY_URLS = [
    'https://api.allorigins.win/get?url=',
    'https://corsproxy.io/?',
    'https://cors-anywhere.herokuapp.com/',
  ];

  /**
   * Realiza una petición GET usando proxies para evitar problemas de CORS
   */
  async get<T>(url: string): Promise<T> {
    console.log('ApiService: Iniciando petición a:', url);

    // Primero intentar sin proxy (por si la API ya soporta CORS)
    try {
      console.log('ApiService: Intentando petición directa...');
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        console.log('ApiService: Petición directa exitosa');
        return data;
      }
    } catch (error) {
      console.log(
        'ApiService: Petición directa falló, intentando con proxy...',
        error
      );
    }

    // Si falla, intentar con proxies
    for (let i = 0; i < this.PROXY_URLS.length; i++) {
      try {
        const proxyUrl = this.PROXY_URLS[i] + encodeURIComponent(url);
        console.log(`ApiService: Intentando proxy ${i + 1}:`, proxyUrl);

        const response = await fetch(proxyUrl);

        if (!response.ok) {
          console.log(
            `ApiService: Error en proxy ${i + 1}:`,
            response.status,
            response.statusText
          );
          continue;
        }

        const data = await response.json();
        console.log(`ApiService: Proxy ${i + 1} exitoso`);

        // api.allorigins.win devuelve los datos en la propiedad 'contents'
        if (this.PROXY_URLS[i].includes('allorigins') && data.contents) {
          return JSON.parse(data.contents);
        }

        return data;
      } catch (error) {
        console.log(`ApiService: Error en proxy ${i + 1}:`, error);
        continue;
      }
    }

    throw new ApiError(
      'Todos los proxies fallaron. No se pudo realizar la petición.'
    );
  }

  /**
   * Realiza una petición directa sin proxy (para casos donde no sea necesario)
   */
  async getDirect<T>(url: string): Promise<T> {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new ApiError(
          `Error en la petición: ${response.status} ${response.statusText}`,
          response.status
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(
        error instanceof Error ? error.message : 'Error desconocido'
      );
    }
  }
}

// Implementación de la clase ApiError
class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export const apiService = new ApiService();
export { ApiError };
