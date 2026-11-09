import { memoize } from './memoize.js';
import type { Base } from './types.js';

const countMemoized = memoize(
  (length: number, base: number): number => {
    if (length === 0) {
      return 1;
    }

    if (length > base) {
      return 0;
    }

    return base * countMemoized(length - 1, base - 1);
  },
  (length, base) => `${length}:${base}`,
);

export const countPossibleSecrets = (length: number, base: Base): number =>
  countMemoized(length, base);
