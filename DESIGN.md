# Design

## 1. Data structures and algorithms

### Secret: `readonly string[]`

The secret is an array of single-character strings, not a number and not a `string`.

- A number cannot hold leading zeros, so `0123` would become `123`. A character array keeps the value the player actually sees.
- A `string` would work too, but an array is a better fit for the algorithms: bulls are counted by position, so `reduce` over an array is the natural expression.
- Each element is one digit in its base (`'0'`–`'1'`, `'0'`–`'7'`, `'0'`–`'9'`, `'0'`–`'9a'`–`'f'`), always lowercased by `normalizeDigit`.
- Typed `readonly` so no consumer can change a secret in place. `generateSecret` returns a fresh array on every call.

### Attempts history: `readonly Attempt[]`

```ts
type Attempt = { guess: string; result: GuessResult };
```

- History is a plain array that only ever grows by replacement: `[...state.history, attempt]`. Nothing calls `push`, `splice` or `sort` on it.
- Why immutable: the previous state stays valid, tests can compare snapshots, and rendering becomes a pure function of state. Re-rendering cannot desynchronise from data, because rendering never mutates data.
- Cost is acceptable because a round is short (a few dozen attempts at most), and structural sharing keeps the untouched state objects intact.
- Entries are never edited or removed: an attempt is a fact about the past.

### Game state

```ts
type GameState = {
  status: 'settings' | 'playing' | 'won';
  settings: Settings | null;
  secret: readonly string[] | null;
  history: readonly Attempt[];
  startedAt: number | null;
  finishedAt: number | null;
};
```

A flat record plus a `status` field was chosen over a class and over a fully discriminated union:

- a plain record is serialisable, spreadable and trivially comparable in tests;
- transitions are pure functions returning a new record, so there is no hidden mutable state;
- nullable fields are only read after a `status` check in `applyGuess` and `toRecordEntry`, which act as guard clauses.

Side effects are not stored in the state, they are injected as parameters:

- `random` into `generateSecret` and `startRound`;
- `now` into `startRound`, `applyGuess` and `toRecordEntry` (as a `() => number` clock);
- `storage` into `createRecordsStore`;
- all three into `createApp`.

That is what makes the core testable without a browser: the test supplies `() => 0` and a frozen clock, and the result becomes deterministic.

### `generateSecret(length, base, random)`

1. Take the digit alphabet of the base from `DIGITS_BY_BASE` as a pool.
2. Pick an index: `Math.floor(random() * pool.length)`.
3. Take the digit at that index and rebuild the pool without it (`filter` by index).
4. Repeat `length` times, collecting the digits.

Because the pool shrinks after every pick, a digit can never be chosen twice — uniqueness is structural, not a retry loop. Each position is chosen uniformly from the remaining digits, so all `P(base, length)` secrets are equally likely when `random` is uniform.

The function is a pure function of its three arguments: passing a deterministic `random` (for example `() => 0`) yields the same secret every time. `Math.random` is only the default value of the parameter.

### `evaluateGuess(secret, guess)`

1. Normalise both sides: `secret.map(normalizeDigit)`, `[...guess].map(normalizeDigit)`.
2. **Bulls** — `reduce` over the guess, comparing `digit` with `normalizedSecret[index]`. A manual index counter is not needed: `reduce` already carries the index.
3. **Cows** — build a `Set` of secret digits, `filter` the guess by membership, subtract `bulls` from the size of the result.

The subtraction is correct because the secret and every valid guess contain unique digits: each guess digit is either a bull, a cow, or absent. Without the subtraction, digits already scored as bulls would be counted twice.

### `countPossibleSecrets(length, base)`

The number of secrets is the number of ordered arrangements without repetition:

```
P(length, base) = base * P(length - 1, base - 1)
P(0, base)      = 1
P(length, base) = 0   when length > base
```

The implementation follows that recurrence directly. The recursive function is wrapped in `memoize` with the key `` `${length}:${base}` ``, so the chain of subproblems is computed once and every later lookup (settings screen, repeated renders) is a `Map` hit.

### Leaderboard and storage

```ts
type RecordEntry = {
  attempts: number;
  timeMs: number;
  length: number;
  base: Base;
  createdAt: number;
};
```

- One shared top-10 table: `length` and `base` are stored per entry and rendered as a badge (`Decimal · 4 digits`). This avoids a matrix of storage keys while still showing which settings a result was achieved in.
- `addRecord` copies the input array, sorts it with a comparator (`attempts`, then `timeMs`, then `createdAt`) and slices off everything after the limit. The input array is never mutated.
- `createRecordsStore(storage)` hides `localStorage` behind a two-method interface (`load`, `save`). `load` guards `JSON.parse` with `try`/`catch`, rejects non-arrays and filters out objects that do not match `RecordEntry`. Corrupted storage degrades to an empty table instead of crashing the app.
- The key is namespaced and versioned: `bulls-and-cows:records:v1`.

