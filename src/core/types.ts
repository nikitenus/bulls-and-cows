export type Base = 2 | 8 | 10 | 16;

export type GuessResult = { bulls: number; cows: number };

export type Settings = { length: number; base: Base };

export type Attempt = { guess: string; result: GuessResult };

export type GameStatus = 'settings' | 'playing' | 'won';

export type GameState = {
  status: GameStatus;
  settings: Settings | null;
  secret: readonly string[] | null;
  history: readonly Attempt[];
  startedAt: number | null;
  finishedAt: number | null;
};

export type GuessOutcome = 'invalid' | 'duplicate' | 'accepted' | 'won';

export type RecordEntry = {
  attempts: number;
  timeMs: number;
  length: number;
  base: Base;
  createdAt: number;
};
