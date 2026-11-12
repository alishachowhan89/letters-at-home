import { computed, ref, shallowRef, watch } from 'vue'
import { MAX_GUESSES, WORD_LENGTH, scoreGuess, type LetterState } from './feedback'
import { keyboardStates, restoreGame, submitGuess, type GameState, type RejectReason } from './game'
import { DEFINITIONS, isAcceptedGuess } from './words'

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
// work, it just won't remember progress.
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

function endMessage(s: GameState): string {
  if (s.status === 'won') return `Solved in ${s.guesses.length}/${MAX_GUESSES}`
  if (s.status === 'lost') return `The word was ${s.answer}`
  return ''
}

/**
 * One game round for a given answer. The rules live in ./game.ts; this only
 * holds the current state reactively and turns key presses into moves.
 *
 * `storageKey` set (daily mode): guesses are saved, so a reload restores the
 * board instead of allowing a replay. `null` (practice mode): nothing is saved.
 */
export function useWordGame(answer: string, storageKey: string | null) {
  const saved = storageKey ? load(storageKey) : []
  const state = shallowRef(restoreGame(answer, saved, isAcceptedGuess))
  const current = ref('')
  const message = ref(endMessage(state.value))

  if (storageKey) watch(state, (s) => save(storageKey, s.guesses))

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
    message.value = endMessage(r.state)
  }

  const rows = computed<BoardRow[]>(() => {
    const { guesses, status } = state.value
    const out: BoardRow[] = guesses.map((g) => ({ letters: [...g], states: scoreGuess(g, state.value.answer) }))
    if (status === 'playing' && out.length < MAX_GUESSES) {
      out.push({ letters: [...current.value.padEnd(WORD_LENGTH, ' ')], states: null })
    }
    while (out.length < MAX_GUESSES) out.push({ letters: Array(WORD_LENGTH).fill(' '), states: null })
    return out
  })

  const keyStates = computed(() => keyboardStates(state.value))

  /** Shown only once the round is over — the reveal teaches the term (ADR-0001). */
  const reveal = computed(() =>
    state.value.status === 'playing'
      ? null
      : { word: state.value.answer, definition: DEFINITIONS[state.value.answer] ?? '' },
  )

  return { state, rows, keyStates, message, reveal, typeLetter, backspace, submit }
}