## 2. Complexity

Here `n` is the secret length and `b` is the base; in this game `n ≤ 6` and `b ≤ 16`.

| Function               | Time                                 | Space | Why                                                                                                                                                                   |
| ---------------------- | ------------------------------------ | ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `generateSecret`       | O(n · b)                             | O(b)  | Each of the `n` picks copies the remaining pool, and the pool is never larger than `b`; the stored result is `n` digits, the recursion adds O(n) stack frames.        |
| `evaluateGuess`        | O(n)                                 | O(n)  | Two normalisation passes over `n`, one `reduce` over `n`, one `filter` over `n`, and a `Set` of at most `n` digits. Nothing is nested inside a loop over the input.   |
| `isValidGuess`         | O(n)                                 | O(n)  | One pass for the alphabet check (`every`), one pass to build the `Set` of seen digits. The membership test itself is O(1) because the alphabet is a 16-element array. |
| `countPossibleSecrets` | O(n) first call, O(1) on a cache hit | O(n)  | The recursion depth is `n` and each level does O(1) work, so the first call computes at most `n` cached pairs; afterwards `memoize` returns from the `Map`.           |

The practical consequence: even the slowest function runs in microseconds at the maximum settings (`n = 6`, `b = 16`), so no optimisation beyond memoisation is justified.

## 3. Clean code principles

**Pure functions and separation of effects.** Everything in `src/core/` is a pure function of its arguments: no `document`, no `Date.now()`, no `Math.random()`, no `localStorage`. Effects are injected:

- `generateSecret(length, base, random)` — randomness is a parameter, not a global;
- `startRound(settings, { random, now })` and `applyGuess(state, guess, now)` — the clock is a parameter;
- `createRecordsStore(storage)` — the storage object is a parameter;
- `createApp(root, { storage, now, random })` — the only place where real effects are wired together is `src/main.ts`.

**Dependency direction.** `ui` imports `core`; `core` never imports `ui`. The DOM layer can be replaced without touching game rules.

**Single responsibility.** Each module answers one question: `digits.ts` — what digits exist and how case is normalised; `create-digit-validator.ts` — is this character a digit of this base; `evaluate-guess.ts` — how many bulls and cows; `state.ts` — how the round transitions; `leaderboard.ts` — how results are ranked; `records-store.ts` — how results are persisted. `src/ui/app.ts` only translates events into those calls and state into DOM.

**DRY without over-abstraction.** `normalizeDigit` is defined once and used in `createDigitValidator`, `isValidGuess`, `evaluateGuess` and `applyGuess` (duplicate detection). Case handling is decided in exactly one place, which is what prevents the classic `A` vs `a` bug. `memoize` is a single generic higher-order function, not two ad-hoc copies.

**Meaningful names and no magic numbers.** `bulls`, `cows`, `guess`, `attempts`, `timeMs`, `startedAt`, `finishedAt`, `isLengthAvailable`. Constants are named: `DIGITS_BY_BASE`, `DEFAULT_LIMIT`, `RECORDS_STORAGE_KEY`, `LENGTHS`, `BASES`. The comparator in `leaderboard.ts` reads as the ranking rule itself: attempts, then time, then creation order.

**Small functions, one level of abstraction.** `evaluateGuess` is two readable steps (bulls, cows) instead of one nested loop. `renderSettings`, `renderGame`, `renderHistory` and `renderLeaderboard` each build one section; `render` only chooses the screen. `applyGuess` uses guard clauses for the three early exits (not playing, invalid input, duplicate), so the happy path stays flat and unindented.

**Higher-order functions and recursion where the task calls for them.** `map`/`filter`/`reduce` in `evaluateGuess` and `isValidGuess`; `every` with the curried validator; `memoize` as a higher-order function; recursion in `generateSecret` and `countPossibleSecrets`.

**Immutability by construction.** `readonly` types in the domain, spread updates in `state.ts`, `[...history, attempt]`, and `addRecord` returning a new sorted array. No function in `core` mutates its arguments, which the tests assert by comparing the previous state after each transition.

**Boundaries handle bad input, the core does not.** `records-store.ts` validates parsed JSON before it reaches the domain; `generateSecret` raises `RangeError` for an impossible configuration (`length > base`); `applyGuess` returns an outcome value (`invalid`, `duplicate`, `accepted`, `won`) instead of throwing, so the UI decides what to show.

**No classes in the game logic.** State lives in closures (`createApp`) or in plain objects passed between functions. There is no `class` in `src/core/`, and `src/ui` renders with `createElement` and `textContent` only — `innerHTML` and `insertAdjacentHTML` are forbidden by an ESLint rule (`no-restricted-syntax`).
