import { useState, useEffect } from 'react';
import Setup from './components/Setup';
import Questionnaire from './components/Questionnaire';
import SwipeDeck from './components/SwipeDeck';
import Share from './components/Share';
import Results from './components/Results';
import { filterMoviesByAnswers } from './utils/filter';
import { buildShareUrl, parseUrlState } from './utils/room';

// Shuffle array
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function App() {
  const [screen, setScreen] = useState('init');
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [answers, setAnswers] = useState({});
  const [p1Swipes, setP1Swipes] = useState({});
  const [p2Swipes, setP2Swipes] = useState({});
  const [shareUrl, setShareUrl] = useState('');
  const [shareError, setShareError] = useState('');
  const [shareLoading, setShareLoading] = useState(false);
  const [urlState, setUrlState] = useState(null);

  useEffect(() => {
    (async () => {
      const state = await parseUrlState();
      setUrlState(state);

      if (state.mode === 'p2-swipe') {
        // P2 landed on the link — load their movies from setup data
        setMovies(state.setup.movies || []);
        setP1Swipes(state.p1Swipes);
        setScreen('p2-questionnaire');
      } else {
        setScreen('setup');
      }
    })();
  }, []);

  // P1 FLOW
  function handleSetupReady({ username, movies: fetchedMovies }) {
    setMovies(fetchedMovies);
    setScreen('p1-questionnaire');
  }

  function handleP1Answers(ans) {
    setAnswers(ans);
    const filtered = filterMoviesByAnswers(movies, ans);
    const pool = shuffle(filtered).slice(0, 40); // cap at 40 for speed
    setFilteredMovies(pool);
    setScreen('p1-swipe');
  }

  async function handleP1Swipes(swipes) {
    setP1Swipes(swipes);
    setShareError('');
    setShareLoading(true);
    const setup = { movies, answers };

    try {
      const url = await buildShareUrl(setup, swipes);
      setShareUrl(url);
      setScreen('p1-share');
    } catch (err) {
      console.error('Failed to build share URL', err);
      setShareError('Something went wrong creating your partner link. Please try again.');
      setShareUrl('');
      setScreen('p1-share');
    } finally {
      setShareLoading(false);
    }
  }

  // P2 FLOW
  function handleP2Answers(ans) {
    const filtered = filterMoviesByAnswers(urlState.setup.movies, ans);
    const pool = shuffle(filtered).slice(0, 40);
    setFilteredMovies(pool);
    setScreen('p2-swipe');
  }

  function handleP2Swipes(swipes) {
    setP2Swipes(swipes);
    setScreen('results');
  }

  function handleRestart() {
    // Clear URL params and reset
    window.history.replaceState({}, '', window.location.pathname);
    setScreen('setup');
    setMovies([]);
    setFilteredMovies([]);
    setAnswers({});
    setP1Swipes({});
    setP2Swipes({});
    setShareUrl('');
    setUrlState({ mode: 'setup' });
  }

  const p1YesCount = Object.values(p1Swipes).filter(v => v === 'yes').length;
  const resultMovies = urlState?.mode === 'p2-swipe' ? urlState.setup.movies : movies;

  if (screen === 'init') return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', color: 'var(--text-muted)', fontSize: 14 }}>
      Loading…
    </div>
  );

  if (screen === 'setup') return <Setup onReady={handleSetupReady} />;

  if (screen === 'p1-questionnaire') return (
    <Questionnaire onComplete={handleP1Answers} playerName="You (Player 1)" />
  );

  if (screen === 'p1-swipe') return (
    <SwipeDeck movies={filteredMovies} onComplete={handleP1Swipes} playerName="Player 1" />
  );

  if (screen === 'p1-share') return (
    <Share
      shareUrl={shareUrl}
      yesCount={p1YesCount}
      totalCount={filteredMovies.length}
      isLoading={shareLoading}
      error={shareError}
    />
  );

  if (screen === 'p2-questionnaire') return (
    <Questionnaire onComplete={handleP2Answers} playerName="Your partner (Player 2)" />
  );

  if (screen === 'p2-swipe') return (
    <SwipeDeck movies={filteredMovies} onComplete={handleP2Swipes} playerName="Player 2" />
  );

  if (screen === 'results') return (
    <Results
      movies={resultMovies}
      p1Swipes={p1Swipes}
      p2Swipes={p2Swipes}
      onRestart={handleRestart}
    />
  );

  return null;
}
