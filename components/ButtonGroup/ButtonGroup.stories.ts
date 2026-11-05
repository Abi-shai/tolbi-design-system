import { ref } from 'vue'
import type { Meta, StoryObj } from '@storybook/vue3'
import ButtonGroup from './ButtonGroup.vue'
import ButtonGroupItem from './ButtonGroupItem.vue'
import { InputField } from '../InputField'
import { InputDropdown, Dropdown, DropdownTrigger, DropdownItem } from '../Dropdown'
import { Button } from '../Button'
import { Badge } from '../Badge'
import { Icon } from '../Icon'

const meta: Meta = {
  title: 'Actions/ButtonGroup',
  tags: ['stable'],
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

/** `md` (42px) à côté des contrôles `md`, `sm` (38px) à côté des champs `sm` : le rail garde son retrait de 4px, les segments passent de 32 à 28. */
export const Sizes: Story = {
  name: 'Sizes',
  render: () => ({
    setup: () => ({ md: ref('grille'), sm: ref('grille') }),
    components: { ButtonGroup, ButtonGroupItem },
    template: `
      <div style="display:flex; flex-direction:column; align-items:flex-start; gap:var(--ds-spacing-xl);">
        <ButtonGroup v-model="md" aria-label="Vue, md">
          <ButtonGroupItem value="grille" icon="layout-grid" aria-label="Grille" />
          <ButtonGroupItem value="tableau" icon="table" aria-label="Tableau" />
        </ButtonGroup>
        <ButtonGroup v-model="sm" size="sm" aria-label="Vue, sm">
          <ButtonGroupItem value="grille" icon="layout-grid" aria-label="Grille" />
          <ButtonGroupItem value="tableau" icon="table" aria-label="Tableau" />
        </ButtonGroup>
        <ButtonGroup v-model="sm" size="sm" aria-label="Vue avec libellés, sm">
          <ButtonGroupItem value="grille" icon="layout-grid" label="Grille" />
          <ButtonGroupItem value="tableau" icon="table" label="Tableau" />
        </ButtonGroup>
      </div>
    `,
  }),
}

/**
 * Une barre de filtres sur une seule ligne de 38px (ADR-0108) : tout est en `sm`.
 * Recherche `InputField`, liste de valeurs `InputDropdown`, filtre à plusieurs
 * critères = `Dropdown` dont le `#trigger` est un `DropdownTrigger` (boxed, `sm`) —
 * icône `filter` 16, libellé, nombre de filtres actifs en `Badge` **`sm`** (un `md`
 * fait 24px et porte le déclencheur à 42), chevron. Une action posée dans la barre
 * est un `Button` `sm` : 38px rendus (son jeton dit 36, sans la bordure — ADR-0033).
 */
export const InAFilterBar: Story = {
  name: 'In a filter bar',
  parameters: { layout: 'padded' },
  render: () => ({
    setup: () => {
      const criteria = ref<string[]>(['arachide', 'en-cours'])
      const toggle = (v: string) => {
        criteria.value = criteria.value.includes(v) ? criteria.value.filter(x => x !== v) : [...criteria.value, v]
      }
      return {
      view: ref('tableau'),
      query: ref(''),
      filter: ref<string | null>(null),
      criteria,
      toggle,
      filtersOpen: ref(false),
      options: [
        { value: 'tous', label: 'Tous les projets' },
        { value: 'a-jour', label: 'Suivi à jour' },
        { value: 'calcul', label: 'En calcul' },
      ],
      }
    },
    components: { ButtonGroup, ButtonGroupItem, InputField, InputDropdown, Dropdown, DropdownTrigger, DropdownItem, Button, Badge, Icon },
    template: `
      <div style="display:flex; align-items:center; gap:var(--ds-spacing-md); width:1000px;">
        <div style="width:300px;"><InputField v-model="query" size="sm" type="search" placeholder="Rechercher un projet" /></div>
        <InputDropdown v-model="filter" size="sm" :options="options" placeholder="Tous les projets" aria-label="Filtrer les projets" />
        <Dropdown v-model:open="filtersOpen" label="Filtres">
          <template #trigger>
            <DropdownTrigger size="sm" chevron :open="filtersOpen" @click="filtersOpen = !filtersOpen">
              <Icon name="filter" :size="16" aria-hidden="true" />
              Filtres
              <Badge v-if="criteria.length" :label="String(criteria.length)" size="sm" />
            </DropdownTrigger>
          </template>
          <DropdownItem label="Arachide" :checked="criteria.includes('arachide')" @click="toggle('arachide')" />
          <DropdownItem label="Mil" :checked="criteria.includes('mil')" @click="toggle('mil')" />
          <DropdownItem label="En cours" :checked="criteria.includes('en-cours')" @click="toggle('en-cours')" />
          <DropdownItem label="Terminé" :checked="criteria.includes('termine')" @click="toggle('termine')" />
        </Dropdown>
        <div style="flex:1;" />
        <Button size="sm" variant="secondary-gray" icon-leading="download" label="Télécharger la liste" />
        <ButtonGroup v-model="view" size="sm" aria-label="Vue">
          <ButtonGroupItem value="grille" icon="layout-grid" aria-label="Grille" />
          <ButtonGroupItem value="tableau" icon="table" aria-label="Tableau" />
        </ButtonGroup>
      </div>
    `,
  }),
}
