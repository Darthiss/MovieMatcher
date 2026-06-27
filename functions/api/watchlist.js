export async function onRequest(context) {
  const url = new URL(context.request.url);
  const username = url.searchParams.get('username')?.trim();

  if (!username) {
    return new Response(JSON.stringify({ error: 'Missing username query parameter.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const BROWSER_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
  };

  function decodeHtml(input) {
    return input.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, code) => {
      const named = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
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

  async function fetchPage(pageUrl) {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const res = await fetch(pageUrl, {
          headers: BROWSER_HEADERS,
          timeout: 12000,
        });
        if (res.ok) return await res.text();
        if ([403, 429, 503, 520, 521, 522].includes(res.status)) {
          await new Promise((r) => setTimeout(r, 1400 * (attempt + 1)));
          continue;
        }
        return null;
      } catch {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
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

  try {
    const normalized = username.replace(/^@/, '');
    const firstPageUrl = `https://letterboxd.com/${normalized}/watchlist/`;
    const firstHtml = await fetchPage(firstPageUrl);

    if (!firstHtml) {
      return new Response(JSON.stringify({ error: `Could not fetch watchlist for '${normalized}'.` }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const bodyClass = /<body[^>]*class="([^"]*)"/i.exec(firstHtml)?.[1] || '';
    if (bodyClass.includes('error')) {
      return new Response(JSON.stringify({ error: `User '${normalized}' not found on Letterboxd.` }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
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

    const uniqueMovies = Array.from(new Map(movies.map((m) => [m.id, m])).values());

    return new Response(JSON.stringify({ movies: uniqueMovies, count: uniqueMovies.length }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Server error while retrieving watchlist.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
