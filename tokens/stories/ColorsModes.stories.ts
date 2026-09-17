import type { Meta, StoryObj } from '@storybook/vue3'
import light from '../src/color/semantic.json'
import dark from '../src/color/semantic.dark.json'

/**
 * The two modes side by side — the shape of the Figma frame this came from
 * (`gray-forest — rampe et rôles`), but generated from the token sources rather
 * than transcribed, so it cannot drift from what ships.
 *
 * The dark column renders inside a real `[data-theme="dark"]` subtree. That is
 * the whole mechanism: an attribute, and the cascade does the rest.
 */
type Token = { $value: string; $description?: string }
type Group = Record<string, Token>

/** `{color.brand.600}` → `var(--ds-color-brand-600)`, including inside color-mix(). */
const toCss = (value: string) =>
  value.replace(/\{([^}]+)\}/g, (_, ref: string) => `var(--ds-${ref.split('.').join('-')})`)

/** The readable half of the value: the primitive it routes to. */
const toRef = (value: string) =>
  value.startsWith('color-mix')
    ? value.replace(/\{color\.([^}]+)\}/g, (_, r: string) => r).replace('in srgb, ', '')
    : value.replace(/[{}]/g, '').replace(/^color\./, '')

function rows(group: 'text' | 'bg' | 'border') {
  const l = light[group] as Group
  const d = dark[group] as Group
  return Object.keys(l).map((name) => ({
    name: `--ds-${group}-${name}`,
    lightCss: toCss(l[name].$value),
    lightRef: toRef(l[name].$value),
    darkCss: toCss(d[name].$value),
    darkRef: toRef(d[name].$value),
    moved: toRef(l[name].$value) !== toRef(d[name].$value),
    why: d[name].$description ?? '',
  }))
}

const MONO = 'font-family: var(--ds-typography-font-family-mono); font-size: 0.7rem;'
const CELL = 'padding: 0.5rem 0.75rem; vertical-align: middle; border-bottom: 1px solid var(--ds-border-subtle);'
const SWATCH = 'width: 1.75rem; height: 1.75rem; border-radius: var(--ds-radius-inner-sm); border: 1px solid var(--ds-border-inset); flex: none;'
const TH = 'padding: 0.5rem 0.75rem 0.75rem; text-align: left; font-family: var(--ds-typography-font-family-poppins); font-size: 0.7rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ds-text-subtle);'

function makeStory(group: 'text' | 'bg' | 'border'): StoryObj<typeof meta> {
  return {
    render: () => ({
      setup: () => ({ rows: rows(group) }),
      template: `
        <div style="padding: 1.5rem; overflow-x: auto; background: var(--ds-bg-default);">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 2px solid var(--ds-border-subtle);">
                <th style="${TH}">Token</th>
                <th style="${TH}" colspan="2">Light</th>
                <th style="${TH}" colspan="2">Dark</th>
                <th style="${TH}">Why the dark value is that one</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in rows" :key="row.name">
                <td style="${CELL} ${MONO} color: var(--ds-text-strong); white-space: nowrap;">{{ row.name }}</td>

                <td style="${CELL}">
                  <div :style="{ background: row.lightCss }" style="${SWATCH}" />
                </td>
                <td style="${CELL} ${MONO} color: var(--ds-text-subtle); white-space: nowrap;">{{ row.lightRef }}</td>

                <td style="${CELL}" data-theme="dark">
                  <div :style="{ background: row.darkCss }" style="${SWATCH}" />
                </td>
                <td
                  style="${CELL} ${MONO} white-space: nowrap;"
                  :style="{ color: row.moved ? 'var(--ds-text-brand)' : 'var(--ds-text-subtlest)' }"
                >{{ row.darkRef }}</td>

                <td style="${CELL} font-family: var(--ds-typography-font-family-poppins); font-size: 0.75rem; color: var(--ds-text-subtle); min-width: 22rem;">{{ row.why }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      `,
    }),
  }
}

const meta: Meta = {
  title: 'Foundations/Color/Modes',
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Text:       Story = makeStory('text')
export const Background: Story = makeStory('bg')
export const Border:     Story = makeStory('border')
