import type { Meta, StoryObj } from '@storybook/vue3'
import blurs from '../src/effect/blurs.json'
import BlurCard from './components/BlurCard.vue'

const steps = Object.entries(blurs.blur).map(([name, token]) => ({
  name: `backdrop-blur-${name}`,
  cssVar: `--ds-blur-${name}`,
  value: token.value,
}))

const meta: Meta = {
  title: 'Tokens/Effect Styles/Backdrop Blurs',
  tags: ['autodocs'],
  render: () => ({
    components: { BlurCard },
    setup: () => ({ steps }),
    template: `
      <div style="padding: 2rem;">
        <div style="
          border-radius: 16px; overflow: hidden; padding: 2rem;
          display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;
          background:
            radial-gradient(circle at 20% 30%, var(--ds-color-brand-200, #8CBAA3) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, var(--ds-color-brand-400, #388760) 0%, transparent 45%),
            var(--ds-color-brand-100, #B2D1C1);
        ">
          <template v-for="step in steps" :key="step.name">
            <BlurCard :name="step.name" :css-var="step.cssVar" :value="step.value" mode="light" />
            <BlurCard :name="step.name" :css-var="step.cssVar" :value="step.value" mode="dark" />
          </template>
        </div>
      </div>
    `,
  }),
}

export default meta
type Story = StoryObj<typeof meta>

export const All: Story = {}
