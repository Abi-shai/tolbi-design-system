import type { Meta, StoryObj } from '@storybook/vue3'
import { fn } from '@storybook/test'
import DropdownItem from './DropdownItem.vue'
import DropdownDivider from './DropdownDivider.vue'

const PANEL = `
  padding: var(--ds-spacing-xs);
  background: var(--ds-bg-default);
  border: 1px solid var(--ds-border-subtle);
  border-radius: var(--ds-radius-control);
  box-shadow: var(--ds-elevation-overlay);
  width: 240px;
`

const meta: Meta<typeof DropdownItem> = {
  title: 'Superposition/Dropdown/Item',
  tags: ['wip'],
  component: DropdownItem,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Ligne d\'action d\'un menu `Dropdown`. **Ne s\'utilise jamais seule** — elle attend le panneau ' +
          'du parent pour son fond, son ombre et sa largeur. Pour une ligne de *sélection* ' +
          '(état sélectionné, avatar, puce), voir `DropdownSelectItem`.',
      },
    },
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'Libellé de l\'action.',
      table: { category: 'Contenu', type: { summary: 'string' } },
    },
    icon: {
      control: 'text',
      description: 'Icône de tête, optionnelle.',
      table: { category: 'Contenu', type: { summary: 'IconName' } },
    },
    shortcut: {
      control: 'text',
      description: 'Raccourci clavier affiché à droite, aligné en fin de ligne.',
      table: { category: 'Contenu', type: { summary: 'string' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Désactive la ligne.',
      table: { category: 'État', type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
  },
  args: {
    label: 'Modifier',
    disabled: false,
    onClick: fn(),
  },
  decorators: [() => ({ template: `<div style="${PANEL}"><story /></div>` })],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithIcon: Story = {
  name: 'Avec icône',
  args: { icon: 'square-pen' },
}

export const WithShortcut: Story = {
  name: 'Avec raccourci',
  args: { icon: 'square-pen', shortcut: '⌘E' },
}

export const Disabled: Story = {
  args: { icon: 'trash-2', disabled: true },
}

export const Menu: Story = {
  name: 'Menu complet',
  parameters: {
    docs: {
      description: {
        story: 'Plusieurs lignes séparées par `DropdownDivider` — le contenu type d\'un panneau `Dropdown`.',
      },
    },
  },
  render: () => ({
    components: { DropdownItem, DropdownDivider },
    template: `
      <div>
        <DropdownItem label="Voir le détail" icon="eye" />
        <DropdownItem label="Modifier" icon="square-pen" shortcut="⌘E" />
        <DropdownItem label="Télécharger" icon="download" shortcut="⌘D" />
        <DropdownDivider />
        <DropdownItem label="Supprimer" icon="trash-2" disabled />
      </div>
    `,
  }),
}
