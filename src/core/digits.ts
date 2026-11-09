import type { Base } from './types.js';

export const DIGITS_BY_BASE: Readonly<Record<Base, readonly string[]>> = {
  2: ['0', '1'],
  8: ['0', '1', '2', '3', '4', '5', '6', '7'],
  10: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
  16: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'],
};

export const normalizeDigit = (char: string): string => char.toLowerCase();
