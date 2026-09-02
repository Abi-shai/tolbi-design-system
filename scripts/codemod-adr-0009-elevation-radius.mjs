/**
 * ADR-0009 codemod, pass 3 — radius and elevation onto their semantic layer.
 *
 * Elevation is a clean 1:1: the rule (controls xs · surfaces sm · floating lg)
 * held with no exceptions across the catalogue, plus one 4th case introduced by
 * pass 2 (the slider thumb at shadow-md → elevation-raised).
 *
 * Radius is NOT clean, and ADR-0009 overstated it — the audit behind that claim
 * sampled 13 components. Across the full catalogue radius uses 8 steps for 6
 * roles. Only the four unambiguous roles are migrated here:
 *
 *   xl   → radius-surface   cards, toasts, callouts, tables, popovers
 *   md   → radius-control   buttons, inputs
 *   full → radius-pill      badges, avatars, dots, toggles
 *   sm   → radius-inner     marks nested inside a control
 *
 * `lg` (5 sites), `xs` (4), `2xl` (1) and `4xl` (1) are deliberately left on
 * the primitive ramp: they have no agreed role yet, and inventing names for
 * them here would be the "six tiles, four radii" defect wearing a token.
 * That is now an open item on the ADR, not a silent gap.
 *
 * One-shot. Run once, review, delete.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'

const DRY = process.argv.includes('--dry')

const MAP = {
  '--ds-shadow-xs': '--ds-elevation-control',
  '--ds-shadow-sm': '--ds-elevation-surface',
  '--ds-shadow-md': '--ds-elevation-raised',
  '--ds-shadow-lg': '--ds-elevation-overlay',
  '--ds-radius-xl': '--ds-radius-surface',
  '--ds-radius-md': '--ds-radius-control',
  '--ds-radius-full': '--ds-radius-pill',
  '--ds-radius-sm': '--ds-radius-inner',
}

function walk(dir, out = []) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (new Set(['.vue']).has(extname(p))) out.push(p)
  }
  return out
}

const counts = {}
const changed = new Set()
// Generated artwork (ADR-0005) and the token stories, which must show the ramp.
const files = walk('components').filter((f) => !f.includes('/ModuleIcon/art/'))

for (const file of files) {
  const before = readFileSync(file, 'utf8')
  let s = before
  for (const [from, to] of Object.entries(MAP)) {
    const re = new RegExp(`${from}(?![a-z0-9-])`, 'g')
    const n = (s.match(re) || []).length
    if (n) { s = s.replace(re, to); counts[from] = (counts[from] ?? 0) + n }
  }
  if (s !== before) { changed.add(file); if (!DRY) writeFileSync(file, s) }
}

console.log(`${DRY ? '[dry] ' : ''}files changed: ${changed.size}`)
for (const [k, v] of Object.entries(counts)) console.log(`  ${k.padEnd(20)} → ${MAP[k].padEnd(24)} ${v}`)
