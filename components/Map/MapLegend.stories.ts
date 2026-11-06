import type { Meta, StoryObj } from '@storybook/vue3'
import { computed, ref } from 'vue'
import MapLegend from './MapLegend.vue'
import MapTimeline from './MapTimeline.vue'

const meta: Meta<typeof MapLegend> = {
  title: 'Données/Map/Legend',
  component: MapLegend,
  tags: ['wip'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'La **légende d’une carte** en mode SIG (ADR-0102, Figma « Indicateur ») : ce que veulent dire les couleurs — ' +
          'le nom de l’indicateur, son échelle continue (un dégradé, son unité, ses bornes) — et ce que sont les symboles.\n\n' +
          'Quand l’écran offre plusieurs indicateurs, la légende **bascule de l’un à l’autre** (`metrics` + ' +
          '`v-model:metric`, des `Tabs xs`) : le sélecteur est au-dessus de l’échelle qu’il change, on ne cherche jamais ' +
          'la clé de ce qu’on vient de choisir. Quels indicateurs existent, c’est le module qui le dit ; le produit répond ' +
          'au changement par un autre `title`, `unit`, `ticks` et une autre carte.\n\n' +
          'La rampe est `--ds-chart-sequential-*` (ADR-0096) sauf si l’appelant donne la sienne. Un lecteur d’écran ' +
          'entend le dégradé **une fois** — « Carbone, de 0 t à 16 t CO2e/ha ». `ChartLegend` nomme les séries d’un ' +
          'graphique ; `MapLegend` dit comment lire une carte.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof MapLegend>

const ground = (inner: string) =>
  `<div style="background:var(--ds-bg-neutral);padding:24px;border-radius:12px;max-width:640px">${inner}</div>`

const METRICS = [
  { value: 'carbon', label: 'Carbone' },
  { value: 'biomass', label: 'Biomasse' },
  { value: 'cover', label: 'Couvert' },
  { value: 'height', label: 'Hauteur' },
]
const SCALES: Record<string, { title: string; unit: string; ticks: string[] }> = {
  carbon: { title: 'Carbone', unit: 'CO2e/ha', ticks: ['0 t', '8 t', '16 t'] },
  biomass: { title: 'Biomasse', unit: 't/ha', ticks: ['0', '60', '120'] },
  cover: { title: 'Couvert', unit: '%', ticks: ['0', '50', '100'] },
  height: { title: 'Hauteur', unit: 'm', ticks: ['0', '15', '30'] },
}

/** Le dessin « Indicateur » : quatre indicateurs, la légende de celui qui est choisi. */
export const Metrics: Story = {
  name: 'Avec le choix de l’indicateur',
  render: () => ({
    components: { MapLegend },
    setup() {
      const metric = ref('carbon')
      const scale = computed(() => SCALES[metric.value])
      return { metric, scale, METRICS }
    },
    template: ground(`<MapLegend v-model:metric="metric" :metrics="METRICS" :title="scale.title" :unit="scale.unit" :ticks="scale.ticks" />`),
  }),
}

/** Un seul indicateur : pas de sélecteur ; la clé des symboles de l’ARR dessous. */
export const Symbols: Story = {
  name: 'Un indicateur et ses symboles',
  render: () => ({
    components: { MapLegend },
    setup: () => ({
      legend: [
        { key: 'project', label: 'Point du projet', shape: 'square', color: 'var(--ds-text-strong)' },
        { key: 'control', label: 'Point de contrôle', shape: 'circle', color: 'var(--ds-chart-sequential-4)' },
        { key: 'reserve', label: 'Réserve', shape: 'point', color: 'var(--ds-chart-threshold)' },
        { key: 'excluded', label: 'Zone exclue', shape: 'zone', color: 'var(--ds-chart-categorical-3)' },
      ],
    }),
    template: ground(`<MapLegend title="Indice de stock" :ticks="['0,30', '0,45', '0,60']" :legend="legend" />`),
  }),
}

/**
 * **La largeur du contenu, 480 px au plus** (ADR-0116) — la même règle et le même jeton (`--ds-width-sm`) que la
 * frise : sur l’écran SIG, la légende en haut et la frise en bas restent sur l’axe central de la carte quoi qu’elles
 * tiennent. Le dégradé prend la place que laissent la bascule et le titre, jamais moins de 16rem.
 */
export const OnTheAxis: Story = {
  name: 'Sur l’axe de la frise',
  render: () => ({
    components: { MapLegend, MapTimeline },
    setup: () => ({
      year: ref('2024'),
      SCALE: [{ value: 'year', label: 'Année' }],
      YEARS: ['2020', '2021', '2022', '2023', '2024'].map((y) => ({ value: y, label: y, data: true })),
      metric: ref('carbon'),
      TWO: [{ value: 'carbon', label: 'Carbone' }, { value: 'cover', label: 'Couvert' }],
    }),
    template: `<div style="background:var(--ds-bg-neutral);padding:24px;border-radius:12px;width:720px;display:flex;flex-direction:column;align-items:center;gap:24px;">
      <MapLegend title="Carbone" unit="tCO2e/ha" :ticks="['0', '8', '16']" />
      <MapLegend v-model:metric="metric" :metrics="TWO" title="Carbone" unit="tCO2e/ha" :ticks="['0', '8', '16']" />
      <MapTimeline v-model="year" :scales="SCALE" :periods="YEARS" label="Année" />
    </div>`,
  }),
}

/**
 * **En attente** (ADR-0122) : la rampe est déjà là — ses couleurs sont celles de l’indicateur, connues avant toute
 * donnée — l’unité et les bornes sont des repères qui gardent leur ligne. **Sans mesure** : les bornes sont « — »
 * (ADR-0105), l’unité tombe.
 */
export const Loading: Story = {
  name: 'En attente, puis sans mesure',
  render: () => ({
    components: { MapLegend },
    setup: () => ({ METRICS }),
    template: ground(`
      <div style="display:flex;flex-direction:column;gap:16px">
        <MapLegend :metrics="METRICS" title="Carbone" unit="CO2e/ha" :ticks="[]" loading />
        <MapLegend :metrics="METRICS" title="Carbone" unit="CO2e/ha" :ticks="[]" />
      </div>`),
  }),
}
