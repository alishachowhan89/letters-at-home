import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves a project site under /<repo-name>/. The deploy workflow
  // passes BASE_PATH from the repo's own name, so renaming the repo
  // (QST-PRODUCT-NAME = B) needs no change here. Locally it's just '/'.
  base: process.env.BASE_PATH ?? '/',
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
