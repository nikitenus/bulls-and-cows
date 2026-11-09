import { describe, expect, it, vi } from 'vitest';

import { memoize } from './memoize.js';

describe('memoize', () => {
  it('does not call the function twice for the same arguments', () => {
    const fn = vi.fn((a: number, b: number) => a + b);
    const memoized = memoize(fn);

    expect(memoized(1, 2)).toBe(3);
    expect(memoized(1, 2)).toBe(3);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('caches different arguments separately', () => {
    const fn = vi.fn((a: number) => a * 2);
    const memoized = memoize(fn);

    expect(memoized(1)).toBe(2);
    expect(memoized(2)).toBe(4);
    expect(memoized(1)).toBe(2);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('supports a custom cache key function', () => {
    const fn = vi.fn((value: { id: number }) => value.id);
    const memoized = memoize(fn, (value) => String(value.id));

    expect(memoized({ id: 1 })).toBe(1);
    expect(memoized({ id: 1 })).toBe(1);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('builds the default key from all arguments', () => {
    const fn = vi.fn((a: number, b: number) => a + b);
    const memoized = memoize(fn);

    memoized(1, 2);
    memoized(2, 1);

    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('keeps caches independent between wrappers', () => {
    const fn = vi.fn((a: number) => a);
    const first = memoize(fn);
    const second = memoize(fn);

    first(1);
    second(1);

    expect(fn).toHaveBeenCalledTimes(2);
  });
});
