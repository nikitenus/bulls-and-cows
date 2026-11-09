import { describe, expect, it } from 'vitest';

import { createRecordsStore, RECORDS_STORAGE_KEY } from './records-store.js';
import type { RecordEntry } from './types.js';

const createEntry = (overrides: Partial<RecordEntry> = {}): RecordEntry => ({
  attempts: 3,
  timeMs: 4000,
  length: 4,
  base: 10,
  createdAt: 5000,
  ...overrides,
});

const createFakeStorage = (): Storage => {
  const items = new Map<string, string>();

  return {
    get length(): number {
      return items.size;
    },
    clear: (): void => {
      items.clear();
    },
    getItem: (key: string): string | null => items.get(key) ?? null,
    key: (index: number): string | null => [...items.keys()][index] ?? null,
    removeItem: (key: string): void => {
      items.delete(key);
    },
    setItem: (key: string, value: string): void => {
      items.set(key, value);
    },
  };
};

describe('createRecordsStore', () => {
  it('loads an empty list when nothing is stored', () => {
    const store = createRecordsStore(createFakeStorage());

    expect(store.load()).toEqual([]);
  });

  it('round-trips saved records', () => {
    const storage = createFakeStorage();
    const store = createRecordsStore(storage);
    const entries = [createEntry(), createEntry({ attempts: 1, base: 16, length: 6 })];

    store.save(entries);

    expect(store.load()).toEqual(entries);
  });

  it('stores records under the namespaced key', () => {
    const storage = createFakeStorage();
    const store = createRecordsStore(storage);

    store.save([createEntry()]);

    expect(storage.getItem(RECORDS_STORAGE_KEY)).not.toBeNull();
    expect(storage.getItem(RECORDS_STORAGE_KEY)).toContain('"attempts":3');
  });

  it('returns an empty list for malformed json', () => {
    const storage = createFakeStorage();
    storage.setItem(RECORDS_STORAGE_KEY, 'not json');

    expect(createRecordsStore(storage).load()).toEqual([]);
  });

  it('returns an empty list when the stored value is not an array', () => {
    const storage = createFakeStorage();
    storage.setItem(RECORDS_STORAGE_KEY, '{"attempts":3}');

    expect(createRecordsStore(storage).load()).toEqual([]);
  });

  it('drops entries that do not match the record shape', () => {
    const valid = createEntry();
    const storage = createFakeStorage();
    storage.setItem(
      RECORDS_STORAGE_KEY,
      JSON.stringify([valid, { attempts: 'three' }, { base: 5 }, null, 'nope']),
    );

    expect(createRecordsStore(storage).load()).toEqual([valid]);
  });

  it('overwrites previously stored records', () => {
    const store = createRecordsStore(createFakeStorage());

    store.save([createEntry({ attempts: 9 })]);
    store.save([createEntry({ attempts: 1 })]);

    expect(store.load()).toEqual([createEntry({ attempts: 1 })]);
  });
});
