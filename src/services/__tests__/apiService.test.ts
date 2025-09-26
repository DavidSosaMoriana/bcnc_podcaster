import { apiService, ApiError } from '../apiService';

// Mock fetch global
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('ApiService', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should fetch data successfully with direct request', async () => {
    const mockData = { feed: { entry: [] } };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    } as Response);

    const result = await apiService.get('https://test.com/api');

    expect(result).toEqual(mockData);
    expect(mockFetch).toHaveBeenCalledWith('https://test.com/api');
  });

  it('should fallback to proxy when direct request fails', async () => {
    const mockData = { test: 'data' };
    const proxyResponse = { contents: JSON.stringify(mockData) };

    mockFetch.mockRejectedValueOnce(new Error('CORS policy'));
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => proxyResponse,
    } as Response);

    const result = await apiService.get('https://test.com/api');

    expect(result).toEqual(mockData);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('should throw ApiError when all requests fail', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    await expect(apiService.get('https://test.com/api')).rejects.toThrow(
      ApiError
    );
  });

  it('should handle getDirect method correctly', async () => {
    const mockData = { test: 'direct' };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    } as Response);

    const result = await apiService.getDirect('https://test.com/direct');

    expect(result).toEqual(mockData);
  });

  it('should throw ApiError for getDirect failures', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    } as Response);

    await expect(apiService.getDirect('https://test.com/api')).rejects.toThrow(
      ApiError
    );
  });
});

describe('ApiError', () => {
  it('should create error with message and optional status', () => {
    const errorWithStatus = new ApiError('Test error', 404);
    expect(errorWithStatus.message).toBe('Test error');
    expect(errorWithStatus.status).toBe(404);
    expect(errorWithStatus).toBeInstanceOf(Error);

    const errorWithoutStatus = new ApiError('Test error');
    expect(errorWithoutStatus.status).toBeUndefined();
  });
});
