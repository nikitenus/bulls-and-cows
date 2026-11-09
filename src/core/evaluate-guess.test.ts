import { describe, expect, it } from 'vitest';

import { evaluateGuess } from './evaluate-guess.js';

const SECRET = ['1', '2', '3', '4'];

describe('evaluateGuess', () => {
  it('counts every digit as a bull for an exact match', () => {
    expect(evaluateGuess(SECRET, '1234')).toEqual({ bulls: 4, cows: 0 });
  });

  it('counts every digit as a cow for a reversed guess', () => {
    expect(evaluateGuess(SECRET, '4321')).toEqual({ bulls: 0, cows: 4 });
  });

  it('splits bulls and cows for a partially correct guess', () => {
    expect(evaluateGuess(SECRET, '1243')).toEqual({ bulls: 2, cows: 2 });
  });

  it('does not count digits already scored as bulls', () => {
    expect(evaluateGuess(SECRET, '1324')).toEqual({ bulls: 2, cows: 2 });
  });

  it('returns zeros when no digit matches', () => {
    expect(evaluateGuess(SECRET, '5678')).toEqual({ bulls: 0, cows: 0 });
  });

  it('handles a leading zero in the secret', () => {
    expect(evaluateGuess(['0', '1', '2', '3'], '0123')).toEqual({ bulls: 4, cows: 0 });
    expect(evaluateGuess(['0', '1', '2', '3'], '3210')).toEqual({ bulls: 0, cows: 4 });
  });

  it('is case insensitive for hex digits', () => {
    expect(evaluateGuess(['a', 'b', 'c', 'd'], 'ABCD')).toEqual({ bulls: 4, cows: 0 });
    expect(evaluateGuess(['A', 'B', 'C', 'D'], 'abcd')).toEqual({ bulls: 4, cows: 0 });
  });

  it('supports length 2 binary secrets', () => {
    expect(evaluateGuess(['0', '1'], '10')).toEqual({ bulls: 0, cows: 2 });
  });
});
