import { useState, useEffect } from 'react';
import { findMatches, pickWinner } from '../utils/filter';

const POSTER_PLACEHOLDER = (title) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(title)}&size=300&background=1e1e26&color=8b8a99&bold=true&length=2`;

export default function Results({ movies, p1Swipes, p2Swipes, onRestart }) {
  const matches = findMatches(movies, p1Swipes, p2Swipes);
  const [winner, setWinner] = useState(null);
  const [revealing, setRevealing] = useState(false);
  const [imgError, setImgError] = useState({});

  useEffect(() => {
    if (matches.length === 1) {
      setTimeout(() => setWinner(matches[0]), 600);
    }
  }, []);

  function rollWinner() {
    setRevealing(true);
    let spins = 0;
    const max = 12 + Math.floor(Math.random() * 8);
    let lastPick = null;
    const interval = setInterval(() => {
      spins++;
      lastPick = matches[Math.floor(Math.random() * matches.length)];
      setWinner(lastPick);
      if (spins >= max) {
        clearInterval(interval);
        setRevealing(false);
      }
    }, spins < 4 ? 80 : spins < 8 ? 120 : 200);
  }

  const noMatches = matches.length === 0;

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg)',
      padding: '32px 20px 48px',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>
          {noMatches ? '😬' : matches.length === 1 ? '🎯' : '🎬'}
        </div>
        <h1 style={{
          fontSize: 'clamp(22px, 5vw, 30px)',
          marginBottom: 8,
        }}>
          {noMatches ? 'No matches found' : `${matches.length} match${matches.length !== 1 ? 'es' : ''}!`}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
          {noMatches
            ? "You both have very different taste tonight 😄"
            : matches.length === 1
              ? "You both want to watch this one!"
              : "You both said yes to these — pick a winner!"}
        </p>
      </div>

      {noMatches ? (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
        }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, textAlign: 'center', maxWidth: 300 }}>
            Nobody said yes to the same movie. Try again with more open preferences?
          </p>
          <button
            onClick={onRestart}
            style={{
              background: 'var(--accent)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              padding: '14px 28px',
              color: '#0e0e11',
              fontWeight: 700,
              fontSize: 15,
              cursor: 'pointer',
              marginTop: 8,
            }}
          >
            Start over
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 440, margin: '0 auto', width: '100%' }}>

          {/* Winner card */}
          {winner && (
            <div style={{
              background: 'var(--bg2)',
              border: '2px solid var(--accent)',
              borderRadius: 20,
              overflow: 'hidden',
              boxShadow: `0 0 40px var(--accent-glow)`,
              transition: 'all 0.2s ease',
            }}>
              <div style={{ position: 'relative', aspectRatio: '16/9' }}>
                <img
                  src={(!imgError[winner.id] && winner.poster) ? winner.poster : POSTER_PLACEHOLDER(winner.title)}
                  alt={winner.title}
                  onError={() => setImgError(e => ({ ...e, [winner.id]: true }))}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)',
                }} />
                {matches.length > 1 && !revealing && (
                  <div style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    background: 'var(--accent)',
                    color: '#0e0e11',
                    borderRadius: 6,
                    padding: '3px 10px',
                    fontSize: 12,
                    fontWeight: 700,
                  }}>🎲 WINNER</div>
                )}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px 18px' }}>
                  <h2 style={{
                    fontFamily: "'DM Serif Display', serif",
                    fontSize: 'clamp(18px, 4vw, 24px)',
                    color: '#fff',
                  }}>{winner.title}</h2>
                  {winner.year && <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>{winner.year}</div>}
                  {winner.overview && (
                    <div style={{
                      color: 'rgba(255,255,255,0.78)',
                      fontSize: 13,
                      lineHeight: 1.45,
                      marginTop: 8,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>{winner.overview}</div>
                  )}
                </div>
              </div>
              {winner.link && (
                <div style={{ padding: '14px 18px', borderTop: '1px solid var(--border)' }}>
                  <a
                    href={winner.link}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: 'var(--accent)',
                      fontSize: 14,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    View on Letterboxd ↗
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Roll button when multiple matches */}
          {matches.length > 1 && (
            <button
              onClick={rollWinner}
              disabled={revealing}
              style={{
                background: revealing ? 'var(--bg3)' : 'var(--accent)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                padding: '16px',
                color: revealing ? 'var(--text-muted)' : '#0e0e11',
                fontWeight: 700,
                fontSize: 16,
                cursor: revealing ? 'default' : 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {revealing ? '🎲 Picking...' : winner ? '🔀 Re-roll' : '🎲 Pick a winner randomly'}
            </button>
          )}

          {/* All matches list */}
          {matches.length > 1 && (
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 12 }}>
                All {matches.length} mutual picks:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {matches.map(m => (
                  <div
                    key={m.id}
                    onClick={() => setWinner(m)}
                    style={{
                      background: winner?.id === m.id ? 'var(--accent-glow)' : 'var(--bg2)',
                      border: `1px solid ${winner?.id === m.id ? 'var(--accent)' : 'var(--border)'}`,
                      borderRadius: 'var(--radius-sm)',
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {m.poster && !imgError[m.id] ? (
                      <img
                        src={m.poster}
                        alt=""
                        onError={() => setImgError(e => ({ ...e, [m.id]: true }))}
                        style={{ width: 36, height: 52, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }}
                      />
                    ) : (
                      <div style={{
                        width: 36, height: 52, background: 'var(--bg3)',
                        borderRadius: 4, flexShrink: 0, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: 16,
                      }}>🎬</div>
                    )}
                    <div>
                      <div style={{ color: 'var(--text)', fontWeight: 500, fontSize: 14 }}>{m.title}</div>
                      {m.year && <div style={{ color: 'var(--text-dim)', fontSize: 12 }}>{m.year}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={onRestart}
            style={{
              background: 'none',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px',
              color: 'var(--text-muted)',
              fontSize: 14,
              cursor: 'pointer',
              marginTop: 8,
            }}
          >
            Start a new session
          </button>
        </div>
      )}
    </div>
  );
}
