import { describe, expect, it } from 'vitest'
import { scoreGuess } from '../feedback'

// The scoring rule is the one piece of logic every player sees on every guess.
// Repeated letters are where implementations go wrong (ADR-0001, assumption 2),
// so most cases here are about them.

describe('scoreGuess', () => {
  it('marks every letter correct when the guess is the answer', () => {
    expect(scoreGuess('STACK', 'STACK')).toEqual(['correct', 'correct', 'correct', 'correct', 'correct'])
  })

  it('marks letters absent when none appear in the answer', () => {
    expect(scoreGuess('PIXEL', 'STACK')).toEqual(['absent', 'absent', 'absent', 'absent', 'absent'])
  })

  it('marks right-letter-wrong-spot as present', () => {
    // CACHE vs STACK: nothing lines up. STACK has one C and one A, so CACHE's
    // first C and its A are present; its second C finds no C left, so absent.
    expect(scoreGuess('CACHE', 'STACK')).toEqual(['present', 'present', 'absent', 'absent', 'absent'])
  })

  it('credits a repeated guess letter only as many times as the answer has it (ADR-0001 worked example)', () => {
    // QUEUE has two E's; EERIE has three. The last E is correct (uses one E),
    // the first E is present (uses the other), the second E gets nothing.
    expect(scoreGuess('EERIE', 'QUEUE')).toEqual(['present', 'absent', 'absent', 'absent', 'correct'])
  })

  it('gives an exact match priority over an earlier wrong-spot copy of the same letter', () => {
    // TOKEN has one E, at index 3. EMBED has E at 0 and at 3.
    // A one-pass left-to-right scorer would spend TOKEN's E on index 0 ("present")
    // and then mark the exact match at index 3 as absent — the classic bug.
    expect(scoreGuess('EMBED', 'TOKEN')).toEqual(['absent', 'absent', 'absent', 'correct', 'absent'])
  })

  it('marks both copies present when the answer also has the letter twice', () => {
    // ARRAY has A×2 and R×2; RADIX has one R and one A, both in wrong spots.
    expect(scoreGuess('RADIX', 'ARRAY')).toEqual(['present', 'present', 'absent', 'absent', 'absent'])
  })
})
