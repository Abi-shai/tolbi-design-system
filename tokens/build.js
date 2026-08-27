import StyleDictionary from 'style-dictionary'
import { readFileSync, writeFileSync, appendFileSync } from 'fs'

const TYPE_ROLE_ROOTS = ['font-size', 'line-height', 'letter-spacing', 'font-weight']
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

  buildTokenFile(
    ['tokens/src/color/primitives.json', 'tokens/src/color/semantic.light.json'],
    'semantic.css',
    { filter: (token) => token.path[0] === 'semantic', outputReferences: true },
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

  buildTokenFile('tokens/src/radius/primitives.json', 'radius.css'),
  buildTokenFile('tokens/src/motion/primitives.json', 'motion.css'),
])

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
  'shadows', 'focus-rings', 'blurs', 'semantic', 'motion',
]
const combined = tokenFiles
  .map(f => readFileSync(`tokens/dist/${f}.css`, 'utf8'))
  .join('\n')
writeFileSync('tokens/dist/index.css', combined)
