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
  'tokens/src/border/semantic.json', 'tokens/src/layer/semantic.json',
]

/**
 * semantic.dark.json is deliberately absent from ALL_SOURCES. It carries the
 * SAME 69 token paths as semantic.json, so adding it would not add tokens to the
 * JS/JSON export — it would silently overwrite the light values with the dark
 * ones. A mode is a CSS concern: it belongs to the cascade, which is exactly
 * what the JS platform cannot have (ADR-0019).
 */

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

  // ADR-0030: a shadow is a darkening, and the dark ground has almost no
  // luminance left to lose — 100% black on gray-forest/900 is 1.262:1, where
  // border-subtle is already 1.644:1. So the dark shadow is not solved to match
  // the light one; it is raised until it is perceptible and left there. What
  // separates a floating surface in dark is the border it already had.
  buildTokenFile('tokens/src/effect/shadows.dark.json',  'shadows-dark.css',
    { selector: '[data-theme="dark"]' }),

  // ADR-0016: an ordered categorical series palette over the display hues.
  // Ordered max-min by ΔE, so the first N series are always the most distinct.
  buildTokenFile(
    ['tokens/src/color/primitives.json', 'tokens/src/color/chart.json'],
    'chart.css',
    { filter: (token) => token.path[0] === 'chart', outputReferences: true },
  ),
  buildTokenFile('tokens/src/effect/focus-rings.json',  'focus-rings.css'),

  // A focus ring is the interactive colour at low alpha. The alpha is the
  // decision and carries over; the BASE is what is mode-wrong — brand-500 is
  // 1.63:1 on gray-forest/900, and a light-mode gray haloes nothing there.
  // WCAG 2.4.7 is not optional in the second mode (ADR-0029).
  buildTokenFile('tokens/src/effect/focus-rings.dark.json', 'focus-rings-dark.css',
    { selector: '[data-theme="dark"]' }),

  // ADR-0020: two scales several components had agreed on without naming.
  buildTokenFile('tokens/src/border/semantic.json',      'border.css'),
  buildTokenFile('tokens/src/layer/semantic.json',       'layer.css'),
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

  // Dark mode, returning the way ADR-0003 said it would have to: as a Figma
  // mode first, then as code. Same mechanism as the mobile type scale — a
  // parallel source under its own selector, opt-in via an attribute rather than
  // prefers-color-scheme. A product decides when it is dark; the OS does not.
  buildTokenFile(
    ['tokens/src/color/primitives.json', 'tokens/src/color/semantic.dark.json'],
    'semantic-dark.css',
    { filter: isSemanticColor, selector: '[data-theme="dark"]', outputReferences: true },
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

  // Elevation is redefined under the dark selector from the SAME elevation.json
  // — there is no elevation.dark.json to drift. It has to be redefined at all
  // because `--ds-elevation-*` resolves `var(--ds-shadow-*)` at computed-value
  // time on the element that declares it: with [data-theme="dark"] on a subtree
  // rather than on <html>, :root would already have baked the light shadow in.
  buildTokenFile(
    ['tokens/src/effect/shadows.dark.json', 'tokens/src/effect/elevation.json'],
    'elevation-dark.css',
    { filter: (token) => token.path[0] === 'elevation', outputReferences: true,
      selector: '[data-theme="dark"]' },
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

// ── The easing curves, as functions ───────────────────────────────────────
// A `cubic-bezier(...)` string is exactly what a `requestAnimationFrame` ramp or
// a canvas CANNOT use, and ADR-0019 says this platform exists for "a
// computation". It shipped the curves as strings anyway, so the first consumer
// that needed one at time t hand-wrote its own: the product's marquee ramp used
// an easeOutQuart, believing it was `easing-default`. It is 25 percentage points
// off at t=0.1 — 0.344 against 0.094.
//
// Generated from the same token values as the CSS, so the two cannot drift.
{
  const easings = JSON.parse(readFileSync('tokens/src/motion/semantic.json', 'utf8')).motion.easing
  const camel = (k) => k.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
  const entries = Object.entries(easings).map(([name, token]) => {
    const [x1, y1, x2, y2] = token.$value.match(/-?[\d.]+/g).map(Number)
    return `  ${camel(name)}: cubicBezier(${x1}, ${y1}, ${x2}, ${y2}),`
  })
  appendFileSync('tokens/dist/index.js', `
/**
 * Build the easing function for a CSS \`cubic-bezier(x1, y1, x2, y2)\` — Newton's
 * method over the parametric curve, which is what the browser does internally.
 * Returns eased progress 0..1 for linear progress 0..1.
 */
export function cubicBezier(x1, y1, x2, y2) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by
  const sampleX = (t) => ((ax * t + bx) * t + cx) * t
  const slopeX = (t) => (3 * ax * t + 2 * bx) * t + cx
  const sampleY = (t) => ((ay * t + by) * t + cy) * t
  return (x) => {
    if (x <= 0) return 0
    if (x >= 1) return 1
    let t = x
    for (let i = 0; i < 12; i++) {
      const error = sampleX(t) - x
      if (Math.abs(error) < 1e-7) break
      const slope = slopeX(t)
      if (Math.abs(slope) < 1e-7) break
      t -= error / slope
    }
    return sampleY(t)
  }
}

/**
 * The motion easings as CALLABLE functions, for the cases CSS cannot reach: a
 * requestAnimationFrame ramp, a canvas, any value computed over time. Same
 * control points as \`--ds-motion-easing-*\`, generated from the same source.
 *
 *     const t = easing.default(elapsed / duration)
 */
export const easing = {
${entries.join('\n')}
}
`)
  appendFileSync('tokens/dist/index.d.ts', `
/** Build the easing function for a CSS \`cubic-bezier()\`. Progress 0..1 in, eased 0..1 out. */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number): (x: number) => number

/**
 * The motion easings as callable functions, for what CSS cannot reach — a
 * requestAnimationFrame ramp, a canvas, any value computed over time.
 */
export const easing: Record<${Object.keys(easings).map((k) => `'${camel(k)}'`).join(' | ')}, (x: number) => number>
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
  'shadows', 'shadows-dark', 'elevation', 'elevation-dark',
  'focus-rings', 'focus-rings-dark', 'semantic', 'semantic-dark', 'chart', 'motion',
  'border', 'layer',
]
const combined = tokenFiles
  .map(f => readFileSync(`tokens/dist/${f}.css`, 'utf8'))
  .join('\n')
writeFileSync('tokens/dist/index.css', combined)
