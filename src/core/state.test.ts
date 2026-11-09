import { describe, expect, it } from 'vitest';

import { applyGuess, createIdleState, newGame, startRound, toRecordEntry } from './state.js';
import type { GameState, Settings } from './types.js';

const SETTINGS: Settings = { length: 4, base: 10 };

const createClock = (start: number) => {
  let current = start;

  return {
    now: (): number => current,
    advance: (amount: number): void => {
      current += amount;
    },
  };
};

const startPlayingRound = (secretRandom = () => 0): GameState => {
  const clock = createClock(1000);

  return startRound(SETTINGS, { random: secretRandom, now: clock.now });
};

describe('startRound', () => {
  it('creates a playing state with a deterministic secret', () => {
    const state = startPlayingRound();

    expect(state.status).toBe('playing');
    expect(state.settings).toEqual(SETTINGS);
    expect(state.secret).toEqual(['0', '1', '2', '3']);
    expect(state.history).toEqual([]);
    expect(state.startedAt).toBe(1000);
    expect(state.finishedAt).toBeNull();
  });
});

describe('applyGuess', () => {
  it('appends an attempt with bulls and cows', () => {
    const state = startPlayingRound();
    const { state: next, outcome } = applyGuess(state, '1243', () => 2000);

    expect(outcome).toBe('accepted');
    expect(next.history).toEqual([{ guess: '1243', result: { bulls: 1, cows: 2 } }]);
  });

  it('does not mutate the previous state', () => {
    const state = startPlayingRound();
    const { state: next } = applyGuess(state, '1243', () => 2000);

    expect(state.history).toEqual([]);
    expect(next).not.toBe(state);
    expect(next.history).not.toBe(state.history);
  });

  it('rejects invalid guesses without touching the history', () => {
    const state = startPlayingRound();
    const { state: next, outcome } = applyGuess(state, '1123', () => 2000);

    expect(outcome).toBe('invalid');
    expect(next).toBe(state);
  });

  it('reports duplicate guesses and keeps the history unchanged', () => {
    const state = startPlayingRound();
    const first = applyGuess(state, '1243', () => 2000);
    const second = applyGuess(first.state, '1243', () => 3000);

    expect(second.outcome).toBe('duplicate');
    expect(second.state).toBe(first.state);
    expect(second.state.history).toHaveLength(1);
  });

  it('treats hex guesses case insensitively for duplicates', () => {
    const hexSettings: Settings = { length: 2, base: 16 };
    const state = startRound(hexSettings, { random: () => 0, now: () => 1000 });
    const first = applyGuess(state, 'ab', () => 2000);
    const second = applyGuess(first.state, 'AB', () => 3000);

    expect(second.outcome).toBe('duplicate');
  });

  it('marks the round as won when every digit is a bull', () => {
    const clock = createClock(1000);
    const state = startRound(SETTINGS, { random: () => 0, now: clock.now });

    clock.advance(1500);
    const { state: next, outcome } = applyGuess(state, '0123', clock.now);

    expect(outcome).toBe('won');
    expect(next.status).toBe('won');
    expect(next.finishedAt).toBe(2500);
  });

  it('rejects guesses after the round is won', () => {
    const state = startPlayingRound();
    const won = applyGuess(state, '0123', () => 2000);
    const after = applyGuess(won.state, '1243', () => 3000);

    expect(after.outcome).toBe('invalid');
    expect(after.state).toBe(won.state);
  });
});

describe('newGame', () => {
  it('returns to the settings screen', () => {
    const state = applyGuess(startPlayingRound(), '1243', () => 2000).state;

    expect(state.status).toBe('playing');
    expect(newGame()).toEqual(createIdleState());
    expect(newGame().status).toBe('settings');
    expect(newGame().history).toEqual([]);
  });
});

describe('toRecordEntry', () => {
  it('builds a record entry for a won round', () => {
    const clock = createClock(1000);
    const state = startRound(SETTINGS, { random: () => 0, now: clock.now });
    const first = applyGuess(state, '1243', clock.now);

    clock.advance(3000);
    const won = applyGuess(first.state, '0123', clock.now).state;

    expect(toRecordEntry(won)).toEqual({
      attempts: 2,
      timeMs: 3000,
      length: 4,
      base: 10,
      createdAt: 4000,
    });
  });

  it('returns null while the round is still playing', () => {
    expect(toRecordEntry(startPlayingRound())).toBeNull();
  });
});
