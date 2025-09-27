import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import EpisodeList from '../EpisodeList';

// Mock data
const mockEpisodes = [
  {
    id: 'episode-1',
    title: 'First Episode',
    description: 'Description of the first episode',
    releaseDate: '2024-01-01T10:00:00Z',
    duration: 1800000, // 30 minutes in milliseconds
    audioUrl: 'https://example.com/audio1.mp3',
    episodeUrl: 'https://example.com/episode1',
  },
  {
    id: 'episode-2',
    title: 'Second Episode',
    description: 'Description of the second episode',
    releaseDate: '2024-01-15T14:30:00Z',
    duration: 2700000, // 45 minutes in milliseconds
    audioUrl: 'https://example.com/audio2.mp3',
    episodeUrl: 'https://example.com/episode2',
  },
  {
    id: 'episode-3',
    title:
      'Episode with Very Long Title That Should Be Handled Properly by the Component',
    description: 'Description of the third episode',
    releaseDate: '2024-02-01T09:15:00Z',
    duration: 3600000, // 60 minutes in milliseconds
    audioUrl: 'https://example.com/audio3.mp3',
    episodeUrl: 'https://example.com/episode3',
  },
];

// Mock de useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Helper para renderizar con Router
const renderEpisodeList = (
  episodes = mockEpisodes,
  onEpisodeClick = jest.fn()
) => {
  return render(
    <BrowserRouter>
      <EpisodeList episodes={episodes} onEpisodeClick={onEpisodeClick} />
    </BrowserRouter>
  );
};

describe('EpisodeList', () => {
  const mockOnEpisodeClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render episode list with correct header', () => {
    renderEpisodeList(mockEpisodes, mockOnEpisodeClick);

    expect(screen.getByText('Episodes: 3')).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('should render table headers correctly', () => {
    renderEpisodeList(mockEpisodes, mockOnEpisodeClick);

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Length')).toBeInTheDocument();
  });

  it('should render all episodes with correct information', () => {
    renderEpisodeList(mockEpisodes, mockOnEpisodeClick);

    // Verificar títulos
    expect(screen.getByText('First Episode')).toBeInTheDocument();
    expect(screen.getByText('Second Episode')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Episode with Very Long Title That Should Be Handled Properly by the Component'
      )
    ).toBeInTheDocument();

    // Verificar fechas formateadas
    expect(screen.getByText('01/01/2024')).toBeInTheDocument();
    expect(screen.getByText('15/01/2024')).toBeInTheDocument();
    expect(screen.getByText('01/02/2024')).toBeInTheDocument();

    // Verificar duraciones formateadas
    expect(screen.getByText('30:00')).toBeInTheDocument();
    expect(screen.getByText('45:00')).toBeInTheDocument();
    expect(screen.getByText('60:00')).toBeInTheDocument();
  });

  it('should call onEpisodeClick when row is clicked', () => {
    renderEpisodeList(mockEpisodes, mockOnEpisodeClick);

    const firstRow = screen.getByText('First Episode').closest('tr');
    fireEvent.click(firstRow!);

    expect(mockOnEpisodeClick).toHaveBeenCalledWith(mockEpisodes[0]);
  });

  it('should call onEpisodeClick when title button is clicked', () => {
    renderEpisodeList(mockEpisodes, mockOnEpisodeClick);

    const titleButton = screen.getByRole('button', { name: 'First Episode' });
    fireEvent.click(titleButton);

    expect(mockOnEpisodeClick).toHaveBeenCalledWith(mockEpisodes[0]);
  });

  it('should handle empty episode list', () => {
    renderEpisodeList([], mockOnEpisodeClick);

    expect(screen.getByText('Episodes: 0')).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();

    // Verificar que no hay filas de episodios
    const tableBody = screen.getByRole('table').querySelector('tbody');
    expect(tableBody?.children).toHaveLength(0);
  });

  it('should format duration correctly for different values', () => {
    const episodesWithDifferentDurations = [
      {
        ...mockEpisodes[0],
        id: 'short',
        duration: 65000, // 1:05
      },
      {
        ...mockEpisodes[0],
        id: 'zero',
        duration: 0, // N/A (porque !milliseconds incluye 0)
      },
      {
        ...mockEpisodes[0],
        id: 'undefined',
        duration: undefined as any, // N/A
      },
    ];

    renderEpisodeList(episodesWithDifferentDurations, mockOnEpisodeClick);

    expect(screen.getByText('1:05')).toBeInTheDocument();
    // Tanto duration 0 como undefined devuelven 'N/A'
    const naElements = screen.getAllByText('N/A');
    expect(naElements).toHaveLength(2);
  });

  it('should have correct CSS classes and accessibility', () => {
    renderEpisodeList(mockEpisodes, mockOnEpisodeClick);

    const container = document.querySelector('.episode-list');
    const header = document.querySelector('.episode-list__header');
    const tableContainer = document.querySelector(
      '.episode-list__table-container'
    );
    const table = document.querySelector('.episode-list__table');

    expect(container).toBeInTheDocument();
    expect(header).toBeInTheDocument();
    expect(tableContainer).toBeInTheDocument();
    expect(table).toBeInTheDocument();

    // Verificar estructura de tabla accesible
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getAllByRole('columnheader')).toHaveLength(3);
    expect(screen.getAllByRole('row')).toHaveLength(4); // header + 3 episodes
  });

  it('should handle click events with stopPropagation', () => {
    renderEpisodeList(mockEpisodes, mockOnEpisodeClick);

    const titleButton = screen.getByRole('button', { name: 'First Episode' });
    const row = titleButton.closest('tr');

    // Simular click en el botón
    fireEvent.click(titleButton);
    expect(mockOnEpisodeClick).toHaveBeenCalledTimes(1);

    // Resetear mock
    mockOnEpisodeClick.mockClear();

    // Simular click en la fila
    fireEvent.click(row!);
    expect(mockOnEpisodeClick).toHaveBeenCalledTimes(1);
  });

  it('should render episode count dynamically', () => {
    const { rerender } = renderEpisodeList(
      [mockEpisodes[0]],
      mockOnEpisodeClick
    );
    expect(screen.getByText('Episodes: 1')).toBeInTheDocument();

    rerender(
      <BrowserRouter>
        <EpisodeList
          episodes={mockEpisodes}
          onEpisodeClick={mockOnEpisodeClick}
        />
      </BrowserRouter>
    );
    expect(screen.getByText('Episodes: 3')).toBeInTheDocument();
  });
});
