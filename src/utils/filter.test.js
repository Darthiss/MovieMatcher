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

test('prefers shorter animated picks when runtime and format are specified', () => {
  const movies = [
    { title: 'Dune', runtime: 155, genres: ['science_fiction', 'adventure'] },
    { title: 'Spirited Away', runtime: 125, genres: ['animation', 'fantasy'] },
    { title: 'The Lego Movie', runtime: 100, genres: ['animation', 'comedy'] },
  ];

  const filtered = filterMoviesByAnswers(movies, {
    runtime: '90',
    format: 'animated',
  });

  assert.equal(filtered[0].title, 'The Lego Movie');
  assert.equal(filtered[1].title, 'Spirited Away');
});
