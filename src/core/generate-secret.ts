import { DIGITS_BY_BASE } from './digits.js';
import type { Base } from './types.js';

const pickDigits = (count: number, pool: readonly string[], random: () => number): string[] => {
  if (count === 0) {
    return [];
  }

  const index = Math.floor(random() * pool.length);
  const digit = pool[index];

  if (digit === undefined) {
    throw new RangeError(`Random source produced an out-of-range index: ${index}`);
  }

  const remainingPool = pool.filter((_, poolIndex) => poolIndex !== index);

  return [digit, ...pickDigits(count - 1, remainingPool, random)];
};

export const generateSecret = (
  length: number,
  base: Base,
  random: () => number = Math.random,
): string[] => {
  const digits = DIGITS_BY_BASE[base];

  if (length < 0 || length > digits.length) {
    throw new RangeError(`Cannot generate ${length} unique digits in base ${base}`);
  }

  return pickDigits(length, digits, random);
};
