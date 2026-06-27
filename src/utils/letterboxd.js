const API_BASE = '/api';

function decodeHtml(input) {
  return input.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, code) => {
    const named = {
      amp: '&',
      lt: '<',
      gt: '>',
      quot: '"',
      apos: "'",
    };
    if (code in named) return named[code];
    if (typeof code === 'string' && code.startsWith('#x')) {
      const num = parseInt(code.slice(2), 16);
      return Number.isNaN(num) ? match : String.fromCodePoint(num);
    }
    if (typeof code === 'string' && code.startsWith('#')) {
      const num = parseInt(code.slice(1), 10);
      return Number.isNaN(num) ? match : String.fromCodePoint(num);
    }
    return match;
  });
}

export async function fetchWatchlist(username) {
  const res = await fetch(`${API_BASE}/watchlist?username=${encodeURIComponent(username)}`, {
    signal: AbortSignal.timeout(14000),
  });

  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.error || 'Network error fetching watchlist');
  }

  const json = await res.json();
  if (!Array.isArray(json.movies) || json.movies.length === 0) {
    throw new Error(json.error || 'No movies found in watchlist.');
  }

  return json.movies;
}
