import type { Meta, StoryObj } from '@storybook/vue3'
import primitives from '../src/spacing/primitives.json'
import SpacingRow from './components/SpacingRow.vue'

const scale = Object.entries(primitives.space).map(([key, token]) => ({
  label: key,
  cssVar: `--ds-space-${key}`,
  px: token.$description,
}))

const meta: Meta = {
  title: 'Foundations/Spacing/Primitives',
  tags: ['autodocs'],
  render: () => ({
    components: { SpacingRow },
    setup: () => ({ scale }),
    template: `
      <div style="padding: 1.5rem;">
        <SpacingRow
          v-for="step in scale"
          :key="step.label"
          :label="step.label"
          :css-var="step.cssVar"
          :px="step.px"
          accent="primitive"
        />
      </div>
    `,
  }),
}

export default meta
type Story = StoryObj<typeof meta>

export const All: Story = {}
