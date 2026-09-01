import { ref } from 'vue'
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
    setup: () => ({ selected: ref('jour') }),
    components: { ButtonGroup, ButtonGroupItem },
    template: `
      <ButtonGroup v-model="selected" aria-label="Options">
        <ButtonGroupItem value="jour" label="Jour" />
        <ButtonGroupItem value="semaine" label="Semaine" />
        <ButtonGroupItem value="mois" label="Mois" />
      </ButtonGroup>
    `,
  }),
}

export const LeadingIcon: Story = {
  name: 'Leading icon',
  render: () => ({
    setup: () => ({ selected: ref('liste') }),
    components: { ButtonGroup, ButtonGroupItem },
    template: `
      <ButtonGroup v-model="selected" aria-label="Vues">
        <ButtonGroupItem value="liste" icon="list"     label="Liste" />
        <ButtonGroupItem value="grille" icon="layout-grid"  label="Grille" />
        <ButtonGroupItem value="tableau" icon="table"    label="Tableau" />
      </ButtonGroup>
    `,
  }),
}

export const IconOnly: Story = {
  name: 'Icon only',
  render: () => ({
    components: { ButtonGroup, ButtonGroupItem },
    template: `
      <ButtonGroup v-model="selected" aria-label="Navigation">
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
    setup: () => ({ selected: ref('modifier') }),
    components: { ButtonGroup, ButtonGroupItem },
    template: `
      <ButtonGroup v-model="selected" aria-label="Actions">
        <ButtonGroupItem value="modifier" label="Modifier" icon="square-pen" />
        <ButtonGroupItem value="télécharger" label="Télécharger" icon="download" />
        <ButtonGroupItem value="supprimer" label="Supprimer" icon="trash-2" :disabled="true" />
      </ButtonGroup>
    `,
  }),
}
