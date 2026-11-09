import type { RecordEntry } from './types.js';

export const RECORDS_STORAGE_KEY = 'bulls-and-cows:records:v1';

export type RecordsStore = {
  load: () => RecordEntry[];
  save: (entries: readonly RecordEntry[]) => void;
};

const isBase = (value: unknown): boolean =>
  value === 2 || value === 8 || value === 10 || value === 16;

const isRecordEntry = (value: unknown): value is RecordEntry => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const entry = value as Record<string, unknown>;

  return (
    typeof entry.attempts === 'number' &&
    typeof entry.timeMs === 'number' &&
    typeof entry.length === 'number' &&
    isBase(entry.base) &&
    typeof entry.createdAt === 'number'
  );
};

export const createRecordsStore = (storage: Storage): RecordsStore => ({
  load: (): RecordEntry[] => {
    const raw = storage.getItem(RECORDS_STORAGE_KEY);

    if (raw === null) {
      return [];
    }

    try {
      const parsed: unknown = JSON.parse(raw);

      return Array.isArray(parsed) ? parsed.filter(isRecordEntry) : [];
    } catch {
      return [];
    }
  },
  save: (entries: readonly RecordEntry[]): void => {
    storage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(entries));
  },
});
