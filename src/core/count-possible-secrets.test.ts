import { describe, expect, it } from 'vitest';

import { countPossibleSecrets } from './count-possible-secrets.js';

describe('countPossibleSecrets', () => {
  it('returns one arrangement for an empty secret', () => {
    expect(countPossibleSecrets(0, 10)).toBe(1);
  });

  it('counts permutations without repetition', () => {
    expect(countPossibleSecrets(2, 2)).toBe(2);
    expect(countPossibleSecrets(2, 10)).toBe(90);
    expect(countPossibleSecrets(4, 10)).toBe(5040);
    expect(countPossibleSecrets(6, 10)).toBe(151200);
  });

  it('supports the whole base range', () => {
    expect(countPossibleSecrets(2, 8)).toBe(56);
    expect(countPossibleSecrets(3, 16)).toBe(3360);
    expect(countPossibleSecrets(6, 16)).toBe(5765760);
  });

  it('returns zero when the length exceeds the base', () => {
    expect(countPossibleSecrets(5, 2)).toBe(0);
    expect(countPossibleSecrets(9, 8)).toBe(0);
  });

  it('returns the same value on repeated calls', () => {
    expect(countPossibleSecrets(6, 16)).toBe(countPossibleSecrets(6, 16));
  });
});
