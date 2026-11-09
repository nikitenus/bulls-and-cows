import type { RecordEntry } from './types.js';

const DEFAULT_LIMIT = 10;

const compareEntries = (a: RecordEntry, b: RecordEntry): number =>
  a.attempts - b.attempts || a.timeMs - b.timeMs || a.createdAt - b.createdAt;

export const addRecord = (
  entries: readonly RecordEntry[],
  entry: RecordEntry,
  limit: number = DEFAULT_LIMIT,
): RecordEntry[] => [...entries, entry].sort(compareEntries).slice(0, limit);
