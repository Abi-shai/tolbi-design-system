import StyleDictionary from 'style-dictionary'
import { readFileSync, writeFileSync, appendFileSync } from 'fs'

const ALL_SOURCES = [
  'tokens/src/color/primitives.json', 'tokens/src/color/semantic.json', 'tokens/src/color/chart.json',
  'tokens/src/typography/primitives.json', 'tokens/src/typography/semantic.web.json',
  'tokens/src/radius/primitives.json', 'tokens/src/radius/semantic.json',
  'tokens/src/spacing/primitives.json', 'tokens/src/spacing/semantic.json', 'tokens/src/spacing/control.json',
  'tokens/src/widths/semantic.json', 'tokens/src/containers/semantic.json',
  'tokens/src/effect/shadows.json', 'tokens/src/effect/elevation.json', 'tokens/src/effect/focus-rings.json',
  'tokens/src/motion/semantic.json',
]

const TYPE_ROLE_ROOTS = ['font-size', 'line-height', 'letter-spacing', 'font-weight']
const SEMANTIC_COLOR_ROOTS = ['text', 'bg', 'border']
const isSemanticColor = (token) => SEMANTIC_COLOR_ROOTS.includes(token.path[0])
const isTypeRole = (token) => TYPE_ROLE_ROOTS.includes(token.path[0])

/**
 * ADR-0019: the JS and JSON platforms exist for the cases a CSS custom property
 * CANNOT serve — a canvas-rendered chart cannot read `var(--ds-…)`, and neither
 * can a computation. Anything rendering to the DOM should use the CSS: it keeps
 * the cascade, and a resolved value in JS is a second source of truth the day
 * the token moves.
 *
 * Values are therefore RESOLVED, not `var()` references. That is the point.
 */
async function buildAllSources(dest, opts = {}) {
  const sd = new StyleDictionary({
    source: ALL_SOURCES,
    platforms: {
      js: {
        transformGroup: 'js',
        prefix: 'ds',
        buildPath: 'tokens/dist/',
        files: [
          { destination: 'index.js',    format: 'javascript/es6' },
          { destination: 'index.d.ts',  format: 'typescript/es6-declarations' },
          { destination: 'tokens.json', format: 'json/flat' },
        ],
      },
    },
  })
  return sd.buildAllPlatforms()
}

async function buildTokenFile(source, dest, opts = {}) {
  const {
    filter,
    selector = ':root',
    outputReferences = false,
  } = opts

  const sd = new StyleDictionary({
    source: Array.isArray(source) ? source : [source],
    platforms: {
      css: {
        transformGroup: 'css',
        prefix: 'ds',
        buildPath: 'tokens/dist/',
        files: [{
          destination: dest,
          format: 'css/variables',
          ...(filter ? { filter } : {}),
          options: { selector, outputReferences },
        }],
      },
    },
  })

  return sd.buildAllPlatforms()
}

await Promise.all([
  buildTokenFile('tokens/src/color/primitives.json',    'colors.css'),
  buildTokenFile('tokens/src/typography/primitives.json', 'typography.css'),
  buildTokenFile('tokens/src/effect/shadows.json',      'shadows.css'),

  // ADR-0016: an ordered categorical series palette over the display hues.
  // Ordered max-min by ΔE, so the first N series are always the most distinct.
  buildTokenFile(
    ['tokens/src/color/primitives.json', 'tokens/src/color/chart.json'],
    'chart.css',
    { filter: (token) => token.path[0] === 'chart', outputReferences: true },
  ),
  buildTokenFile('tokens/src/effect/focus-rings.json',  'focus-rings.css'),
  buildTokenFile('tokens/src/effect/blurs.json',        'blurs.css'),
  buildTokenFile('tokens/src/spacing/primitives.json',  'space.css'),

  buildTokenFile(
    ['tokens/src/spacing/primitives.json', 'tokens/src/spacing/semantic.json'],
    'spacing.css',
    { filter: (token) => token.path[0] === 'spacing', outputReferences: true },
  ),

  // ADR-0009: three groups, no tier marker in the name. `--ds-bg-brand-solid`,
  // not `--ds-semantic-bg-brand-solid` — the namespace word already says the tier
  // (`color`/`space`/`typography` are primitives; `text`/`bg`/`border` are semantic).
  buildTokenFile(
    ['tokens/src/color/primitives.json', 'tokens/src/color/semantic.json'],
    'semantic.css',
    { filter: isSemanticColor, outputReferences: true },
  ),

  // Typography roles. Web is the default scale; the mobile scale is opt-in via
  // [data-typography="mobile"] because "mobile" here means a native/webview
  // context (sp on Android, Dynamic Type on iOS), not a narrow browser window.
  buildTokenFile(
    ['tokens/src/typography/primitives.json', 'tokens/src/typography/semantic.web.json'],
    'type-roles.css',
    { filter: isTypeRole, outputReferences: true },
  ),

  buildTokenFile(
    ['tokens/src/typography/primitives.json', 'tokens/src/typography/semantic.mobile.json'],
    'type-roles-mobile.css',
    { filter: isTypeRole, selector: '[data-typography="mobile"]', outputReferences: true },
  ),

  // ADR-0013: control padding is a scale of its own — derived from control
  // heights minus the line box, so it lands between the layout ramp's steps.
  buildTokenFile(
    ['tokens/src/spacing/primitives.json', 'tokens/src/spacing/control.json'],
    'control.css',
    { filter: (token) => token.path[0] === 'control-padding', outputReferences: true },
  ),

  buildTokenFile(
    ['tokens/src/spacing/primitives.json', 'tokens/src/widths/semantic.json'],
    'widths.css',
    { filter: (token) => token.path[0] === 'width', outputReferences: true },
  ),

  buildTokenFile(
    ['tokens/src/spacing/primitives.json', 'tokens/src/containers/semantic.json'],
    'containers.css',
    { filter: (token) => token.path[0] === 'container', outputReferences: true },
  ),

  // ADR-0015: motion has no primitive tier. ADR-0002 named these by intent, and
  // a numeric ramp beneath them would alias six names 1:1 onto six values,
  // adding no decision — the `fg` failure mode ADR-0009 deleted.
  buildTokenFile('tokens/src/motion/semantic.json', 'motion.css'),

  buildTokenFile(
    ['tokens/src/radius/primitives.json', 'tokens/src/radius/semantic.json'],
    'radius.css',
    { outputReferences: true },
  ),

  // ADR-0009: names the elevation rule that already had 100% adherence —
  // controls xs, surfaces sm, floating lg.
  buildTokenFile(
    ['tokens/src/effect/shadows.json', 'tokens/src/effect/elevation.json'],
    'elevation.css',
    { filter: (token) => token.path[0] === 'elevation', outputReferences: true },
  ),
])

