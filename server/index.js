import http from 'node:http';
import { URL } from 'node:url';

const PORT = Number(process.env.PORT || 3001);
const MAX_RETRIES = 3;
const RETRY_STATUSES = new Set([403, 429, 503, 520, 521, 522]);
const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

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
    if (typeof code === 'string') {
      if (code.startsWith('#x')) {
        const num = parseInt(code.slice(2), 16);
        return Number.isNaN(num) ? match : String.fromCodePoint(num);
      }
      if (code.startsWith('#')) {
        const num = parseInt(code.slice(1), 10);
        return Number.isNaN(num) ? match : String.fromCodePoint(num);
      }
    }
    return match;
  });
}

async function fetchPage(url) {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt += 1) {
    try {
      const res = await fetch(url, {
        headers: BROWSER_HEADERS,
        signal: AbortSignal.timeout(12000),
      });

      if (res.ok) {
        return await res.text();
      }

      if (RETRY_STATUSES.has(res.status)) {
        await new Promise((resolve) => setTimeout(resolve, 1400 * (attempt + 1)));
        continue;
      }

      return null;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }

  return null;
}

function getPageCount(html) {
  const matches = [...html.matchAll(/<li[^>]*class="[^"]*paginate-page[^"]*"[^>]*>[\s\S]*?<a[^>]*>([\d,]+)<\/a>/gi)];
  if (matches.length === 0) return 1;
  const last = matches[matches.length - 1]?.[1]?.replace(/,/g, '');
  const parsed = last ? parseInt(last, 10) : NaN;
  return Number.isNaN(parsed) ? 1 : parsed;
}

function parseWatchlistPage(html) {
  const films = [];
  const seen = new Set();
  const tagRegex = /<div[^>]*class="[^"]*react-component[^"]*"[^>]*>/gi;
  let match;

  while ((match = tagRegex.exec(html))) {
    const tag = match[0];
    const nameMatch = /data-item-name="([^"]*)"/i.exec(tag)
      || /data-item-full-display-name="([^"]*)"/i.exec(tag)
      || /data-film-name="([^"]*)"/i.exec(tag);
    const slugMatch = /data-item-slug="([^"]*)"/i.exec(tag)
      || /data-film-slug="([^"]*)"/i.exec(tag)
      || /href="\/film\/([^/\"]+)\//i.exec(tag);

    if (!nameMatch || !slugMatch) continue;

    const rawName = decodeHtml(nameMatch[1]).trim();
    const slug = decodeHtml(slugMatch[1]).trim();
    if (!rawName || !slug || seen.has(slug)) continue;

    seen.add(slug);
    const yearMatch = rawName.match(/\((\d{4})\)\s*$/);
    const year = yearMatch ? parseInt(yearMatch[1], 10) : null;
    const title = rawName.replace(/\s*\(\d{4}\)\s*$/, '').trim();

    films.push({
      id: slug,
      title,
      year,
      poster: null,
      link: `https://letterboxd.com/film/${slug}/`,
    });
  }

  return films;
}

async function scrapeWatchlist(username) {
  const normalized = username.trim().replace(/^@/, '');
  const firstPageUrl = `https://letterboxd.com/${normalized}/watchlist/`;
  const firstHtml = await fetchPage(firstPageUrl);

  if (!firstHtml) {
    return { username: normalized, movies: [], error: `Could not fetch watchlist for '${normalized}'.` };
  }

  const bodyClass = /<body[^>]*class="([^"]*)"/i.exec(firstHtml)?.[1] || '';
  if (bodyClass.includes('error')) {
    return { username: normalized, movies: [], error: `User '${normalized}' not found on Letterboxd.` };
  }

  const numPages = getPageCount(firstHtml);
  const movies = parseWatchlistPage(firstHtml);

  for (let page = 2; page <= numPages; page += 1) {
    const pageUrl = `https://letterboxd.com/${normalized}/watchlist/page/${page}/`;
    const pageHtml = await fetchPage(pageUrl);
    if (pageHtml) {
      movies.push(...parseWatchlistPage(pageHtml));
    }
  }

  const uniqueMovies = Array.from(new Map(movies.map((movie) => [movie.id, movie])).values());
  return { username: normalized, movies: uniqueMovies };
}

const rooms = new Map();

function generateRoomId() {
  return Math.random().toString(36).substring(2, 8);
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(JSON.stringify(payload));
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '', `http://${req.headers.host}`);

    if (req.method === 'GET' && url.pathname === '/api/watchlist') {
      const username = url.searchParams.get('username')?.trim();
      if (!username) {
        sendJson(res, 400, { error: 'Missing username query parameter.' });
        return;
      }

      const result = await scrapeWatchlist(username);
      if (result.error) {
        sendJson(res, 404, { error: result.error });
        return;
      }

      sendJson(res, 200, { movies: result.movies, count: result.movies.length });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/room') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const { setup, p1Swipes } = JSON.parse(body);
          const roomId = generateRoomId();
          rooms.set(roomId, { setup, p1Swipes, timestamp: Date.now() });
          sendJson(res, 200, { roomId });
        } catch {
          sendJson(res, 400, { error: 'Invalid request' });
        }
      });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/room') {
      const roomId = url.searchParams.get('id');
      if (!roomId) {
        sendJson(res, 400, { error: 'Missing room ID' });
        return;
      }

      const room = rooms.get(roomId);
      if (!room) {
        sendJson(res, 404, { error: 'Room not found' });
        return;
      }

      sendJson(res, 200, room);
      return;
    }

    sendJson(res, 404, { error: 'Not found.' });
  } catch (error) {
    sendJson(res, 500, { error: 'Server error while retrieving watchlist.' });
    console.error(error);
  }
});

server.listen(PORT, () => {
  console.log(`Watchlist API server listening on http://localhost:${PORT}`);
});
