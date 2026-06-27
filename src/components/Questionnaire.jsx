import { useState } from 'react';
import { QUESTIONS } from '../utils/filter';

export default function Questionnaire({ onComplete, playerName = 'You' }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [multiSelected, setMultiSelected] = useState([]);

  const q = QUESTIONS[current];
  const isMulti = q.type === 'multi';
  const progress = ((current) / QUESTIONS.length) * 100;

  function handleSingle(value) {
    const newAnswers = { ...answers, [q.id]: value };
    setAnswers(newAnswers);
    setMultiSelected([]);
    if (current + 1 < QUESTIONS.length) {
      setTimeout(() => setCurrent(c => c + 1), 180);
    } else {
      setTimeout(() => onComplete(newAnswers), 180);
    }
  }

  function toggleMulti(value) {
    if (value === 'any') {
      setMultiSelected(['any']);
      return;
    }
    setMultiSelected(prev => {
      const withoutAny = prev.filter(v => v !== 'any');
      if (withoutAny.includes(value)) return withoutAny.filter(v => v !== value);
      return [...withoutAny, value];
    });
  }

  function confirmMulti() {
    const vals = multiSelected.length === 0 ? ['any'] : multiSelected;
    const newAnswers = { ...answers, [q.id]: vals };
    setAnswers(newAnswers);
    setMultiSelected([]);
    if (current + 1 < QUESTIONS.length) {
      setTimeout(() => setCurrent(c => c + 1), 120);
    } else {
      setTimeout(() => onComplete(newAnswers), 120);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', background: 'var(--bg)' }}>
      {/* Progress */}
      <div style={{ height: 3, background: 'var(--bg3)' }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: 'var(--accent)',
          transition: 'width 0.4s ease',
          borderRadius: '0 2px 2px 0',
        }} />
      </div>

      <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          background: 'var(--bg3)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '4px 12px',
          fontSize: 13,
          color: 'var(--text-muted)',
        }}>
          {playerName}
        </div>
        <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>
          {current + 1} / {QUESTIONS.length}
        </div>
      </div>

      {/* Question */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '28px 20px 32px',
        gap: 24,
      }}>
        <div>
          <div style={{ fontSize: 36, marginBottom: 12, lineHeight: 1 }}>{q.emoji}</div>
          <h2 style={{ fontSize: 'clamp(20px, 5vw, 26px)', color: 'var(--text)', lineHeight: 1.25 }}>
            {q.label}
          </h2>
          {isMulti && (
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 8 }}>
              Pick as many as you like
            </p>
          )}
        </div>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {q.options.map(opt => {
            const isSelected = isMulti
              ? multiSelected.includes(opt.value)
              : answers[q.id] === opt.value;

            return (
              <button
                key={opt.value}
                onClick={() => isMulti ? toggleMulti(opt.value) : handleSingle(opt.value)}
                style={{
                  background: isSelected ? 'var(--accent-glow)' : 'var(--bg2)',
                  border: `1.5px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-sm)',
                  padding: '14px 18px',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  transition: 'all 0.15s ease',
                  cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <div>
                  <div style={{
                    color: isSelected ? 'var(--accent)' : 'var(--text)',
                    fontWeight: 500,
                    fontSize: 15,
                    transition: 'color 0.15s',
                  }}>
                    {opt.label}
                  </div>
                  {opt.sub && (
                    <div style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 2 }}>
                      {opt.sub}
                    </div>
                  )}
                </div>
                {isMulti && (
                  <div style={{
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    border: `1.5px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                    background: isSelected ? 'var(--accent)' : 'transparent',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s',
                  }}>
                    {isSelected && <span style={{ color: '#000', fontSize: 13, fontWeight: 700 }}>✓</span>}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {isMulti && (
          <button
            onClick={confirmMulti}
            style={{
              background: multiSelected.length > 0 ? 'var(--accent)' : 'var(--bg3)',
              color: multiSelected.length > 0 ? '#0e0e11' : 'var(--text-muted)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              padding: '15px',
              fontWeight: 600,
              fontSize: 15,
              transition: 'all 0.2s',
              cursor: 'pointer',
            }}
          >
            {multiSelected.length === 0 ? 'Skip (any genre)' : `Continue →`}
          </button>
        )}
      </div>
    </div>
  );
}
