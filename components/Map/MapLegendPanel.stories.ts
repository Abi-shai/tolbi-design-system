import type { Meta, StoryObj } from '@storybook/vue3'
import { within, expect, userEvent } from '@storybook/test'
import { ref } from 'vue'
import MapLegendPanel from './MapLegendPanel.vue'
import MapOverlay from './MapOverlay.vue'

const METRICS = [
  { value: 'stock', label: 'Indice de stock · 2026' },
  { value: 'biomass', label: 'Biomasse aérienne' },
  { value: 'soil', label: 'Carbone du sol', disabled: true },
]

const GROUPS = [
  {
    value: 'metric',
    title: 'Indicateur',
    items: [
      { value: 'high', label: 'Fort (> 120 t/ha)', mark: 'square' as const, color: 'var(--ds-chart-sequential-5)' },
      { value: 'mid', label: 'Moyen (60–120 t/ha)', mark: 'square' as const, color: 'var(--ds-chart-sequential-3)' },
      { value: 'low', label: 'Faible (< 60 t/ha)', mark: 'square' as const, color: 'var(--ds-chart-sequential-1)' },
    ],
  },
  {
    value: 'points',
    title: 'Points',
    items: [
      { value: 'project', label: 'Point du projet', mark: 'glyph-project' as const },
      { value: 'control', label: 'Point de contrôle', mark: 'glyph-control' as const },
      { value: 'reserve', label: 'Point de réserve', mark: 'point' as const, color: 'var(--ds-text-subtle)' },
    ],
  },
  {
    value: 'zones',
    title: 'Zones',
    items: [
      { value: 'eligible', label: 'Zone éligible', mark: 'zone' as const, color: 'var(--ds-chart-categorical-1)' },
      { value: 'buffer', label: 'Zone tampon', mark: 'ring' as const, color: 'var(--ds-chart-categorical-2)' },
    ],
  },
]

const meta: Meta<typeof MapLegendPanel> = {
  title: 'Données/Map/LegendPanel',
  component: MapLegendPanel,
  /* wip: first release, from the product's local legend; it is to replace MapLegend at the top of the map. */
  tags: ['wip'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'La légende d’une carte (ADR-0226, Felt) : `MapPanel` en clé — compact, à la hauteur de son contenu, le pli ' +
          'en fin de ligne (ADR-0224/0225). Un bloc par famille ; le premier porte l’indicateur (son menu, « À propos », ' +
          'l’œil). Une ligne : le repère de la carte et son nom, pas de compte ; au survol, « Afficher seulement » et ' +
          'l’œil. Ce qui est masqué tient dans `v-model:hidden`. Par défaut en densité « confort » (22rem, 16 px, lignes de 36 ; ' +
          'ADR-0227), `density="compact"` pour la clé de 18rem.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

/** Sur la carte : survoler une ligne montre ses actions ; « Afficher seulement » isole une ligne dans sa famille. */
export const OnTheMap: Story = {
  name: 'Sur la carte',
  render: () => ({
    components: { MapLegendPanel, MapOverlay },
    setup: () => ({
      METRICS, GROUPS,
      metric: ref('stock'), hidden: ref<string[]>([]), metricHidden: ref(false), collapsed: ref(false),
    }),
    template: `
      <div style="position:relative;height:620px;background:url('./stories/map-loading/base.webp') center / cover;overflow:hidden">
        <MapOverlay position="top-start">
          <MapLegendPanel
            :groups="GROUPS" :metrics="METRICS" v-model:metric="metric" v-model:hidden="hidden"
            v-model:metric-hidden="metricHidden" v-model:collapsed="collapsed"
            metric-help="Stock de carbone estimé par hectare, tous réservoirs confondus."
          />
        </MapOverlay>
      </div>`,
  }),
  /* Guarded: « Afficher seulement » isolates a row and brings its family back; the eye hides a row and turns its name. */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const solo = canvas.getByRole('button', { name: 'Afficher seulement Point de contrôle' })
    await userEvent.click(solo)
    await expect(solo).toHaveAttribute('aria-pressed', 'true')
    await expect(canvas.getByRole('button', { name: 'Afficher Point du projet' })).toBeTruthy()
    await userEvent.click(solo)
    await expect(solo).toHaveAttribute('aria-pressed', 'false')
    await userEvent.click(canvas.getByRole('button', { name: 'Masquer Zone tampon' }))
    await expect(canvas.getByRole('button', { name: 'Afficher Zone tampon' })).toBeTruthy()
    await userEvent.click(canvas.getByRole('button', { name: 'Masquer Indice de stock · 2026' }))
    await expect(canvas.getByRole('button', { name: 'Afficher Indice de stock · 2026' })).toBeTruthy()
  },
}

/** Un seul indicateur : son nom tient lieu de titre, sans menu. Sans indicateur, chaque bloc est une famille. */
export const WithoutMenu: Story = {
  name: 'Sans menu',
  render: () => ({
    components: { MapLegendPanel, MapOverlay },
    setup: () => ({ GROUPS, METRICS, hidden: ref<string[]>(['reserve']) }),
    template: `
      <div style="position:relative;height:560px;background:url('./stories/map-loading/base.webp') center / cover;overflow:hidden">
        <MapOverlay position="top-start">
          <MapLegendPanel :groups="GROUPS" :metrics="METRICS.slice(0, 1)" v-model:hidden="hidden" />
        </MapOverlay>
        <MapOverlay position="top-end">
          <MapLegendPanel :groups="GROUPS.slice(1)" v-model:hidden="hidden" />
        </MapOverlay>
      </div>`,
  }),
}

/**
 * Les deux densités (ADR-0227) : `comfortable` par défaut — 22rem, titres et libellés à 16 px, lignes de 36, repères un
 * cran au-dessus — pour une carte lue de loin et des cibles pointées ; `compact` — la clé de 18rem de l’ADR-0226.
 */
export const Densities: Story = {
  name: 'Densités',
  render: () => ({
    components: { MapLegendPanel, MapOverlay },
    setup: () => ({ GROUPS, METRICS, metric: ref('stock') }),
    template: `
      <div style="position:relative;height:680px;background:url('./stories/map-loading/base.webp') center / cover;overflow:hidden">
        <MapOverlay position="top-start">
          <MapLegendPanel :groups="GROUPS" :metrics="METRICS" v-model:metric="metric" />
        </MapOverlay>
        <MapOverlay position="top-end">
          <MapLegendPanel :groups="GROUPS" :metrics="METRICS" v-model:metric="metric" density="compact" />
        </MapOverlay>
      </div>`,
  }),
}
