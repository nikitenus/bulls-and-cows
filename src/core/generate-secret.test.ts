import { afterEach, describe, expect, it, vi } from 'vitest';

import { DIGITS_BY_BASE } from './digits.js';
import { generateSecret } from './generate-secret.js';

const createSeededRandom = (seed: number): (() => number) => {
  let state = seed;

  return (): number => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
};

const createSequenceRandom = (values: readonly number[]): (() => number) => {
  let index = 0;

  return (): number => {
    const value = values[index] ?? 0;
    index += 1;
    return value;
  };
};

describe('generateSecret', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns a secret of the requested length', () => {
    expect(generateSecret(4, 10, () => 0)).toHaveLength(4);
  });

  it('returns unique digits', () => {
    const secret = generateSecret(6, 16, createSeededRandom(42));

    expect(new Set(secret).size).toBe(secret.length);
  });

  it('uses only digits allowed in the base', () => {
    const secret = generateSecret(6, 16, createSeededRandom(7));

    expect(secret.every((digit) => DIGITS_BY_BASE[16].includes(digit))).toBe(true);
  });

  it('returns lowercase hex digits', () => {
    const secret = generateSecret(4, 16, () => 0.99);

    expect(secret.every((digit) => digit === digit.toLowerCase())).toBe(true);
  });

  it('is deterministic for a constant random source', () => {
    expect(generateSecret(4, 10, () => 0)).toEqual(['0', '1', '2', '3']);
    expect(generateSecret(4, 10, () => 0.999)).toEqual(['9', '8', '7', '6']);
  });

  it('picks digits from the shrinking pool in sequence', () => {
    expect(generateSecret(2, 10, createSequenceRandom([0.5, 0]))).toEqual(['5', '0']);
  });

  it('generates both binary orders', () => {
    expect(generateSecret(2, 2, () => 0)).toEqual(['0', '1']);
    expect(generateSecret(2, 2, () => 0.99)).toEqual(['1', '0']);
  });

  it('does not mutate the shared alphabet', () => {
    const before = [...DIGITS_BY_BASE[10]];

    generateSecret(4, 10, () => 0);

    expect(DIGITS_BY_BASE[10]).toEqual(before);
  });

  it('uses Math.random by default', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);

    expect(generateSecret(2, 10)).toEqual(['0', '1']);
  });

  it('throws when the base cannot provide enough unique digits', () => {
    expect(() => generateSecret(3, 2, () => 0)).toThrow(RangeError);
    expect(() => generateSecret(9, 8, () => 0)).toThrow(RangeError);
  });
});
