<script setup lang="ts">
import { KeepAlive, ref } from 'vue'
import GamePanel from './components/GamePanel.vue'
import { answerForDay, dailyStorageKey, dayNumber } from './game/daily'
import { pickPracticeAnswer } from './game/practice'
import { ANSWERS } from './game/words'

// ADR-0003 (replaces Five Bytes from ADR-0002 QST-GAME-NAME). Also in index.html's <title>.
const GAME_TITLE = 'Letters at Home'

type Mode = 'daily' | 'practice'
const mode = ref<Mode>('daily')

const day = dayNumber(new Date())
const dailyAnswer = answerForDay(day)
const dailyKey = dailyStorageKey(day, dailyAnswer)

// Practice: random answer, never today's daily word, never the one just played.
const practiceAnswer = ref(pickPracticeAnswer(ANSWERS, [dailyAnswer]))
const practiceRound = ref(0)

function newPracticeWord() {
  practiceAnswer.value = pickPracticeAnswer(ANSWERS, [dailyAnswer, practiceAnswer.value])
  practiceRound.value++
}
</script>

<template>
  <div class="app">
    <header class="header">
      <h1 class="title"><span class="prompt">&gt;</span> {{ GAME_TITLE }}</h1>
      <p class="subtitle">guess the five-letter word in six tries</p>
      <div class="modes" role="group" aria-label="Game mode">
        <button type="button" class="mode" :aria-pressed="mode === 'daily'" @click="mode = 'daily'">
          daily #{{ day + 1 }}
        </button>
        <button type="button" class="mode" :aria-pressed="mode === 'practice'" @click="mode = 'practice'">
          practice
        </button>
        <button v-if="mode === 'practice'" type="button" class="mode new" @click="newPracticeWord">
          new word ↻
        </button>
      </div>
    </header>

    <main class="main">
      <KeepAlive>
        <GamePanel v-if="mode === 'daily'" key="daily" :answer="dailyAnswer" :storage-key="dailyKey" />
        <GamePanel v-else :key="`practice-${practiceRound}`" :answer="practiceAnswer" :storage-key="null" />
      </KeepAlive>
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
.modes {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}
.mode {
  padding: 4px 10px;
  font: inherit;
  font-size: 0.8rem;
  color: var(--muted);
  background: transparent;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  cursor: pointer;
}
.mode[aria-pressed='true'] {
  color: var(--text);
  border-color: var(--correct);
}
.mode.new {
  color: var(--accent);
}
.mode:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-top: 20px;
}
</style>
