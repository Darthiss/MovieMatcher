// Questions definition — used for both the questionnaire and filtering
export const QUESTIONS = [
  {
    id: 'vibe',
    label: 'How does tonight feel?',
    emoji: '🌙',
    type: 'single',
    options: [
      { value: 'celebration', label: 'Celebration', sub: 'A little sparkle and release' },
      { value: 'cozy', label: 'Cozy', sub: 'Warm, low-stress, comforting' },
      { value: 'escape', label: 'Need to escape', sub: 'Get lost in something bigger' },
      { value: 'open', label: 'Emotionally open', sub: 'Ready for something real' },
    ],
  },
  {
    id: 'ending',
    label: 'What do you want to feel by the end?',
    emoji: '✨',
    type: 'single',
    options: [
      { value: 'laughed', label: 'Laughed', sub: 'Light and silly' },
      { value: 'cried', label: 'Cried', sub: 'Let it hit' },
      { value: 'thrilled', label: 'Thrilled', sub: 'Heart racing' },
      { value: 'awe', label: 'In awe', sub: 'Big, beautiful, transcendent' },
      { value: 'unsettled', label: 'Unsettled', sub: 'A little haunted or weird' },
    ],
  },
  {
    id: 'darkness',
    label: 'How dark can it go?',
    emoji: '🌑',
    type: 'single',
    options: [
      { value: 'light', label: 'Keep it light', sub: 'Bright and breezy' },
      { value: 'edge', label: 'Some edge okay', sub: 'Tension is welcome' },
      { value: 'dark', label: 'Bring the darkness', sub: 'Go all in' },
    ],
  },
  {
    id: 'scale',
    label: 'What scale appeals to you?',
    emoji: '🎭',
    type: 'single',
    options: [
      { value: 'indie', label: 'Indie', sub: 'Small, intimate, personal' },
      { value: 'mid', label: 'Mid-budget', sub: 'Solid storytelling' },
      { value: 'blockbuster', label: 'Blockbuster', sub: 'Big spectacle and action' },
      { value: 'any', label: 'Any scale', sub: 'Surprise me' },
    ],
  },
  {
    id: 'originality',
    label: 'Original idea or familiar story?',
    emoji: '💡',
    type: 'single',
    options: [
      { value: 'original', label: 'Original concept', sub: 'Fresh and inventive' },
      { value: 'adaptation', label: 'Adaptation/sequel', sub: 'Known universe' },
      { value: 'either', label: 'Either works', sub: 'No preference' },
    ],
  },
  {
    id: 'romance',
    label: 'How much romance?',
    emoji: '💕',
    type: 'single',
    options: [
      { value: 'none', label: 'None', sub: 'Skip the love plot' },
      { value: 'subplot', label: 'Subplot', sub: 'Secondary but sweet' },
      { value: 'central', label: 'Central', sub: 'Love is the story' },
    ],
  },
  {
    id: 'era',
    label: 'Any preference on film era?',
    emoji: '📽',
    type: 'single',
    options: [
      { value: 'classic', label: 'Classic', sub: 'Before 1980' },
      { value: 'modern', label: 'Modern', sub: '1980–2009' },
      { value: 'recent', label: 'Recent', sub: '2010 onward' },
      { value: 'any', label: 'No preference', sub: '' },
    ],
  },
];

const GENRE_HINTS = {
  celebration: ['comedy', 'family', 'animation', 'adventure', 'music'],
  cozy: ['romance', 'family', 'animation', 'comedy', 'drama'],
  escape: ['adventure', 'science_fiction', 'fantasy', 'action', 'animation'],
  open: ['drama', 'romance', 'music', 'documentary', 'history'],
  laughed: ['comedy', 'animation', 'family', 'music'],
  cried: ['drama', 'romance', 'music', 'family'],
  thrilled: ['action', 'adventure', 'thriller', 'science_fiction'],
  awe: ['science_fiction', 'fantasy', 'documentary', 'adventure', 'animation'],
  unsettled: ['thriller', 'horror', 'mystery', 'crime', 'drama'],
  light: ['comedy', 'family', 'animation', 'romance', 'adventure'],
  edge: ['thriller', 'crime', 'mystery', 'drama', 'action'],
  dark: ['horror', 'thriller', 'crime', 'drama', 'mystery'],
  indie: ['drama', 'documentary', 'music', 'history'],
  mid: ['drama', 'thriller', 'romance', 'action', 'comedy'],
  blockbuster: ['action', 'adventure', 'science_fiction', 'fantasy'],
  original: ['science_fiction', 'fantasy', 'documentary', 'drama'],
  adaptation: ['action', 'adventure', 'fantasy', 'comedy'],
  none: ['action', 'thriller', 'adventure', 'horror', 'documentary'],
  subplot: ['drama', 'comedy', 'adventure', 'animation'],
  central: ['romance', 'drama', 'comedy', 'music'],
  classic: ['drama', 'comedy', 'documentary', 'history'],
  modern: ['thriller', 'drama', 'action', 'comedy', 'romance'],
  recent: ['science_fiction', 'action', 'horror', 'thriller'],
};


