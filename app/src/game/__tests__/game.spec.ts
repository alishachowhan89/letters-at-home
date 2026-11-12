import { describe, expect, it } from 'vitest'
import { keyboardStates, newGame, restoreGame, submitGuess, type GameState } from '../game'

const anyWord = () => true
const dictionary = (w: string) => ['CRANE', 'SLATE', 'STACK', 'EERIE', 'PIXEL'].includes(w)

function play(answer: string, guesses: string[]): GameState {
  let s = newGame(answer)
  for (const g of guesses) {
    const r = submitGuess(s, g, anyWord)
    if (!r.ok) throw new Error(`unexpected reject of ${g}: ${r.reason}`)
    s = r.state
  }
  return s
}

describe('submitGuess', () => {
  it('wins when the guess is the answer', () => {
    expect(play('STACK', ['CRANE', 'STACK']).status).toBe('won')
  })

  it('loses after six wrong guesses', () => {
    const s = play('STACK', ['CRANE', 'SLATE', 'PIXEL', 'EERIE', 'CRANE', 'SLATE'])
    expect(s.status).toBe('lost')
    expect(s.guesses).toHaveLength(6)
  })

  it('rejects a non-word without using up a turn', () => {
    const r = submitGuess(newGame('STACK'), 'AEIOU', dictionary)
    expect(r).toEqual({ ok: false, reason: 'not-a-word' })
  })

  it('rejects a short guess', () => {
    expect(submitGuess(newGame('STACK'), 'CAT', dictionary)).toEqual({ ok: false, reason: 'too-short' })
  })

  it('refuses more guesses once the game is over', () => {
    const won = play('STACK', ['STACK'])
    expect(submitGuess(won, 'CRANE', anyWord)).toEqual({ ok: false, reason: 'game-over' })
  })

  it('treats lowercase input the same as uppercase', () => {
    expect(play('STACK', ['stack']).status).toBe('won')
  })
})

describe('restoreGame', () => {
  it('recovers a finished game from saved guesses, so a reload cannot replay the daily puzzle', () => {
    const s = restoreGame('STACK', ['CRANE', 'STACK'], dictionary)
    expect(s.status).toBe('won')
    expect(s.guesses).toEqual(['CRANE', 'STACK'])
  })

  it('drops saved guesses that are not words instead of trusting storage', () => {
    const s = restoreGame('STACK', ['CRANE', 'ZZZZZ', 'SLATE'], dictionary)
    expect(s.guesses).toEqual(['CRANE', 'SLATE'])
  })
})

describe('keyboardStates', () => {
  it('keeps a letter green once it has been correct, even if a later copy is absent', () => {
    // EPOCH vs EERIE: E at 0 is correct; the other two E's are absent. If the
    // keyboard took the last state seen, the E key would turn grey — telling the
    // player E is not in the word when it is.
    expect(keyboardStates(play('EPOCH', ['EERIE'])).E).toBe('correct')
  })

  it('upgrades present to correct across guesses', () => {
    const k = keyboardStates(play('STACK', ['CRANE', 'STACK']))
    expect(k.C).toBe('correct')
    expect(k.R).toBe('absent')
  })
})
