# Bulls and Cows

A browser implementation of the classic code-breaking game. The computer picks a secret number made of unique digits, and the player has to guess it. After every attempt the game reports how many digits are correct and in the right place (**bulls**) and how many are correct but in the wrong place (**cows**).

The focus of this project is the architecture: the whole game logic is a set of pure functions with no classes and no DOM dependency.

**Live demo:** https://nikitenus.github.io/bulls-and-cows/

## Features

- Secret length from 2 to 6 digits.
- Four numeral systems: binary (`2`), octal (`8`), decimal (`10`), hexadecimal (`16`).
- Length options that cannot exist in the selected base are disabled (binary only allows length 2).
- Input accepts only digits valid for the base; hex `A`–`F` is accepted in any case.
- Attempt history with bulls and cows, immutable appends, duplicate guesses are reported but not added twice.
- No attempt limit; the result is ranked by attempts and then by time.
- Top-10 leaderboard in `localStorage` with the settings badge for every result, survives a page reload.
- "New game" returns to the settings screen without a reload.
- Light and dark themes via `prefers-color-scheme`.

## Stack

TypeScript (ES modules, no bundler), Vitest, ESLint, Prettier, Husky + lint-staged.

## Scripts

| Command                | What it does                            |
| ---------------------- | --------------------------------------- |
| `npm ci`               | install dependencies from the lockfile  |
| `npm run build`        | compile `src/` to `dist/` with `tsc`    |
| `npm test`             | run the unit tests once                 |
| `npm run lint`         | lint the project with ESLint            |
| `npm run format`       | format the project with Prettier        |
| `npm run format:check` | verify formatting without writing files |

## Local run

```sh
npm ci
npm run build
npx serve . -l 3000
```

Then open http://localhost:3000. The page loads `dist/main.js` as a native ES module, so it has to be served over HTTP (opening the file directly will not work).

## Project structure

```
src/
  core/      pure game logic: generation, validation, scoring, state, leaderboard
  ui/        DOM rendering and event wiring
  main.ts    entry point, wires the real effects into createApp
```

`src/core` never imports `src/ui` and never touches `document`, `localStorage`, `Date.now()` or `Math.random()` — those are injected as parameters. See [DESIGN.md](./DESIGN.md) for data structures, complexity analysis and clean-code notes.

## Deploy

Every push to `bulls-and-cows` builds the project and publishes it to GitHub Pages via the workflow in `.github/workflows/deploy.yml`. The Pages source must be set to **GitHub Actions**.
