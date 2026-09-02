import type { Meta, StoryObj } from '@storybook/vue3'
import { fn, userEvent, within, expect } from '@storybook/test'
import CloseButton from './CloseButton.vue'
import StoryGrid from '../../stories/StoryGrid.vue'

const meta: Meta<typeof CloseButton> = {
  title: 'Actions/CloseButton',
  component: CloseButton,
  tags: ['wip'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Bouton de fermeture iconique. Utilisé pour fermer des modales, toasts, alertes ou panels.',
      },
    },
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      description: 'Taille du bouton.',
      table: {
        category: 'Apparence',
        type: { summary: "'sm' | 'md' | 'lg'" },
        defaultValue: { summary: "'sm'" },
      },
    },
    darkBackground: {
      control: 'boolean',
      description: 'À activer sur fond sombre. Passe l\'icône en blanc.',
      table: {
        category: 'Apparence',
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    ariaLabel: {
      control: 'text',
      description: 'Label accessible du bouton (obligatoire, pas de texte visible).',
      table: {
        category: 'Accessibilité',
        type: { summary: 'string' },
        defaultValue: { summary: "'Fermer'" },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Désactive le bouton.',
      table: {
        category: 'État',
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
  },
  args: {
    size: 'sm',
    darkBackground: false,
    ariaLabel: 'Fermer',
    disabled: false,
    onClick: fn(),
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: 'Fermer' })
    await userEvent.click(button)
    await expect(button).not.toBeDisabled()
  },
}

export const Small: Story = {
  args: { size: 'sm' },
}

export const Medium: Story = {
  args: { size: 'md' },
}

export const Large: Story = {
  args: { size: 'lg' },
}

export const DarkBackground: Story = {
  name: 'Dark background',
  args: { darkBackground: true },
  parameters: {
    backgrounds: { default: 'Dark' },
  },
}

export const Disabled: Story = {
  args: { disabled: true },
}

export const AllSizes: Story = {
  name: 'All sizes',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { StoryGrid },
    setup: () => ({
      items: ['sm', 'md', 'lg'].map(size => ({ component: CloseButton, props: { size, ariaLabel: 'Fermer' } })),
    }),
    template: `<StoryGrid :items="items" wrap="nowrap" />`,
  }),
}

export const AllSizesDark: Story = {
  name: 'All sizes — dark',
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'Dark' },
  },
  render: () => ({
    components: { StoryGrid },
    setup: () => ({
      items: ['sm', 'md', 'lg'].map(size => ({ component: CloseButton, props: { size, ariaLabel: 'Fermer', darkBackground: true } })),
    }),
    template: `<StoryGrid :items="items" wrap="nowrap" />`,
  }),
}
