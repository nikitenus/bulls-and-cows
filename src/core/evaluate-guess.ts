import { normalizeDigit } from './digits.js';
import type { GuessResult } from './types.js';

export const evaluateGuess = (secret: readonly string[], guess: string): GuessResult => {
  const normalizedSecret = secret.map(normalizeDigit);
  const guessDigits = [...guess].map(normalizeDigit);

  const bulls = guessDigits.reduce(
    (count, digit, index) => (digit === normalizedSecret[index] ? count + 1 : count),
    0,
  );

  const secretDigits = new Set(normalizedSecret);
  const cows = guessDigits.filter((digit) => secretDigits.has(digit)).length - bulls;

  return { bulls, cows };
};
