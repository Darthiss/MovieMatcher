// Zero-backend room system using URL encoding
// Flow: P1 sets up → answers filters → gets shareable URL → P2 opens URL → answers filters → match

export function encodeRoomSetup(setup) {
  const json = JSON.stringify(setup);
  return btoa(unescape(encodeURIComponent(json)));
}

export function decodeRoomSetup(encoded) {
  try {
    const json = decodeURIComponent(escape(atob(encoded)));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function encodeSwipes(swipes) {
  // swipes: { [movieId]: 'yes' | 'no' }
  const yesIds = Object.entries(swipes)
    .filter(([, v]) => v === 'yes')
    .map(([k]) => k);
  const json = JSON.stringify(yesIds);
  return btoa(unescape(encodeURIComponent(json)));
}

export function decodeSwipes(encoded) {
  try {
    const json = decodeURIComponent(escape(atob(encoded)));
    const yesIds = JSON.parse(json);
    const swipes = {};
    yesIds.forEach(id => { swipes[id] = 'yes'; });
    return swipes;
  } catch {
    return {};
  }
}

export function buildShareUrl(setup, p1Swipes) {
  const base = window.location.origin + window.location.pathname;
  const params = new URLSearchParams();
  params.set('room', encodeRoomSetup(setup));
  params.set('p1', encodeSwipes(p1Swipes));
  return `${base}?${params.toString()}`;
}

export function parseUrlState() {
  const params = new URLSearchParams(window.location.search);
  const room = params.get('room');
  const p1 = params.get('p1');

  if (!room) return { mode: 'setup' };

  const setup = decodeRoomSetup(room);
  if (!setup) return { mode: 'setup' };

  if (!p1) return { mode: 'p1-swipe', setup };

  const p1Swipes = decodeSwipes(p1);
  return { mode: 'p2-swipe', setup, p1Swipes };
}
