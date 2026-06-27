import { TMDB_GENRE_MAP } from './tmdb.js';

// Questions definition — used for both the questionnaire and filtering
export const QUESTIONS = [
  {
    id: 'vibe',
    label: 'What vibe are you chasing tonight?',
    emoji: '🌙',
    type: 'single',
    options: [
      { value: 'celebration', label: 'Celebration', sub: 'A little sparkle and release' },
      { value: 'cozy', label: 'Cozy', sub: 'Warm, low-stress, comforting' },
      { value: 'escape', label: 'Need to escape', sub: 'Get lost in something bigger' },
      { value: 'open', label: 'Emotionally open', sub: 'Ready for something real' },
      { value: 'any', label: "I don't care", sub: 'Anything is fine' },
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
      { value: 'inspired', label: 'Inspired', sub: 'Moved and uplifted' },
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
      { value: 'any', label: "I don't care", sub: 'Same either way' },
    ],
  },
  {
    id: 'runtime',
    label: 'What runtime fits tonight?',
    emoji: '⏱️',
    type: 'single',
    options: [
      { value: '90', label: 'Up to 90', sub: 'Quick and focused' },
      { value: '90-120', label: 'Up to 120', sub: 'A comfortable middle' },
      { value: '120', label: '120+', sub: 'Give it room to breathe' },
      { value: 'any', label: "I don't care", sub: 'Surprise me' },
    ],
  },
  {
    id: 'format',
    label: 'Animated, live action, or either?',
    emoji: '🎬',
    type: 'single',
    options: [
      { value: 'animated', label: 'Animated', sub: 'Bright and imaginative' },
      { value: 'live-action', label: 'Live action', sub: 'Grounded and real' },
      { value: 'any', label: 'Either works', sub: 'No preference' },
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
  inspired: ['drama', 'documentary', 'music', 'history', 'science_fiction', 'fantasy', 'adventure'],
  unsettled: ['thriller', 'horror', 'mystery', 'crime', 'drama'],
  light: ['comedy', 'family', 'animation', 'romance', 'adventure'],
  edge: ['thriller', 'crime', 'mystery', 'drama', 'action'],
  dark: ['horror', 'thriller', 'crime', 'drama', 'mystery'],
  any: [],
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
    let mapped = null;
    if (typeof id === 'number') {
      mapped = TMDB_GENRE_MAP[id] || null;
    } else if (typeof id === 'string') {
      mapped = TMDB_GENRE_MAP[Number(id)] || id.toLowerCase();
    }
    if (mapped && !seen.has(mapped)) {
      seen.add(mapped);
      values.push(mapped);
    }
  }

  return values;
}

const DARK_GENRES = ['horror', 'thriller', 'crime', 'mystery'];
const DARKNESS_REQUIRED = {
  edge: ['thriller', 'crime', 'mystery', 'action', 'drama'],
  dark: ['horror', 'thriller', 'crime', 'mystery', 'drama'],
};

function getMovieFormat(movie) {
  if (movie?.format === 'animated' || movie?.format === 'live-action') {
    return movie.format;
  }

  if (typeof movie?.isAnimated === 'boolean') {
    return movie.isAnimated ? 'animated' : 'live-action';
  }

  const genres = getMovieGenres(movie);
  if (genres.includes('animation')) {
    return 'animated';
  }

  return 'live-action';
}

function intersects(genres, hints) {
  return genres.some(genre => hints.includes(genre));
}

function hasGenreData(movie) {
  return getMovieGenres(movie).length > 0;
}

function isRuntimeMatch(movie, runtime) {
  if (!runtime || runtime === 'any') return true;
  if (!movie?.runtime) return false;
  const duration = Number(movie.runtime);
  if (Number.isNaN(duration)) return false;
  if (runtime === '90') return duration <= 90;
  if (runtime === '90-120') return duration >= 90 && duration <= 120;
  if (runtime === '120') return duration >= 120;
  return true;
}

function isFormatMatch(movie, format) {
  if (!format || format === 'any') return true;
  return getMovieFormat(movie) === format;
}

function isDarknessMatch(movie, darkness) {
  if (!darkness || darkness === 'any') return true;
  const genres = getMovieGenres(movie);
  if (genres.length === 0) return false;
  if (darkness === 'light') {
    return !intersects(genres, DARK_GENRES);
  }
  return intersects(genres, DARKNESS_REQUIRED[darkness] || []);
}

function isPreferenceMatch(movie, preference) {
  if (!preference || preference === 'any') return true;
  const genres = getMovieGenres(movie);
  if (genres.length === 0) return false;
  return intersects(genres, GENRE_HINTS[preference] || []);
}

function scoreMovie(movie, answers) {
  let score = 0;
  const genres = getMovieGenres(movie);

  const vibe = getAnswerValue(answers, ['vibe', 'mood']);
  const ending = getAnswerValue(answers, ['ending', 'feeling']);
  const darkness = getAnswerValue(answers, ['darkness', 'tone']);
  const runtime = getAnswerValue(answers, ['runtime']);
  const format = getAnswerValue(answers, ['format']);

  if (vibe && genres.length > 0 && intersects(genres, GENRE_HINTS[vibe] || [])) score += 5;
  if (ending && genres.length > 0 && intersects(genres, GENRE_HINTS[ending] || [])) score += 4;
  if (darkness && darkness !== 'any' && genres.length > 0 && intersects(genres, GENRE_HINTS[darkness] || [])) score += 3;
  if (darkness === 'light' && genres.length > 0 && !intersects(genres, DARK_GENRES)) score += 1;
  if (runtime === '90' && movie.runtime) {
    if (movie.runtime <= 90) score += 4;
    else if (movie.runtime <= 120) score += 1;
  }
  if (runtime === '90-120' && movie.runtime) {
    if (movie.runtime >= 90 && movie.runtime <= 120) score += 4;
    else if (movie.runtime < 90) score += 1;
  }
  if (runtime === '120' && movie.runtime) {
    if (movie.runtime >= 120) score += 4;
    else if (movie.runtime >= 90) score += 1;
  }
  if (format && format !== 'any') {
    const movieFormat = getMovieFormat(movie);
    if (format === movieFormat) score += 4;
  }
  if (movie.voteAverage) score += Math.max(0, Math.round(movie.voteAverage / 2));

  return score;
}

function isHardMatch(movie, answers) {
  const format = getAnswerValue(answers, ['format']);
  const runtime = getAnswerValue(answers, ['runtime']);
  const darkness = getAnswerValue(answers, ['darkness', 'tone']);
  const vibe = getAnswerValue(answers, ['vibe', 'mood']);
  const ending = getAnswerValue(answers, ['ending', 'feeling']);

  return (
    isFormatMatch(movie, format) &&
    isRuntimeMatch(movie, runtime) &&
    isDarknessMatch(movie, darkness) &&
    isPreferenceMatch(movie, vibe) &&
    isPreferenceMatch(movie, ending)
  );
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

  const strictMatches = pool.filter(movie => isHardMatch(movie, answers));
  const sorted = (strictMatches.length > 0 ? strictMatches : pool)
    .map(movie => ({ movie, score: scoreMovie(movie, answers) }))
    .sort((a, b) => b.score - a.score)
    .map(({ movie }) => movie);

  return sorted;
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
