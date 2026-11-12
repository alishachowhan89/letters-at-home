export const WORD_LENGTH = 5
export const MAX_GUESSES = 6

export type LetterState = 'correct' | 'present' | 'absent'

/**
 * Score a guess against the answer, letter by letter (ADR-0001, repeated-letter rule).
 *
 * Two passes, so a repeated letter is never credited more times than it occurs
 * in the answer:
 *   1. exact-position matches are `correct` and consume that answer letter;
 *   2. remaining guess letters, left to right, are `present` only while an
 *      unconsumed copy of that letter is left in the answer, else `absent`.
 *
 * Both inputs must be WORD_LENGTH uppercase letters (callers validate first).
 */
export function scoreGuess(guess: string, answer: string): LetterState[] {
  const result: LetterState[] = Array(guess.length).fill('absent')
  const remaining = new Map<string, number>()

  for (let i = 0; i < answer.length; i++) {
    if (guess[i] === answer[i]) {
      result[i] = 'correct'
    } else {
      const ch = answer[i]!
      remaining.set(ch, (remaining.get(ch) ?? 0) + 1)
    }
  }

  for (let i = 0; i < guess.length; i++) {
    if (result[i] === 'correct') continue
    const ch = guess[i]!
    const left = remaining.get(ch) ?? 0
    if (left > 0) {
      result[i] = 'present'
      remaining.set(ch, left - 1)
    }
  }

  return result
}
