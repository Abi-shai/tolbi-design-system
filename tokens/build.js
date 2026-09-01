import StyleDictionary from 'style-dictionary'
import { readFileSync, writeFileSync, appendFileSync } from 'fs'

const TYPE_ROLE_ROOTS = ['font-size', 'line-height', 'letter-spacing', 'font-weight']
const SEMANTIC_COLOR_ROOTS = ['text', 'bg', 'border']
const isSemanticColor = (token) => SEMANTIC_COLOR_ROOTS.includes(token.path[0])
const isTypeRole = (token) => TYPE_ROLE_ROOTS.includes(token.path[0])

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

  buildTokenFile('tokens/src/motion/primitives.json', 'motion.css'),

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
  'shadows', 'elevation', 'focus-rings', 'blurs', 'semantic', 'motion',
]
const combined = tokenFiles
  .map(f => readFileSync(`tokens/dist/${f}.css`, 'utf8'))
  .join('\n')
writeFileSync('tokens/dist/index.css', combined)
