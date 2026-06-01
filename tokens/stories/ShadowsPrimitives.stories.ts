import type { Meta, StoryObj } from '@storybook/vue3'
import shadows from '../src/effect/shadows.json'
import EffectCard from './components/EffectCard.vue'

const tokens = Object.entries(shadows.shadow).map(([name, token]) => ({
  name: `shadow-${name}`,
  cssVar: `--ds-shadow-${name}`,
  description: token.value,
}))

const meta: Meta = {
  title: 'Tokens/Effect Styles/Shadows',
  tags: ['autodocs'],
  render: () => ({
    components: { EffectCard },
    setup: () => ({ tokens }),
    template: `
      <div style="padding: 3rem 2rem; display: flex; flex-wrap: wrap; gap: 3rem; align-items: flex-end; background: var(--ds-semantic-bg-secondary, #f9fafb);">
        <EffectCard
          v-for="token in tokens"
          :key="token.name"
          :name="token.name"
          :css-var="token.cssVar"
          :description="token.description"
        />
      </div>
    `,
  }),
}

export default meta
type Story = StoryObj<typeof meta>

export const All: Story = {}
