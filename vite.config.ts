import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'fs'

const copyTokens = () => ({
  name: 'copy-tokens',
  closeBundle() {
    if (!existsSync('tokens/dist')) return
    mkdirSync('dist/tokens', { recursive: true })
    readdirSync('tokens/dist').forEach(file => {
      copyFileSync(`tokens/dist/${file}`, `dist/tokens/${file}`)
    })
  },
})

export default defineConfig({
  plugins: [vue(), copyTokens()],
  build: {
    lib: {
      entry: resolve(__dirname, 'components/index.ts'),
      name: 'TolbiDS',
      fileName: 'index',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: { vue: 'Vue' },
      },
    },
  },
})
