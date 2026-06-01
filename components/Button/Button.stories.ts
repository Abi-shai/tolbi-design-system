import type { Meta, StoryObj } from '@storybook/vue3'
import { fn, userEvent, within, expect } from '@storybook/test'
import Button from './Button.vue'

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: [],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Composant d\'action principal. Déclenche une action immédiate — **ne sert pas à naviguer** (utiliser `<a>` ou le composant `Link`).',
      },
    },
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
    components: { Button },
    template: `
      <div style="display:flex; gap:12px; flex-wrap:wrap; align-items:center;">
        <Button label="Primary"          variant="primary"          />
        <Button label="Secondary gray"   variant="secondary-gray"   />
        <Button label="Secondary color"  variant="secondary-color"  />
        <Button label="Tertiary"         variant="tertiary"         />
        <Button label="Link"             variant="link"             />
        <Button label="Danger"           variant="danger"           />
        <Button label="Danger secondary" variant="danger-secondary" />
      </div>
    `,
  }),
}

export const AllSizes: Story = {
  name: 'All sizes',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { Button },
    template: `
      <div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap;">
        <Button label="sm"  size="sm"  />
        <Button label="md"  size="md"  />
        <Button label="lg"  size="lg"  />
        <Button label="xl"  size="xl"  />
        <Button label="2xl" size="2xl" />
      </div>
    `,
  }),
}
