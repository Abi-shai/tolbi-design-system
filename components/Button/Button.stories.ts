import type { Meta, StoryObj } from '@storybook/vue3'
import { fn, userEvent, within, expect } from '@storybook/test'
import Button from './Button.vue'
import StoryGrid from '../../stories/StoryGrid.vue'

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: [],
  parameters: {
    layout: 'centered',
    docs: {},
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['primary', 'secondary-gray', 'secondary-color', 'tertiary', 'link', 'danger', 'danger-secondary'],
      description: 'Hiérarchie visuelle du bouton.',
      table: {
        category: 'Apparence',
        type: { summary: "'primary' | 'secondary-gray' | 'secondary-color' | 'tertiary' | 'link' | 'danger' | 'danger-secondary'" },
        defaultValue: { summary: "'primary'" },
      },
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg', 'xl', '2xl'],
      description: 'Taille du bouton.',
      table: {
        category: 'Apparence',
        type: { summary: "'sm' | 'md' | 'lg' | 'xl' | '2xl'" },
        defaultValue: { summary: "'md'" },
      },
    },
    label: {
      control: 'text',
      description: 'Verbe d\'action court. Maximum ~3 mots.',
      table: {
        category: 'Contenu',
        type: { summary: 'string' },
      },
    },
    iconLeading: {
      control: 'text',
      description: 'Nom d\'icône affiché avant le label.',
      table: {
        category: 'Contenu',
        type: { summary: 'IconName' },
      },
    },
    iconTrailing: {
      control: 'text',
      description: 'Nom d\'icône affiché après le label.',
      table: {
        category: 'Contenu',
        type: { summary: 'IconName' },
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
    loading: {
      control: 'boolean',
      description: 'Affiche un spinner et bloque le clic. Expose `aria-busy="true"`.',
      table: {
        category: 'État',
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    type: {
      control: 'inline-radio',
      options: ['button', 'submit', 'reset'],
      description: 'Attribut HTML `type` natif.',
      table: {
        category: 'HTML',
        type: { summary: "'button' | 'submit' | 'reset'" },
        defaultValue: { summary: "'button'" },
      },
    },
  },
  args: {
    label: 'Button',
    variant: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
    type: 'button',
    onClick: fn(),
  },
}

export default meta
type Story = StoryObj<typeof meta>

// ── Variants ────────────────────────────────────────────────────────

export const Primary: Story = {
  args: { label: 'Enregistrer', variant: 'primary' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button')
    await userEvent.click(button)
    await expect(button).not.toBeDisabled()
  },
}

export const SecondaryGray: Story = {
  name: 'Secondary gray',
  args: { label: 'Annuler', variant: 'secondary-gray' },
}

export const SecondaryColor: Story = {
  name: 'Secondary color',
  args: { label: 'Annuler', variant: 'secondary-color' },
}

export const Tertiary: Story = {
  args: { label: 'En savoir plus', variant: 'tertiary' },
}

export const Link: Story = {
  args: { label: 'Voir tout', variant: 'link' },
}

export const Danger: Story = {
  args: { label: 'Supprimer', variant: 'danger' },
}

export const DangerSecondary: Story = {
  name: 'Danger secondary',
  args: { label: 'Supprimer', variant: 'danger-secondary' },
}

// ── Sizes ────────────────────────────────────────────────────────────

export const Small: Story = {
  args: { label: 'Filtrer', size: 'sm' },
}

export const Large: Story = {
  args: { label: 'Commencer', size: 'lg' },
}

export const ExtraLarge: Story = {
  name: 'Extra large',
  args: { label: 'Commencer', size: 'xl' },
}

export const DoubleExtraLarge: Story = {
  name: '2XL',
  args: { label: 'Commencer', size: '2xl' },
}

// ── États ────────────────────────────────────────────────────────────

export const Loading: Story = {
  args: { label: 'Enregistrement…', loading: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button')
    await expect(button).toBeDisabled()
    await expect(button).toHaveAttribute('aria-busy', 'true')
  },
}

export const Disabled: Story = {
  args: { label: 'Non disponible', disabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button')
    await expect(button).toBeDisabled()
  },
}

// ── Grilles récapitulatives ──────────────────────────────────────────

export const AllVariants: Story = {
  name: 'All variants',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { StoryGrid },
    setup: () => ({
      items: [
        { component: Button, props: { label: 'Primary',          variant: 'primary'          } },
        { component: Button, props: { label: 'Secondary gray',   variant: 'secondary-gray'   } },
        { component: Button, props: { label: 'Secondary color',  variant: 'secondary-color'  } },
        { component: Button, props: { label: 'Tertiary',         variant: 'tertiary'         } },
        { component: Button, props: { label: 'Link',             variant: 'link'             } },
        { component: Button, props: { label: 'Danger',           variant: 'danger'           } },
        { component: Button, props: { label: 'Danger secondary', variant: 'danger-secondary' } },
      ],
    }),
    template: `<StoryGrid :items="items" />`,
  }),
}

export const AllSizes: Story = {
  name: 'All sizes',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { StoryGrid },
    setup: () => ({
      items: [
        { component: Button, props: { label: 'sm',  size: 'sm'  } },
        { component: Button, props: { label: 'md',  size: 'md'  } },
        { component: Button, props: { label: 'lg',  size: 'lg'  } },
        { component: Button, props: { label: 'xl',  size: 'xl'  } },
        { component: Button, props: { label: '2xl', size: '2xl' } },
      ],
    }),
    template: `<StoryGrid :items="items" />`,
  }),
}
