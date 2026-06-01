import StyleDictionary from 'style-dictionary'
import { readFileSync, writeFileSync } from 'fs'

const [
  sdColors, sdTypography,
  sdShadows, sdFocusRings, sdBlurs,
  sdSpacePrimitives, sdSpaceSemantic,
  sdLight, sdDark,
  sdRadius,
] = await Promise.all([
  new StyleDictionary({
    source: ['tokens/src/color/primitives.json'],
    platforms: { css: { transformGroup: 'css', prefix: 'ds', buildPath: 'tokens/dist/', files: [{ destination: 'colors.css', format: 'css/variables', options: { selector: ':root', outputReferences: false } }] } },
  }),

  new StyleDictionary({
    source: ['tokens/src/typography/primitives.json'],
    platforms: { css: { transformGroup: 'css', prefix: 'ds', buildPath: 'tokens/dist/', files: [{ destination: 'typography.css', format: 'css/variables', options: { selector: ':root', outputReferences: false } }] } },
  }),

  new StyleDictionary({
    source: ['tokens/src/effect/shadows.json'],
    platforms: { css: { transformGroup: 'css', prefix: 'ds', buildPath: 'tokens/dist/', files: [{ destination: 'shadows.css', format: 'css/variables', options: { selector: ':root', outputReferences: false } }] } },
  }),

  new StyleDictionary({
    source: ['tokens/src/effect/focus-rings.json'],
    platforms: { css: { transformGroup: 'css', prefix: 'ds', buildPath: 'tokens/dist/', files: [{ destination: 'focus-rings.css', format: 'css/variables', options: { selector: ':root', outputReferences: false } }] } },
  }),

  new StyleDictionary({
    source: ['tokens/src/effect/blurs.json'],
    platforms: { css: { transformGroup: 'css', prefix: 'ds', buildPath: 'tokens/dist/', files: [{ destination: 'blurs.css', format: 'css/variables', options: { selector: ':root', outputReferences: false } }] } },
  }),

  new StyleDictionary({
    source: ['tokens/src/spacing/primitives.json'],
    platforms: { css: { transformGroup: 'css', prefix: 'ds', buildPath: 'tokens/dist/', files: [{ destination: 'space.css', format: 'css/variables', options: { selector: ':root', outputReferences: false } }] } },
  }),

  new StyleDictionary({
    source: ['tokens/src/spacing/primitives.json', 'tokens/src/spacing/semantic.json'],
    platforms: {
      css: {
        transformGroup: 'css',
        prefix: 'ds',
        buildPath: 'tokens/dist/',
        files: [{
          destination: 'spacing.css',
          format: 'css/variables',
          filter: (token) => token.path[0] === 'spacing',
          options: { selector: ':root', outputReferences: true },
        }],
      },
    },
  }),

  new StyleDictionary({
    source: ['tokens/src/color/primitives.json', 'tokens/src/color/semantic.light.json'],
    platforms: {
      css: {
        transformGroup: 'css', prefix: 'ds', buildPath: 'tokens/dist/',
        files: [{ destination: 'semantic.css', format: 'css/variables', filter: (token) => token.path[0] === 'semantic', options: { selector: ':root', outputReferences: true } }],
      },
    },
  }),

  new StyleDictionary({
    source: ['tokens/src/color/primitives.json', 'tokens/src/color/semantic.dark.json'],
    platforms: {
      css: {
        transformGroup: 'css', prefix: 'ds', buildPath: 'tokens/dist/',
        files: [{ destination: 'semantic-dark.css', format: 'css/variables', filter: (token) => token.path[0] === 'semantic', options: { selector: '[data-theme="dark"]', outputReferences: true } }],
      },
    },
  }),

  new StyleDictionary({
    source: ['tokens/src/radius/primitives.json'],
    platforms: { css: { transformGroup: 'css', prefix: 'ds', buildPath: 'tokens/dist/', files: [{ destination: 'radius.css', format: 'css/variables', options: { selector: ':root', outputReferences: false } }] } },
  }),
])

await Promise.all([
  sdColors.buildAllPlatforms(),
  sdTypography.buildAllPlatforms(),
  sdShadows.buildAllPlatforms(),
  sdFocusRings.buildAllPlatforms(),
  sdBlurs.buildAllPlatforms(),
  sdSpacePrimitives.buildAllPlatforms(),
  sdSpaceSemantic.buildAllPlatforms(),
  sdLight.buildAllPlatforms(),
  sdDark.buildAllPlatforms(),
  sdRadius.buildAllPlatforms(),
])

const tokenFiles = [
  'colors', 'typography', 'radius', 'space', 'spacing',
  'shadows', 'focus-rings', 'blurs', 'semantic', 'semantic-dark',
]
const combined = tokenFiles
  .map(f => readFileSync(`tokens/dist/${f}.css`, 'utf8'))
  .join('\n')
writeFileSync('tokens/dist/index.css', combined)
