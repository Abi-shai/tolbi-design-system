import type { Meta, StoryObj } from '@storybook/vue3'
import Logo from './Logo.vue'

const meta: Meta<typeof Logo> = {
  title: 'Components/Logo',
  component: Logo,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Tolbi brand logo — colored horizontal variant. Replace asset URLs with hosted SVG files before production.',
      },
    },
  },
  argTypes: {
    alt: {
      control: 'text',
      description: 'Texte alternatif pour les lecteurs d\'écran.',
      table: {
        category: 'Accessibilité',
        type: { summary: 'string' },
        defaultValue: { summary: "'Tolbi'" },
      },
    },
  },
  args: {
    alt: 'Tolbi',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