// ── ADR-0011: the `font:` shorthand, one declaration per role ─────────────
// CSS custom properties cannot bundle declarations, so a role is applied as a
// `font:` shorthand carrying family, size, line-height and weight. This is also
// what carries the font-family, which is why no component references
// --ds-typography-font-family-* any more.
//
// Note for consumers: `font:` RESETS font-variant-numeric to normal, so it must
// be declared BEFORE any tabular-nums line.
function writeFontShorthands(roles, selector, dest) {
  const body = roles.map((role) => {
    const family = role === 'code-md' ? 'mono' : 'poppins'
    return `  --ds-font-${role}: var(--ds-font-weight-${role}) var(--ds-font-size-${role})`
         + `/var(--ds-line-height-${role}) var(--ds-typography-font-family-${family});`
  }).join('\n')
  writeFileSync(`tokens/dist/${dest}`, `${selector} {\n${body}\n}\n`)
}

const ROLES = Object.keys(
  JSON.parse(readFileSync('tokens/src/typography/semantic.web.json', 'utf8'))['font-size'],
)
writeFontShorthands(ROLES, ':root', 'font-roles.css')
writeFontShorthands(ROLES, '[data-typography="mobile"]', 'font-roles-mobile.css')

await buildAllSources()

// The series palette is the reason the JS platform exists, and a consumer wants
// an ordered list, not seven separate constants. The ceiling from ADR-0016 rides
// along in the type rather than living only in a document.
{
  const flat = JSON.parse(readFileSync('tokens/dist/tokens.json', 'utf8'))
  const series = Object.keys(flat)
    .filter((k) => /^DsChartCategorical\d+$/.test(k))
    .sort((a, b) => Number(a.match(/\d+$/)[0]) - Number(b.match(/\d+$/)[0]))
    .map((k) => flat[k])
  appendFileSync('tokens/dist/index.js', `
/**
 * Data-series colours, ordered by measured ΔE so the first N are always the most
 * distinguishable (ADR-0016). Past five categories, aggregate rather than reach
 * further down the ramp — 6 and 7 fall to ΔE 24.3 and 16.1.
 */
export const chartCategorical = ${JSON.stringify(series)}

/** The comfortable ceiling. Beyond this the palette stops being distinguishable. */
export const chartCategoricalCeiling = 5
`)
  appendFileSync('tokens/dist/index.d.ts', `
/**
 * Data-series colours, ordered by measured ΔE (ADR-0016). Past
 * \`chartCategoricalCeiling\` categories, aggregate rather than add a colour.
 */
export const chartCategorical: readonly string[]
export const chartCategoricalCeiling: 5
`)
}

appendFileSync('tokens/dist/motion.css', `
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
`)

const tokenFiles = [
  'colors', 'typography', 'type-roles', 'type-roles-mobile',
  'radius', 'space', 'spacing', 'widths', 'containers',
  'font-roles', 'font-roles-mobile', 'control',
  'shadows', 'elevation', 'focus-rings', 'semantic', 'chart', 'motion',
]
const combined = tokenFiles
  .map(f => readFileSync(`tokens/dist/${f}.css`, 'utf8'))
  .join('\n')
writeFileSync('tokens/dist/index.css', combined)
