import { useState, useRef } from 'react';

const POSTER_PLACEHOLDER = (title) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(title)}&size=300&background=1e1e26&color=8b8a99&bold=true&length=2&font-size=0.35`;

export default function SwipeDeck({ movies, onComplete, playerName = 'You' }) {
  const [index, setIndex] = useState(0);
  const [swipes, setSwipes] = useState({});
  const [animDir, setAnimDir] = useState(null); // 'left' | 'right'
  const [imgError, setImgError] = useState({});

  const movie = movies[index];
  const remaining = movies.length - index;
  const done = index >= movies.length;
  const yesCount = Object.values(swipes).filter(v => v === 'yes').length;

  if (!movie) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--bg)', color: 'var(--text-muted)', textAlign: 'center' }}>
        <div>
          <h2 style={{ marginBottom: 12 }}>No movies available</h2>
          <p style={{ maxWidth: 320, margin: '0 auto' }}>
            There are no movies to swipe right now. Try restarting the app or going back to change your answers.
          </p>
        </div>
      </div>
    );
  }

  function swipe(dir) {
    if (animDir || done) return;
    setAnimDir(dir);
    setTimeout(() => {
      const newSwipes = { ...swipes, [movie.id]: dir === 'right' ? 'yes' : 'no' };
      setSwipes(newSwipes);
      setAnimDir(null);
      const nextIndex = index + 1;
      setIndex(nextIndex);
      if (nextIndex >= movies.length) {
        onComplete(newSwipes);
      }
    }, 280);
  }

  if (done) return null;

  const cardStyle = {
    position: 'relative',
    borderRadius: 20,
    overflow: 'hidden',
    background: 'var(--bg2)',
    border: '1px solid var(--border)',
    boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
    transform: animDir === 'right'
      ? 'translateX(120%) rotate(18deg)'
      : animDir === 'left'
        ? 'translateX(-120%) rotate(-18deg)'
        : 'translateX(0) rotate(0deg)',
    transition: animDir ? 'transform 0.28s cubic-bezier(0.4,0,0.2,1)' : 'none',
    width: '100%',
    maxWidth: 400,
    aspectRatio: '2/3',
    display: 'flex',
    flexDirection: 'column',
    userSelect: 'none',
  };

  const posterSrc = (!imgError[movie.id] && movie.poster) ? movie.poster : POSTER_PLACEHOLDER(movie.title);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100dvh',
      background: 'var(--bg)',
      padding: '0 0 20px',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{
          background: 'var(--bg3)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '4px 12px',
          fontSize: 13,
          color: 'var(--text-muted)',
        }}>{playerName}</div>
        <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>
          {index + 1} / {movies.length}
          {yesCount > 0 && <span style={{ color: 'var(--yes)', marginLeft: 8 }}>♥ {yesCount}</span>}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 2, background: 'var(--bg3)', marginBottom: 16 }}>
        <div style={{
          height: '100%',
          width: `${(index / movies.length) * 100}%`,
          background: 'var(--accent)',
          transition: 'width 0.3s ease',
        }} />
      </div>

      {/* Card */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '0 20px',
        gap: 20,
      }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={cardStyle}>
            <img
              src={posterSrc}
              alt={movie.title}
              onError={() => setImgError(e => ({ ...e, [movie.id]: true }))}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                position: 'absolute',
                inset: 0,
              }}
            />
            {/* Gradient overlay */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.3) 50%, transparent 75%)',
            }} />
            {/* YES / NO overlay indicators */}
            {animDir === 'right' && (
              <div style={{
                position: 'absolute',
                top: 24,
                left: 20,
                border: '3px solid var(--yes)',
                color: 'var(--yes)',
                borderRadius: 8,
                padding: '4px 14px',
                fontWeight: 800,
                fontSize: 22,
                letterSpacing: 2,
                transform: 'rotate(-12deg)',
              }}>WATCH</div>
            )}
            {animDir === 'left' && (
              <div style={{
                position: 'absolute',
                top: 24,
                right: 20,
                border: '3px solid var(--no)',
                color: 'var(--no)',
                borderRadius: 8,
                padding: '4px 14px',
                fontWeight: 800,
                fontSize: 22,
                letterSpacing: 2,
                transform: 'rotate(12deg)',
              }}>SKIP</div>
            )}
            {/* Movie info */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '20px 20px 22px',
            }}>
              <h2 style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: 'clamp(18px, 4.5vw, 24px)',
                color: '#fff',
                marginBottom: 4,
                lineHeight: 1.2,
              }}>{movie.title}</h2>
              {movie.year && (
                <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14 }}>{movie.year}</div>
              )}
              {movie.overview ? (
                <div style={{
                  color: 'rgba(255,255,255,0.78)',
                  fontSize: 13,
                  lineHeight: 1.45,
                  marginTop: 8,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>{movie.overview}</div>
              ) : (
                <div style={{
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: 12,
                  fontStyle: 'italic',
                  marginTop: 8,
                }}>No description available</div>
              )}
            </div>
          </div>
        </div>

        {/* Hint text */}
        <div style={{ color: 'var(--text-dim)', fontSize: 13, textAlign: 'center' }}>
          Swipe or tap the buttons
        </div>

        {/* Buttons */}
        <div style={{
          display: 'flex',
          gap: 24,
          justifyContent: 'center',
          width: '100%',
          maxWidth: 400,
        }}>
          <button
            onClick={() => swipe('left')}
            style={{
              flex: 1,
              height: 60,
              borderRadius: 14,
              background: 'var(--bg2)',
              border: '1.5px solid var(--no)',
              color: 'var(--no)',
              fontSize: 26,
              transition: 'all 0.15s',
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
            }}
            aria-label="Skip"
          >✕</button>
          <button
            onClick={() => swipe('right')}
            style={{
              flex: 1,
              height: 60,
              borderRadius: 14,
              background: 'var(--bg2)',
              border: '1.5px solid var(--yes)',
              color: 'var(--yes)',
              fontSize: 26,
              transition: 'all 0.15s',
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
            }}
            aria-label="Watch this"
          >♥</button>
        </div>

        {/* Skip remaining */}
        <button
          onClick={() => {
            const remaining_swipes = {};
            movies.slice(index).forEach(m => { remaining_swipes[m.id] = 'no'; });
            const finalSwipes = { ...swipes, ...remaining_swipes };
            onComplete(finalSwipes);
          }}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-dim)',
            fontSize: 13,
            cursor: 'pointer',
            padding: '4px 8px',
          }}
        >
          Skip remaining ({remaining} left)
        </button>
      </div>
    </div>
  );
}
