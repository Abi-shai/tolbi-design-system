/**
 * ADR-0009 says every fill and every tint has an exact on-colour partner, and
 * ADR-0029 doubled the number of pairings by adding a second mode. Nothing
 * checked that any of them is actually legible — the ratios lived in token
 * descriptions, which are prose and rot like prose.
 *
 * This resolves the real token graph and measures. A pairing that stops meeting
 * AA fails the build, in whichever mode broke it.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const AA = 4.5
const prim = JSON.parse(readFileSync('tokens/src/color/primitives.json', 'utf8')).color
const MODES = {
  light: JSON.parse(readFileSync('tokens/src/color/semantic.json', 'utf8')),
  dark: JSON.parse(readFileSync('tokens/src/color/semantic.dark.json', 'utf8')),
}

/** `{color.brand.600}` → the hex. color-mix() has no single value, so it is skipped. */
function hex(ref) {
  const m = /^\{color\.([a-z0-9-]+)\.([a-z0-9-]+)\}$/.exec(ref)
  if (!m) return null
  return prim[m[1]]?.[m[2]]?.$value ?? null
}
const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
function L(h) {
  const n = h.replace('#', '')
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255)
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}
function ratio(a, b) {
  const [x, y] = [L(a), L(b)].sort((m, n) => n - m)
  return (x + 0.05) / (y + 0.05)
}

/** ADR-0009's rule, read off the names: text-on-{suffix} pairs with bg-{suffix}. */
function pairs(tokens) {
  const out = []
  for (const name of Object.keys(tokens.text)) {
    if (!name.startsWith('on-')) continue
    const suffix = name.slice(3)
    const ground = tokens.bg[suffix] ? suffix : suffix.replace(/-subtle$/, '')
    if (!tokens.bg[ground]) continue
    out.push([`text-${name}`, `bg-${ground}`, tokens.text[name].$value, tokens.bg[ground].$value])
  }
  for (const name of ['strong', 'default', 'subtle', 'subtlest', 'placeholder'])
    out.push([`text-${name}`, 'bg-default', tokens.text[name].$value, tokens.bg.default.$value])
  return out
}

for (const [mode, tokens] of Object.entries(MODES)) {
  test(`${mode}: every on-colour pairing meets AA`, () => {
    const checked = []
    for (const [fg, bg, fgRef, bgRef] of pairs(tokens)) {
      const [a, b] = [hex(fgRef), hex(bgRef)]
      if (!a || !b) continue           // color-mix() has no single value to measure
      const r = ratio(a, b)
      assert.ok(r >= AA, `${mode}: ${fg} on ${bg} is ${r.toFixed(2)}:1, below ${AA}`)
      checked.push(fg)
    }
    // a suite that silently measured nothing would pass just as loudly
    assert.ok(checked.length >= 14, `${mode}: only ${checked.length} pairings measured`)
  })
}

test('both modes carry the same pairings', () => {
  assert.deepEqual(
    pairs(MODES.light).map(([f, b]) => `${f}|${b}`).sort(),
    pairs(MODES.dark).map(([f, b]) => `${f}|${b}`).sort(),
  )
})
