/**
 * Generates components/ModuleIcon/art/{illustration,logo}/*.vue from the raw
 * Figma SVG exports in scripts/module-art-raw/.
 *
 *   npm run module-art
 *
 * WHY a generator rather than committing the exports directly: a Figma SVG
 * export of a node inside a frame carries the surrounding canvas with it — a
 * #8F8F8F placeholder rect and two huge negative-coordinate backdrop paths.
 * Rendered as-is, every module would sit on a grey slab. Rather than pattern-
 * match that junk, this extracts *only* the `<g id="Module=NAME">` subtree, so
 * anything outside the artwork is dropped by construction and the vectors
 * themselves are untouched — exact, not redrawn.
 *
 * It also namespaces every internal id. Figma numbers mask/clip ids per frame,
 * so all 23 exports reuse `mask0_1083_118533` / `clip0_1083_118533`; inlining
 * two of them in one document would cross-wire the masks.
 *
 * Raw exports are committed because the Figma asset URLs are short-lived — see
 * scripts/module-art-raw/README.md for the node ids they came from.
 */
import { readFileSync, writeFileSync, readdirSync, rmSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '..')
const RAW = join(HERE, 'module-art-raw')
const OUT = join(ROOT, 'components/ModuleIcon/art')

const VARIANTS = ['illustration', 'logo']

/** File slug -> the `Module=` value Figma uses, and the public prop value. */
const MODULES = [
  { slug: 'carbone',   figma: 'Carbone', name: 'Carbone' },
  { slug: 'source',    figma: 'Source',  name: 'Source' },
  { slug: 'call',      figma: 'Call',    name: 'Call' },
  { slug: 'scan',      figma: 'Scan',    name: 'Scan' },
  { slug: 'data',      figma: 'Data',    name: 'Data' },
  { slug: 'id',        figma: 'ID',      name: 'ID' },
  { slug: 'redd-plus', figma: 'Redd+',   name: 'Redd+' },
  { slug: 'forest',    figma: 'Forest',  name: 'Forest' },
  { slug: 'survey',    figma: 'Survey',  name: 'Survey' },
  { slug: 'yield',     figma: 'Yield',   name: 'Yield' },
  { slug: 'trace',     figma: 'Trace',   name: 'Trace' },
]

const pascal = s => s.split('-').map(p => p[0].toUpperCase() + p.slice(1)).join('')

/**
 * Scan forward from the `<g` at `start` to its matching `</g>`, counting nested
 * opens. Returns the full element source including both tags.
 */
function balancedGroup(svg, start) {
  let depth = 0
  let i = start
  while (i < svg.length) {
    if (svg.startsWith('<g', i) && /[\s>]/.test(svg[i + 2] ?? '')) {
      depth++
      i += 2
    } else if (svg.startsWith('</g>', i)) {
      depth--
      i += 4
      if (depth === 0) return svg.slice(start, i)
    } else {
      i++
    }
  }
  throw new Error('unbalanced <g> while extracting artwork')
}

/** Pull the <clipPath>/<mask> definitions the subtree references. */
function collectDefs(svg, subtree) {
  const ids = new Set([...subtree.matchAll(/url\(#([^)]+)\)/g)].map(m => m[1]))
  const out = []
  for (const id of ids) {
    // Inline masks already live inside the subtree; only reach for what doesn't.
    if (new RegExp(`<(?:mask|clipPath)\\s[^>]*id="${id}"`).test(subtree)) continue
    const open = new RegExp(`<(clipPath|mask)\\s[^>]*id="${id}"[^>]*>`).exec(svg)
    if (!open) continue
    const tag = open[1]
    const end = svg.indexOf(`</${tag}>`, open.index)
    if (end === -1) continue
    out.push(svg.slice(open.index, end + tag.length + 3))
  }
  return out
}

/** Prefix every internal id so two inlined artworks cannot cross-wire. */
function namespaceIds(markup, prefix) {
  const ids = new Set([
    ...[...markup.matchAll(/\bid="((?:mask|clip|filter|paint|pattern|image)[^"]*)"/g)].map(m => m[1]),
    ...[...markup.matchAll(/url\(#([^)]+)\)/g)].map(m => m[1]),
  ])
  let out = markup
  for (const id of ids) {
    const esc = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    out = out
      .replace(new RegExp(`id="${esc}"`, 'g'), `id="${prefix}-${id}"`)
      .replace(new RegExp(`url\\(#${esc}\\)`, 'g'), `url(#${prefix}-${id})`)
  }
  return out
}

rmSync(OUT, { recursive: true, force: true })

const built = { illustration: [], logo: [] }
const skipped = []

for (const variant of VARIANTS) {
  mkdirSync(join(OUT, variant), { recursive: true })

  for (const mod of MODULES) {
    const file = join(RAW, variant, `${mod.slug}.svg`)
    let svg
    try {
      svg = readFileSync(file, 'utf8')
    } catch {
      skipped.push(`${variant}/${mod.slug} — no export`)
      continue
    }

    const marker = `<g id="Module=${mod.figma}"`
    const at = svg.indexOf(marker)
    if (at === -1) {
      // Empty in Figma: the export is the placeholder rect and nothing else.
      skipped.push(`${variant}/${mod.slug} — export has no "Module=${mod.figma}" artwork`)
      continue
    }

    let artwork = balancedGroup(svg, at)
    const defs = collectDefs(svg, artwork)
    let inner = artwork + (defs.length ? `\n<defs>\n${defs.join('\n')}\n</defs>` : '')
    inner = namespaceIds(inner, `ds-mod-${variant}-${mod.slug}`)

    const body = inner
      .split('\n')
      .map(l => (l.trim() ? `    ${l.trim()}` : ''))
      .filter(Boolean)
      .join('\n')

    writeFileSync(
      join(OUT, variant, `${mod.slug}.vue`),
      `<template>
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
${body}
  </svg>
</template>
`,
    )
    built[variant].push(mod)
  }
}

// ── registry ────────────────────────────────────────────────────────────────
const imports = []
const maps = {}

for (const variant of VARIANTS) {
  maps[variant] = []
  for (const mod of built[variant]) {
    const ident = `${pascal(variant)}${pascal(mod.slug)}`
    imports.push(`import ${ident} from './art/${variant}/${mod.slug}.vue'`)
    maps[variant].push(`  '${mod.name}': ${ident},`)
  }
}

const allNames = MODULES.filter(m => built.logo.some(b => b.slug === m.slug)).map(m => m.name)

writeFileSync(
  join(ROOT, 'components/ModuleIcon/registry.ts'),
  `/**
 * GENERATED by scripts/generate-module-art.mjs — do not edit by hand.
 * Run \`npm run module-art\` after changing scripts/module-art-raw/.
 *
 * Source: Figma \`00 — Core Brand Visual Identity\` —
 *   Module illustration (node 9945:197) → the primitive artwork
 *   Modules logos      (node 9892:11717) → the same artwork on its tile
 */
${imports.join('\n')}

/** The raw artwork, as drawn. The primitive. */
export const illustrations = {
${maps.illustration.join('\n')}
} as const

/** The artwork on its rounded tile — what product surfaces consume. */
export const logos = {
${maps.logo.join('\n')}
} as const

export const moduleNames = [${allNames.map(n => `'${n}'`).join(', ')}] as const

export type ModuleName = typeof moduleNames[number]
export type ModuleVariant = 'illustration' | 'logo'
`,
)

console.log(`illustration: ${built.illustration.length}   logo: ${built.logo.length}`)
if (skipped.length) {
  console.log('\nskipped:')
  for (const s of skipped) console.log(`  ${s}`)
}
