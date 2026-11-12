import { describe, expect, it } from 'vitest'
import { pickPracticeAnswer } from '../practice'
import { ANSWERS } from '../words'

describe('pickPracticeAnswer', () => {
  it("never picks today's daily answer, whatever the random draw", () => {
    // Practice must not spoil the daily puzzle. Sweep the random range so every
    // index is tried, not just whatever Math.random happens to return.
    const today = ANSWERS[0]!
    for (let i = 0; i < ANSWERS.length; i++) {
      const r = i / ANSWERS.length
      expect(pickPracticeAnswer(ANSWERS, [today], () => r)).not.toBe(today)
    }
  })

  it('does not repeat the word just played', () => {
    const [a, b] = ['STACK', 'QUEUE']
    expect(pickPracticeAnswer([a, b], [a], () => 0)).toBe(b)
    expect(pickPracticeAnswer([a, b], [a], () => 0.99)).toBe(b)
  })

  it('always returns a real answer', () => {
    expect(ANSWERS).toContain(pickPracticeAnswer(ANSWERS, [], () => 0.5))
  })
})
