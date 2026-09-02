import type { Meta, StoryObj } from '@storybook/vue3'
import focusRings from '../src/effect/focus-rings.json'
import EffectCard from './components/EffectCard.vue'

const simple = Object.entries(focusRings['focus-ring'])
  .filter(([k]) => !k.includes('shadow'))
  .map(([name, token]) => ({ name: `focus-ring-${name}`, cssVar: `--ds-focus-ring-${name}`, description: token.$description }))

const withShadow = Object.entries(focusRings['focus-ring'])
  .filter(([k]) => k.includes('shadow'))
  .map(([name, token]) => ({ name: `focus-ring-${name}`, cssVar: `--ds-focus-ring-${name}`, description: token.$description }))

const SECTION_LABEL = 'font-family: var(--ds-typography-font-family-poppins); font-weight: 600; font-size: 0.875rem; color: var(--ds-text-subtle, #475467); text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 1.25rem;'

const meta: Meta = {
  title: 'Foundations/Effects/Focus Rings',
  tags: ['autodocs'],
  render: () => ({
    components: { EffectCard },
    setup: () => ({ simple, withShadow }),
    template: `
      <div style="padding: 2.5rem; background: var(--ds-bg-neutral-subtle, #f9fafb); display: flex; flex-direction: column; gap: 3rem;">
        <div>
          <p style="${SECTION_LABEL}">Focus rings</p>
          <div style="display: flex; flex-wrap: wrap; gap: 2rem;">
            <EffectCard v-for="t in simple" :key="t.name" :name="t.name" :css-var="t.cssVar" :description="t.$description" />
          </div>
        </div>
        <div>
          <p style="${SECTION_LABEL}">Focus rings + shadow</p>
          <div style="display: flex; flex-wrap: wrap; gap: 2rem;">
            <EffectCard v-for="t in withShadow" :key="t.name" :name="t.name" :css-var="t.cssVar" :description="t.$description" />
          </div>
        </div>
      </div>
    `,
  }),
}

export default meta
type Story = StoryObj<typeof meta>

export const All: Story = {}
