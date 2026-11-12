import { MAX_GUESSES, WORD_LENGTH, scoreGuess, type LetterState } from './feedback'

export type GameStatus = 'playing' | 'won' | 'lost'

export interface GameState {
  readonly answer: string
  readonly guesses: readonly string[]
  readonly status: GameStatus
}

export type RejectReason = 'too-short' | 'not-a-word' | 'game-over'

export type SubmitResult =
  | { ok: true; state: GameState }
  | { ok: false; reason: RejectReason }

/**
 * The game core takes the answer as INPUT (QST-PUZZLE-CADENCE = C): daily and
 * practice modes differ only in how the answer is picked, never in the rules.
 * Pure functions on immutable state — the Vue layer just holds the current value.
 */
export function newGame(answer: string): GameState {
  return { answer: answer.toUpperCase(), guesses: [], status: 'playing' }
}

export function submitGuess(
  state: GameState,
  rawGuess: string,
  isWord: (w: string) => boolean,
): SubmitResult {
  if (state.status !== 'playing') return { ok: false, reason: 'game-over' }
  const guess = rawGuess.toUpperCase()
  if (guess.length !== WORD_LENGTH) return { ok: false, reason: 'too-short' }
  if (!isWord(guess)) return { ok: false, reason: 'not-a-word' }

  const guesses = [...state.guesses, guess]
  const status: GameStatus =
    guess === state.answer ? 'won' : guesses.length >= MAX_GUESSES ? 'lost' : 'playing'
  return { ok: true, state: { ...state, guesses, status } }
}

/**
 * Rebuild a game from saved guesses (e.g. after a page reload). Guesses that
 * would be rejected now are dropped rather than trusted — saved data is just
 * whatever was in localStorage, and it can be stale or hand-edited.
 */
export function restoreGame(
  answer: string,
  saved: readonly string[],
  isWord: (w: string) => boolean,
): GameState {
  let state = newGame(answer)
  for (const g of saved) {
    const r = submitGuess(state, g, isWord)
    if (r.ok) state = r.state
  }
  return state
}

const RANK: Record<LetterState, number> = { absent: 0, present: 1, correct: 2 }

/**
 * Best-known state per letter, for colouring the on-screen keyboard.
 * A letter seen as `correct` anywhere stays `correct` even if a later guess
 * shows it `present` or `absent` (e.g. the second copy of a repeated letter).
 */
export function keyboardStates(state: GameState): Record<string, LetterState> {
  const best: Record<string, LetterState> = {}
  for (const guess of state.guesses) {
    const scored = scoreGuess(guess, state.answer)
    for (let i = 0; i < guess.length; i++) {
      const ch = guess[i]!
      const s = scored[i]!
      const prev = best[ch]
      if (prev === undefined || RANK[s] > RANK[prev]) best[ch] = s
    }
  }
  return best
}
