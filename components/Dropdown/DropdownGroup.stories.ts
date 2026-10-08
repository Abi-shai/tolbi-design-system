import type { Meta, StoryObj } from '@storybook/vue3'
import DropdownGroup from './DropdownGroup.vue'
import DropdownItem from './DropdownItem.vue'

const PANEL = `
  padding: var(--ds-spacing-xs) 0;
  background: var(--ds-bg-default);
  border: 1px solid var(--ds-border-subtle);
  border-radius: var(--ds-radius-control);
  box-shadow: var(--ds-elevation-overlay);
  width: 320px;
`

const meta: Meta<typeof DropdownGroup> = {
  title: 'Superposition/Dropdown/Group',
  tags: ['wip', 'primitive'],
  component: DropdownGroup,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Une suite de lignes titrée dans un `Dropdown` — « Aujourd’hui », « Hier ». Le titre est celui de ' +
          '`SideNavGroup` : `label-md` en `text-subtle`, aligné sur le texte des lignes ; le groupe est un ' +
          '`role="group"` nommé par lui (ADR-0069). **Ne s\'utilise jamais seul** — il attend le panneau du parent.',
      },
    },
  },
  args: { label: 'Aujourd’hui' },
  decorators: [() => ({ template: `<div style="${PANEL}"><story /></div>` })],
  render: (args) => ({
    components: { DropdownGroup, DropdownItem },
    setup: () => ({ args }),
    template: `
      <DropdownGroup v-bind="args">
        <DropdownItem label="Expliquer les résultats de ce projet" meta="14:32" :selected="true" />
        <DropdownItem label="Quelle parcelle a le plus produit ?" meta="11:05" :selected="false" />
      </DropdownGroup>
      <DropdownGroup label="Hier">
        <DropdownItem label="Comparer avec la campagne 2024" meta="18:10" :selected="false" />
      </DropdownGroup>
    `,
  }),
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
