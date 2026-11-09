import { describe, expect, it } from 'vitest';

import { createDigitValidator } from './create-digit-validator.js';

const DECIMAL_DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

describe('createDigitValidator', () => {
  it('returns a predicate function', () => {
    expect(typeof createDigitValidator(10)).toBe('function');
  });

  it.each(DECIMAL_DIGITS)('accepts %s in base 10', (digit) => {
    expect(createDigitValidator(10)(digit)).toBe(true);
  });

  it.each(['a', 'A', '10', '', ' ', '-1'])('rejects %j in base 10', (value) => {
    expect(createDigitValidator(10)(value)).toBe(false);
  });

  it('accepts binary digits in base 2', () => {
    const isBinaryDigit = createDigitValidator(2);

    expect(isBinaryDigit('0')).toBe(true);
    expect(isBinaryDigit('1')).toBe(true);
  });

  it.each(['2', 'a', ''])('rejects %j in base 2', (value) => {
    expect(createDigitValidator(2)(value)).toBe(false);
  });

  it('accepts octal digits up to 7 in base 8', () => {
    const isOctalDigit = createDigitValidator(8);

    expect(isOctalDigit('7')).toBe(true);
    expect(isOctalDigit('8')).toBe(false);
  });

  it('accepts hex digits in both cases', () => {
    const isHexDigit = createDigitValidator(16);

    expect(isHexDigit('a')).toBe(true);
    expect(isHexDigit('A')).toBe(true);
    expect(isHexDigit('F')).toBe(true);
    expect(isHexDigit('f')).toBe(true);
  });

  it.each(['g', 'G', 'z'])('rejects %j in base 16', (value) => {
    expect(createDigitValidator(16)(value)).toBe(false);
  });

  it('creates independent validators per base', () => {
    const isDecimalDigit = createDigitValidator(10);
    const isHexDigit = createDigitValidator(16);

    expect(isDecimalDigit('a')).toBe(false);
    expect(isHexDigit('a')).toBe(true);
  });
});
