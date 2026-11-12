<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import GameBoard from './components/GameBoard.vue'
import OnScreenKeyboard from './components/OnScreenKeyboard.vue'
import { useDailyGame } from './game/useDailyGame'

// Working title. QST-PRODUCT-NAME was answered B (original name + repo rename),
// but the name itself is still to be chosen — change it here and in index.html.
const GAME_TITLE = 'CS Word Guess'

const { day, rows, keyStates, message, typeLetter, backspace, submit } = useDailyGame()

function onKey(key: string) {
  if (key === 'ENTER') submit()
  else if (key === 'BACK') backspace()
  else typeLetter(key)
}

function onPhysicalKey(e: KeyboardEvent) {
  if (e.ctrlKey || e.metaKey || e.altKey) return
  // Let a focused on-screen key handle Enter itself (otherwise Enter would both
  // "click" the focused button and submit).
  if (e.key === 'Enter' && document.activeElement instanceof HTMLButtonElement) return
  if (e.key === 'Enter') onKey('ENTER')
  else if (e.key === 'Backspace') onKey('BACK')
  else if (/^[a-zA-Z]$/.test(e.key)) onKey(e.key.toUpperCase())
  else return
  e.preventDefault()
}

onMounted(() => window.addEventListener('keydown', onPhysicalKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onPhysicalKey))
</script>

<template>
  <div class="app">
    <header class="header">
      <h1 class="title"><span class="prompt">&gt;</span> {{ GAME_TITLE }}</h1>
      <p class="subtitle">daily #{{ day + 1 }} · every answer is a CS term</p>
    </header>

    <main class="main">
      <GameBoard :rows="rows" />
      <p class="message" role="status" aria-live="polite">{{ message }}</p>
      <OnScreenKeyboard :states="keyStates" @key="onKey" />
    </main>
  </div>
</template>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  padding: 16px;
}
.header {
  text-align: center;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}
.title {
  font-size: 1.4rem;
  letter-spacing: 0.04em;
}
.prompt {
  color: var(--correct);
}
.subtitle {
  margin-top: 4px;
  font-size: 0.8rem;
  color: var(--muted);
}
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 16px;
  padding-top: 20px;
}
.message {
  min-height: 1.5em;
  text-align: center;
  font-size: 0.95rem;
  color: var(--accent);
}
</style>
