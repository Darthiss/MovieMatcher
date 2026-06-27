import { useState } from 'react';
import { fetchWatchlist } from '../utils/letterboxd';
import { enrichMoviesWithTmdb } from '../utils/tmdb';

export default function Setup({ onReady }) {
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | error | done
  const [error, setError] = useState('');
  const [movies, setMovies] = useState([]);
  const [count, setCount] = useState(0);

  async function handleFetch(e) {
    e.preventDefault();
    const u = username.trim().replace(/^@/, '');
    if (!u) return;
    setStatus('loading');
    setError('');
    try {
      const result = await fetchWatchlist(u);
      const enrichedResult = await enrichMoviesWithTmdb(result);
      setMovies(enrichedResult);
      setCount(enrichedResult.length);
      setStatus('done');
    } catch (err) {
      setStatus('error');
      setError(err.message);
    }
  }

  function handleStart() {
    onReady({ username: username.trim().replace(/^@/, ''), movies });
  }

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg)',
    }}>
      {/* Hero */}
      <div style={{
        padding: '48px 24px 32px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎬</div>
        <h1 style={{
          fontSize: 'clamp(28px, 7vw, 42px)',
          background: 'linear-gradient(135deg, var(--text) 30%, var(--accent))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: 10,
        }}>MovieMatch</h1>
        <p style={{
          color: 'var(--text-muted)',
          fontSize: 15,
          maxWidth: 340,
          margin: '0 auto',
          lineHeight: 1.6,
        }}>
          Pick a movie you'll both actually want to watch. From your Letterboxd watchlist and a mood-first TMDB match.
        </p>
      </div>

      {/* How it works */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        padding: '0 24px 32px',
        maxWidth: 420,
        margin: '0 auto',
        width: '100%',
      }}>
        {[
          ['1', 'Enter your Letterboxd username', 'We load your watchlist'],
          ['2', 'Answer a few preference questions', 'Mood, feeling, intensity...'],
          ['3', 'Swipe yes or no on movies', 'Quick & fun'],
          ['4', 'Share a link with your partner', 'They do it blind'],
          ['5', 'See what you both picked ♥', 'And pick a winner'],
        ].map(([n, title, sub]) => (
          <div key={n} style={{
            display: 'flex',
            gap: 16,
            padding: '14px 0',
            borderBottom: '1px solid var(--border)',
          }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'var(--bg3)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent)',
              fontSize: 13,
              fontWeight: 600,
              flexShrink: 0,
              marginTop: 2,
            }}>{n}</div>
            <div>
              <div style={{ color: 'var(--text)', fontSize: 14, fontWeight: 500 }}>{title}</div>
              <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>{sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Form */}
      <div style={{
        padding: '0 24px 48px',
        maxWidth: 420,
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}>
        <form onSubmit={handleFetch} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <label style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 500 }}>
            Letterboxd username
          </label>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              value={username}
              onChange={e => { setUsername(e.target.value); setStatus('idle'); }}
              placeholder="e.g. darthiss"
              style={{
                flex: 1,
                background: 'var(--bg2)',
                border: '1.5px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '13px 16px',
                color: 'var(--text)',
                fontSize: 15,
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
              autoCapitalize="none"
              autoCorrect="off"
            />
            <button
              type="submit"
              disabled={!username.trim() || status === 'loading'}
              style={{
                background: 'var(--bg3)',
                border: '1.5px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '0 18px',
                color: status === 'loading' ? 'var(--text-dim)' : 'var(--text)',
                fontSize: 14,
                fontWeight: 500,
                cursor: username.trim() ? 'pointer' : 'not-allowed',
                whiteSpace: 'nowrap',
              }}
            >
              {status === 'loading' ? '...' : 'Load'}
            </button>
          </div>
        </form>

        {status === 'loading' && (
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: '14px 16px',
            color: 'var(--text-muted)',
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
            Fetching your watchlist and matching the vibe…
          </div>
        )}

        {status === 'error' && (
          <div style={{
            background: 'rgba(224,92,92,0.08)',
            border: '1px solid rgba(224,92,92,0.3)',
            borderRadius: 'var(--radius-sm)',
            padding: '14px 16px',
            color: 'var(--no)',
            fontSize: 14,
            lineHeight: 1.5,
          }}>
            ⚠ {error}
            <div style={{ color: 'var(--text-dim)', marginTop: 4, fontSize: 13 }}>
              Make sure your Letterboxd profile and watchlist are set to public.
            </div>
          </div>
        )}

        {status === 'done' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{
              background: 'rgba(76,175,130,0.08)',
              border: '1px solid rgba(76,175,130,0.25)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px 16px',
              color: 'var(--yes)',
              fontSize: 14,
            }}>
              ✓ Found {count} movies in your watchlist
            </div>
            <button
              onClick={handleStart}
              style={{
                background: 'var(--accent)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                padding: '16px',
                color: '#0e0e11',
                fontWeight: 700,
                fontSize: 16,
                cursor: 'pointer',
                letterSpacing: 0.3,
              }}
            >
              Start → Answer questions
            </button>
          </div>
        )}

        <p style={{ color: 'var(--text-dim)', fontSize: 12, textAlign: 'center', marginTop: 4 }}>
          Your watchlist must be public. We never store any data.
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
