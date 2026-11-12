import { describe, expect, it } from 'vitest'
import { ANSWERS, DEFINITIONS, isAcceptedGuess } from '../words'

describe('answer list', () => {
  it('contains only five-letter uppercase words (a sixth letter would break the board)', () => {
    const bad = ANSWERS.filter((w) => !/^[A-Z]{5}$/.test(w))
    expect(bad).toEqual([])
  })

  it('has no duplicates (a duplicate silently repeats a daily puzzle)', () => {
    const seen = new Set<string>()
    const dupes = ANSWERS.filter((w) => (seen.has(w) ? true : (seen.add(w), false)))
    expect(dupes).toEqual([])
  })

  it('stays at 100+ words, the threshold under which the daily cadence decision flips', () => {
    // ADR-0001 QST-PUZZLE-CADENCE was answered C on the condition that the list is
    // not under ~100 words ("a daily puzzle repeats within one semester"). If this
    // fails, the decision's falsifier fired: reopen the question, don't just lower the bar.
    expect(ANSWERS.length).toBeGreaterThanOrEqual(100)
  })

  it('has a definition for every answer, so the end-of-game reveal is never blank', () => {
    // Appending a word to answers.ts without defining it is the easy mistake.
    const undefinedWords = ANSWERS.filter((w) => !DEFINITIONS[w]?.trim())
    expect(undefinedWords).toEqual([])
  })

  it('has no definitions for words that are not answers (a typo in a key hides a missing one)', () => {
    const orphans = Object.keys(DEFINITIONS).filter((w) => !ANSWERS.includes(w))
    expect(orphans).toEqual([])
  })
})

describe('isAcceptedGuess', () => {
  it('accepts ordinary English words, so non-CS players can open with CRANE', () => {
    expect(isAcceptedGuess('CRANE')).toBe(true)
    expect(isAcceptedGuess('slate')).toBe(true)
  })

  it('accepts every CS answer, including terms no English dictionary has', () => {
    // MUTEX, REGEX, ASYNC, QUBIT are not in ENABLE; without the union with
    // ANSWERS a player could not type the very word they are hunting for.
    const rejected = ANSWERS.filter((w) => !isAcceptedGuess(w))
    expect(rejected).toEqual([])
  })

  it('rejects letter-probing nonsense', () => {
    expect(isAcceptedGuess('AEIOU')).toBe(false)
    expect(isAcceptedGuess('QWXYZ')).toBe(false)
  })
})
