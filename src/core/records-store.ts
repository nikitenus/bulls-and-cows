import type { RecordEntry } from './types.js';

export const RECORDS_STORAGE_KEY = 'bulls-and-cows:records:v1';

export type RecordsStore = {
  load: () => RecordEntry[];
  save: (entries: readonly RecordEntry[]) => void;
};

export const createRecordsStore = (_storage: Storage): RecordsStore => {
  throw new Error('not implemented');
};
