import { describe, expect, it } from 'vitest';

import { isValidGuess } from './is-valid-guess.js';

describe('isValidGuess', () => {
  it('accepts a guess of the right length with unique digits', () => {
    expect(isValidGuess('1234', 4, 10)).toBe(true);
  });

  it('accepts a guess with a leading zero', () => {
    expect(isValidGuess('0123', 4, 10)).toBe(true);
  });

  it('accepts lowercase and uppercase hex digits', () => {
    expect(isValidGuess('abcd', 4, 16)).toBe(true);
    expect(isValidGuess('ABCD', 4, 16)).toBe(true);
    expect(isValidGuess('aBcD', 4, 16)).toBe(true);
  });

  it('rejects a guess that is too short or too long', () => {
    expect(isValidGuess('123', 4, 10)).toBe(false);
    expect(isValidGuess('12345', 4, 10)).toBe(false);
    expect(isValidGuess('', 4, 10)).toBe(false);
  });

  it('rejects digits that do not exist in the base', () => {
    expect(isValidGuess('12a4', 4, 10)).toBe(false);
    expect(isValidGuess('1238', 4, 8)).toBe(false);
    expect(isValidGuess('102', 3, 2)).toBe(false);
  });

  it('rejects repeated digits', () => {
    expect(isValidGuess('1123', 4, 10)).toBe(false);
    expect(isValidGuess('0000', 4, 10)).toBe(false);
  });

  it('treats a digit and its uppercase form as the same digit', () => {
    expect(isValidGuess('1aA2', 4, 16)).toBe(false);
  });

  it('accepts valid binary guesses', () => {
    expect(isValidGuess('01', 2, 2)).toBe(true);
    expect(isValidGuess('10', 2, 2)).toBe(true);
    expect(isValidGuess('11', 2, 2)).toBe(false);
    expect(isValidGuess('00', 2, 2)).toBe(false);
  });
});
