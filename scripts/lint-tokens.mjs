/**
 * Token discipline linter — enforces the rules ADR-0009, ADR-0010 and ADR-0011
 * left as "still open". Every rule here is one an ADR states in prose; this is
 * the machine-checkable half.
 *
 *   node scripts/lint-tokens.mjs            all rules, errors fail the build
 *   node scripts/lint-tokens.mjs --warn     report only, always exit 0
 *
 * Zero dependencies on purpose: the cross-declaration rules (role completeness,
 * font ordering, on-colour pairing) need a whole rule block at once, which is
 * awkward in stylelint without writing a plugin.
 */
import { readFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'
import { pathToFileURL } from 'url'

const web = JSON.parse(readFileSync('tokens/src/typography/semantic.web.json', 'utf8'))
const ROLES = Object.keys(web['font-size'])
const TRACKED = ROLES.filter((r) => !web['letter-spacing'][r].$value.includes('none'))
const spacing = JSON.parse(readFileSync('tokens/src/spacing/semantic.json', 'utf8')).spacing
const PX_ON_RAMP = new Map(Object.entries(spacing).map(([n, t]) => [parseInt(t.$description, 10), n]))
const semantic = JSON.parse(readFileSync('tokens/src/color/semantic.json', 'utf8'))
const SEMANTIC_NAMES = new Set(
  Object.entries(semantic).flatMap(([g, ts]) => Object.keys(ts).map((t) => `${g}-${t}`)),
)

/** Empty, and that is the point: every colour literal in the catalogue now has
 *  a token. ADR-0015 took the avatar hairlines, ADR-0016 the nav's drop shadow. */
const COLOUR_LITERAL_ALLOW = []

function walk(dir, out = []) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n)
    if (p.includes('/ModuleIcon/art/') || p.includes('/Icon/icons/')) continue
    if (statSync(p).isDirectory()) walk(p, out)
    else if (extname(p) === '.vue') out.push(p)
  }
  return out
}

function walkTs(dir, out = []) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n)
    if (p.includes('/ModuleIcon/art/') || p.includes('/Icon/icons/')) continue
    if (statSync(p).isDirectory()) walkTs(p, out)
    else if (extname(p) === '.ts' && !p.endsWith('.stories.ts')) out.push(p)
  }
  return out
}

/** `// token-lint-disable-next-line <rule> — reason` and a file-level
 *  `/* token-lint-disable <rule> — reason *\/`. A deliberate exception must
 *  say which rule and why; a bare disable is not accepted. */
function suppressions(src) {
  const file = new Set()
  const line = new Map()
  const lines = src.split('\n')
  for (const [i, l] of lines.entries()) {
    let m = l.match(/token-lint-disable-next-line\s+([a-z-]+)\s+—/)
    if (m) line.set(i + 2 + '|' + m[1], true)
    m = l.match(/token-lint-disable\s+([a-z-]+)\s+—/)
    if (m && !l.includes('next-line')) file.add(m[1])
  }
  return { file, line }
}

export const RULES = ['no-raw-primitive', 'no-colour-literal', 'no-shadowing-var',
                      'no-literal-type', 'role-completeness', 'font-order', 'solid-pairing',
                      'spacing-on-ramp', 'no-raw-radius', 'no-literal-dimension-js',
                      'no-token-js-import', 'no-literal-border-width', 'no-literal-z-index',
                      'focus-ring-instant', 'dark-mode-parity', 'mode-neutral-ramp']

export const LIGHT_SRC = 'tokens/src/color/semantic.json'
export const DARK_SRC = 'tokens/src/color/semantic.dark.json'
export const MODE_PAIRS = [
  [LIGHT_SRC, DARK_SRC],
  ['tokens/src/effect/focus-rings.json', 'tokens/src/effect/focus-rings.dark.json'],
  ['tokens/src/effect/shadows.json', 'tokens/src/effect/shadows.dark.json'],
]

