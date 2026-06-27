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

test('enforces strict animated and short runtime filtering', () => {
  const movies = [
    { title: 'Dune', runtime: 155, genres: ['science_fiction', 'adventure'] },
    { title: 'Spirited Away', runtime: 125, genres: ['animation', 'fantasy'] },
    { title: 'The Lego Movie', runtime: 90, genres: ['animation', 'comedy'] },
    { title: 'Short Cartoon', runtime: 85, genres: ['animation', 'family'] },
  ];

  const filtered = filterMoviesByAnswers(movies, {
    runtime: '90',
    format: 'animated',
  });

  assert.deepEqual(filtered.map(m => m.title), ['The Lego Movie', 'Short Cartoon']);
});

test('excludes dark films when the user selects light tone', () => {
  const movies = [
    { title: 'Bright Family', genres: ['comedy', 'family'], runtime: 95 },
    { title: 'Dark Thriller', genres: ['thriller', 'crime'], runtime: 110 },
  ];

  const filtered = filterMoviesByAnswers(movies, {
    darkness: 'light',
  });

  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].title, 'Bright Family');
});

test('normalizes TMDB numeric genre IDs before filtering', () => {
  const movies = [
    { title: 'Creepy Movie', genreIds: [27], runtime: 90 },
    { title: 'Funny Movie', genreIds: [35, 10749], runtime: 90 },
  ];

  const filtered = filterMoviesByAnswers(movies, {
    vibe: 'celebration',
    ending: 'laughed',
    darkness: 'light',
  });

  assert.deepEqual(filtered.map(m => m.title), ['Funny Movie']);
});
