import { createDigitValidator } from './create-digit-validator.js';
import { normalizeDigit } from './digits.js';
import type { Base } from './types.js';

export const isValidGuess = (guess: string, length: number, base: Base): boolean => {
  const chars = [...guess];

  return (
    chars.length === length &&
    chars.every(createDigitValidator(base)) &&
    new Set(chars.map(normalizeDigit)).size === chars.length
  );
};
