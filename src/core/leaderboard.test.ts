import { describe, expect, it } from 'vitest';

import { addRecord } from './leaderboard.js';
import type { RecordEntry } from './types.js';

const createEntry = (overrides: Partial<RecordEntry> = {}): RecordEntry => ({
  attempts: 1,
  timeMs: 1000,
  length: 4,
  base: 10,
  createdAt: 1000,
  ...overrides,
});

describe('addRecord', () => {
  it('adds a record to an empty list', () => {
    const entry = createEntry();

    expect(addRecord([], entry)).toEqual([entry]);
  });

  it('sorts by attempts in ascending order', () => {
    const entries = [createEntry({ attempts: 5 }), createEntry({ attempts: 2 })];

    expect(addRecord(entries, createEntry({ attempts: 3 })).map((item) => item.attempts)).toEqual([
      2, 3, 5,
    ]);
  });

  it('breaks ties between equal attempts by time', () => {
    const entries = [
      createEntry({ attempts: 2, timeMs: 900, createdAt: 1 }),
      createEntry({ attempts: 2, timeMs: 300, createdAt: 2 }),
    ];

    expect(
      addRecord(entries, createEntry({ attempts: 2, timeMs: 500, createdAt: 3 })).map(
        (item) => item.timeMs,
      ),
    ).toEqual([300, 500, 900]);
  });

  it('breaks ties between equal attempts and time by creation order', () => {
    const entries = [
      createEntry({ attempts: 2, timeMs: 300, createdAt: 5 }),
      createEntry({ attempts: 2, timeMs: 300, createdAt: 2 }),
    ];

    expect(
      addRecord(entries, createEntry({ attempts: 2, timeMs: 300, createdAt: 9 })).map(
        (item) => item.createdAt,
      ),
    ).toEqual([2, 5, 9]);
  });

  it('keeps only the best entries up to the limit', () => {
    const entries = Array.from({ length: 12 }, (_, index) => createEntry({ attempts: index + 1 }));

    const result = addRecord(entries, createEntry({ attempts: 0 }));

    expect(result).toHaveLength(10);
    expect(result[0]?.attempts).toBe(0);
    expect(result.at(-1)?.attempts).toBe(9);
  });

  it('drops entries that are worse than the whole table', () => {
    const entries = Array.from({ length: 10 }, (_, index) => createEntry({ attempts: index + 1 }));

    const result = addRecord(entries, createEntry({ attempts: 99 }));

    expect(result).toHaveLength(10);
    expect(result.some((item) => item.attempts === 99)).toBe(false);
  });

  it('does not mutate the source list', () => {
    const entries = [createEntry({ attempts: 5 }), createEntry({ attempts: 2 })];
    const snapshot = [...entries];

    addRecord(entries, createEntry({ attempts: 1 }));

    expect(entries).toEqual(snapshot);
  });

  it('keeps entries with different settings in the same table', () => {
    const entries = [createEntry({ length: 6, base: 16, attempts: 8 })];

    const result = addRecord(entries, createEntry({ length: 2, base: 2, attempts: 3 }));

    expect(result).toHaveLength(2);
    expect(result.map((item) => item.base)).toEqual([2, 16]);
  });
});
