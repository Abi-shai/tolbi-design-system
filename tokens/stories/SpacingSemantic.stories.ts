import type { Meta, StoryObj } from '@storybook/vue3'
import semantic from '../src/spacing/semantic.json'
import SpacingRow from './components/SpacingRow.vue'

const named = Object.entries(semantic.spacing).map(([name, token]) => ({
  label: name,
  cssVar: `--ds-spacing-${name}`,
  px: token.description,
}))

const meta: Meta = {
  title: 'Foundations/Spacing/Semantic',
  tags: ['autodocs'],
  render: () => ({
    components: { SpacingRow },
    setup: () => ({ named }),
    template: `
      <div style="padding: 1.5rem;">
        <SpacingRow
          v-for="step in named"
          :key="step.label"
          :label="step.label"
          :css-var="step.cssVar"
          :px="step.px"
          accent="semantic"
        />
      </div>
    `,
  }),
}

export default meta
type Story = StoryObj<typeof meta>

export const All: Story = {}
