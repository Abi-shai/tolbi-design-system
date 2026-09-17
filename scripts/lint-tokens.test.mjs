/**
 * Regression suite for the token-discipline linter.
 *
 *   npm test
 *
 * The linter is a build gate for ten rules across five ADRs, and it had FOUR
 * bugs found by ad-hoc probing (ADR-0012 and ADR-0013). A rule that reports zero
 * is indistinguishable from a rule that is broken, so every rule is asserted
 * BOTH ways: it must fire on a violation, and stay silent on the valid form.
 * The four historical bugs each have a named test so they cannot come back.
 */
import { test } from 'node:test'
import { readFileSync } from 'node:fs'
import assert from 'node:assert/strict'
import { lintSource, lintModes, lintTokenImports, RULES, LIGHT_SRC, DARK_SRC } from './lint-tokens.mjs'

const rules = (src) => new Set(lintSource('Fixture.vue', src).map((f) => f.rule))
const fires = (rule, src) => assert.ok(rules(src).has(rule), `expected ${rule} to fire on:\n${src}`)
const fires2 = (rule, l, d) => assert.ok(modeRules(l, d).has(rule), `expected ${rule} to fire`)
const silent2 = (rule, l, d) => assert.ok(!modeRules(l, d).has(rule), `expected ${rule} NOT to fire`)
const silent = (rule, src) => assert.ok(!rules(src).has(rule), `expected ${rule} NOT to fire on:\n${src}`)

const style = (css) => `<template><i /></template>\n<style scoped>\n${css}\n</style>\n`
const script = (js) => `<script setup lang="ts">\n${js}\n</script>\n<template><i /></template>\n`

/* ── every rule, both directions ───────────────────────────────────────── */

test('no-raw-primitive', () => {
  fires('no-raw-primitive', style('.a { color: var(--ds-color-brand-600); }'))
  silent('no-raw-primitive', style('.a { color: var(--ds-text-brand); }'))
  // ADR-0010: a categorical palette bypasses the semantic tier by design
  silent('no-raw-primitive', style('.a { background: var(--ds-color-display-blue-50); }'))
})

test('no-colour-literal', () => {
  fires('no-colour-literal', style('.a { color: #ff0000; }'))
  fires('no-colour-literal', style('.a { background: rgba(0, 0, 0, 0.08); }'))
  fires('no-colour-literal', style('.a { color: #f00; }'))
  fires('no-colour-literal', style('.a { color: hsl(210 100% 50%); }'))
  silent('no-colour-literal', style('.a { color: var(--ds-text-strong); }'))
  silent('no-colour-literal', style('.a { background: color-mix(in srgb, var(--ds-bg-inverse) 8%, transparent); }'))
})

test('no-colour-literal covers keywords, not just hex and rgb()', () => {
  // ADR-0029: `white` is the one literal a second colour mode breaks — it does
  // not move and everything around it does.
  fires('no-colour-literal', style('.a { color: white; }'))
  fires('no-colour-literal', style('.a { background: white; }'))
  fires('no-colour-literal', style('.a { border: 1px solid black; }'))
  fires('no-colour-literal', style('.a { --badge-dot: white; }'))
  // not colours in this sense
  silent('no-colour-literal', style('.a { background: transparent; }'))
  silent('no-colour-literal', style('.a { color: currentColor; }'))
  silent('no-colour-literal', style('.a { color: inherit; }'))
  // and the word has to be a value, not part of a name
  silent('no-colour-literal', style('.ds-avatar--white-label { padding: 0; }'))
})

test('regression: three `color: white` sat under a linter reporting zero (ADR-0029)', () => {
  // CloseButton, ProgressSteps and Avatar each hardcoded white where a token
  // already existed — and no-colour-literal only ever looked for #hex and rgb()
  fires('no-colour-literal', style('.ds-close-button--dark .icon { color: white; }'))
  silent('no-colour-literal', style('.ds-close-button--dark .icon { color: var(--ds-text-on-inverse); }'))
})

test('no-shadowing-var', () => {
  // a variant switch must not wear a semantic token's name minus the prefix
  fires('no-shadowing-var', style('.a { --bg-default: red; }'))
  silent('no-shadowing-var', style('.a { --badge-group-bg: var(--ds-bg-default); }'))
})

test('no-literal-type', () => {
  fires('no-literal-type', style('.a { font-size: 1rem; }'))
  fires('no-literal-type', style('.a { font-weight: 700; }'))
  fires('no-literal-type', style('.a { line-height: 1.5rem; }'))
  silent('no-literal-type', style('.a { font: var(--ds-font-body-md); }'))
  // a unitless line-height is a deliberate reset, not a scale value
  silent('no-literal-type', style('.a { font: var(--ds-font-body-md); line-height: 1; }'))
})

