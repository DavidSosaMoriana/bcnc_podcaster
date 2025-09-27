import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from '@/context/AppContext';
import PodcastDetailView from '../PodcastDetailView';
import { usePodcastDetail } from '@/hooks';

// Mock data
const mockPodcastDetail = {
  id: '1',
  name: 'Test Podcast 1',
  artist: 'Test Artist 1',
  image: 'https://example.com/image1.jpg',
  summary: 'Test summary 1',
  description: 'Full description',
  episodes: [
    {
      id: 'episode-1',
      title: 'Episode 1',
      description: 'First episode',
      releaseDate: '2024-01-01',
      duration: 1800000, // 30 minutes in milliseconds
      audioUrl: 'https://example.com/audio1.mp3',
      episodeUrl: 'https://example.com/episode1',
    },
  ],
};

// Mock de los hooks
jest.mock('@/hooks', () => ({
  usePodcastDetail: jest.fn(),
}));

// Mock de los componentes hijos
jest.mock('@/components/PodcastSidebar', () => {
  return function MockPodcastSidebar({ podcast }: { podcast: any }) {
    return <div data-testid="podcast-sidebar">Sidebar: {podcast.name}</div>;
  };
});

jest.mock('@/components/EpisodeList', () => {
  return function MockEpisodeList({
    episodes,
    onEpisodeClick,
  }: {
    episodes: any[];
    onEpisodeClick: any;
  }) {
    return (
      <div data-testid="episode-list">
        Episodes: {episodes.length}
        <button onClick={() => onEpisodeClick(episodes[0])}>
          Click Episode
        </button>
      </div>
    );
  };
});

jest.mock('@/components/LoadingSpinner', () => {
  return function MockLoadingSpinner({ size }: { size?: string }) {
    return <div data-testid="loading-spinner">Loading... ({size})</div>;
  };
});

// Mock de react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ podcastId: 'test-podcast-id' }),
  useNavigate: () => mockNavigate,
}));

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <AppProvider>
        <PodcastDetailView />
      </AppProvider>
    </BrowserRouter>
  );
};

describe('PodcastDetailView', () => {
  const mockUsePodcastDetail = usePodcastDetail as jest.MockedFunction<
    typeof usePodcastDetail
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state correctly', () => {
    mockUsePodcastDetail.mockReturnValue({
      podcast: null,
      loading: true,
      error: null,
    });

    renderComponent();

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText('Loading podcast...')).toBeInTheDocument();
    expect(screen.getByText('Loading... (large)')).toBeInTheDocument();
  });

  it('should render error state correctly', () => {
    const errorMessage = 'Failed to load podcast';
    mockUsePodcastDetail.mockReturnValue({
      podcast: null,
      loading: false,
      error: errorMessage,
    });

    renderComponent();

    expect(
      screen.getByText('There was an error loading the podcast')
    ).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.queryByTestId('podcast-sidebar')).not.toBeInTheDocument();
    expect(screen.queryByTestId('episode-list')).not.toBeInTheDocument();
  });

  it('should render not found state when podcast is null and no loading/error', () => {
    mockUsePodcastDetail.mockReturnValue({
      podcast: null,
      loading: false,
      error: null,
    });

    renderComponent();

    expect(screen.getByText('Podcast no encontrado')).toBeInTheDocument();
    expect(
      screen.getByText('El podcast que buscas no existe o no se pudo cargar.')
    ).toBeInTheDocument();
  });

  it('should render podcast detail successfully with sidebar and episode list', () => {
    mockUsePodcastDetail.mockReturnValue({
      podcast: mockPodcastDetail,
      loading: false,
      error: null,
    });

    renderComponent();

    expect(screen.getByTestId('podcast-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('episode-list')).toBeInTheDocument();
    expect(
      screen.getByText(`Sidebar: ${mockPodcastDetail.name}`)
    ).toBeInTheDocument();
    expect(
      screen.getByText(`Episodes: ${mockPodcastDetail.episodes.length}`)
    ).toBeInTheDocument();
  });

  it('should call navigate when episode is clicked', () => {
    mockUsePodcastDetail.mockReturnValue({
      podcast: mockPodcastDetail,
      loading: false,
      error: null,
    });

    renderComponent();

    const episodeButton = screen.getByText('Click Episode');
    episodeButton.click();

    expect(mockNavigate).toHaveBeenCalledWith(
      `/podcast/test-podcast-id/episode/${mockPodcastDetail.episodes[0].id}`
    );
  });

  it('should have correct CSS classes and structure', () => {
    mockUsePodcastDetail.mockReturnValue({
      podcast: mockPodcastDetail,
      loading: false,
      error: null,
    });

    renderComponent();

    const container = document.querySelector('.podcast-detail-view');
    const layout = document.querySelector('.podcast-detail-view__layout');
    const main = document.querySelector('.podcast-detail-view__main');

    expect(container).toBeInTheDocument();
    expect(layout).toBeInTheDocument();
    expect(main).toBeInTheDocument();
  });

  it('should use correct podcast ID from URL params', () => {
    mockUsePodcastDetail.mockReturnValue({
      podcast: mockPodcastDetail,
      loading: false,
      error: null,
    });

    renderComponent();

    expect(mockUsePodcastDetail).toHaveBeenCalledWith('test-podcast-id');
  });
});
