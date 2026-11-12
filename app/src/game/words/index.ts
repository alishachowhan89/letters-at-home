import { ANSWERS } from './answers'
import { ENGLISH_GUESSES_RAW } from './guesses'

const ACCEPTED = new Set<string>([...ENGLISH_GUESSES_RAW.split(' '), ...ANSWERS])

/**
 * Is this an accepted guess? (ADR-0001, QST-VALID-GUESSES = B)
 * Any English five-letter word from ENABLE, plus every CS answer — the union
 * matters because terms like MUTEX, REGEX, ASYNC are not in English dictionaries.
 */
export function isAcceptedGuess(word: string): boolean {
  return ACCEPTED.has(word.toUpperCase())
}

export { ANSWERS }
export { DEFINITIONS } from './definitions'
