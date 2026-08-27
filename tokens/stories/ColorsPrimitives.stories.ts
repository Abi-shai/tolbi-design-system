import type { Meta, StoryObj } from '@storybook/vue3'
import colors from '../src/color/primitives.json'
import ColorSwatchGroup from './components/ColorSwatchGroup.vue'

type ColorGroup = Record<string, { value: string; description?: string }>

const groups = Object.entries(colors.color).map(([name, group]) => ({
  name,
  swatches: Object.entries(group as ColorGroup).map(([shade, token]) => ({
    shade,
    value: token.value,
    cssVar: `--ds-color-${name}-${shade}`,
    description: token.description,
  })),
}))

const meta: Meta = {
  title: 'Foundations/Color/Primitives',
  tags: ['autodocs'],
  render: () => ({
    components: { ColorSwatchGroup },
    setup: () => ({ groups }),
    template: `
      <div style="padding: 1.5rem; display: flex; flex-direction: column; gap: 3rem;">
        <ColorSwatchGroup
          v-for="group in groups"
          :key="group.name"
          :name="group.name"
          :swatches="group.swatches"
        />
      </div>
    `,
  }),
}

export default meta
type Story = StoryObj<typeof meta>

export const All: Story = {}
