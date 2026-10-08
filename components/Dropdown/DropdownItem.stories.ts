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
          'Ligne d\'un menu `Dropdown` — une *action*, ou un *choix* dès que `selected` est donné ' +
          '(`menuitemradio`), avec une icône ou un avatar en tête. Le choix courant est marqué comme tout ' +
          'élément courant du catalogue : `bg-selected`, son encre `text-on-brand-subtle`, la graisse ' +
          'forte — pas de coche. **Ne s\'utilise jamais seule** — elle attend le panneau du parent pour ' +
          'son fond, son ombre et sa largeur. Pour l\'option d\'un champ, voir `DropdownSelectItem`.',
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
    meta: {
      control: 'text',
      description: 'Ce que la ligne porte à côté de son nom — une heure, un nombre —, à la place et dans l\'encre d\'un raccourci.',
      table: { category: 'Contenu', type: { summary: 'string' } },
    },
    avatarInitials: {
      control: 'text',
      description: 'Avatar de tête (initiales), à la place de l\'icône — sa présence décide.',
      table: { category: 'Contenu', type: { summary: 'string' } },
    },
    selected: {
      control: 'select',
      options: [undefined, false, true],
      description: 'Absent : une action. Donné : un choix — `true` est le choix courant.',
      table: { category: 'État', type: { summary: 'boolean | undefined' } },
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

/**
 * Des *choix* : `selected` donné sur chaque ligne, `true` sur la courante —
 * marquée par son fond, son encre et la graisse forte, sans coche. Avec
 * l'avatar en tête, comme dans le `WorkspaceSelector`.
 */
export const Choices: Story = {
  name: 'Choix — avec avatar',
  render: () => ({
    components: { DropdownItem },
    template: `
      <div>
        <DropdownItem label="Coopérative de Kaolack" avatar-initials="CK" :selected="true" />
        <DropdownItem label="Coopérative de Nioro" avatar-initials="CN" :selected="false" />
        <DropdownItem label="Guinguinéo — périmètre sud" avatar-initials="GP" :selected="false" />
      </div>
    `,
  }),
}

/** Une heure à la place d'un raccourci — l'historique de Tolbi AI (ADR-0069). */
export const WithMeta: Story = {
  name: 'Avec une méta',
  args: { label: 'Comparer avec la campagne 2024', meta: '18:10', selected: false },
}
