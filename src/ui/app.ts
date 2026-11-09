import { countPossibleSecrets } from '../core/count-possible-secrets.js';
import { createDigitValidator } from '../core/create-digit-validator.js';
import { DIGITS_BY_BASE } from '../core/digits.js';
import { applyGuess, createIdleState, newGame, startRound } from '../core/state.js';
import type { Attempt, Base, GameState, Settings } from '../core/types.js';
import { el } from './dom.js';

const LENGTHS = [2, 3, 4, 5, 6];
const BASES: readonly Base[] = [2, 8, 10, 16];

const BASE_LABELS: Record<Base, string> = {
  2: 'Binary',
  8: 'Octal',
  10: 'Decimal',
  16: 'Hexadecimal',
};

export type AppDeps = {
  now: () => number;
  random: () => number;
};

type AppState = {
  game: GameState;
  settingsDraft: Settings;
  draft: string;
  message: string | null;
};

const availableLengths = (base: Base): number[] =>
  LENGTHS.filter((length) => length <= DIGITS_BY_BASE[base].length);

const describeSettings = (settings: Settings): string =>
  `${BASE_LABELS[settings.base]} · ${settings.length} digits`;

const formatDuration = (timeMs: number): string => `${(timeMs / 1000).toFixed(1)} s`;

const formatNumber = (value: number): string => value.toLocaleString('en-US');

