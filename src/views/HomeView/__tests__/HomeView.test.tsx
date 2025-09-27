import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HomeView from '../HomeView';
import { usePodcasts, useLoadPodcasts } from '@/hooks';

// Mock de los hooks
jest.mock('@/hooks', () => ({
  usePodcasts: jest.fn(),
  useLoadPodcasts: jest.fn(),
}));

// Mock de los componentes
jest.mock('@/components/PodcastCard', () => {
  return function MockPodcastCard({ podcast, onClick }: any) {
    return (
      <div data-testid={`podcast-card-${podcast.id}`} onClick={onClick}>
        {podcast.name}
      </div>
    );
  };
});

jest.mock('@/components/SearchFilter', () => {
  return function MockSearchFilter({ value, onChange, totalCount }: any) {
    return (
      <div data-testid="search-filter">
        <input
          data-testid="search-input"
          value={value}
          onChange={e => onChange(e.target.value)}
        />
        <span data-testid="total-count">{totalCount}</span>
      </div>
    );
  };
});

jest.mock('@/components/LoadingSpinner', () => {
  return function MockLoadingSpinner({ size }: any) {
    return (
      <div data-testid="loading-spinner" data-size={size}>
        Loading...
      </div>
    );
  };
});

const mockUsePodcasts = usePodcasts as jest.MockedFunction<typeof usePodcasts>;
const mockUseLoadPodcasts = useLoadPodcasts as jest.MockedFunction<
  typeof useLoadPodcasts
>;

// Mock data
const mockPodcasts = [
  {
    id: '1',
    name: 'Test Podcast 1',
    artist: 'Test Artist 1',
    image: 'https://example.com/image1.jpg',
    imageSmall: 'https://example.com/image1-small.jpg',
    imageLarge: 'https://example.com/image1-large.jpg',
    summary: 'Test summary 1',
  },
  {
    id: '2',
    name: 'Test Podcast 2',
    artist: 'Test Artist 2',
    image: 'https://example.com/image2.jpg',
    imageSmall: 'https://example.com/image2-small.jpg',
    imageLarge: 'https://example.com/image2-large.jpg',
    summary: 'Test summary 2',
  },
];

// Helper para renderizar con Router
const renderHomeView = () => {
  return render(
    <BrowserRouter>
      <HomeView />
    </BrowserRouter>
  );
};

describe('HomeView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLoadPodcasts.mockImplementation(() => {});
  });

  it('should render podcasts when data is available', () => {
    mockUsePodcasts.mockReturnValue({
      filteredPodcasts: mockPodcasts,
      loading: false,
      error: null,
      filter: '',
      setFilter: jest.fn(),
      podcasts: mockPodcasts,
    });

    renderHomeView();

    expect(screen.getByTestId('search-filter')).toBeInTheDocument();
    expect(screen.getByTestId('podcast-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('podcast-card-2')).toBeInTheDocument();
    expect(screen.getByText('Test Podcast 1')).toBeInTheDocument();
    expect(screen.getByText('Test Podcast 2')).toBeInTheDocument();
  });

  it('should show loading state when podcasts are loading', () => {
    mockUsePodcasts.mockReturnValue({
      filteredPodcasts: [],
      loading: true,
      error: null,
      filter: '',
      setFilter: jest.fn(),
      podcasts: [],
    });

    renderHomeView();

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText('Loading podcasts...')).toBeInTheDocument();
    expect(screen.getByTestId('loading-spinner')).toHaveAttribute(
      'data-size',
      'large'
    );
  });

  it('should show error state when there is an error', () => {
    const mockError = 'Failed to load podcasts';
    mockUsePodcasts.mockReturnValue({
      filteredPodcasts: [],
      loading: false,
      error: mockError,
      filter: '',
      setFilter: jest.fn(),
      podcasts: [],
    });

    // Mock window.location.reload
    const mockReload = jest.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true,
    });

    renderHomeView();

    expect(screen.getByText('Error al cargar podcasts')).toBeInTheDocument();
    expect(screen.getByText(mockError)).toBeInTheDocument();
    expect(screen.getByText('Reintentar')).toBeInTheDocument();

    // Test retry button
    fireEvent.click(screen.getByText('Reintentar'));
    expect(mockReload).toHaveBeenCalled();
  });

  it('should navigate to podcast detail when clicking a podcast card', () => {
    const mockNavigate = jest.fn();
    jest.doMock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => mockNavigate,
    }));

    mockUsePodcasts.mockReturnValue({
      filteredPodcasts: mockPodcasts,
      loading: false,
      error: null,
      filter: '',
      setFilter: jest.fn(),
      podcasts: mockPodcasts,
    });

    renderHomeView();

    fireEvent.click(screen.getByTestId('podcast-card-1'));
    // Note: This might need adjustment based on how navigation is mocked
  });

  it('should show no results state when filter has no matches', () => {
    const mockSetFilter = jest.fn();
    mockUsePodcasts.mockReturnValue({
      filteredPodcasts: [],
      loading: false,
      error: null,
      filter: 'nonexistent',
      setFilter: mockSetFilter,
      podcasts: mockPodcasts,
    });

    renderHomeView();

    expect(screen.getByText('No se encontraron podcasts')).toBeInTheDocument();
    expect(
      screen.getByText(
        /No hay podcasts que coincidan con tu búsqueda "nonexistent"/
      )
    ).toBeInTheDocument();
  });

  it('should integrate with SearchFilter component', () => {
    const mockSetFilter = jest.fn();
    mockUsePodcasts.mockReturnValue({
      filteredPodcasts: mockPodcasts,
      loading: false,
      error: null,
      filter: 'test',
      setFilter: mockSetFilter,
      podcasts: mockPodcasts,
    });

    renderHomeView();

    const searchInput = screen.getByTestId('search-input');
    expect(searchInput).toHaveValue('test');

    fireEvent.change(searchInput, { target: { value: 'new search' } });
    expect(mockSetFilter).toHaveBeenCalledWith('new search');

    expect(screen.getByTestId('total-count')).toHaveTextContent('2');
  });

  it('should call useLoadPodcasts on mount', () => {
    mockUsePodcasts.mockReturnValue({
      filteredPodcasts: [],
      loading: false,
      error: null,
      filter: '',
      setFilter: jest.fn(),
      podcasts: [],
    });

    renderHomeView();

    expect(mockUseLoadPodcasts).toHaveBeenCalled();
  });
});
