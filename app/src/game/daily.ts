import { ANSWERS } from './words'

/** Day 0 of the daily schedule: the day the project started (ADR-0001). */
export const EPOCH = { year: 2026, month: 11, day: 12 } as const

const MS_PER_DAY = 86_400_000

/**
 * Days since EPOCH, using the player's LOCAL calendar date (rollover at local
 * midnight, per QST-PUZZLE-CADENCE option text).
 *
 * Computed from calendar components via Date.UTC — never by subtracting two
 * local timestamps. Local days are 23 or 25 hours long across a DST change,
 * so timestamp division drifts by an hour and can floor to the wrong day.
 */
export function dayNumber(now: Date): number {
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  const epoch = Date.UTC(EPOCH.year, EPOCH.month - 1, EPOCH.day)
  return Math.floor((today - epoch) / MS_PER_DAY)
}

/** The daily answer for a given day number; wraps after the list runs out. */
export function answerForDay(day: number, answers: readonly string[] = ANSWERS): string {
  const i = ((day % answers.length) + answers.length) % answers.length
  return answers[i]!
}