export const createApp = (root: HTMLElement, deps: AppDeps): void => {
  const state: AppState = {
    game: createIdleState(),
    settingsDraft: { length: 4, base: 10 },
    draft: '',
    message: null,
  };

  const focusGuess = (): void => {
    root.querySelector<HTMLInputElement>('#guess')?.focus();
  };

  const render = (): void => {
    root.replaceChildren(state.game.status === 'settings' ? renderSettings() : renderGame());
  };

  const updateSettings = (patch: Partial<Settings>): void => {
    const merged = { ...state.settingsDraft, ...patch };
    const lengths = availableLengths(merged.base);

    state.settingsDraft = {
      base: merged.base,
      length: lengths.includes(merged.length) ? merged.length : (lengths.at(-1) ?? 2),
    };

    render();
  };

  const start = (): void => {
    state.game = startRound(state.settingsDraft, { random: deps.random, now: deps.now });
    state.draft = '';
    state.message = null;
    render();
    focusGuess();
  };

  const reset = (): void => {
    state.game = newGame();
    state.draft = '';
    state.message = null;
    render();
  };

  const submitGuess = (): void => {
    const { state: next, outcome } = applyGuess(state.game, state.draft, deps.now);

    if (outcome === 'invalid') {
      const length = state.game.settings?.length ?? 0;
      state.message = `Enter ${length} unique digits allowed in this base.`;
      render();
      focusGuess();
      return;
    }

    if (outcome === 'duplicate') {
      state.message = 'You have already tried this guess.';
      render();
      focusGuess();
      return;
    }

    state.game = next;
    state.draft = '';
    state.message = null;
    render();

    if (next.status === 'playing') {
      focusGuess();
    }
  };

  const renderHistory = (history: readonly Attempt[]): HTMLElement => {
    const rows = history
      .map((attempt, index) =>
        el('tr', {}, [
          el('td', { textContent: String(index + 1) }),
          el('td', { textContent: attempt.guess }),
          el('td', { textContent: String(attempt.result.bulls) }),
          el('td', { textContent: String(attempt.result.cows) }),
        ]),
      )
      .reverse();

    const body =
      rows.length > 0
        ? rows
        : [el('tr', {}, [el('td', { colSpan: 4, textContent: 'No attempts yet.' })])];

    return el('section', {}, [
      el('h2', { textContent: 'Attempts' }),
      el('table', {}, [
        el('thead', {}, [
          el('tr', {}, [
            el('th', { textContent: '#' }),
            el('th', { textContent: 'Guess' }),
            el('th', { textContent: 'Bulls' }),
            el('th', { textContent: 'Cows' }),
          ]),
        ]),
        el('tbody', {}, body),
      ]),
    ]);
  };

  const renderSettings = (): HTMLElement => {
    const { length, base } = state.settingsDraft;
    const lengths = availableLengths(base);

    const lengthSelect = el(
      'select',
      { id: 'length', name: 'length' },
      LENGTHS.map((value) =>
        el('option', {
          value: String(value),
          textContent: String(value),
          disabled: !lengths.includes(value),
        }),
      ),
    );
    lengthSelect.value = String(length);
    lengthSelect.addEventListener('change', () =>
      updateSettings({ length: Number(lengthSelect.value) }),
    );

    const baseSelect = el(
      'select',
      { id: 'base', name: 'base' },
      BASES.map((value) =>
        el('option', { value: String(value), textContent: `${BASE_LABELS[value]} (${value})` }),
      ),
    );
    baseSelect.value = String(base);
    baseSelect.addEventListener('change', () =>
      updateSettings({ base: Number(baseSelect.value) as Base }),
    );

    const form = el('form', { className: 'settings' }, [
      el('div', { className: 'field' }, [
        el('label', { htmlFor: 'length', textContent: 'Digits' }),
        lengthSelect,
      ]),
      el('div', { className: 'field' }, [
        el('label', { htmlFor: 'base', textContent: 'Base' }),
        baseSelect,
      ]),
      el('p', {
        className: 'hint',
        textContent: `Possible secrets: ${formatNumber(countPossibleSecrets(length, base))}`,
      }),
      el('button', { type: 'submit', textContent: 'Start game' }),
    ]);
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      start();
    });

    return el('main', { className: 'card' }, [
      el('h1', { textContent: 'Bulls and Cows' }),
      el('p', {
        className: 'hint',
        textContent:
          'Guess the secret number. Bulls are correct digits in the correct place, cows are correct digits in the wrong place.',
      }),
      form,
    ]);
  };

  const renderGame = (): HTMLElement => {
    const { game } = state;
    const settings = game.settings;

    if (settings === null) {
      return el('main', { className: 'card' }, []);
    }

    const isWon = game.status === 'won';
    const validator = createDigitValidator(settings.base);

    const input = el('input', {
      id: 'guess',
      name: 'guess',
      type: 'text',
      autocomplete: 'off',
      maxLength: settings.length,
      className: 'guess',
      disabled: isWon,
    });
    input.value = state.draft;
    input.addEventListener('input', () => {
      const filtered = [...input.value].filter(validator).slice(0, settings.length).join('');
      input.value = filtered;
      state.draft = filtered;
    });

    const feedback = el('p', { className: 'feedback', textContent: state.message ?? '' });
    feedback.setAttribute('aria-live', 'polite');

    const form = el('form', { className: 'guess-form' }, [
      el('label', { htmlFor: 'guess', textContent: `Your guess (${settings.length} digits)` }),
      input,
      el('button', { type: 'submit', textContent: 'Guess', disabled: isWon }),
    ]);
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      submitGuess();
    });

    const newGameButton = el('button', { type: 'button', textContent: 'New game' });
    newGameButton.addEventListener('click', reset);

    const result =
      isWon && game.startedAt !== null && game.finishedAt !== null
        ? el('p', {
            className: 'banner',
            textContent: `You won in ${game.history.length} attempts and ${formatDuration(
              game.finishedAt - game.startedAt,
            )}!`,
          })
        : null;

    const children = [
      el('header', {}, [
        el('h1', { textContent: 'Bulls and Cows' }),
        el('p', { className: 'hint', textContent: describeSettings(settings) }),
        newGameButton,
      ]),
      result,
      form,
      feedback,
      renderHistory(game.history),
    ].filter((node): node is HTMLElement => node !== null);

    return el('main', { className: 'card' }, children);
  };

  render();
};
