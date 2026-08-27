import type { Meta, StoryObj } from '@storybook/vue3'
import { fn } from '@storybook/test'
import ButtonGroupItem from './ButtonGroupItem.vue'
import ButtonGroup from './ButtonGroup.vue'

const meta: Meta<typeof ButtonGroupItem> = {
  title: 'Subcomponents/ButtonGroupItem',
  component: ButtonGroupItem,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Segment individuel de `ButtonGroup`. **Ne s\'utilise jamais seul** — le rayon de bordure ' +
          'et les bordures partagées sont gérés par le parent. Documenté ici pour ses props et ses états.',
      },
    },
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'Texte du segment. Omis avec `icon`, le segment devient iconique seul.',
      table: { category: 'Contenu', type: { summary: 'string' } },
    },
    icon: {
      control: 'text',
      description: 'Nom d\'icône du registre. Placée avant le label, ou seule si `label` est omis.',
      table: { category: 'Contenu', type: { summary: 'IconName' } },
    },
    active: {
      control: 'boolean',
      description: 'Marque le segment comme sélectionné.',
      table: { category: 'État', type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Désactive le segment.',
      table: { category: 'État', type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    type: {
      control: 'inline-radio',
      options: ['button', 'submit', 'reset'],
      description: 'Attribut `type` du bouton natif.',
      table: { category: 'Comportement', type: { summary: "'button' | 'submit' | 'reset'" }, defaultValue: { summary: "'button'" } },
    },
  },
  args: {
    label: 'Texte',
    active: false,
    disabled: false,
    type: 'button',
    onClick: fn(),
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Active: Story = {
  args: { active: true },
}

export const Disabled: Story = {
  args: { disabled: true },
}

export const WithIcon: Story = {
  name: 'Avec icône',
  args: { icon: 'plus' },
}

export const IconOnly: Story = {
  name: 'Icône seule',
  args: { label: undefined, icon: 'plus' },
}

export const InContext: Story = {
  name: 'Dans son parent',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Comment le segment est réellement destiné à apparaître — assemblé par `ButtonGroup`.',
      },
    },
  },
  render: () => ({
    components: { ButtonGroup, ButtonGroupItem },
    template: `
      <ButtonGroup>
        <ButtonGroupItem label="Jour" />
        <ButtonGroupItem label="Semaine" active />
        <ButtonGroupItem label="Mois" />
        <ButtonGroupItem label="Année" disabled />
      </ButtonGroup>
    `,
  }),
}
