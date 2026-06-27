const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_GENRE_MAP = {
  28: 'action',
  12: 'adventure',
  35: 'comedy',
  18: 'drama',
  27: 'horror',
  878: 'science_fiction',
  10749: 'romance',
  16: 'animation',
  99: 'documentary',
  53: 'thriller',
  9648: 'mystery',
  80: 'crime',
  14: 'fantasy',
  10402: 'music',
  36: 'history',
  10751: 'family',
};

function normalizeMovieGenres(genreIds = [], genres = []) {
  const names = [];
  const seen = new Set();

  for (const genre of genres) {
    const value = typeof genre === 'string' ? genre.toLowerCase() : genre?.name?.toLowerCase();
    if (value && !seen.has(value)) {
      seen.add(value);
      names.push(value);
    }
  }

  for (const id of genreIds) {
    const mapped = TMDB_GENRE_MAP[id];
    if (mapped && !seen.has(mapped)) {
      seen.add(mapped);
      names.push(mapped);
    }
  }

  return names;
}

export async function enrichMoviesWithTmdb(movies) {
  const apiKey = import.meta.env?.VITE_TMDB_API_KEY;
  if (!apiKey || !Array.isArray(movies) || movies.length === 0) return movies;

  const results = await Promise.all(
    movies.map(async (movie) => {
      if (!movie?.title) return movie;

      try {
        const query = new URLSearchParams({
          api_key: apiKey,
          query: movie.title,
          include_adult: 'false',
          language: 'en-US',
        });

        if (movie.year) query.set('year', movie.year);

        const res = await fetch(`${TMDB_BASE_URL}/search/movie?${query.toString()}`, { signal: AbortSignal.timeout(8000) });
        if (!res.ok) return movie;

        const data = await res.json();
        const match = data.results?.[0];
        if (!match) return movie;

        return {
          ...movie,
          tmdbId: match.id,
          overview: match.overview || movie.overview || '',
          releaseDate: match.release_date || movie.releaseDate || '',
          voteAverage: match.vote_average ?? movie.voteAverage ?? null,
          runtime: match.runtime ?? movie.runtime ?? null,
          genres: normalizeMovieGenres(match.genre_ids || [], match.genres || []),
          genreIds: match.genre_ids || movie.genreIds || [],
          poster: movie.poster || (match.poster_path ? `https://image.tmdb.org/t/p/w500${match.poster_path}` : null),
        };
      } catch {
        return movie;
      }
    }),
  );

  return results;
}
