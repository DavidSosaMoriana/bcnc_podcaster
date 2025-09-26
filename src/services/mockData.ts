/**
 * Datos de prueba para testing sin dependencia de APIs externas
 */
export const mockPodcasts = [
  {
    id: '1535809341',
    name: 'The Joe Rogan Experience',
    artist: 'Joe Rogan',
    summary:
      'The Joe Rogan Experience podcast is one of the most popular podcasts in the world, featuring long-form conversations between comedian Joe Rogan and guests from all walks of life. Topics range from comedy, MMA, science, politics, philosophy, and everything in between.',
    image:
      'https://is1-ssl.mzstatic.com/image/thumb/Podcasts112/v4/1c/8d/59/1c8d59dc-6c1d-7de4-f723-9db8935bb8b5/mza_13607882851818636687.png/170x170bb.png',
    imageSmall:
      'https://is1-ssl.mzstatic.com/image/thumb/Podcasts112/v4/1c/8d/59/1c8d59dc-6c1d-7de4-f723-9db8935bb8b5/mza_13607882851818636687.png/55x55bb.png',
    imageLarge:
      'https://is1-ssl.mzstatic.com/image/thumb/Podcasts112/v4/1c/8d/59/1c8d59dc-6c1d-7de4-f723-9db8935bb8b5/mza_13607882851818636687.png/600x600bb.png',
  },
  {
    id: '1504193899',
    name: 'SmartLess',
    artist: 'Jason Bateman, Sean Hayes, Will Arnett',
    summary:
      'SmartLess with Jason Bateman, Sean Hayes, & Will Arnett is a podcast that connects and unites people from all walks of life to learn about shared experiences through thoughtful dialogue and organic hilarity.',
    image:
      'https://is1-ssl.mzstatic.com/image/thumb/Podcasts115/v4/6b/8c/66/6b8c6654-7a1d-5d45-c2d5-5c35f3007d91/mza_4755621436615776583.jpg/170x170bb.jpg',
    imageSmall:
      'https://is1-ssl.mzstatic.com/image/thumb/Podcasts115/v4/6b/8c/66/6b8c6654-7a1d-5d45-c2d5-5c35f3007d91/mza_4755621436615776583.jpg/55x55bb.jpg',
    imageLarge:
      'https://is1-ssl.mzstatic.com/image/thumb/Podcasts115/v4/6b/8c/66/6b8c6654-7a1d-5d45-c2d5-5c35f3007d91/mza_4755621436615776583.jpg/600x600bb.jpg',
  },
  {
    id: '1551382389',
    name: 'Huberman Lab',
    artist: 'Scicomm Media',
    summary:
      'Huberman Lab discusses neuroscience — how our nervous system works, how it can change through experience, and how to leverage that plasticity to improve our lives.',
    image:
      'https://is1-ssl.mzstatic.com/image/thumb/Podcasts115/v4/85/8f/d4/858fd44f-2ab2-4960-c525-8e8479559885/mza_4428363187515982650.jpg/170x170bb.jpg',
    imageSmall:
      'https://is1-ssl.mzstatic.com/image/thumb/Podcasts115/v4/85/8f/d4/858fd44f-2ab2-4960-c525-8e8479559885/mza_4428363187515982650.jpg/55x55bb.jpg',
    imageLarge:
      'https://is1-ssl.mzstatic.com/image/thumb/Podcasts115/v4/85/8f/d4/858fd44f-2ab2-4960-c525-8e8479559885/mza_4428363187515982650.jpg/600x600bb.jpg',
  },
];

export const mockEpisodes = [
  {
    id: '1000000001',
    title: 'Episode 1: Introduction',
    description:
      'En este episodio introductorio, exploramos los fundamentos de la música moderna y su impacto en la cultura contemporánea. Discutimos las tendencias actuales, los artistas emergentes y cómo la tecnología está transformando la industria musical.',
    releaseDate: '2024-09-20T10:00:00Z',
    duration: 5025000, // 01:23:45 en millisegundos
    audioUrl: 'https://archive.org/download/testmp3testfile/mpthreetest.mp3',
    episodeUrl: 'https://example.com/episode/1',
  },
  {
    id: '1000000002',
    title: 'Episode 2: Advanced Topics',
    description:
      'Profundizamos en temas más complejos de la producción musical, incluyendo técnicas de masterización, el uso de sintetizadores analógicos vs digitales, y el futuro de la distribución musical en plataformas streaming. Con invitados especiales de la industria.',
    releaseDate: '2024-09-19T15:30:00Z',
    duration: 8130000, // 02:15:30 en millisegundos
    audioUrl: 'https://archive.org/download/testmp3testfile/mpthreetest.mp3',
    episodeUrl: 'https://example.com/episode/2',
  },
];
