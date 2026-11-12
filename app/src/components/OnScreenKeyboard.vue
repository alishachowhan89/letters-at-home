<script setup lang="ts">
import type { LetterState } from '@/game/feedback'

defineProps<{ states: Record<string, LetterState> }>()
const emit = defineEmits<{ key: [value: string] }>()

const ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK'],
]
</script>

<template>
  <div class="keyboard" aria-label="Keyboard">
    <div v-for="(row, i) in ROWS" :key="i" class="row">
      <button
        v-for="k in row"
        :key="k"
        type="button"
        class="key"
        :class="[states[k], { wide: k.length > 1 }]"
        :aria-label="k === 'BACK' ? 'Backspace' : k === 'ENTER' ? 'Enter' : k"
        @click="emit('key', k)"
      >
        {{ k === 'BACK' ? '⌫' : k === 'ENTER' ? 'enter' : k }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.keyboard {
  display: grid;
  gap: 6px;
  width: min(100%, 500px);
  margin-inline: auto;
}
.row {
  display: flex;
  justify-content: center;
  gap: 5px;
}
.key {
  flex: 1 1 0;
  max-width: 44px;
  height: 52px;
  padding: 0;
  font-family: var(--font-mono);
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text);
  background: var(--key);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  cursor: pointer;
  touch-action: manipulation;
}
.key.wide {
  flex-grow: 1.6;
  max-width: 68px;
  font-size: 0.75rem;
}
.key:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
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
  color: var(--muted);
}
</style>