function getAnswerValue(answers, keys) {
  for (const key of keys) {
    const value = answers?.[key];
    if (value) return value;
  }
  return null;
}

function normalizeGenreValue(genre) {
  if (!genre) return null;
  if (typeof genre === 'string') return genre.toLowerCase();
  if (typeof genre === 'object') {
    return genre.name?.toLowerCase() || genre?.toString?.().toLowerCase() || null;
  }
  return null;
}

function getMovieGenres(movie) {
  const values = [];
  const seen = new Set();

  const fromArray = Array.isArray(movie?.genres) ? movie.genres : [];
  for (const entry of fromArray) {
    const normalized = normalizeGenreValue(entry);
    if (normalized && !seen.has(normalized)) {
      seen.add(normalized);
      values.push(normalized);
    }
  }

  const fromIds = Array.isArray(movie?.genreIds) ? movie.genreIds : [];
  for (const id of fromIds) {
    const mapped = typeof id === 'string' ? id.toLowerCase() : null;
    if (mapped && !seen.has(mapped)) {
      seen.add(mapped);
      values.push(mapped);
    }
  }

  return values;
}

function intersects(genres, hints) {
  return genres.some(genre => hints.includes(genre));
}

function scoreMovie(movie, answers) {
  let score = 0;
  const genres = getMovieGenres(movie);

  const vibe = getAnswerValue(answers, ['vibe', 'mood']);
  const ending = getAnswerValue(answers, ['ending', 'feeling']);
  const attention = getAnswerValue(answers, ['attention', 'focus']);
  const darkness = getAnswerValue(answers, ['darkness', 'tone']);

  if (vibe && genres.length > 0 && intersects(genres, GENRE_HINTS[vibe] || [])) score += 3;
  if (ending && genres.length > 0 && intersects(genres, GENRE_HINTS[ending] || [])) score += 3;
  if (attention === 'full' && movie.runtime && movie.runtime >= 100) score += 2;
  if (attention === 'half' && movie.runtime && movie.runtime <= 120) score += 2;
  if (attention === 'sleep' && movie.runtime && movie.runtime <= 100) score += 2;
  if (darkness && genres.length > 0 && intersects(genres, GENRE_HINTS[darkness] || [])) score += 2;
  if (darkness === 'light' && genres.length > 0 && !intersects(genres, ['horror', 'thriller', 'crime', 'mystery'])) score += 1;
  if (movie.voteAverage) score += Math.max(0, Math.round(movie.voteAverage / 2));

  return score;
}

export function filterMoviesByAnswers(movies, answers) {
  let pool = [...movies];

  if (answers?.era && answers.era !== 'any') {
    pool = pool.filter(m => {
      if (!m.year) return true;
      if (answers.era === 'classic') return m.year < 1980;
      if (answers.era === 'modern') return m.year >= 1980 && m.year < 2010;
      if (answers.era === 'recent') return m.year >= 2010;
      return true;
    });
  }

  return pool
    .map(movie => ({ movie, score: scoreMovie(movie, answers) }))
    .sort((a, b) => b.score - a.score)
    .map(({ movie }) => movie);
}

export function mergeAnswers(a1, a2) {
  const merged = {};

  QUESTIONS.forEach(q => {
    if (q.type === 'single') {
      if (!a1[q.id] || !a2[q.id]) {
        merged[q.id] = a1[q.id] || a2[q.id] || 'any';
      } else if (a1[q.id] === a2[q.id]) {
        merged[q.id] = a1[q.id];
      } else if (a1[q.id] === 'any') {
        merged[q.id] = a2[q.id];
      } else if (a2[q.id] === 'any') {
        merged[q.id] = a1[q.id];
      } else {
        merged[q.id] = 'any';
      }
    } else if (q.type === 'multi') {
      const g1 = a1[q.id] || [];
      const g2 = a2[q.id] || [];
      if (g1.includes('any') || g2.includes('any') || g1.length === 0 || g2.length === 0) {
        merged[q.id] = ['any'];
      } else {
        const intersection = g1.filter(v => g2.includes(v));
        merged[q.id] = intersection.length > 0 ? intersection : [...new Set([...g1, ...g2])];
      }
    }
  });

  return merged;
}

export function findMatches(movies, p1Swipes, p2Swipes) {
  return movies.filter(m => p1Swipes[m.id] === 'yes' && p2Swipes[m.id] === 'yes');
}

export function pickWinner(matches) {
  if (matches.length === 0) return null;
  return matches[Math.floor(Math.random() * matches.length)];
}
