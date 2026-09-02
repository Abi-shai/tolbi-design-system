/**
 * Spacing adoption codemod — ADR-0009 recorded spacing's defect as adoption,
 * not naming, and left it. 47% of padding/margin/gap declarations were literal.
 *
 * Unlike typography this IS mechanical: 8px is `spacing-md` and nothing else.
 * Values off the ramp (odd pixels, %, negative offsets) are left alone and
 * reported — inventing a token for them is the sprawl ADR-0009 forbids.
 *
 * One-shot. Run, review, delete.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'

const DRY = process.argv.includes('--dry')
const spacing = JSON.parse(readFileSync('tokens/src/spacing/semantic.json', 'utf8')).spacing
const PX_TO_TOKEN = Object.fromEntries(
  Object.entries(spacing).map(([name, t]) => [parseInt(t.description, 10), name]),
)

function walk(dir, out = []) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n)
    if (p.includes('/ModuleIcon/art/')) continue
    if (statSync(p).isDirectory()) walk(p, out)
    else if (extname(p) === '.vue') out.push(p)
  }
  return out
}

const PROP = /(^|[{;\n])(\s*)((?:padding|margin|gap|row-gap|column-gap)(?:-(?:top|right|bottom|left|inline|block))?)\s*:\s*([^;{}]+);/g
let converted = 0
const skipped = []
const changed = new Set()

for (const file of walk('components')) {
  const before = readFileSync(file, 'utf8')
  const after = before.replace(PROP, (whole, pre, ws, prop, value) => {
    const v = value.trim()
    if (v.includes('var(') || v.includes('calc(')) return whole
    const parts = v.split(/\s+/)
    const mapped = parts.map((p) => {
      if (p === '0' || p === 'auto') return p
      const m = p.match(/^(\d+)px$/)
      if (!m) return null
      const tok = PX_TO_TOKEN[Number(m[1])]
      return tok ? `var(--ds-spacing-${tok})` : null
    })
    // Convert per part, not all-or-nothing: a mixed shorthand like
    // `4px 10px 4px 4px` still has three values that belong to the ramp.
    if (mapped.every((x) => x === null)) {
      skipped.push([file.replace('components/', ''), prop, v])
      return whole
    }
    if (mapped.some((x) => x === null)) skipped.push([file.replace('components/', ''), prop, v])
    converted += mapped.filter((x) => x !== null && !/^(0|auto)$/.test(x)).length
    return `${pre}${ws}${prop}: ${mapped.map((x, i) => x ?? parts[i]).join(' ')};`
  })
  if (after !== before) { changed.add(file); if (!DRY) writeFileSync(file, after) }
}

console.log(`${DRY ? '[dry] ' : ''}files: ${changed.size}, declarations tokenised: ${converted}`)
console.log(`\n  left literal (off the ramp) — ${skipped.length}:`)
const seen = new Set()
for (const [f, p, v] of skipped) {
  const k = `${f}|${v}`
  if (seen.has(k)) continue
  seen.add(k)
  console.log(`    ${f.padEnd(44)} ${p.padEnd(16)} ${v}`)
}
