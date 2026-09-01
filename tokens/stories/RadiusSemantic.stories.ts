import type { Meta, StoryObj } from '@storybook/vue3'
import semantic from '../src/radius/semantic.json'
import RadiusCard from './components/RadiusCard.vue'

/** ADR-0013: radius scales with the element, so the roles form a ramp. */
const roles = Object.entries(semantic.radius).map(([key, token]) => ({
  label: `radius-${key}`,
  cssVar: `--ds-radius-${key}`,
  rem: token.value.replace(/[{}]/g, '').replace('radius.', 'radius-'),
  px: token.description,
}))

const meta: Meta = {
  title: 'Foundations/Radius/Roles',
  tags: ['autodocs'],
  render: () => ({
    components: { RadiusCard },
    setup: () => ({ roles }),
    template: `
      <div style="padding: 1.5rem;">
        <RadiusCard v-for="r in roles" :key="r.label"
          :label="r.label" :css-var="r.cssVar" :rem="r.rem" :px="r.px" />
      </div>
    `,
  }),
}
export default meta
type Story = StoryObj<typeof meta>
export const All: Story = {}