test('role-completeness', () => {
  fires('role-completeness', style('.a { font-size: var(--ds-font-size-body-md); }'))
  silent('role-completeness', style('.a { font: var(--ds-font-body-md); }'))
  silent('role-completeness', style(
    '.a { font-size: var(--ds-font-size-body-md); line-height: var(--ds-line-height-body-md); font-weight: var(--ds-font-weight-body-md); }'))
  // a lone weight override of an INHERITED role is legitimate (ADR-0011)
  silent('role-completeness', style('.a { font-weight: var(--ds-font-weight-body-md); }'))
})

test('font-order', () => {
  // `font:` resets font-variant-numeric, so it must come first
  fires('font-order', style('.a { font-variant-numeric: tabular-nums; font: var(--ds-font-body-md); }'))
  silent('font-order', style('.a { font: var(--ds-font-body-md); font-variant-numeric: tabular-nums; }'))
  // no `font:` in the block — the role is inherited, ordering cannot apply
  silent('font-order', style('.a { font-variant-numeric: tabular-nums; }'))
})

test('solid-pairing', () => {
  fires('solid-pairing', style('.a { background-color: var(--ds-bg-brand-solid); color: var(--ds-text-strong); }'))
  silent('solid-pairing', style('.a { background-color: var(--ds-bg-brand-solid); color: var(--ds-text-on-brand-solid); }'))
  silent('solid-pairing', style('.a { background-color: var(--ds-bg-brand-subtle); color: var(--ds-text-strong); }'))
})

test('spacing-on-ramp', () => {
  fires('spacing-on-ramp', style('.a { padding: 8px; }'))
  silent('spacing-on-ramp', style('.a { padding: var(--ds-spacing-md); }'))
  // off-ramp control padding is a separate scale and deliberately not flagged
  silent('spacing-on-ramp', style('.a { padding: 10px 14px; }'))
  // a mixed shorthand must still flag the parts that ARE on the ramp
  fires('spacing-on-ramp', style('.a { padding: 4px 10px 4px 4px; }'))
})

test('no-raw-radius', () => {
  fires('no-raw-radius', style('.a { border-radius: var(--ds-radius-md); }'))
  silent('no-raw-radius', style('.a { border-radius: var(--ds-radius-control); }'))
})

test('no-literal-dimension-js', () => {
  fires('no-literal-dimension-js', script("const t = { size: '2.5rem' }"))
  silent('no-literal-dimension-js', script("const t = { size: 'var(--ds-font-size-body-md)' }"))
  // zero carries no design decision
  silent('no-literal-dimension-js', script("const t = { top: '0px', left: '0rem' }"))
})

test('no-token-js-import', () => {
  // the JS export is for consumers; inside the library it is a second source of
  // truth that bypasses the cascade (ADR-0019)
  fires('no-token-js-import', script("import { DsTextOnBrandSolid } from '../../tokens/dist/index.js'"))
  silent('no-token-js-import', style('.a { color: var(--ds-text-on-brand-solid); }'))
})

test('no-literal-border-width', () => {
  fires('no-literal-border-width', style('.a { border: 1px solid var(--ds-border-default); }'))
  fires('no-literal-border-width', style('.a { border-left: 2px solid var(--ds-border-brand); }'))
  silent('no-literal-border-width', style('.a { border: var(--ds-border-width-default) solid var(--ds-border-default); }'))
  // the tooltip's arrow is a CSS triangle, and Toast's 3px is an accent rule
  silent('no-literal-border-width', style('.a { border-left: 8px solid transparent; }'))
  silent('no-literal-border-width', style('.a { border-left: 3px solid var(--ds-text-error); }'))
})

test('no-literal-z-index', () => {
  fires('no-literal-z-index', style('.a { z-index: 100; }'))
  fires('no-literal-z-index', style('.a { z-index: 200; }'))
  silent('no-literal-z-index', style('.a { z-index: var(--ds-z-popover); }'))
  // stacking inside one component is its own business
  silent('no-literal-z-index', style('.a { z-index: 2; }'))
  silent('no-literal-z-index', style('.a { z-index: 0; }'))
})

