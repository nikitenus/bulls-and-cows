import { DIGITS_BY_BASE, normalizeDigit } from './digits.js';
import type { Base } from './types.js';

type DigitPredicate = (char: string) => boolean;

export const createDigitValidator = (base: Base): DigitPredicate => {
  const digits = DIGITS_BY_BASE[base];

  return (char: string): boolean => digits.includes(normalizeDigit(char));
};
