<script setup lang="ts">
import { computed } from 'vue'
import type { LetterState } from '@/game/feedback'

const props = defineProps<{ letter: string; state: LetterState | null }>()

const STATE_WORDS: Record<LetterState, string> = {
  correct: 'correct spot',
  present: 'in the word, wrong spot',
  absent: 'not in the word',
}

// Colour is never the only signal: screen readers get the state in words.
const label = computed(() => {
  const l = props.letter.trim()
  if (!l) return 'empty'
  return props.state ? `${l}, ${STATE_WORDS[props.state]}` : l
})
</script>

<template>
  <div
    class="tile"
    :class="[state ?? (letter.trim() ? 'filled' : 'empty')]"
    role="img"
    :aria-label="label"
  >
    {{ letter.trim() }}
  </div>
</template>

<style scoped>
.tile {
  display: grid;
  place-items: center;
  aspect-ratio: 1;
  font-family: var(--font-mono);
  font-size: clamp(1.4rem, 7vw, 2rem);
  font-weight: 700;
  text-transform: uppercase;
  border-radius: var(--radius);
  border: 2px solid var(--border);
  color: var(--text);
  background: var(--surface);
  transition: background-color 0.2s, border-color 0.2s;
}
.filled {
  border-color: var(--muted);
}
.correct {
  background: var(--correct);
  border-color: var(--correct);
  color: var(--on-state);
}
.present {
  background: var(--present);
  border-color: var(--present);
  color: var(--on-state);
}
.absent {
  background: var(--absent);
  border-color: var(--absent);
  color: var(--muted);
}
</style>
