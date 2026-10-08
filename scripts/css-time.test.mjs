/*
  A duration read from CSS by JavaScript must survive a minifier. 0.55.1
  shipped `--tolbi-ai-spark-turn: 1650ms` as `1.65s` (our own build), the
  components read it with `parseFloat`, and the hover turn and the answer's
  passing light ran in 1.65ms and 1.1ms — invisible, and only in the built
  package. A product's build does the same to the tokens (`200ms` → `.2s`).
*/
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { transformSync } from 'esbuild'

const ROOT = join(import.meta.dirname, '..')
const source = readFileSync(join(ROOT, 'composables/cssTime.ts'), 'utf8')
const { code } = transformSync(source, { loader: 'ts', format: 'esm' })
const { cssTime } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`)

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? walk(path) : [path]
  })
const SOURCES = [...walk(join(ROOT, 'components')), ...walk(join(ROOT, 'composables'))].filter(
  (f) => /\.(vue|ts)$/.test(f) && !/\.(stories|demo)\.ts$/.test(f),
)

test('cssTime reads both units, and nothing that is not one time', () => {
  for (const [value, ms] of [
    ['1650ms', 1650], ['1.65s', 1650], ['.2s', 200], ['200ms', 200], [' 1.1s ', 1100],
    ['0s', 0], ['3.2s', 3200], ['.8s', 800], ['50ms', 50], ['1.25S', 1250],
  ]) assert.equal(cssTime(value), ms, value)
  for (const value of ['', '1.1', 'calc(1s * 2)', 'var(--x)', '1s 2s', 'auto']) assert.equal(cssTime(value), null, value)
})

test('every time the catalogue declares reads the same once minified', () => {
  const declared = new Map()
  const collect = (css, where) => {
    for (const [, name, value] of css.matchAll(/(--[\w-]+)\s*:\s*(-?(?:\d+(?:\.\d*)?|\.\d+)(?:ms|s))\s*[;}]/g)) declared.set(name, { value, where })
  }
  for (const file of SOURCES.filter((f) => f.endsWith('.vue'))) {
    for (const [, css] of readFileSync(file, 'utf8').matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) collect(css, relative(ROOT, file))
  }
  collect(readFileSync(join(ROOT, 'tokens/dist/motion.css'), 'utf8'), 'tokens/dist/motion.css')
  assert.ok(declared.has('--tolbi-ai-spark-turn') && declared.has('--ds-motion-duration-enter'), 'the scan found the known durations')

  const block = `:root{${[...declared].map(([name, { value }]) => `${name}:${value}`).join(';')}}`
  const minified = transformSync(block, { loader: 'css', minify: true }).code
  for (const [name, { value, where }] of declared) {
    const after = new RegExp(`${name}:([^;}]+)`).exec(minified)?.[1]
    assert.ok(after, `${name} survived minification`)
    assert.equal(cssTime(after), cssTime(value), `${name} (${where}): ${value} minified to ${after}`)
  }
})

test('no component parses a CSS duration with a bare parseFloat', () => {
  const offenders = SOURCES.filter((f) => !f.endsWith('cssTime.ts')).flatMap((file) =>
    readFileSync(file, 'utf8')
      .split('\n')
      .map((line, i) => [line, i + 1])
      .filter(([line]) => /(parseFloat|Number)\([^;]*getPropertyValue\(/.test(line))
      .map(([, n]) => `${relative(ROOT, file)}:${n}`),
  )
  assert.deepEqual(offenders, [], 'read durations with readDuration() — a minifier writes 1650ms as 1.65s')
})
