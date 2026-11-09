import type { GameState, GuessOutcome, RecordEntry, Settings } from './types.js';

export type RoundDeps = { random: () => number; now: () => number };

export const createIdleState = (): GameState => {
  throw new Error('not implemented');
};

export const startRound = (_settings: Settings, _deps: RoundDeps): GameState => {
  throw new Error('not implemented');
};

export const applyGuess = (
  _state: GameState,
  _guess: string,
  _now: () => number,
): { state: GameState; outcome: GuessOutcome } => {
  throw new Error('not implemented');
};

export const newGame = (): GameState => {
  throw new Error('not implemented');
};

export const toRecordEntry = (_state: GameState): RecordEntry | null => {
  throw new Error('not implemented');
};
