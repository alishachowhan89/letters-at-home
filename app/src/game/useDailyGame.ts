import { computed, ref, shallowRef, watch } from 'vue'
import { answerForDay, dayNumber } from './daily'
import { MAX_GUESSES, WORD_LENGTH, scoreGuess, type LetterState } from './feedback'
import { keyboardStates, restoreGame, submitGuess, type RejectReason } from './game'
import { isAcceptedGuess } from './words'

export interface BoardRow {
  letters: string[]
  states: LetterState[] | null // null = not yet submitted
}

const REJECT_MESSAGES: Record<RejectReason, string> = {
  'too-short': `Not enough letters — need ${WORD_LENGTH}`,
  'not-a-word': 'Not in the word list',
  'game-over': '',
}

// localStorage can throw (private mode, blocked storage) — the game must still
// work, it just won't remember today's progress.
function load(key: string): string[] {
  try {
    const raw = localStorage.getItem(key)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((g): g is string => typeof g === 'string') : []
  } catch {
    return []
  }
}

function save(key: string, guesses: readonly string[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(guesses))
  } catch {
    /* storage unavailable — progress is session-only */
  }
}

/**
 * Daily mode (QST-PUZZLE-CADENCE = C, daily first). Today's guesses are saved per
 * day number, so reloading the page restores the board instead of offering a replay.
 * Practice mode will reuse the same core with a random answer and no saving.
 */
export function useDailyGame(now: Date = new Date()) {
  const day = dayNumber(now)
  const storageKey = `cs-word-guess:daily:${day}`
  const state = shallowRef(restoreGame(answerForDay(day), load(storageKey), isAcceptedGuess))
  const current = ref('')
  const message = ref('')

  watch(state, (s) => save(storageKey, s.guesses))

  function typeLetter(letter: string) {
    if (state.value.status !== 'playing' || current.value.length >= WORD_LENGTH) return
    current.value += letter.toUpperCase()
    message.value = ''
  }

  function backspace() {
    current.value = current.value.slice(0, -1)
    message.value = ''
  }

  function submit() {
    const r = submitGuess(state.value, current.value, isAcceptedGuess)
    if (!r.ok) {
      message.value = REJECT_MESSAGES[r.reason]
      return
    }
    state.value = r.state
    current.value = ''
    if (r.state.status === 'won') message.value = `Solved in ${r.state.guesses.length}/${MAX_GUESSES}`
    if (r.state.status === 'lost') message.value = `The word was ${r.state.answer}`
  }

  const rows = computed<BoardRow[]>(() => {
    const { guesses, answer, status } = state.value
    const out: BoardRow[] = guesses.map((g) => ({ letters: [...g], states: scoreGuess(g, answer) }))
    if (status === 'playing' && out.length < MAX_GUESSES) {
      out.push({ letters: [...current.value.padEnd(WORD_LENGTH, ' ')], states: null })
    }
    while (out.length < MAX_GUESSES) out.push({ letters: Array(WORD_LENGTH).fill(' '), states: null })
    return out
  })

  const keyStates = computed(() => keyboardStates(state.value))

  // On reload of a finished game, say how it ended.
  if (state.value.status === 'won') message.value = `Solved in ${state.value.guesses.length}/${MAX_GUESSES}`
  if (state.value.status === 'lost') message.value = `The word was ${state.value.answer}`

  return { day, state, rows, keyStates, message, typeLetter, backspace, submit }
}
