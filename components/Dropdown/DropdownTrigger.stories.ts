import type { Meta, StoryObj } from '@storybook/vue3'
import DropdownTrigger from './DropdownTrigger.vue'
import { Avatar } from '../Avatar'

const meta: Meta = {
  title: 'Superposition/Dropdown/Trigger',
  component: DropdownTrigger,
  tags: ['wip'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          "La boîte qui ouvre un `Dropdown`, et la propriétaire de son chrome — padding, bordure, " +
          "rayon, élévation, survol, anneau de focus. Le contenu est un slot. `Dropdown` en rend une " +
          "pour son trigger texte ; tout ce qui a besoin d'une autre forme la slote plutôt que de " +
          'refabriquer une boîte à partir des tokens de contrôle (ADR-0001). Seul le trigger *boîte* : ' +
          "les triggers icône et avatar de `Dropdown` sont nus, il n'y a pas de chrome à posséder.",
      },
    },
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    open: { control: 'boolean' },
    chevron: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { size: 'md', chevron: true },
  render: (args) => ({
    setup: () => ({ args }),
    components: { DropdownTrigger },
    template: '<DropdownTrigger v-bind="args">Compte</DropdownTrigger>',
  }),
}

export const Sizes: Story = {
  name: 'Tailles',
  parameters: {
    docs: {
      description: {
        story:
          '`md` (10/14) est le pas de `Dropdown`. `sm` (8/12) convient à un trigger portant une ' +
          'marque de 24px : les deux atteignent la même hauteur par deux chemins différents.',
      },
    },
  },
  render: () => ({
    components: { DropdownTrigger, Avatar },
    template: `
      <div style="display: flex; align-items: center; gap: 16px;">
        <DropdownTrigger size="md" chevron>Compte</DropdownTrigger>
        <DropdownTrigger size="sm" chevron>
          <Avatar size="xs" initials="CK" alt="Coopérative de Kaolack" />
          <span>Kaolack</span>
        </DropdownTrigger>
      </div>
    `,
  }),
}

export const Open: Story = {
  name: 'Ouvert',
  parameters: {
    docs: {
      description: {
        story: '`open` porte `aria-expanded` et retourne le chevron.',
      },
    },
  },
  render: () => ({
    components: { DropdownTrigger },
    template: '<DropdownTrigger open chevron>Compte</DropdownTrigger>',
  }),
}

export const Disabled: Story = {
  name: 'Désactivé',
  render: () => ({
    components: { DropdownTrigger },
    template: '<DropdownTrigger disabled chevron>Compte</DropdownTrigger>',
  }),
}
