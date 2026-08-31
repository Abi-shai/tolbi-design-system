import type { Meta, StoryObj } from '@storybook/vue3'
import DropdownDivider from './DropdownDivider.vue'
import DropdownItem from './DropdownItem.vue'

const PANEL = `
  padding: var(--ds-spacing-xs);
  background: var(--ds-bg-default);
  border: 1px solid var(--ds-border-subtle);
  border-radius: var(--ds-radius-md);
  box-shadow: var(--ds-elevation-overlay);
  width: 240px;
`

const meta: Meta<typeof DropdownDivider> = {
  title: 'Superposition/Dropdown/Divider',
  tags: ['wip'],
  component: DropdownDivider,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Séparateur de groupes dans un panneau `Dropdown`. Aucune prop — 1px de ' +
          '`--ds-border-subtle` et 4px de marge verticale. Porte `role="separator"`, ' +
          'donc les lecteurs d\'écran annoncent la coupure de groupe.',
      },
    },
  },
  decorators: [() => ({ template: `<div style="${PANEL}"><story /></div>` })],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const BetweenGroups: Story = {
  name: 'Entre deux groupes',
  parameters: {
    docs: {
      description: {
        story: 'Son seul usage réel : séparer les actions destructives du reste du menu.',
      },
    },
  },
  render: () => ({
    components: { DropdownDivider, DropdownItem },
    template: `
      <div>
        <DropdownItem label="Voir le détail" icon="eye" />
        <DropdownItem label="Modifier" icon="square-pen" />
        <DropdownDivider />
        <DropdownItem label="Supprimer" icon="trash-2" />
      </div>
    `,
  }),
}
