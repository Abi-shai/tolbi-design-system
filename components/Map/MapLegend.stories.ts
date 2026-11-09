import type { Meta, StoryObj } from '@storybook/vue3'
import { computed, ref } from 'vue'
import { expect, userEvent, waitFor, within } from '@storybook/test'
import MapLegend, { type MapLegendMetric } from './MapLegend.vue'
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
          'La **légende d’une carte** en mode SIG, **sur une ligne, dans la grammaire de la frise** (ADR-0137, piste A ' +
          'de `3919:1427`) : une puce qui choisit, un trait, les valeurs. La même pilule que `MapTimeline` — même puce, ' +
          'même trait, même hauteur, **480 px** — : en haut de la carte ce qu’elle montre, en bas quand.\n\n' +
          '- **La puce nomme l’indicateur** et, avec deux `metrics` ou plus, le choisit (`v-model:metric`) ; son menu ' +
          'montre pour chacun le nom, l’unité et un aperçu de sa rampe. Le titre n’est plus répété.\n' +
          '- **L’échelle sur une ligne** : borne basse, rampe, borne haute, unité. Les crans du milieu ne sont plus écrits, ' +
          'ils sont lus (`summary`). **La ligne fait toujours 480 et la rampe est sa seule part élastique** ; sous 120 px ' +
          'de rampe, la puce prend le nom court (`shortLabel`).\n' +
          '- **Par catégories** : les clés après le trait, à leur taille jusqu’à 480 ; au-delà, « +N ».\n' +
          '- **Rampe et symboles** : une puce « Symboles » en fin de ligne, leurs noms dans son panneau.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof MapLegend>

const ground = (inner: string, width = 640) =>
  `<div style="background:var(--ds-bg-neutral);padding:24px;border-radius:12px;max-width:${width}px;min-height:72px">${inner}</div>`

const METRICS: MapLegendMetric[] = [
  { value: 'carbon', label: 'Carbone', unit: 'tCO2e/ha' },
  { value: 'biomass', label: 'Biomasse', unit: 't/ha' },
  { value: 'cover', label: 'Couverture forestière', shortLabel: 'Couvert', unit: 'ha' },
  { value: 'height', label: 'Hauteur de canopée', unit: 'm' },
]
const SCALES: Record<string, { title: string; unit: string; ticks: string[] }> = {
  carbon: { title: 'Carbone', unit: 'tCO2e/ha', ticks: ['0', '8', '16'] },
  biomass: { title: 'Biomasse', unit: 't/ha', ticks: ['0', '60', '120'] },
  cover: { title: 'Couverture forestière', unit: 'ha', ticks: ['0', '625', '1 250'] },
  height: { title: 'Hauteur de canopée', unit: 'm', ticks: ['0', '15', '30'] },
}

