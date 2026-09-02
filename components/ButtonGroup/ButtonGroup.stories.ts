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

/**
 * ADR-0024 registered items by pushing onto an array, so an item that unmounted
 * and remounted grew the list and shifted every index after it — the indicator
 * would then point at the wrong segment. Registration is idempotent by value and
 * items unregister on unmount; this story exercises that path, because a DOM
 * detach does not trigger `onBeforeUnmount` and so cannot prove it.
 */
export const DynamicSegments: Story = {
  name: 'Segments added and removed',
  parameters: { layout: 'padded' },
  render: () => ({
    setup: () => ({ selected: ref('mois'), showMiddle: ref(true) }),
    components: { ButtonGroup, ButtonGroupItem },
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--ds-spacing-xl); align-items: flex-start;">
        <ButtonGroup v-model="selected" aria-label="Période">
          <ButtonGroupItem value="jour" label="Jour" />
          <ButtonGroupItem v-if="showMiddle" value="semaine" label="Semaine" />
          <ButtonGroupItem value="mois" label="Mois" />
        </ButtonGroup>

        <button
          id="toggle-middle"
          type="button"
          @click="showMiddle = !showMiddle"
          style="font: var(--ds-font-label-lg); padding: var(--ds-control-padding-sm);
                 border: var(--ds-border-width-default) solid var(--ds-border-default);
                 border-radius: var(--ds-radius-control); background: var(--ds-bg-default); cursor: pointer;"
        >{{ showMiddle ? 'Retirer' : 'Remettre' }} « Semaine »</button>

        <p style="margin: 0; font: var(--ds-font-body-sm); color: var(--ds-text-subtle); max-width: 34rem;">
          La sélection doit rester sur le même segment pendant que ses voisins apparaissent et
          disparaissent — c'est le chemin de démontage que le détachement DOM ne déclenche pas.
        </p>
      </div>
    `,
  }),
}
