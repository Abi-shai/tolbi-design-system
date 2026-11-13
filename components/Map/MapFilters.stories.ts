import type { Meta, StoryObj } from '@storybook/vue3'
import { computed, ref } from 'vue'
import MapFilters from './MapFilters.vue'
import MapFilterSection from './MapFilterSection.vue'
import MapFilterOption from './MapFilterOption.vue'
import { Tag } from '../Tag'
import { Slider } from '../Slider'

const meta: Meta<typeof MapFilters> = {
  title: 'Données/Map/Filters',
  component: MapFilters,
  tags: ['wip'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Ce que « Filtres » ouvre dans la colonne d’outils (ADR-0171) : des sections empilées (`MapFilterSection` — un ' +
          'titre et les contrôles du produit : `MapFilterOption`, une case avec la couleur de la valeur sur la carte et ' +
          'son compte ; des `Tag` à choix ; un `Slider` de plage), et un pied : « Effacer » et ce qui reste (« 4 ' +
          'parcelles », annoncé). **Les filtres s’appliquent en direct** — pas de « Appliquer ». Lesquels, et leur état, ' +
          'sont au produit (Carbone : alerte, lot, surface ; zone ARR : statut, surface ; Yield : culture, stade…).',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: 'Carbone',
  render: () => ({
    components: { MapFilters, MapFilterSection, MapFilterOption, Tag, Slider },
    setup() {
      const alerts = ref<Record<string, boolean>>({ Bloque: true, 'À surveiller': true, 'À revoir': false, 'Sans alerte': false })
      const colors: Record<string, string> = { Bloque: 'var(--ds-chart-status-critical)', 'À surveiller': 'var(--ds-chart-status-warning)', 'À revoir': 'var(--ds-chart-status-neutral)', 'Sans alerte': 'var(--ds-chart-categorical-1)' }
      const counts: Record<string, number> = { Bloque: 9, 'À surveiller': 4, 'À revoir': 2, 'Sans alerte': 13 }
      const lots = ref<string[]>(['2023'])
      const area = ref<[number, number]>([5, 18])
      const left = computed(() => Object.entries(alerts.value).filter(([, on]) => on).reduce((n, [k]) => n + counts[k], 0))
      const toggle = (y: string) => (lots.value = lots.value.includes(y) ? lots.value.filter((l) => l !== y) : [...lots.value, y])
      const clear = () => { Object.keys(alerts.value).forEach((k) => (alerts.value[k] = false)); lots.value = []; area.value = [0, 30] }
      const none = computed(() => !Object.values(alerts.value).some(Boolean) && !lots.value.length && area.value[0] === 0 && area.value[1] === 30)
      return { alerts, colors, counts, lots, area, left, toggle, clear, none }
    },
    template: `
      <div style="border:1px solid var(--ds-border-subtle); border-radius:var(--ds-radius-surface); background:var(--ds-bg-default); box-shadow:var(--ds-elevation-raised); max-height:36rem; display:flex">
        <MapFilters :result-label="(none ? 28 : left) + ' parcelles'" :clear-disabled="none" @clear="clear">
          <MapFilterSection title="Alerte">
            <MapFilterOption v-for="(on, name) in alerts" :key="name" v-model="alerts[name]" :label="name" :color="colors[name]" :count="counts[name]" />
          </MapFilterSection>
          <MapFilterSection title="Lot">
            <div style="display:flex; flex-wrap:wrap; gap:var(--ds-spacing-xs)">
              <Tag v-for="y in ['2021', '2022', '2023']" :key="y" :label="y" checkbox :checked="lots.includes(y)" @update:checked="toggle(y)" />
            </div>
          </MapFilterSection>
          <MapFilterSection title="Surface (ha)">
            <Slider v-model="area" :min="0" :max="30" value-display="bottom" />
          </MapFilterSection>
        </MapFilters>
      </div>`,
  }),
}