/** Au repos : la puce nomme l’indicateur choisi, puis la rampe entre ses deux bornes et son unité. 480 × 48. */
export const Rest: Story = {
  name: 'Au repos',
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

/**
 * **Le menu ouvert** : le menu de la puce de la frise, à l’identique — chaque indicateur avec son unité et l’aperçu
 * de sa rampe, l’indisponible grisé mais atteignable (ADR-0119). Choisir ferme le menu, la rampe et les bornes
 * changent sur place, la ligne ne bouge pas.
 */
export const MenuOpen: Story = {
  name: 'Menu ouvert',
  render: () => ({
    components: { MapLegend },
    setup() {
      const metric = ref('carbon')
      const scale = computed(() => SCALES[metric.value])
      const metrics = [...METRICS, { value: 'soil', label: 'Carbone du sol', unit: 'tC/ha', disabled: true }]
      return { metric, scale, metrics }
    },
    mounted() {
      setTimeout(() => (document.querySelector('.ds-map-legend__chip') as HTMLElement | null)?.click(), 300)
    },
    template: ground(`<MapLegend v-model:metric="metric" :metrics="metrics" :title="scale.title" :unit="scale.unit" :ticks="scale.ticks" />`, 640),
  }),
}

/**
 * **En attente, puis sans mesure** : la pilule est à 480 dès le clic, la puce lisible, la rampe aux couleurs de
 * l’indicateur ; bornes et unité en squelettes (ADR-0122). Sans mesure, les bornes sont « — » et l’unité tombe
 * (ADR-0105).
 */
export const Loading: Story = {
  name: 'En attente, puis sans mesure',
  render: () => ({
    components: { MapLegend },
    setup: () => ({ METRICS }),
    template: ground(`
      <div style="display:flex;flex-direction:column;gap:16px">
        <MapLegend :metrics="METRICS" title="Carbone" unit="tCO2e/ha" :ticks="[]" loading />
        <MapLegend :metrics="METRICS" title="Carbone" unit="tCO2e/ha" :ticks="[]" />
      </div>`),
  }),
}

/**
 * **Comparer** : le produit passe une rampe divergente, des bornes signées et un `title` court — « 2021 → 2024 » —
 * écrit après le trait, avant la rampe ; la puce garde l’indicateur.
 */
export const Compare: Story = {
  name: 'Comparer',
  render: () => ({
    components: { MapLegend },
    setup: () => ({
      METRICS,
      metric: ref('carbon'),
      diverging: ['var(--ds-text-error)', 'var(--ds-bg-neutral)', 'var(--ds-chart-sequential-4)'],
    }),
    template: ground(`<MapLegend v-model:metric="metric" :metrics="METRICS" title="2021 → 2024" unit="tCO2e/ha" :ticks="['−4', '0', '+4']" :colors="diverging" summary="Carbone, écart de 2021 à 2024, de −4 à +4 tCO2e/ha" />`),
  }),
}

const PARTS = [
  { key: 'eligible', label: 'Éligibles', color: 'var(--ds-chart-categorical-1)' },
  { key: 'forest', label: 'Forêt en 2016', color: 'var(--ds-chart-categorical-2)' },
  { key: 'invalid', label: 'Contour invalide', color: 'var(--ds-chart-categorical-3)' },
]

/**
 * **Par catégories** (ADR-0129) : rien à choisir, le mot nomme ce qui est coloré, les clés suivent le trait. À sa
 * taille, 480 au plus ; au-delà, les dernières clés passent dans une puce « +N » dont le panneau les liste.
 */
export const Categorical: Story = {
  name: 'Par catégories',
  render: () => ({
    components: { MapLegend },
    setup: () => ({
      PARTS,
      many: [
        ...PARTS,
        { key: 'water', label: 'Plan d’eau', color: 'var(--ds-chart-categorical-4)' },
        { key: 'urban', label: 'Zone bâtie', color: 'var(--ds-chart-categorical-5)' },
      ],
    }),
    template: ground(`
      <div style="display:flex;flex-direction:column;align-items:center;gap:16px">
        <MapLegend title="Parcelles" :legend="PARTS" />
        <MapLegend title="Parcelles" :legend="many" />
      </div>`),
  }),
}

/**
 * **Rampe et symboles** — le cockpit ARR : les quatre symboles ne tiennent pas dans 480 avec leurs noms (747) ; leurs
 * pastilles restent visibles dans une puce « Symboles », leurs noms dans son panneau.
 */
export const Symbols: Story = {
  name: 'Rampe et symboles',
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
 * **Le pire cas, et le nom court** : « Couverture forestière » avec « 1 250 ha » laisse encore ~200 px de rampe dans
 * 480. Plus étroite (ici 360), la rampe passerait sous 120 px : la puce prend le nom court, « Couvert ».
 */
export const WorstCase: Story = {
  name: 'Pire cas et nom court',
  render: () => ({
    components: { MapLegend },
    setup: () => ({ METRICS, s: SCALES.cover, h: SCALES.height }),
    template: ground(`
      <div style="display:flex;flex-direction:column;gap:16px">
        <MapLegend metric="cover" :metrics="METRICS" :title="s.title" :unit="s.unit" :ticks="s.ticks" />
        <MapLegend metric="height" :metrics="METRICS" :title="h.title" :unit="h.unit" :ticks="h.ticks" />
        <div style="width:360px"><MapLegend metric="cover" :metrics="METRICS" :title="s.title" :unit="s.unit" :ticks="s.ticks" /></div>
      </div>`),
  }),
}

/** **En situation** : la légende en haut, la frise en bas — la même famille, la même largeur, sur un même axe. */
export const WithTimeline: Story = {
  name: 'Avec la frise',
  render: () => ({
    components: { MapLegend, MapTimeline },
    setup() {
      const metric = ref('carbon')
      const scale = computed(() => SCALES[metric.value])
      return {
        metric, scale, METRICS,
        year: ref('2024'),
        scaleT: ref('year'),
        SCALE: [{ value: 'year', label: 'Année' }, { value: 'month', label: 'Mois' }],
        YEARS: ['2020', '2021', '2022', '2023', '2024'].map((y) => ({ value: y, label: y, data: true })),
      }
    },
    template: `<div style="background:var(--ds-map-land, var(--ds-bg-neutral));padding:24px;border-radius:12px;width:900px;height:420px;display:flex;flex-direction:column;align-items:center;justify-content:space-between;">
      <MapLegend v-model:metric="metric" :metrics="METRICS" :title="scale.title" :unit="scale.unit" :ticks="scale.ticks" />
      <MapTimeline v-model="year" v-model:scale="scaleT" :scales="SCALE" :periods="YEARS" label="Année" compare />
    </div>`,
  }),
}


/*
  The panels open, and close back onto their chip (0.116.0 shipped with both
  chips toggling nothing — their `Dropdown` is controlled and was given no
  state). Each check runs as the story's `play`: click → the panel is shown,
  Escape → it is gone and the focus is on the chip; ↓ opens it too; and one
  panel at a time.
*/
const shownPanel = (label: string) =>
  document.querySelector<HTMLElement>(`[role="dialog"][aria-label="${label}"]`)?.matches(':popover-open') ?? false

async function opensAndCloses(canvasElement: HTMLElement, chipName: string, panelLabel: string) {
  const canvas = within(canvasElement)
  const chip = await canvas.findByRole('button', { name: chipName })
  await userEvent.click(chip)
  await waitFor(() => expect(shownPanel(panelLabel)).toBe(true))
  await userEvent.keyboard('{Escape}')
  await waitFor(() => expect(shownPanel(panelLabel)).toBe(false))
  await expect(chip).toHaveFocus()
  await userEvent.keyboard('{ArrowDown}')
  await waitFor(() => expect(shownPanel(panelLabel)).toBe(true))
  await userEvent.keyboard('{Escape}')
  await waitFor(() => expect(shownPanel(panelLabel)).toBe(false))
  await expect(chip).toHaveFocus()
}

/**
 * **« Symboles » s’ouvre** — le cockpit ARR : un clic déplie le panneau des symboles (aligné à droite), Échap le referme
 * et rend le focus à la puce ; ↓ l’ouvre aussi. Ouvrir le menu des indicateurs le referme : un panneau à la fois.
 */
export const SymbolsOpen: Story = {
  name: 'Symboles, ouvert',
  render: () => ({
    components: { MapLegend },
    setup: () => ({
      metric: ref('stock'),
      metrics: [
        { value: 'stock', label: 'Indice de stock' },
        { value: 'carbon', label: 'Carbone', unit: 'tCO2e/ha' },
      ],
      legend: [
        { key: 'project', label: 'Point du projet', shape: 'square', color: 'var(--ds-text-strong)' },
        { key: 'control', label: 'Point de contrôle', shape: 'circle', color: 'var(--ds-chart-sequential-4)' },
        { key: 'reserve', label: 'Réserve', shape: 'point', color: 'var(--ds-chart-threshold)' },
        { key: 'excluded', label: 'Zone exclue', shape: 'zone', color: 'var(--ds-chart-categorical-3)' },
      ],
    }),
    template: ground(`<MapLegend v-model:metric="metric" :metrics="metrics" title="Indice de stock" :ticks="['0,30', '0,45', '0,60']" :legend="legend" />`),
  }),
  play: async ({ canvasElement }) => {
    await opensAndCloses(canvasElement, 'Symboles', 'Symboles')
    const canvas = within(canvasElement)
    await userEvent.click(await canvas.findByRole('button', { name: 'Symboles' }))
    await waitFor(() => expect(shownPanel('Symboles')).toBe(true))
    await userEvent.click(await canvas.findByRole('button', { name: /Indicateur affiché/ }))
    await waitFor(() => expect(shownPanel('Symboles')).toBe(false))
    await userEvent.click(await canvas.findByRole('button', { name: 'Symboles' }))
    await waitFor(() => expect(shownPanel('Symboles')).toBe(true))
  },
}

/**
 * **« +N » s’ouvre** — au-delà de 480, les dernières catégories passent dans la puce « +2 » ; un clic déplie leur
 * panneau (aligné à gauche), Échap le referme et rend le focus à la puce ; ↓ l’ouvre aussi.
 */
export const MoreOpen: Story = {
  name: '+N, ouvert',
  render: () => ({
    components: { MapLegend },
    setup: () => ({
      many: [
        ...PARTS,
        { key: 'water', label: 'Plan d’eau', color: 'var(--ds-chart-categorical-4)' },
        { key: 'urban', label: 'Zone bâtie', color: 'var(--ds-chart-categorical-5)' },
      ],
    }),
    template: ground(`<MapLegend title="Parcelles" :legend="many" />`),
  }),
  play: async ({ canvasElement }) => {
    await opensAndCloses(canvasElement, 'Autres catégories', 'Autres catégories')
    await userEvent.click(await within(canvasElement).findByRole('button', { name: 'Autres catégories' }))
    await waitFor(() => expect(shownPanel('Autres catégories')).toBe(true))
  },
}