/**
 * The two mode files are ONE decision recorded twice, and the failure mode is
 * silent: a light token added without its dark twin does not error, it inherits
 * the light value — which on a dark page is a white flash. Nothing in the build
 * would say so, which is precisely ADR-0012's argument for a linter.
 *
 * Structural, over the token sources, so it cannot live in lintSource(): that
 * one is over one .vue file's text. Pure for the same reason it is (ADR-0018).
 */
/**
 * The only names the library may take from the JS token export. A resolved value
 * read in JS is a second source of truth that bypasses the cascade (ADR-0019) —
 * but an easing curve has no cascade to bypass: there is no `var()` that
 * evaluates a cubic-bezier at t, which is the "computation" case that ADR gives
 * as the platform's whole reason to exist.
 */
export const TOKEN_JS_ALLOW = ['easing', 'cubicBezier']

/**
 * ADR-0019 over the .ts half of the library. `lintSource` only ever sees `.vue`,
 * so a composable importing resolved colours would sail straight past it — which
 * is exactly where the first such import landed.
 */
export function lintTokenImports(files) {
  const findings = []
  for (const { file, source: raw } of files) {
    // Comments are stripped first, and the reason is this rule's own comment in
    // useMarquee: it contains the word `import` and sits directly above one, so
    // an unstripped scan reads the prose as the import clause.
    const source = raw.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '))
                      .replace(/(^|[^:])\/\/[^\n]*/g, (m0, p1) => p1 + ' '.repeat(m0.length - p1.length))
    for (const m of source.matchAll(/import\s+([^;'"]*?)\s+from\s*['"][^'"]*tokens\/dist[^'"]*['"]/g)) {
      const clause = m[1].trim()
      const line = source.slice(0, m.index).split('\n').length
      const named = clause.match(/^\{([^}]*)\}$/)
      if (!named) {
        findings.push({ rule: 'no-token-js-import', file, line,
          msg: `${clause} — a default or namespace import takes the whole token export` })
        continue
      }
      const bad = named[1].split(',')
        .map((n) => n.trim().split(/\s+as\s+/)[0].trim())
        .filter(Boolean)
        .filter((n) => !TOKEN_JS_ALLOW.includes(n))
      if (bad.length)
        findings.push({ rule: 'no-token-js-import', file, line,
          msg: `${bad.join(', ')} — read values from the cascade; only ${TOKEN_JS_ALLOW.join(' and ')} have no var() form` })
    }
  }
  return findings
}

export function lintModes(light, dark, darkSrc = DARK_SRC, lightSrc = LIGHT_SRC) {
  const findings = []
  const push = (rule, file, msg) => findings.push({ rule, file, line: 1, msg })

  for (const group of new Set([...Object.keys(light), ...Object.keys(dark)])) {
    const l = Object.keys(light[group] ?? {})
    const d = new Set(Object.keys(dark[group] ?? {}))
    for (const name of l)
      if (!d.has(name))
        push('dark-mode-parity', darkSrc, `${group}-${name} has no dark value — it would inherit the light one`)
    for (const name of d)
      if (!l.includes(name))
        push('dark-mode-parity', darkSrc, `${group}-${name} exists only in dark`)
  }

  /* Each mode has exactly one neutral ramp: gray-light carries light,
     gray-forest carries dark. A reference to the other mode's neutral is a
     copy-paste that survived — and it is the white flash again. */
  for (const [file, doc, wrong, right] of [
    [lightSrc, light, 'gray-forest', 'gray-light'],
    [darkSrc, dark, 'gray-light', 'gray-forest'],
  ]) {
    for (const [group, tokens] of Object.entries(doc))
      for (const [name, token] of Object.entries(tokens))
        if (String(token.$value).match(new RegExp(`color[.-]${wrong}[.-]`)))
          push('mode-neutral-ramp', file, `${group}-${name} reaches for ${wrong} — this mode's neutral is ${right}`)
  }

  return findings
}

/**
 * The rules, over one file's source. Pure: no filesystem, so the suite can
 * exercise every rule and every escape hatch against fixtures.
 */
export function lintSource(rel, src) {
  const findings = []
  const seenFinding = new Set()
  const sup = suppressions(src)
  const report = (rule, file, line, msg) => {
    if (sup.file.has(rule) || sup.line.has(line + '|' + rule)) return
    const k = `${rule}|${file}|${line}|${msg}`
    if (seenFinding.has(k)) return
    seenFinding.add(k)
    findings.push({ rule, file, line, msg })
  }
  const lineOf = (idx) => src.slice(0, idx).split('\n').length

  /* ADR-0009 — components consume semantic tokens, never raw primitives.
     ADR-0010 excepts a categorical palette: there is no role to route through. */
  for (const m of src.matchAll(/--ds-color-([a-z0-9-]+)/g)) {
    if (m[1].startsWith('display-')) continue
    report('no-raw-primitive', rel, lineOf(m.index), `--ds-color-${m[1]}`)
  }

  /* ADR-0009 — no colour literals. */
  for (const m of src.matchAll(/#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b|(?:rgba?|hsla?)\([^)]*\)/g)) {
    const val = m[0]
    if (COLOUR_LITERAL_ALLOW.some(([f, v]) => rel === f && val === v)) continue
    if (/^(?:rgba?|hsla?)\(\s*(?:var|--)/.test(val)) continue
    report('no-colour-literal', rel, lineOf(m.index), val)
  }

  /* ADR-0009 — and the same rule for colour KEYWORDS, which it did not cover.
     Three `color: white` declarations sat in the catalogue under a linter
     reporting zero — the exact failure ADR-0018 exists to make impossible, found
     the same way the four in ADR-0013 were. `white` is also the one literal that
     a second colour mode breaks (ADR-0029): it does not move, and everything
     around it does. `transparent` and `currentColor` are not colours in this
     sense and stay silent. */
  for (const m of src.matchAll(/(?:^|[{;])\s*(--[a-z][a-z0-9-]*|[a-z-]+)\s*:\s*([^;{}]+)/gm)) {
    const [, prop, value] = m
    if (!prop.startsWith('--') && !/colou?r|background|fill|stroke|border|outline|shadow/.test(prop)) continue
    const kw = value.match(/\b(white|black)\b/)
    if (kw) report('no-colour-literal', rel, lineOf(m.index), kw[1])
  }

  /* ADR-0010 — a variant switch must not shadow a semantic token name. */
  for (const m of src.matchAll(/(?:^|[{;])\s*--([a-z][a-z0-9-]*)\s*:/gm)) {
    if (m[1].startsWith('ds-')) continue
    if (SEMANTIC_NAMES.has(m[1])) report('no-shadowing-var', rel, lineOf(m.index), `--${m[1]}`)
  }

  /* ADR-0011 — no literal type values. Unitless line-height (0, 1, 1.5) is a
     deliberate reset, not a scale value. */
  for (const m of src.matchAll(/(?:^|[{;])\s*font-size:\s*([0-9.]+(?:rem|px|em))\s*;/gm))
    report('no-literal-type', rel, lineOf(m.index), `font-size: ${m[1]}`)
  for (const m of src.matchAll(/(?:^|[{;])\s*font-weight:\s*([0-9]{3})\s*;/gm))
    report('no-literal-type', rel, lineOf(m.index), `font-weight: ${m[1]}`)
  for (const m of src.matchAll(/(?:^|[{;])\s*line-height:\s*([0-9.]+(?:rem|px))\s*;/gm))
    report('no-literal-type', rel, lineOf(m.index), `line-height: ${m[1]}`)

  /* ADR-0013 — radius is consumed through its roles. Every primitive step now
     has a role, so a raw step in a component is drift by definition. */
  for (const m of src.matchAll(/--ds-radius-(none|xxs|xs|sm|md|lg|xl|2xl|3xl|4xl|full)\)/g))
    report('no-raw-radius', rel, lineOf(m.index), `--ds-radius-${m[1]} — use a role (inner-sm, inner, control, surface-sm, surface, pill)`)

  /* ADR-0009 recorded spacing's defect as adoption, not naming. The rule is
     scoped to values that ARE on the ramp: a literal 8px must be spacing-md.
     Off-ramp control padding (10px, 14px, 18px) is a separate open question —
     see ADR-0009 "Still open" — and is deliberately not flagged. */
  for (const m of src.matchAll(/(?:^|[{;])\s*((?:padding|margin|gap|row-gap|column-gap)(?:-[a-z]+)?)\s*:\s*([^;{}]+);/gm)) {
    const v = m[2].trim()
    if (v.includes('var(') || v.includes('calc(')) continue
    for (const part of v.split(/\s+/)) {
      const px = part.match(/^(\d+)px$/)
      if (px && PX_ON_RAMP.has(Number(px[1])))
        report('spacing-on-ramp', rel, lineOf(m.index), `${m[1]}: ${part} is --ds-spacing-${PX_ON_RAMP.get(Number(px[1]))}`)
    }
  }

  /* ADR-0013 — the same rules inside JavaScript style objects. `ProgressCircle`
     carried a whole parallel type ramp in one, and a CSS-only linter is blind
     to it: the property is `fontSize`, not `font-size`. */
  const scriptBlock = src.match(/<script[^>]*>([\s\S]*?)<\/script>/)
  if (scriptBlock) {
    const js = scriptBlock[1]
    const base = src.slice(0, src.indexOf(scriptBlock[1])).split('\n').length - 1
    const jsLine = (i) => base + js.slice(0, i).split('\n').length
    // Not keyed on the property name: ProgressCircle's ramp lives in tables
    // keyed `size:`/`line:`, which a property-name rule sails straight past.
    // Any bare dimensional literal is surfaced; the component declares intent
    // with a `token-lint-disable` comment naming the rule and the reason.
    for (const m of js.matchAll(/'(-?[0-9.]+(?:rem|px))'/g)) {
      if (/^-?0(?:\.0+)?(?:rem|px)$/.test(m[1])) continue   // zero is not a decision
      report('no-literal-dimension-js', rel, jsLine(m.index), m[1])
    }
  }

  /* ADR-0019 — the JS token export is for CONSUMERS, for the cases a custom
     property cannot serve (canvas, computation). Inside the library it would be
     a second source of truth: a resolved value bypasses the cascade and goes
     stale the day the token moves. Components use the CSS. */
  for (const m of src.matchAll(/from\s+['"][^'"]*tokens\/dist(?:\/index)?(?:\.js)?['"]/g))
    report('no-token-js-import', rel, lineOf(m.index), 'components use the CSS custom properties, not the resolved JS export')

  /* ADR-0020 — a border width that maps to a token must use it. Scoped to the
     two values that ARE tokens: the tooltip's 6/8px triangles are geometry and
     Toast's 3px rule is an accent, neither is a border width. */
  for (const m of src.matchAll(/\b(border(?:-(?:top|right|bottom|left))?)\s*:\s*(1|2)px\s+(?:solid|dashed)/g))
    report('no-literal-border-width', rel, lineOf(m.index), `${m[1]}: ${m[2]}px is --ds-border-width-${m[2] === '1' ? 'default' : 'strong'}`)

  /* ADR-0020 — a z-index of 10 or more is a SHARED layer and needs a name.
     Below that it is stacking inside one component, which is its own business. */
  for (const m of src.matchAll(/z-index:\s*(\d+)/g)) {
    if (Number(m[1]) < 10) continue
    report('no-literal-z-index', rel, lineOf(m.index), `z-index: ${m[1]} — use --ds-z-popover or --ds-z-overlay`)
  }

  /* ADR-0022 — every state-driven box-shadow change in the catalogue is a focus
     ring, and a focus ring must confirm the keystroke immediately: at 150ms it
     reads as lag. `instant` exists for exactly this — ADR-0002's own description
     says "press states, focus rings" — and it had zero consumers until the
     transitions were split. A component animating elevation instead can suppress
     this with a reason. */
  for (const m of src.matchAll(/transition:([^;]+);/gs)) {
    const bs = m[1].match(/box-shadow\s+var\(--ds-motion-duration-([a-z]+)\)/)
    if (bs && bs[1] !== 'instant')
      report('focus-ring-instant', rel, lineOf(m.index), `box-shadow transitions the focus ring — use --ds-motion-duration-instant, not ${bs[1]}`)
  }

  /* Rule-block rules. */
  for (const m of src.matchAll(/\{([^{}]*)\}/g)) {
    const body = m[1]
    const at = lineOf(m.index)

    /* ADR-0011 — completeness, scoped to font-size. A block setting a role's
       size must set the whole role; a lone weight/line-height override of an
       inherited role is legitimate. */
    const fs = body.match(/--ds-font-size-([a-z0-9-]+)\)/)
    if (fs && ROLES.includes(fs[1])) {
      const r = fs[1]
      const miss = []
      if (!body.includes(`--ds-line-height-${r})`) && !/line-height:\s*[0-9]/.test(body)) miss.push('line-height')
      if (!body.includes(`--ds-font-weight-${r})`)) miss.push('font-weight')
      if (TRACKED.includes(r) && !body.includes(`--ds-letter-spacing-${r})`)) miss.push('letter-spacing')
      if (miss.length) report('role-completeness', rel, at, `${r} missing ${miss.join(', ')} — use font: var(--ds-font-${r})`)
    }

    /* ADR-0011 — `font:` resets font-variant-numeric, so it must come first. */
    const fi = body.indexOf('font:')
    const ti = body.indexOf('font-variant-numeric')
    if (fi !== -1 && ti !== -1 && fi > ti)
      report('font-order', rel, at, '`font:` after font-variant-numeric silently resets it to normal')

    /* ADR-0009 — a -solid fill requires its paired on-colour. */
    const solid = body.match(/background(?:-color)?:\s*var\(--ds-bg-([a-z]+)-solid\)/)
    if (solid && /(?:^|\s)color:\s*var\(--ds-text-(?!on-)/.test(body))
      report('solid-pairing', rel, at, `bg-${solid[1]}-solid needs text-on-${solid[1]}-solid, not a plain text-* token`)
  }

  return findings
}

/* ── CLI ──────────────────────────────────────────────────────────────── */
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) run()

function run() {
const WARN_ONLY = process.argv.includes('--warn')
const findings = [
  ...walk('components').flatMap((file) =>
    lintSource(file.replace('components/', ''), readFileSync(file, 'utf8'))),
  ...MODE_PAIRS.flatMap(([l, d]) =>
    lintModes(JSON.parse(readFileSync(l, 'utf8')), JSON.parse(readFileSync(d, 'utf8')), d, l)),
  ...lintTokenImports(
    ['components', 'composables'].flatMap((dir) => walkTs(dir))
      .map((file) => ({ file, source: readFileSync(file, 'utf8') })),
  ),
]

const byRule = findings.reduce((a, f) => ((a[f.rule] ??= []).push(f), a), {})
console.log('token discipline\n')
for (const rule of RULES) {
  const hits = byRule[rule] ?? []
  console.log(`  ${hits.length === 0 ? '✓' : '✗'} ${rule.padEnd(20)} ${hits.length}`)
  for (const h of hits.slice(0, 12)) console.log(`      ${h.file}:${h.line}  ${h.msg}`)
  if (hits.length > 12) console.log(`      … and ${hits.length - 12} more`)
}
console.log(`\n  ${findings.length} finding(s)`)
if (findings.length && !WARN_ONLY) process.exit(1)
}
