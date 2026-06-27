import test from 'node:test';
import assert from 'node:assert/strict';
import { filterMoviesByAnswers } from './filter.js';

test('prefers lighter, comedy-led picks for a celebratory night', () => {
  const movies = [
    { title: 'The Silence', genres: ['horror'] },
    { title: 'The Big Sick', genres: ['comedy', 'romance'] },
    { title: 'The Grand Budapest Hotel', genres: ['comedy', 'adventure'] },
  ];

  const filtered = filterMoviesByAnswers(movies, {
    vibe: 'celebration',
    ending: 'laughed',
    attention: 'half',
    darkness: 'light',
  });

  assert.equal(filtered[0].title, 'The Big Sick');
  assert.equal(filtered[1].title, 'The Grand Budapest Hotel');
});
