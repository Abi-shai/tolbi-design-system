/**
 * ADR-0009 codemod, pass 2 — colour and shadow literals.
 *
 * The rename pass exposed pre-existing literals that ADR-0009's audit
 * under-counted (it recorded three; there were more). This pass replaces
 * only the ones with an EXACT token equivalent, verified by value:
 *
 *   rgba(16,24,40, .10/.06)  === --ds-shadow-md          (gray-900 @ 10%/6%)
 *   rgba(16,24,40, .03/.08)  === --ds-shadow-lg          (gray-900 @ 3%/8%)
 *   #0c111d                  === --ds-bg-inverse         (gray-950)
 *   #ffffff                  === --ds-text-on-inverse
 *   #d0d5dd                  === --ds-text-on-inverse-subtle (gray-300)
 *
 * Alpha overlays on bespoke surfaces become color-mix over the token they
 * were eyeballed from, so the relationship is declared rather than implied.
 *
 * It also strips stale `var(--ds-x, #hex)` fallbacks: the hex duplicates the
 * token's value and silently goes stale the moment the token moves.
 *
 * One-shot. Run once, review, delete.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'

const DRY = process.argv.includes('--dry')
const t = (n) => `var(--ds-${n})`
const mix = (n, pct) => `color-mix(in srgb, ${t(n)} ${pct}%, transparent)`

const EDITS = {
  // Tooltip was entirely un-tokenised — it is the inverse surface.
  'components/Tooltip/Tooltip.vue': [
    [`  filter: drop-shadow(0px 4px 6px rgba(16, 24, 40, 0.03))
          drop-shadow(0px 12px 16px rgba(16, 24, 40, 0.08));`,
     `  filter: drop-shadow(0px 4px 6px ${mix('color-gray-light-900', 3)})
          drop-shadow(0px 12px 16px ${mix('color-gray-light-900', 8)});`],
    [`  background: #0c111d;`, `  background: ${t('bg-inverse')};`],
    [`  color: #ffffff;`, `  color: ${t('text-on-inverse')};`],
    [`  color: #d0d5dd;`, `  color: ${t('text-on-inverse-subtle')};`],
    [`  border-top:   6px solid #0c111d;`, `  border-top:   6px solid ${t('bg-inverse')};`],
    [`  border-bottom: 6px solid #0c111d;`, `  border-bottom: 6px solid ${t('bg-inverse')};`],
    [`  border-right:  6px solid #0c111d;`, `  border-right:  6px solid ${t('bg-inverse')};`],
    [`  border-left:   6px solid #0c111d;`, `  border-left:   6px solid ${t('bg-inverse')};`],
  ],

  // Hand-rolled shadows that duplicate the ramp exactly.
  'components/Slider/Slider.vue': [
    [`  box-shadow:
    0 4px 8px -2px rgba(16, 24, 40, 0.1),
    0 2px 4px -2px rgba(16, 24, 40, 0.06);`,
     `  box-shadow: ${t('shadow-md')};`, 'all'],
    // ADR-0006: one focus treatment, no component defines its own
    [`  box-shadow:
    0 0 0 3px rgba(5, 96, 51, 0.2),
    0 4px 8px -2px rgba(16, 24, 40, 0.1),
    0 2px 4px -2px rgba(16, 24, 40, 0.06);`,
     `  box-shadow: ${t('focus-ring-brand')}, ${t('shadow-md')};`],
    [`  box-shadow:
    0 4px 6px -2px rgba(16, 24, 40, 0.03),
    0 12px 16px -4px rgba(16, 24, 40, 0.08);`,
     `  box-shadow: ${t('elevation-overlay')};`],
  ],
  'components/ProgressBar/ProgressBar.vue': [
    [`  box-shadow:
    0px 4px 6px -2px rgba(16, 24, 40, 0.03),
    0px 12px 16px -4px rgba(16, 24, 40, 0.08);`,
     `  box-shadow: ${t('elevation-overlay')};`],
  ],

  // Alpha overlays on the nav's bespoke dark-brand surface.
  'components/HorizontalNavigation/HorizontalNavigation.vue': [
    [`  background: rgba(6, 105, 56, 0.95);`, `  background: ${mix('bg-brand-solid', 95)};`],
    [`  color: rgba(255, 255, 255, 0.4);`, `  color: ${mix('text-on-brand-solid', 40)};`],
    [`  color: rgba(255, 255, 255, 0.85);`, `  color: ${mix('text-on-brand-solid', 85)};`],
    [`  background: rgba(255, 255, 255, 0.1);`, `  background: ${mix('text-on-brand-solid', 10)};`],
  ],
  'components/CloseButton/CloseButton.vue': [
    [`  background-color: rgba(255, 255, 255, 0.2);`, `  background-color: ${mix('text-on-inverse', 20)};`, 'all'],
  ],
}

const ROOTS = ['components']
const EXTS = new Set(['.vue', '.ts'])
function walk(dir, out = []) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (EXTS.has(extname(p))) out.push(p)
  }
  return out
}

let hits = 0, stripped = 0, missed = []
const changed = new Set()
// ModuleIcon art is generated from Figma exports (ADR-0005) — never touch it.
const files = walk('components').filter((f) => !f.includes('/ModuleIcon/art/'))

for (const file of files) {
  const before = readFileSync(file, 'utf8')
  let s = before
  for (const [from, to, mode] of EDITS[file] ?? []) {
    if (!s.includes(from)) { missed.push(`${file}: ${from.split('\n')[0].trim().slice(0, 60)}`); continue }
    const n = s.split(from).length - 1
    s = mode === 'all' ? s.split(from).join(to) : s.replace(from, to)
    hits += mode === 'all' ? n : 1
  }
  // stale hex fallbacks
  const fb = /var\((--ds-[a-z0-9-]+), *#[0-9a-fA-F]{3,8}\)/g
  const n = (s.match(fb) || []).length
  if (n) { s = s.replace(fb, 'var($1)'); stripped += n }

  if (s !== before) { changed.add(file); if (!DRY) writeFileSync(file, s) }
}

console.log(`${DRY ? '[dry] ' : ''}files changed: ${changed.size}`)
console.log(`  literals replaced:      ${hits}`)
console.log(`  stale fallbacks stripped: ${stripped}`)
if (missed.length) { console.log(`\n  !! did not match:`); missed.forEach((m) => console.log(`     ${m}`)) }
