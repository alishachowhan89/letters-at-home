import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { answerForDay, dayNumber } from '../daily'
import { ANSWERS } from '../words'

// Pin a timezone that has daylight saving, so the DST case means something even
// on a CI runner set to UTC (Node re-reads TZ when it changes at runtime).
const savedTZ = process.env.TZ
beforeAll(() => {
  process.env.TZ = 'America/New_York'
})
afterAll(() => {
  process.env.TZ = savedTZ
})

describe('dayNumber', () => {
  it('is 0 on the epoch date, morning or night', () => {
    expect(dayNumber(new Date(2026, 10, 12, 0, 1))).toBe(0)
    expect(dayNumber(new Date(2026, 10, 12, 23, 59))).toBe(0)
  })

  it('rolls over at local midnight', () => {
    expect(dayNumber(new Date(2026, 10, 13, 0, 0))).toBe(1)
  })

  it('does not lose a day after the spring DST change', () => {
    // Epoch is in EST (UTC-5); 2027-03-15 is in EDT (UTC-4). Subtracting local
    // midnights gives 123 days minus one hour, which floors to 122 — so every
    // player in a DST zone would get yesterday's word until next November.
    expect(dayNumber(new Date(2027, 2, 15, 0, 30))).toBe(123)
    expect(dayNumber(new Date(2027, 2, 15, 23, 30))).toBe(123)
  })
})

describe('answerForDay', () => {
  it('walks the list in file order, so appending words never changes past days', () => {
    expect(answerForDay(0)).toBe(ANSWERS[0])
    expect(answerForDay(1)).toBe(ANSWERS[1])
  })

  it('wraps around when the list runs out', () => {
    expect(answerForDay(ANSWERS.length)).toBe(ANSWERS[0])
  })

  it('still returns a real answer before the epoch (a player whose clock or date is behind launch)', () => {
    expect(ANSWERS).toContain(answerForDay(-1))
  })
})
