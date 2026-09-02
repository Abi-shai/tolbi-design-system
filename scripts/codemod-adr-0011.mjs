/**
 * ADR-0011 codemod — typography roles onto the `font:` shorthand.
 *
 *   node scripts/codemod-adr-0011.mjs --pass=a [--dry]   collapse role usages
 *   node scripts/codemod-adr-0011.mjs --pass=b [--dry]   propose roles for literals
 *
 * Pass A is mechanical: a rule block already applying a role's axis tokens
 * collapses to `font: var(--ds-font-{role})`. `letter-spacing` survives only for
 * the roles whose tracking is non-zero — for the other twelve the declaration
 * carries nothing.
 *
 * Pass B is NOT mechanical and does not apply blind: 21 sites sit at 14px, which
 * is body-md, heading-sm or label-lg. It proposes a role from the selector name
 * and prints everything it could not decide.
 *
 * One-shot. Run, review, delete.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'

const DRY  = process.argv.includes('--dry')
const PASS = (process.argv.find((a) => a.startsWith('--pass=')) ?? '--pass=a').split('=')[1]

const web = JSON.parse(readFileSync('tokens/src/typography/semantic.web.json', 'utf8'))
const ROLES = Object.keys(web['font-size'])
const TRACKED = ROLES.filter((r) => !web['letter-spacing'][r].value.includes('none'))
const SIZE_OF = Object.fromEntries(
  ROLES.map((r) => [r, web['font-size'][r].value.match(/font-size\.(\d+)/)[1]]),
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
const files = walk('components')

/* ── Pass A ─────────────────────────────────────────────────────────── */
function passA() {
  let collapsed = 0, kept = 0
  const changed = new Set()
  for (const file of files) {
    const before = readFileSync(file, 'utf8')
    const after = before.replace(/\{([^{}]*)\}/g, (whole, body) => {
      const m = body.match(/--ds-font-size-([a-z0-9-]+)\)/)
      if (!m) return whole
      const role = m[1]
      if (!ROLES.includes(role)) return whole
      // Collapse when line-height and weight either match the role or are
      // absent — applying the role's own values is the point of the ADR.
      // A cross-role borrow or a literal weight is a different fix (an emphasis
      // role, or a relabel); those are left for the per-site pass.
      const lhOther = /--ds-line-height-(?!(?:MARK))[a-z0-9-]+\)/.test(body)
                      && !body.includes(`--ds-line-height-${role})`)
      const fwOther = /--ds-font-weight-[a-z0-9-]+\)/.test(body)
                      && !body.includes(`--ds-font-weight-${role})`)
      const fwLiteral = /font-weight:\s*[0-9]/.test(body)
      if (lhOther || fwOther || fwLiteral) return whole
      // A literal line-height is a deliberate override: keep it, but after the
      // shorthand, which resets it.
      const lhLiteral = /line-height:\s*[0-9]/.test(body)
      let out = body
        .replace(/^[ \t]*font-size:\s*var\(--ds-font-size-[a-z0-9-]+\);[ \t]*\n?/m,
                 (l) => l.replace(/font-size:\s*var\(--ds-font-size-[a-z0-9-]+\)/, `font: var(--ds-font-${role})`))
        .replace(/^[ \t]*line-height:\s*var\(--ds-line-height-[a-z0-9-]+\);[ \t]*\n?/m, '')
        .replace(/^[ \t]*font-weight:\s*var\(--ds-font-weight-[a-z0-9-]+\);[ \t]*\n?/m, '')
        .replace(/^[ \t]*font-family:\s*var\(--ds-typography-font-family-[a-z]+\);[ \t]*\n?/m, '')
      if (!TRACKED.includes(role)) {
        out = out.replace(/^[ \t]*letter-spacing:\s*var\(--ds-letter-spacing-[a-z0-9-]+\);[ \t]*\n?/m, '')
      } else { kept++ }
      collapsed++
      return `{${out}}`
    })
    if (after !== before) { changed.add(file); if (!DRY) writeFileSync(file, after) }
  }
  console.log(`${DRY ? '[dry] ' : ''}pass A — files: ${changed.size}, roles collapsed: ${collapsed}`)
  console.log(`  letter-spacing kept for the ${TRACKED.length} tracked roles: ${TRACKED.join(', ')} (${kept} sites)`)
}

/* ── Pass B ─────────────────────────────────────────────────────────── */
const PX = { '0.6875rem': 11, '0.75rem': 12, '0.8125rem': 13, '0.875rem': 14, '0.9375rem': 15,
             '1rem': 16, '1.0625rem': 17, '1.125rem': 18, '1.25rem': 20, '1.375rem': 22,
             '1.5rem': 24, '1.75rem': 28, '2rem': 32, '2.5rem': 40, '3rem': 48, '3.75rem': 60 }

// The selector name is the signal — __label is a label, __supporting is body.
const LABEL = /label|badge|tag|chip|button|nav|tab|step|pill|dismiss|trigger|option|crumb/i
const BODY  = /supporting|hint|help|message|description|text|email|cell|value|body|paragraph|empty|content|placeholder/i
const HEAD  = /title|heading|header|name/i

function roleFor(selector, px) {
  const kind = HEAD.test(selector) ? 'heading' : LABEL.test(selector) ? 'label' : BODY.test(selector) ? 'body' : null
  if (!kind) return null
  const byPx = ROLES.filter((r) => Number(SIZE_OF[r]) === px && r.startsWith(kind) && !r.endsWith('-emphasis'))
  return byPx.length === 1 ? byPx[0] : null
}

function passB() {
  const rows = []
  for (const file of files) {
    const s = readFileSync(file, 'utf8')
    let sel = ''
    for (const line of s.split('\n')) {
      const t = line.trim()
      const sm = t.match(/^([.&#][^{]*?)\s*\{/)
      if (sm) sel = sm[1].trim()
      const fm = t.match(/^font-size:\s*([0-9.]+rem|[0-9]+px)\s*;/)
      if (fm) {
        const px = PX[fm[1]] ?? null
        rows.push({ file: file.replace('components/', ''), sel, raw: fm[1], px, role: px ? roleFor(sel, px) : null })
      }
    }
  }
  const ok = rows.filter((r) => r.role)
  const no = rows.filter((r) => !r.role)
  console.log(`pass B — ${rows.length} literal font-size declarations`)
  console.log(`  proposed automatically: ${ok.length}`)
  console.log(`  NEEDS A DECISION:       ${no.length}\n`)
  console.log('  ── proposed ──')
  for (const r of ok) console.log(`    ${r.file.padEnd(42)} ${String(r.px).padStart(2)}px  ${r.sel.slice(0, 34).padEnd(34)} → ${r.role}`)
  console.log('\n  ── needs a decision ──')
  for (const r of no) console.log(`    ${r.file.padEnd(42)} ${String(r.px ?? '?').padStart(2)}px  ${r.sel.slice(0, 46)}`)
}

PASS === 'a' ? passA() : passB()
