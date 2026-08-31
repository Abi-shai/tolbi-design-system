import type { Meta, StoryObj } from '@storybook/vue3'
import ButtonGroup from './ButtonGroup.vue'
import ButtonGroupItem from './ButtonGroupItem.vue'

const meta: Meta = {
  title: 'Actions/ButtonGroup',
  tags: ['wip'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Groupe de boutons adjacents partageant une bordure commune. Utiliser pour des actions mutuellement exclusives ou des commandes groupées.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const TextOnly: Story = {
  name: 'Text only',
  render: () => ({
    components: { ButtonGroup, ButtonGroupItem },
    template: `
      <ButtonGroup aria-label="Options">
        <ButtonGroupItem label="Jour" />
        <ButtonGroupItem label="Semaine" :active="true" />
        <ButtonGroupItem label="Mois" />
      </ButtonGroup>
    `,
  }),
}

export const LeadingIcon: Story = {
  name: 'Leading icon',
  render: () => ({
    components: { ButtonGroup, ButtonGroupItem },
    template: `
      <ButtonGroup aria-label="Vues">
        <ButtonGroupItem icon="list"     label="Liste" />
        <ButtonGroupItem icon="layout-grid"  label="Grille" :active="true" />
        <ButtonGroupItem icon="table"    label="Tableau" />
      </ButtonGroup>
    `,
  }),
}

export const IconOnly: Story = {
  name: 'Icon only',
  render: () => ({
    components: { ButtonGroup, ButtonGroupItem },
    template: `
      <ButtonGroup aria-label="Navigation">
        <ButtonGroupItem icon="minus"  aria-label="Précédent" />
        <ButtonGroupItem icon="plus"   aria-label="Ajouter" />
        <ButtonGroupItem icon="search" aria-label="Suivant" />
      </ButtonGroup>
    `,
  }),
}

export const WithDisabled: Story = {
  name: 'With disabled item',
  render: () => ({
    components: { ButtonGroup, ButtonGroupItem },
    template: `
      <ButtonGroup aria-label="Actions">
        <ButtonGroupItem label="Modifier" icon="square-pen" />
        <ButtonGroupItem label="Télécharger" icon="download" :active="true" />
        <ButtonGroupItem label="Supprimer" icon="trash-2" :disabled="true" />
      </ButtonGroup>
    `,
  }),
}
