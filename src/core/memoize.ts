export const memoize = <Args extends readonly unknown[], Result>(
  _fn: (...args: Args) => Result,
  _keyFn?: (...args: Args) => string,
): ((...args: Args) => Result) => {
  throw new Error('not implemented');
};
