<script setup lang="ts">
import BoardTile from './BoardTile.vue'
import type { BoardRow } from '@/game/useWordGame'

defineProps<{ rows: BoardRow[] }>()
</script>

<template>
  <div class="board" role="grid" aria-label="Guesses">
    <div v-for="(row, r) in rows" :key="r" class="row" role="row">
      <BoardTile
        v-for="(letter, c) in row.letters"
        :key="c"
        :letter="letter"
        :state="row.states?.[c] ?? null"
      />
    </div>
  </div>
</template>

<style scoped>
.board {
  display: grid;
  gap: 6px;
  width: min(100%, 330px);
  margin-inline: auto;
}
.row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
}
</style>
