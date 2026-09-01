import type { Meta, StoryObj } from '@storybook/vue3'
import elevation from '../src/effect/elevation.json'

/** ADR-0009 named a rule that already had 100% adherence across the catalogue. */
const roles = Object.entries(elevation.elevation).map(([key, token]) => ({
  name: key,
  cssVar: `--ds-elevation-${key}`,
  ref: token.value.replace(/[{}]/g, ''),
  use: token.description,
}))

const meta: Meta = {
  title: 'Foundations/Effects/Elevation',
  tags: ['autodocs'],
  render: () => ({
    setup: () => ({ roles }),
    template: `
      <div style="padding: 2.5rem; display: flex; flex-direction: column; gap: 2rem; background: var(--ds-bg-neutral-subtle);">
        <div v-for="r in roles" :key="r.name" style="display: flex; align-items: center; gap: 2rem;">
          <div :style="{ boxShadow: 'var(' + r.cssVar + ')', background: 'var(--ds-bg-default)',
                         borderRadius: 'var(--ds-radius-surface)', width: '140px', height: '84px', flex: 'none' }" />
          <div>
            <p style="margin: 0 0 0.25rem; font: var(--ds-font-label-lg); color: var(--ds-text-strong);">{{ r.cssVar }}</p>
            <p style="margin: 0 0 0.25rem; font: var(--ds-font-body-sm); font-family: monospace; color: var(--ds-text-subtlest);">{{ r.ref }}</p>
            <p style="margin: 0; font: var(--ds-font-body-sm); color: var(--ds-text-subtle); max-width: 34rem;">{{ r.use }}</p>
          </div>
        </div>
      </div>
    `,
  }),
}
export default meta
type Story = StoryObj<typeof meta>
export const All: Story = {}
