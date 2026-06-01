import type { Meta, StoryObj } from '@storybook/vue3'
import ButtonGroup from './ButtonGroup.vue'
import ButtonGroupItem from './ButtonGroupItem.vue'

const meta: Meta = {
  title: 'Components/ButtonGroup',
  tags: [],
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
        <ButtonGroupItem icon="grid-01"  label="Grille" :active="true" />
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
        <ButtonGroupItem icon="search-md" aria-label="Suivant" />
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
        <ButtonGroupItem label="Modifier" icon="edit-01" />
        <ButtonGroupItem label="Télécharger" icon="download-01" :active="true" />
        <ButtonGroupItem label="Supprimer" icon="trash-01" :disabled="true" />
      </ButtonGroup>
    `,
  }),
}