test('focus-ring-instant', () => {
  // a focus ring at 150ms reads as lag; `instant` exists for exactly this
  fires('focus-ring-instant', style('.a { transition: box-shadow var(--ds-motion-duration-moderate) var(--ds-motion-easing-default); }'))
  silent('focus-ring-instant', style('.a { transition: box-shadow var(--ds-motion-duration-instant) var(--ds-motion-easing-default); }'))
  // only the box-shadow part is constrained
  silent('focus-ring-instant', style('.a { transition: color var(--ds-motion-duration-moderate) var(--ds-motion-easing-default); }'))
  // multi-line declarations count too
  fires('focus-ring-instant', style('.a {\n  transition:\n    color var(--ds-motion-duration-quick) var(--ds-motion-easing-default),\n    box-shadow var(--ds-motion-duration-quick) var(--ds-motion-easing-default);\n}'))
})

const modeRules = (light, dark) => new Set(lintModes(light, dark).map((f) => f.rule))
const c = (ref) => ({ $value: `{color.${ref}}`, $type: 'color' })
const LIGHT = { text: { strong: c('gray-light.900') }, bg: { default: c('base.white') }, border: {} }
const DARK = { text: { strong: c('gray-forest.100') }, bg: { default: c('gray-forest.900') }, border: {} }

test('every exported rule has a test that fires it', () => {
  const covered = new Set()
  for (const [rule, src] of [
    ['no-raw-primitive', style('.a { color: var(--ds-color-brand-600); }')],
    ['no-colour-literal', style('.a { color: #ff0000; }')],
    ['no-shadowing-var', style('.a { --bg-default: red; }')],
    ['no-literal-type', style('.a { font-size: 1rem; }')],
    ['role-completeness', style('.a { font-size: var(--ds-font-size-body-md); }')],
    ['font-order', style('.a { font-variant-numeric: tabular-nums; font: var(--ds-font-body-md); }')],
    ['solid-pairing', style('.a { background-color: var(--ds-bg-brand-solid); color: var(--ds-text-strong); }')],
    ['spacing-on-ramp', style('.a { padding: 8px; }')],
    ['no-raw-radius', style('.a { border-radius: var(--ds-radius-md); }')],
    ['no-literal-dimension-js', script("const t = { size: '2.5rem' }")],
    ['no-token-js-import', script("import { DsTextOnBrandSolid } from '../../tokens/dist/index.js'")],
    ['no-literal-border-width', style('.a { border: 1px solid var(--ds-border-default); }')],
    ['no-literal-z-index', style('.a { z-index: 100; }')],
    ['focus-ring-instant', style('.a { transition: box-shadow var(--ds-motion-duration-moderate) var(--ds-motion-easing-default); }')],
  ]) if (rules(src).has(rule)) covered.add(rule)

  // The mode rules are structural — they read the two token sources, not a
  // .vue file — so they reach `covered` through lintModes rather than a fixture.
  for (const [rule, light, dark] of [
    ['dark-mode-parity', { ...LIGHT, text: { ...LIGHT.text, orphan: c('gray-light.600') } }, DARK],
    ['mode-neutral-ramp', LIGHT, { ...DARK, text: { strong: c('gray-light.900') } }],
  ]) if (modeRules(light, dark).has(rule)) covered.add(rule)

  assert.deepEqual([...covered].sort(), [...RULES].sort())
})

/* ── the four bugs found by probing, so they cannot return ─────────────── */

test('regression: single-line rule blocks are not skipped (ADR-0012)', () => {
  // no-shadowing-var and no-literal-type anchored on ^\s*, so anything written
  // on one line slipped through — exactly the shape Badge's and Tag's rules use
  fires('no-literal-type', style('.a { padding: 0; font-size: 1rem; }'))
  fires('no-shadowing-var', style('.a { --bg-default: red; }'))
})

test('regression: a suppression with a reason actually applies (ADR-0013)', () => {
  // `const sup` inside the file loop shadowed the module-level `sup` that
  // report() read, so no suppression ever applied
  const src = script("/* token-lint-disable no-literal-dimension-js — geometry, not type */\nconst t = { size: '2.5rem' }")
  silent('no-literal-dimension-js', src)
})

test('regression: a bare suppression is ignored (ADR-0013)', () => {
  // the escape hatch has to cost something: name the rule AND give a reason
  fires('no-literal-dimension-js', script("/* token-lint-disable no-literal-dimension-js */\nconst t = { size: '2.5rem' }"))
})

test('regression: the JS rule is not keyed on property names (ADR-0013)', () => {
  // a rule looking for `fontSize` sails past ProgressCircle, whose tables are
  // keyed `size:` and `line:`
  fires('no-literal-dimension-js', script("const VALUE = { md: { size: '2.25rem', line: '2.75rem' } }"))
})

