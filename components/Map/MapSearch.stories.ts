import type { Meta, StoryObj } from '@storybook/vue3'
import { computed, ref } from 'vue'
import MapSearch from './MapSearch.vue'

const meta: Meta<typeof MapSearch> = {
  title: 'Données/Map/Search',
  component: MapSearch,
  tags: ['wip'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Ce que « Rechercher » ouvre dans la colonne d’outils (ADR-0171) : un champ, puis les résultats **groupés par ' +
          'type** — les groupes et leur ordre sont au produit, qui connaît ses objets et fait le géocodage. Une ligne : un ' +
          'glyphe (`#media`, ou `icon` sur une tuile), un nom, une ligne de faits, un `Badge` facultatif. Au clavier, ' +
          'celui d’une combobox : le focus reste dans le champ, ↓ ↑ parcourent toutes les lignes, Entrée choisit. ' +
          'Choisir émet `select` : le produit sélectionne l’objet (sa fiche, son épingle).',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

const RESULTS = [
  { label: 'Parcelles', items: [
    { value: 'FPH-SBR-008', label: 'FPH-SBR-008', meta: 'Koné Affoué · Lot 2023', icon: 'land-plot' as const, badge: 'En alerte', badgeTone: 'error' as const },
    { value: 'FPH-SBR-004', label: 'FPH-SBR-004', meta: 'Konan Brou · Lot 2021', icon: 'land-plot' as const, badge: 'Suivie', badgeTone: 'success' as const },
  ] },
  { label: 'Producteurs', items: [{ value: 'p-kone', label: 'Koné Affoué', meta: '2 parcelles', icon: 'user' as const }] },
  { label: 'Lieux', items: [{ value: 'l-konan-kro', label: 'Konan-Kro', meta: 'Nawa, Côte d’Ivoire', icon: 'map-pin' as const }] },
]

const SURFACE = 'border:1px solid var(--ds-border-subtle); border-radius:var(--ds-radius-surface); background:var(--ds-bg-default); box-shadow:var(--ds-elevation-raised); max-height:28rem; display:flex'

export const Default: Story = {
  name: 'Résultats groupés',
  render: () => ({
    components: { MapSearch },
    setup() {
      const query = ref('Kon')
      const chosen = ref('')
      const groups = computed(() => (query.value.trim() ? RESULTS : []))
      return { query, groups, chosen, SURFACE }
    },
    template: `
      <div>
        <div :style="SURFACE"><MapSearch v-model="query" :groups="groups" @select="chosen = $event.label" /></div>
        <p style="font:var(--ds-font-body-sm); color:var(--ds-text-subtle)">Choisi : {{ chosen || '—' }}</p>
      </div>`,
  }),
}

/** Rien de trouvé : une phrase, annoncée. */
export const Empty: Story = {
  name: 'Aucun résultat',
  render: () => ({
    components: { MapSearch },
    setup: () => ({ query: ref('Zzz'), SURFACE }),
    template: `<div :style="SURFACE"><MapSearch v-model="query" :groups="[]" /></div>`,
  }),
}
