<script setup lang="ts">
import { onActivated, onBeforeUnmount, onDeactivated } from 'vue'
import GameBoard from './GameBoard.vue'
import OnScreenKeyboard from './OnScreenKeyboard.vue'
import { useWordGame } from '@/game/useWordGame'

// One round of play. App.vue keeps a daily panel and a practice panel alive
// side by side (<KeepAlive>), so switching modes never loses either board.
const props = defineProps<{ answer: string; storageKey: string | null }>()

const { rows, keyStates, message, reveal, typeLetter, backspace, submit } = useWordGame(
  props.answer,
  props.storageKey,
)

function onKey(key: string) {
  if (key === 'ENTER') submit()
  else if (key === 'BACK') backspace()
  else typeLetter(key)
}

function onPhysicalKey(e: KeyboardEvent) {
  if (e.ctrlKey || e.metaKey || e.altKey) return
  // A focused button (an on-screen key, the mode switch) handles Enter itself;
  // also submitting here would make one Enter press do two things.
  if (e.key === 'Enter' && document.activeElement instanceof HTMLButtonElement) return
  if (e.key === 'Enter') onKey('ENTER')
  else if (e.key === 'Backspace') onKey('BACK')
  else if (/^[a-zA-Z]$/.test(e.key)) onKey(e.key.toUpperCase())
  else return
  e.preventDefault()
}

// Inside <KeepAlive>, onActivated also fires on first mount. Only the visible
// panel listens, so typing never goes into the hidden board.
onActivated(() => window.addEventListener('keydown', onPhysicalKey))
onDeactivated(() => window.removeEventListener('keydown', onPhysicalKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onPhysicalKey))
</script>

<template>
  <div class="panel">
    <GameBoard :rows="rows" />
    <div class="feedback">
      <p class="message" role="status" aria-live="polite">{{ message }}</p>
      <p v-if="reveal" class="reveal">
        <strong class="term">{{ reveal.word }}</strong> — {{ reveal.definition }}
      </p>
    </div>
    <OnScreenKeyboard :states="keyStates" @key="onKey" />
  </div>
</template>

<style scoped>
.panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 16px;
}
.feedback {
  min-height: 3.5em;
  text-align: center;
  max-width: 34rem;
  margin-inline: auto;
}
.message {
  min-height: 1.5em;
  font-size: 0.95rem;
  color: var(--accent);
}
.reveal {
  margin-top: 6px;
  font-size: 0.85rem;
  line-height: 1.45;
  color: var(--muted);
}
.term {
  color: var(--correct);
  letter-spacing: 0.06em;
}
</style>
