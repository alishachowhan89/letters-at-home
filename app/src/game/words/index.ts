import { ANSWERS } from './answers'
import { ENGLISH_GUESSES_RAW } from './guesses'

const ACCEPTED = new Set<string>([...ENGLISH_GUESSES_RAW.split(' '), ...ANSWERS])

/**
 * Is this an accepted guess? (ADR-0001, QST-VALID-GUESSES = B)
 * Any English five-letter word from ENABLE. ANSWERS is unioned in so an answer
 * can never be unguessable, even if one is someday added that ENABLE lacks
 * (the CS list needed this for MUTEX, REGEX, …; the everyday list of ADR-0003
 * is all in ENABLE today).
 */
export function isAcceptedGuess(word: string): boolean {
  return ACCEPTED.has(word.toUpperCase())
}

export { ANSWERS }
