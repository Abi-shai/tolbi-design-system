/**
 * The Tolbi AI sign is generated (ADR-0056), so two things can go wrong
 * silently: someone edits `art.ts` by hand, or the Figma file drifts from the
 * primitives the component binds. Both are asserted here, and the extraction is
 * exercised on mutated exports so the checks are known to bite (ADR-0018).
 */
import { test } from 'node:test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import assert from 'node:assert/strict'
import { extractSpark, primitiveInks, render, RAW, OUT } from './generate-tolbi-ai-art.mjs'

const raw = readFileSync(RAW, 'utf8')
const primitives = JSON.parse(readFileSync(join(import.meta.dirname, '../tokens/src/color/primitives.json'), 'utf8'))

test('the committed art.ts is what the generator writes — nobody edited it by hand', () => {
  assert.equal(readFileSync(OUT, 'utf8'), render(extractSpark(raw)))
})

test('four leaves, from the west clockwise, and one spark', () => {
  const art = extractSpark(raw)
  assert.deepEqual(art.leaves.map((l) => l.direction), ['west', 'north', 'east', 'south'])
  assert.match(art.spark.d, /^M/)
  assert.equal(art.viewBox, '0 0 48 48')
})

test('the inks in Figma are the primitives the component binds', () => {
  assert.deepEqual(extractSpark(raw).inks, primitiveInks(primitives))
})

test('only the variant is read — the section around it is dropped', () => {
  // The export carries the section's backdrop: two paths at x = −652.
  assert.ok(raw.includes('M-652'))
  assert.ok(!render(extractSpark(raw)).includes('-652'))
})

/* ── mutations: each check must fail on the export it exists to catch ───── */

test('a missing leaf fails the extraction', () => {
  const mutated = raw.replace(/<path id="Feuille N"[^>]*\/>/, '')
  assert.throws(() => extractSpark(mutated), /Feuille N/)
})

test('an extra layer in the drawing fails the extraction', () => {
  const mutated = raw.replace('<path id="Feuille N"', '<path id="Cœur" d="M24 24Z" fill="#066938"/>\n<path id="Feuille N"')
  assert.throws(() => extractSpark(mutated), /unexpected layers/)
})

test('leaves that disagree on their ink fail the extraction', () => {
  const mutated = raw.replace(/(<path id="Feuille E"[^>]*fill=")#066938/, '$1#056033')
  assert.throws(() => extractSpark(mutated), /disagree/)
})

test('a drifted ink is visible against the primitives', () => {
  const mutated = raw.replace(/(<path id="Petite &#195;&#169;tincelle"[^>]*fill=")#FAC720/, '$1#EAAA08')
  assert.notDeepEqual(extractSpark(mutated).inks, primitiveInks(primitives))
})

test('an export at another size fails — one grid, scaled by a viewBox', () => {
  const mutated = raw.replace('viewBox="0 0 48 48"', 'viewBox="0 0 64 64"')
  assert.throws(() => extractSpark(mutated), /48 grid/)
})
