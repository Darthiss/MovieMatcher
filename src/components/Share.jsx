import { useState } from 'react';

export default function Share({ shareUrl, yesCount, totalCount, isLoading = false, error = '' }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  }

  function share() {
    if (navigator.share) {
      navigator.share({
        title: 'MovieMatch — your turn!',
        text: `I've picked my movies. Open this link and pick yours — then we'll see what we both want to watch! 🍿`,
        url: shareUrl,
      });
    } else {
      copy();
    }
  }

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 24px',
      background: 'var(--bg)',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
      <h2 style={{ fontSize: 'clamp(22px, 5vw, 30px)', marginBottom: 12 }}>
        Your picks are in!
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 4 }}>
        You said <strong style={{ color: 'var(--yes)' }}>yes</strong> to{' '}
        <strong style={{ color: 'var(--text)' }}>{yesCount}</strong> out of {totalCount} movies.
      </p>
      <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 36, maxWidth: 320 }}>
        Now send the link to your partner. They'll answer blindly and we'll reveal the matches!
      </p>

      {error && (
        <div style={{ color: 'var(--no)', fontSize: 14, marginBottom: 18, maxWidth: 320 }}>
          ⚠ {error}
        </div>
      )}

      {/* URL box */}
      <div style={{
        width: '100%',
        maxWidth: 400,
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        padding: '12px 16px',
        marginBottom: 12,
        wordBreak: 'break-all',
        fontSize: 12,
        color: 'var(--text-dim)',
        textAlign: 'left',
        lineHeight: 1.6,
      }}>
        {isLoading ? 'Creating your partner link…' : shareUrl ? (shareUrl.length > 120 ? shareUrl.slice(0, 120) + '…' : shareUrl) : 'No link available yet.'}
      </div>

      <div style={{
        display: 'flex',
        gap: 10,
        width: '100%',
        maxWidth: 400,
        flexDirection: 'column',
      }}>
        <button
          onClick={share}
          disabled={isLoading || !shareUrl}
          style={{
            background: isLoading || !shareUrl ? 'var(--bg3)' : 'var(--accent)',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            padding: '16px',
            color: '#0e0e11',
            fontWeight: 700,
            fontSize: 16,
            cursor: isLoading || !shareUrl ? 'not-allowed' : 'pointer',
          }}
        >
          {isLoading ? 'Creating link…' : '📤 Send to partner'}
        </button>
        <button
          onClick={copy}
          style={{
            background: copied ? 'var(--bg3)' : 'var(--bg2)',
            border: `1px solid ${copied ? 'var(--yes)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-sm)',
            padding: '14px',
            color: copied ? 'var(--yes)' : 'var(--text-muted)',
            fontSize: 15,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {copied ? '✓ Copied!' : '📋 Copy link'}
        </button>
      </div>

      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 24, maxWidth: 300, lineHeight: 1.6 }}>
        The link contains your answers encoded in the URL. No servers, no accounts.
      </p>
    </div>
  );
}