test('findings carry file, line and message', () => {
  const [f] = lintSource('Fixture.vue', style('\n\n.a { color: #ff0000; }'))
  assert.equal(f.file, 'Fixture.vue')
  assert.equal(typeof f.line, 'number')
  assert.ok(f.line > 1, 'line number should point past the template')
  assert.match(f.msg, /#ff0000/)
})

/* ── the mode rules, over the token sources rather than a .vue file ────── */

test('dark-mode-parity', () => {
  silent2('dark-mode-parity', LIGHT, DARK)
  // the real failure: a light token added, the dark twin forgotten. It does not
  // error at build time — it inherits the light value and flashes white.
  fires2('dark-mode-parity', { ...LIGHT, text: { ...LIGHT.text, subtle: c('gray-light.600') } }, DARK)
  fires2('dark-mode-parity', LIGHT, { ...DARK, text: { ...DARK.text, ghost: c('gray-forest.300') } })
})

test('mode-neutral-ramp', () => {
  silent2('mode-neutral-ramp', LIGHT, DARK)
  // a dark token still reaching for the light neutral — the same white flash,
  // arrived at by copy-paste instead of by omission
  fires2('mode-neutral-ramp', LIGHT, { ...DARK, text: { strong: c('gray-light.900') } })
  fires2('mode-neutral-ramp', { ...LIGHT, text: { strong: c('gray-forest.100') } }, DARK)
})

test('the mode rules read the real token sources, not just fixtures', () => {
  // ADR-0018: a rule that only ever sees fixtures proves nothing about the ship
  const light = JSON.parse(readFileSync(LIGHT_SRC, 'utf8'))
  const dark = JSON.parse(readFileSync(DARK_SRC, 'utf8'))
  assert.equal(lintModes(light, dark).length, 0, 'shipped token sources must be clean')
  // and the suite bites: break one and it must be caught
  const broken = structuredClone(dark)
  delete broken.text.strong
  assert.ok(modeRules(light, broken).has('dark-mode-parity'))
  const swapped = structuredClone(dark)
  swapped.bg.default = c('gray-light.950')
  assert.ok(modeRules(light, swapped).has('mode-neutral-ramp'))
})

/* ── the JS token export boundary, over .ts ────────────────────────────── */

const imports = (src) => new Set(
  lintTokenImports([{ file: 'composables/x.ts', source: src }]).map((f) => f.rule),
)
const TOK = "'../tokens/dist/index.js'"

test('no-token-js-import reaches TypeScript, not only .vue', () => {
  // ADR-0019: a resolved value read in JS bypasses the cascade. lintSource only
  // ever walks .vue, so a composable was invisible to it.
  assert.ok(imports(`import { DsBgDefault } from ${TOK}`).has('no-token-js-import'))
  assert.ok(imports(`import tokens from ${TOK}`).has('no-token-js-import'))
  assert.ok(imports(`import * as tokens from ${TOK}`).has('no-token-js-import'))
  // an easing has no var() form — it is the computation case that platform is for
  assert.ok(!imports(`import { easing } from ${TOK}`).has('no-token-js-import'))
  assert.ok(!imports(`import { easing, cubicBezier } from ${TOK}`).has('no-token-js-import'))
  // one allowed name does not smuggle a forbidden one in beside it
  assert.ok(imports(`import { easing, DsBgDefault } from ${TOK}`).has('no-token-js-import'))
  // and an unrelated import is not the token export
  assert.ok(!imports("import { ref } from 'vue'").has('no-token-js-import'))
})

test("regression: the rule's own comment is not read as an import (ADR-0032)", () => {
  // useMarquee explains the exception directly above the import, and the prose
  // contains the word `import`. Unstripped, the scan read the comment as the
  // clause and reported the explanation as a violation.
  const src = [
    '// `no-token-js-import` forbids importing resolved VALUES, not this.',
    `import { easing } from ${TOK}`,
  ].join('\n')
  assert.ok(!imports(src).has('no-token-js-import'))
})

test('regression: a clause does not span the import before it (ADR-0032)', () => {
  // The codebase writes no semicolons, so a lazy `[^;]*?` ran from one import
  // across the next and blamed the wrong line.
  const src = [
    "import { computed, ref } from 'vue'",
    `import { easing } from ${TOK}`,
  ].join('\n')
  assert.ok(!imports(src).has('no-token-js-import'))
})

test('the shipped .ts sources are clean', () => {
  const src = readFileSync('composables/useMarquee.ts', 'utf8')
  assert.equal(lintTokenImports([{ file: 'composables/useMarquee.ts', source: src }]).length, 0)
})
