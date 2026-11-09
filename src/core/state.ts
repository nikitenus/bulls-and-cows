import { evaluateGuess } from './evaluate-guess.js';
import { generateSecret } from './generate-secret.js';
import { isValidGuess } from './is-valid-guess.js';
import type { Attempt, GameState, GuessOutcome, RecordEntry, Settings } from './types.js';

export type RoundDeps = { random: () => number; now: () => number };

const IDLE_STATE: GameState = {
  status: 'settings',
  settings: null,
  secret: null,
  history: [],
  startedAt: null,
  finishedAt: null,
};

export const createIdleState = (): GameState => IDLE_STATE;

export const startRound = (settings: Settings, deps: RoundDeps): GameState => {
  const secret = generateSecret(settings.length, settings.base, deps.random);

  return {
    status: 'playing',
    settings,
    secret,
    history: [],
    startedAt: deps.now(),
    finishedAt: null,
  };
};

export const applyGuess = (
  state: GameState,
  guess: string,
  now: () => number,
): { state: GameState; outcome: GuessOutcome } => {
  const { status, settings, secret } = state;

  if (status !== 'playing' || settings === null || secret === null) {
    return { state, outcome: 'invalid' };
  }

  if (!isValidGuess(guess, settings.length, settings.base)) {
    return { state, outcome: 'invalid' };
  }

  const normalizedGuess = guess.toLowerCase();

  if (state.history.some((attempt) => attempt.guess === normalizedGuess)) {
    return { state, outcome: 'duplicate' };
  }

  const attempt: Attempt = {
    guess: normalizedGuess,
    result: evaluateGuess(secret, normalizedGuess),
  };
  const isWon = attempt.result.bulls === settings.length;

  return {
    state: {
      ...state,
      history: [...state.history, attempt],
      status: isWon ? 'won' : status,
      finishedAt: isWon ? now() : state.finishedAt,
    },
    outcome: isWon ? 'won' : 'accepted',
  };
};

export const newGame = (): GameState => createIdleState();

export const toRecordEntry = (state: GameState): RecordEntry | null => {
  const { status, settings, startedAt, finishedAt } = state;

  if (status !== 'won' || settings === null || startedAt === null || finishedAt === null) {
    return null;
  }

  return {
    attempts: state.history.length,
    timeMs: finishedAt - startedAt,
    length: settings.length,
    base: settings.base,
    createdAt: finishedAt,
  };
};
