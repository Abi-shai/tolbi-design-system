import type { Meta, StoryObj } from '@storybook/vue3'
import { fn } from '@storybook/test'
import DropdownSelectItem from './DropdownSelectItem.vue'

const PANEL = `
  padding: var(--ds-spacing-xs);
  background: var(--ds-bg-default);
  border: 1px solid var(--ds-border-subtle);
  border-radius: var(--ds-radius-control);
  box-shadow: var(--ds-elevation-overlay);
  width: 280px;
`

const AVATAR = 'https://i.pravatar.cc/80?img=12'

const meta: Meta<typeof DropdownSelectItem> = {
  title: 'Saisie/InputDropdown/SelectItem',
  tags: ['wip'],
  component: DropdownSelectItem,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Ligne de *sélection* d\'un `InputDropdown` — porte un état sélectionné et un texte d\'appui. ' +
          '**Ne s\'utilise jamais seule.** Pour une ligne d\'*action* dans un menu, voir `DropdownItem`.',
      },
    },
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'Libellé principal.',
      table: { category: 'Contenu', type: { summary: 'string' } },
    },
    supportingText: {
      control: 'text',
      description: 'Texte d\'appui affiché à la suite du libellé.',
      table: { category: 'Contenu', type: { summary: 'string' } },
    },
    type: {
      control: 'inline-radio',
      options: ['default', 'icon', 'avatar', 'dot'],
      description: 'Élément de tête de la ligne.',
      table: {
        category: 'Apparence',
        type: { summary: "'default' | 'icon' | 'avatar' | 'dot'" },
        defaultValue: { summary: "'default'" },
      },
    },
    icon: {
      control: 'text',
      description: 'Icône de tête. Requis quand `type` vaut `icon`.',
      table: { category: 'Apparence', type: { summary: 'IconName' } },
    },
    avatarSrc: {
      control: 'text',
      description: 'Source de l\'avatar. Requis quand `type` vaut `avatar`.',
      table: { category: 'Apparence', type: { summary: 'string' } },
    },
    dotColor: {
      control: 'text',
      description: 'Couleur de la puce. Requis quand `type` vaut `dot` — passer un token sémantique.',
      table: { category: 'Apparence', type: { summary: 'string' } },
    },
    selected: {
      control: 'boolean',
      description: 'Marque la ligne comme sélectionnée et affiche la coche.',
      table: { category: 'État', type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Désactive la ligne.',
      table: { category: 'État', type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
  },
  args: {
    label: 'Phoenix Baker',
    supportingText: '@phoenix',
    type: 'default',
    selected: false,
    disabled: false,
    onClick: fn(),
  },
  decorators: [() => ({ template: `<div style="${PANEL}"><story /></div>` })],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Selected: Story = {
  name: 'Sélectionnée',
  args: { selected: true },
}

export const Disabled: Story = {
  args: { disabled: true },
}

export const WithIcon: Story = {
  name: 'Type — icône',
  args: { type: 'icon', icon: 'user' },
}

export const WithAvatar: Story = {
  name: 'Type — avatar',
  args: { type: 'avatar', avatarSrc: AVATAR, avatarAlt: 'Phoenix Baker' },
}

export const WithDot: Story = {
  name: 'Type — puce',
  args: { type: 'dot', dotColor: 'var(--ds-text-success)' },
}

export const AllTypes: Story = {
  name: 'Tous les types',
  render: () => ({
    components: { DropdownSelectItem },
    setup: () => ({ AVATAR }),
    template: `
      <div>
        <DropdownSelectItem label="Défaut" supportingText="@default" />
        <DropdownSelectItem label="Icône" supportingText="@icon" type="icon" icon="user" />
        <DropdownSelectItem label="Avatar" supportingText="@avatar" type="avatar" :avatar-src="AVATAR" avatar-alt="Avatar" selected />
        <DropdownSelectItem label="En ligne" supportingText="@dot" type="dot" dot-color="var(--ds-text-success)" />
        <DropdownSelectItem label="Désactivée" supportingText="@disabled" disabled />
      </div>
    `,
  }),
}
