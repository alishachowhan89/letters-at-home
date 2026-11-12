import { describe, expect, it } from 'vitest'
import { ANSWERS, isAcceptedGuess } from '../words'

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
})

describe('isAcceptedGuess', () => {
  it('accepts ordinary English words, so a player can open with CRANE', () => {
    expect(isAcceptedGuess('CRANE')).toBe(true)
    expect(isAcceptedGuess('slate')).toBe(true)
  })

  it('accepts every answer, so no daily word is ever unguessable', () => {
    // If an answer were rejected as "not in the word list", the player could
    // never type the word they are hunting for.
    const rejected = ANSWERS.filter((w) => !isAcceptedGuess(w))
    expect(rejected).toEqual([])
  })

  it('rejects letter-probing nonsense', () => {
    expect(isAcceptedGuess('AEIOU')).toBe(false)
    expect(isAcceptedGuess('QWXYZ')).toBe(false)
  })
})
