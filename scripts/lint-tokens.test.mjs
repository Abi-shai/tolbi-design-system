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
import assert from 'node:assert/strict'
import { lintSource, RULES } from './lint-tokens.mjs'

const rules = (src) => new Set(lintSource('Fixture.vue', src).map((f) => f.rule))
const fires = (rule, src) => assert.ok(rules(src).has(rule), `expected ${rule} to fire on:\n${src}`)
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
  silent('no-colour-literal', style('.a { color: var(--ds-text-strong); }'))
  silent('no-colour-literal', style('.a { background: color-mix(in srgb, var(--ds-bg-inverse) 8%, transparent); }'))
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
  ]) if (rules(src).has(rule)) covered.add(rule)
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
