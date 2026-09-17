import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
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
  plugins: [
    vue(),
    // `types` in package.json has always pointed at dist/index.d.ts; nothing was
    // producing it. `vue-tsc --noEmit` in the build script checks and emits
    // nothing, and the lib build only writes JS. Consumers got 56 untyped
    // components. `entryRoot` puts the entry declaration at dist/index.d.ts,
    // where the export map already said it would be.
    dts({
      entryRoot: 'components',
      // env.d.ts carries the `*.svg` module declaration that Logo and
      // CreditsChip rely on; stories are not API and their `*.mdx` imports
      // would be the only thing left failing.
      include: ['env.d.ts', 'components/**/*.ts', 'components/**/*.vue'],
      exclude: ['components/**/*.stories.ts'],
      tsconfigPath: './tsconfig.json',
    }),
    copyTokens(),
  ],
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
