import type { Meta, StoryObj } from '@storybook/vue3'
import { fn, userEvent, within, expect } from '@storybook/test'
import Icon from './Icon.vue'
import { icons, type IconName } from './registry'

const allNames = Object.keys(icons) as IconName[]

const meta: Meta<typeof Icon> = {
  title: 'Components/Icon',
  component: Icon,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Composant d\'icône SVG inline. Utilise `currentColor` — la couleur se contrôle via CSS `color`. Taille configurable via `size`.',
      },
    },
  },
  argTypes: {
    name: {
      control: 'select',
      options: allNames,
      description: 'Nom de l\'icône (kebab-case, convention Untitled UI).',
      table: {
        category: 'Contenu',
        type: { summary: 'IconName' },
      },
    },
    size: {
      control: { type: 'range', min: 12, max: 64, step: 4 },
      description: 'Largeur et hauteur en px.',
      table: {
        category: 'Apparence',
        type: { summary: 'number | string' },
        defaultValue: { summary: '24' },
      },
    },
    ariaLabel: {
      control: 'text',
      description: 'Label accessible. Si omis, l\'icône est masquée aux lecteurs d\'écran (`aria-hidden`).',
      table: {
        category: 'Accessibilité',
        type: { summary: 'string' },
      },
    },
  },
  args: {
    name: 'check',
    size: 24,
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { name: 'check' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const svg = canvasElement.querySelector('svg')
    await expect(svg).toBeTruthy()
    await expect(svg).toHaveAttribute('aria-hidden')
  },
}

export const Sizes: Story = {
  parameters: { layout: 'padded' },
  render: () => ({
    components: { Icon },
    template: `
      <div style="display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap; padding: 1rem;">
        <div v-for="size in [12, 16, 20, 24, 32, 40, 48]" :key="size" style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
          <Icon name="home-01" :size="size" style="color: var(--ds-color-brand-500, #066938);" />
          <span style="font-family: var(--ds-typography-font-family-poppins); font-size: 0.65rem; color: var(--ds-semantic-text-tertiary, #475467);">{{ size }}px</span>
        </div>
      </div>
    `,
  }),
}

export const Colors: Story = {
  parameters: { layout: 'padded' },
  render: () => ({
    components: { Icon },
    template: `
      <div style="display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap; padding: 1rem;">
        <Icon name="heart" :size="32" style="color: var(--ds-color-brand-500);" />
        <Icon name="heart" :size="32" style="color: var(--ds-color-error-500);" />
        <Icon name="heart" :size="32" style="color: var(--ds-color-warning-500);" />
        <Icon name="heart" :size="32" style="color: var(--ds-color-gray-light-400);" />
        <Icon name="heart" :size="32" style="color: var(--ds-semantic-text-primary);" />
      </div>
    `,
  }),
}

export const Gallery: Story = {
  parameters: { layout: 'padded' },
  render: () => ({
    components: { Icon },
    setup: () => ({ allNames }),
    template: `
      <div style="padding: 1.5rem;">
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 1rem;">
          <div
            v-for="name in allNames"
            :key="name"
            style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 0.75rem; border-radius: 8px; border: 1px solid var(--ds-semantic-border-secondary, #eaecf0);"
          >
            <Icon :name="name" :size="24" style="color: var(--ds-semantic-text-primary, #101828);" />
            <span style="font-family: var(--ds-typography-font-family-poppins); font-size: 0.6rem; color: var(--ds-semantic-text-tertiary, #475467); text-align: center; word-break: break-all;">{{ name }}</span>
          </div>
        </div>
      </div>
    `,
  }),
}
