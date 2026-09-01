import type { Meta, StoryObj } from '@storybook/vue3'
import control from '../src/spacing/control.json'

/**
 * ADR-0013: control padding is a scale of its own. The spacing ramp contains no
 * 10, 14, 18 or 22px because those are not layout rhythm — they are a control's
 * height minus its line box.
 */
const steps = Object.entries(control['control-padding']).map(([key, token]) => ({
  name: key,
  cssVar: `--ds-control-padding-${key}`,
  use: token.$description,
}))

const meta: Meta = {
  title: 'Foundations/Spacing/Control padding',
  tags: ['autodocs'],
  render: () => ({
    setup: () => ({ steps }),
    template: `
      <div style="padding: 2rem; display: flex; flex-direction: column; gap: 1.25rem;">
        <div v-for="s in steps" :key="s.name" style="display: flex; align-items: center; gap: 1.5rem;">
          <span :style="{ padding: 'var(' + s.cssVar + ')', background: 'var(--ds-bg-brand-solid)',
                          color: 'var(--ds-text-on-brand-solid)', borderRadius: 'var(--ds-radius-control)',
                          font: 'var(--ds-font-label-lg-strong)', flex: 'none' }">Bouton</span>
          <div>
            <p style="margin: 0 0 0.2rem; font-family: monospace; font: var(--ds-font-body-sm); color: var(--ds-text-strong);">{{ s.cssVar }}</p>
            <p style="margin: 0; font: var(--ds-font-body-sm); color: var(--ds-text-subtle);">{{ s.use }}</p>
          </div>
        </div>
      </div>
    `,
  }),
}
export default meta
type Story = StoryObj<typeof meta>
export const All: Story = {}
