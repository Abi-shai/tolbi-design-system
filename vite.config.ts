import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { dirname, relative, resolve } from 'path'
import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'fs'

/* Where this build writes — the guard below checks declarations against it,
   not against a hardcoded `dist/`. */
let outDir = resolve(__dirname, 'dist')
const readOutDir = () => ({
  name: 'read-out-dir',
  configResolved(config: { root: string; build: { outDir: string } }) {
    outDir = resolve(config.root, config.build.outDir)
  },
})

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
    readOutDir(),
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
      // would be the only thing left failing. `*.demo.ts` is story material
      // too (the Tolbi AI voice note's synthetic recording).
      include: ['env.d.ts', 'components/**/*.ts', 'components/**/*.vue'],
      exclude: ['components/**/*.stories.ts', 'components/**/*.demo.ts'],
      tsconfigPath: './tsconfig.json',
      // A declaration error does not stop the build on its own: the plugin
      // logs it and leaves the component's `.d.ts` out. 0.37.0 shipped that
      // way — `TolbiAiVoiceNote` untyped, the build green. Fail instead.
      afterDiagnostic(diagnostics) {
        if (diagnostics.length) throw new Error(`${diagnostics.length} declaration error(s) — see above`)
      },
      // A declaration may only point at what the package ships. The composer's
      // first build imported its recorder from `composables/`, outside `dist/`:
      // no error anywhere, and every consumer would have lost the type.
      afterBuild(emitted) {
        const out = outDir
        const escaped: string[] = []
        for (const [file, code] of emitted) {
          for (const [, spec] of code.matchAll(/from\s+['"](\.{1,2}\/[^'"]+)['"]/g)) {
            if (relative(out, resolve(dirname(file), spec)).startsWith('..')) escaped.push(`${relative(out, file)} → ${spec}`)
          }
        }
        if (escaped.length) throw new Error(`declarations point outside ${relative(__dirname, out)}/:\n  ${escaped.join('\n  ')}`)
      },
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
