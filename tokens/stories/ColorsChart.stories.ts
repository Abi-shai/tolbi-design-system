import type { Meta, StoryObj } from '@storybook/vue3'
import chart from '../src/color/chart.json'

/**
 * ADR-0016: ordered by a greedy max-min pass on ΔE, so the first N series are
 * always the most distinguishable available. Five is the comfortable ceiling.
 */
const series = Object.entries(chart.chart.categorical).map(([n, t]) => ({
  n,
  cssVar: `--ds-chart-categorical-${n}`,
  hue: t.$value.replace(/[{}]/g, '').replace('color.display.', '').replace('.500', ''),
  note: t.$description,
}))

/** ADR-0096: a magnitude, low to high — one hue family, lightness falling at every step. */
const sequential = Object.entries(chart.chart.sequential).map(([n, t]) => ({
  n, cssVar: `--ds-chart-sequential-${n}`, note: t.$description,
}))

const meta: Meta = {
  title: 'Foundations/Color/Chart series',
  tags: ['autodocs'],
  render: () => ({
    setup: () => ({ series, sequential }),
    template: `
      <div style="padding: 2rem;">
        <p style="margin: 0 0 1.5rem; max-width: 44rem; font: var(--ds-font-body-sm); color: var(--ds-text-subtle);">
          The design system ships chart chrome and no renderer, so the product picks its own series
          colours — this is the set it should pick from. Never <code>brand</code>, which is
          interactive affordance (ADR-0009). <strong>Past five categories, aggregate rather than
          reach further down the ramp.</strong>
        </p>
        <div style="display: flex; gap: 0.25rem; margin-bottom: 2rem; align-items: flex-end;">
          <div v-for="(s, i) in series" :key="s.n"
               :style="{ background: 'var(' + s.cssVar + ')', width: '64px',
                         height: (150 - i * 16) + 'px', borderRadius: 'var(--ds-radius-inner-sm)' }" />
        </div>
        <div v-for="s in series" :key="s.n" style="display: flex; align-items: center; gap: 1rem; padding: 0.4rem 0; border-bottom: 1px solid var(--ds-border-subtlest);">
          <span :style="{ background: 'var(' + s.cssVar + ')', width: '20px', height: '20px', flex: 'none', borderRadius: 'var(--ds-radius-pill)' }" />
          <span style="width: 15rem; flex: none; font-family: monospace; font: var(--ds-font-body-sm); color: var(--ds-text-strong);">{{ s.cssVar }}</span>
          <span style="font: var(--ds-font-body-sm); color: var(--ds-text-subtle);">{{ s.note }}</span>
        </div>
        <h3 style="margin: 3rem 0 0.5rem; font: var(--ds-font-heading-sm); color: var(--ds-text-strong);">Sequential — a magnitude (ADR-0096)</h3>
        <p style="margin: 0 0 1rem; max-width: 44rem; font: var(--ds-font-body-sm); color: var(--ds-text-subtle);">
          One hue family, lightness falling at every step: the reader orders it without the legend, in any of the
          four visions (adjacent ΔE ≥ 20). Not red → green — that kept 18.9 end to end in protan vision. A map or a
          chart interpolates between the stops; <code>chartSequential</code> in <code>./tokens/js</code>.
        </p>
        <div style="display: flex; height: 24px; margin-bottom: 1rem; border-radius: var(--ds-radius-inner-sm); overflow: hidden;">
          <div v-for="s in sequential" :key="s.n" :style="{ background: 'var(' + s.cssVar + ')', flex: 1 }" />
        </div>
        <div v-for="s in sequential" :key="'q' + s.n" style="display: flex; align-items: center; gap: 1rem; padding: 0.4rem 0; border-bottom: 1px solid var(--ds-border-subtlest);">
          <span :style="{ background: 'var(' + s.cssVar + ')', width: '20px', height: '20px', flex: 'none', borderRadius: 'var(--ds-radius-pill)' }" />
          <span style="width: 15rem; flex: none; font-family: monospace; font: var(--ds-font-body-sm); color: var(--ds-text-strong);">{{ s.cssVar }}</span>
          <span style="font: var(--ds-font-body-sm); color: var(--ds-text-subtle);">{{ s.note }}</span>
        </div>
      </div>
    `,
  }),
}
export default meta
type Story = StoryObj<typeof meta>
export const All: Story = {}
