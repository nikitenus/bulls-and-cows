export const memoize = <Args extends readonly unknown[], Result>(
  fn: (...args: Args) => Result,
  keyFn: (...args: Args) => string = (...args) => JSON.stringify(args),
): ((...args: Args) => Result) => {
  const cache = new Map<string, Result>();

  return (...args: Args): Result => {
    const key = keyFn(...args);
    const cached = cache.get(key);

    if (cached !== undefined) {
      return cached;
    }

    const value = fn(...args);
    cache.set(key, value);

    return value;
  };
};
