import type { Meta, StoryObj } from '@storybook/vue3'
import primitives from '../src/color/primitives.json'

/**
 * ADR-0010: a categorical palette bypasses the semantic tier, because there is
 * no role to route through — the only sentence you can write about it is
 * "this one is blue". Four steps, gap-toothed on purpose.
 */
const hues = Object.entries(primitives.color.display).map(([hue, steps]) => ({
  hue,
  steps: Object.entries(steps).map(([n, t]) => ({
    n, value: (t as { value: string }).value, use: (t as { description: string }).description,
    cssVar: `--ds-color-display-${hue}-${n}`,
  })),
}))

const meta: Meta = {
  title: 'Foundations/Color/Display palette',
  tags: ['autodocs'],
  render: () => ({
    setup: () => ({ hues }),
    template: `
      <div style="padding: 2rem;">
        <p style="margin: 0 0 1.5rem; max-width: 44rem; font: var(--ds-font-body-sm); color: var(--ds-text-subtle);">
          Badge's categorical hues. 50 is the ground, 200 the decorative hairline, 500 the dot,
          700 both the label text and the outline border — the outline uses 700 rather than 600
          because in <code>pill-outline</code> the border is the whole visual and must clear 3:1.
        </p>
        <div v-for="h in hues" :key="h.hue" style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.75rem;">
          <span style="width: 7rem; flex: none; font-family: monospace; font: var(--ds-font-body-sm); color: var(--ds-text-strong);">{{ h.hue }}</span>
          <div v-for="s in h.steps" :key="s.n" style="flex: none; text-align: center;">
            <div :style="{ background: 'var(' + s.cssVar + ')', width: '92px', height: '48px',
                           borderRadius: 'var(--ds-radius-inner)', border: '1px solid var(--ds-border-inset)' }" />
            <span style="font-family: monospace; font-size: 0.65rem; color: var(--ds-text-subtlest);">{{ s.n }} · {{ s.value }}</span>
          </div>
        </div>
      </div>
    `,
  }),
}
export default meta
type Story = StoryObj<typeof meta>
export const All: Story = {}
