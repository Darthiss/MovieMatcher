// Room system using server storage (avoids huge URLs)
// Flow: P1 sets up → answers → stores room on backend → gets short URL with roomId → P2 opens → retrieves room → answers → match

const API_BASE = '/api/room';

export async function buildShareUrl(setup, p1Swipes) {
  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ setup, p1Swipes }),
    });
    const { roomId, error } = await res.json();
    if (error) throw new Error(error);
    const base = window.location.origin + window.location.pathname;
    return `${base}?room=${roomId}`;
  } catch (err) {
    console.error('Failed to create room:', err);
    throw err;
  }
}

export async function parseUrlState() {
  const params = new URLSearchParams(window.location.search);
  const roomId = params.get('room');

  if (!roomId) return { mode: 'setup' };

  try {
    const res = await fetch(`${API_BASE}?id=${roomId}`);
    if (!res.ok) return { mode: 'setup' };
    const { setup, p1Swipes, error } = await res.json();
    if (error) return { mode: 'setup' };
    return { mode: 'p2-swipe', setup, p1Swipes };
  } catch {
    return { mode: 'setup' };
  }
}
