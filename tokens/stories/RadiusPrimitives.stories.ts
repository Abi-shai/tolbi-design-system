import type { Meta, StoryObj } from '@storybook/vue3'
import primitives from '../src/radius/primitives.json'
import RadiusCard from './components/RadiusCard.vue'

const scale = Object.entries(primitives.radius).map(([key, token]) => ({
  label: `radius-${key}`,
  cssVar: `--ds-radius-${key}`,
  rem: token.value,
  px: token.description,
}))

const meta: Meta = {
  title: 'Foundations/Radius/Primitives',
  tags: ['autodocs'],
  render: () => ({
    components: { RadiusCard },
    setup: () => ({ scale }),
    template: `
      <div style="padding: 1.5rem;">
        <RadiusCard
          v-for="step in scale"
          :key="step.label"
          :label="step.label"
          :css-var="step.cssVar"
          :rem="step.rem"
          :px="step.px"
        />
      </div>
    `,
  }),
}

export default meta
type Story = StoryObj<typeof meta>

export const All: Story = {}
