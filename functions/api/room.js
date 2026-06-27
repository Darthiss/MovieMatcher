/**
 * Simple in-memory room storage for MovieMatcher
 * Note: Persists for ~24 hours depending on Cloudflare Workers runtime
 * For production durability, consider using Cloudflare KV or D1
 */

const rooms = new Map();

// Generate a short random room ID
function generateRoomId() {
  return Math.random().toString(36).substring(2, 8);
}

// Store room data and return ID
export async function storeRoom(setup, p1Swipes) {
  const roomId = generateRoomId();
  rooms.set(roomId, { setup, p1Swipes, timestamp: Date.now() });
  return roomId;
}

// Retrieve room data by ID
export function getRoom(roomId) {
  return rooms.get(roomId) || null;
}

export async function onRequest(context) {
  const request = context.request;
  const url = new URL(request.url);

  if (request.method === 'POST') {
    try {
      const { setup, p1Swipes } = await request.json();
      const roomId = await storeRoom(setup, p1Swipes);
      return new Response(JSON.stringify({ roomId }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Invalid request' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  if (request.method === 'GET') {
    const roomId = url.searchParams.get('id');
    if (!roomId) {
      return new Response(JSON.stringify({ error: 'Missing room ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const room = getRoom(roomId);
    if (!room) {
      return new Response(JSON.stringify({ error: 'Room not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(room), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' },
  });
}
