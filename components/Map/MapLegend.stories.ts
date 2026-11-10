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
          'même trait, même hauteur, **560 px** — : en haut de la carte ce qu’elle montre, en bas quand.\n\n' +
          '- **La puce nomme l’indicateur** et, avec deux `metrics` ou plus, le choisit (`v-model:metric`) ; son menu ' +
          'montre pour chacun le nom, l’unité et un aperçu de sa rampe. Le titre n’est plus répété.\n' +
          '- **L’échelle sur une ligne** : borne basse, rampe, borne haute, unité. Les crans du milieu ne sont plus écrits, ' +
          'ils sont lus (`summary`). **La ligne fait toujours 560 et la rampe est sa seule part élastique** ; sous 120 px ' +
          'de rampe, la puce prend le nom court (`shortLabel`).\n' +
          '- **Par catégories** : les clés après le trait, à leur taille jusqu’à 560 ; au-delà, « +N ».\n' +
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

/** Au repos : la puce nomme l’indicateur choisi, puis la rampe entre ses deux bornes et son unité. 560 × 48. */
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
 * **En attente, puis sans mesure** : la pilule est à 560 dès le clic, la puce lisible, la rampe aux couleurs de
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
 * taille, 560 au plus ; au-delà, les dernières clés passent dans une puce « +N » dont le panneau les liste.
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
 * **Symboles, replié** — le cockpit ARR : les quatre symboles ne tiennent pas dans 560 avec leurs noms (747) ; leurs
 * pastilles restent visibles dans la puce « Symboles », qui déplie le bloc sous la ligne (ADR-0138).
 */
export const Symbols: Story = {
  name: 'Symboles, replié',
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
 * 560. Plus étroite (ici 360), la rampe passerait sous 120 px : la puce prend le nom court, « Couvert ».
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



const SYMBOLS = [
  { key: 'project', label: 'Point du projet', shape: 'square', color: 'var(--ds-text-strong)', value: '40' },
  { key: 'control', label: 'Point de contrôle', shape: 'circle', color: 'var(--ds-chart-sequential-4)', value: '200' },
  { key: 'reserve', label: 'Réserve', shape: 'point', color: 'var(--ds-chart-threshold)', value: '2 180' },
  { key: 'excluded', label: 'Zone exclue', shape: 'zone', color: 'var(--ds-chart-categorical-3)', value: '2' },
]
const COCKPIT = `<MapLegend v-model:expanded="expanded" title="Indice de stock" :ticks="['0,30', '0,45', '0,60']" :legend="legend" />`

/*
  The block unfolds and folds back onto its chip (ADR-0138), and a click on the
  map leaves it open — it is read while looking at the map. Run as the story's
  `play`: click → the block is shown and the chip says `aria-expanded="true"`;
  a click elsewhere → still open; Escape → folded, the focus on the chip.
*/
const unfolded = (el: HTMLElement) => {
  const region = el.querySelector<HTMLElement>('[role="region"]')
  return !!region && getComputedStyle(region.parentElement!).visibility === 'visible'
}

async function unfoldsAndStays(canvasElement: HTMLElement, chipName: string) {
  const canvas = within(canvasElement)
  const chip = await canvas.findByRole('button', { name: chipName })
  await expect(chip).toHaveAttribute('aria-expanded', 'false')
  await userEvent.click(chip)
  await expect(chip).toHaveAttribute('aria-expanded', 'true')
  await expect(chip).toHaveAttribute('aria-controls', canvasElement.querySelector('[role="region"]')!.id)
  await waitFor(() => expect(unfolded(canvasElement)).toBe(true))
  await userEvent.click(canvasElement.querySelector<HTMLElement>('.legend-map__spot')!)
  await new Promise((r) => setTimeout(r, 300))
  await expect(unfolded(canvasElement)).toBe(true)
  chip.focus()
  await userEvent.keyboard('{Escape}')
  await expect(chip).toHaveAttribute('aria-expanded', 'false')
  await waitFor(() => expect(unfolded(canvasElement)).toBe(false))
  await expect(chip).toHaveFocus()
  await userEvent.keyboard('{Enter}')
  await expect(chip).toHaveAttribute('aria-expanded', 'true')
}

const onMap = (inner: string) =>
  `<div class="legend-map" style="background:var(--ds-map-land, var(--ds-bg-neutral));padding:24px;border-radius:12px;max-width:640px;min-height:260px;display:flex;flex-direction:column;justify-content:space-between">${inner}<div class="legend-map__spot" style="height:32px"></div></div>`

/**
 * **Symboles, déplié** (ADR-0138, rangement R1 de `3922:1671`) — la légende s’agrandit sur place : la ligne ne bouge
 * pas, un filet puis quatre colonnes égales, centrées — la forme, le nombre (`value`), le nom. Un clic sur la carte ne
 * replie pas : on lit la légende en regardant la carte. Échap replie et laisse le focus sur la puce.
 */
export const SymbolsUnfolded: Story = {
  name: 'Symboles, déplié',
  render: () => ({
    components: { MapLegend },
    setup: () => ({ legend: SYMBOLS, expanded: ref(false) }),
    template: onMap(COCKPIT),
  }),
  play: async ({ canvasElement }) => {
    await unfoldsAndStays(canvasElement, 'Symboles')
  },
}

/** **Symboles, sans nombres** — sans `value`, chaque colonne montre la forme et le nom seulement. */
export const SymbolsWithoutFigures: Story = {
  name: 'Symboles, sans nombres',
  render: () => ({
    components: { MapLegend },
    setup: () => ({ legend: SYMBOLS.map(({ value: _v, ...s }) => s), expanded: ref(true) }),
    template: onMap(COCKPIT),
  }),
}

/** **« +N », déplié** — les catégories qui ne tiennent pas sur la ligne se déplient dessous, de la même façon. */
export const MoreUnfolded: Story = {
  name: '+N, déplié',
  render: () => ({
    components: { MapLegend },
    setup: () => ({
      expanded: ref(false),
      many: [
        ...PARTS,
        { key: 'fallow', label: 'Jachère', color: 'var(--ds-chart-categorical-4)' },
        { key: 'crop', label: 'Culture annuelle', color: 'var(--ds-chart-categorical-5)' },
      ],
    }),
    template: onMap(`<MapLegend v-model:expanded="expanded" title="Parcelles" :legend="many" />`),
  }),
  play: async ({ canvasElement }) => {
    await unfoldsAndStays(canvasElement, 'Autres catégories')
  },
}

/**
 * **Déplié, et le menu des indicateurs ouvert** — choisir n’est pas lire : le menu reste un menu, et l’ouvrir laisse
 * le bloc déplié.
 */
export const UnfoldedWithMenu: Story = {
  name: 'Déplié + menu des indicateurs',
  render: () => ({
    components: { MapLegend },
    setup: () => ({
      legend: SYMBOLS,
      expanded: ref(true),
      metric: ref('stock'),
      metrics: [
        { value: 'stock', label: 'Indice de stock' },
        { value: 'carbon', label: 'Carbone', unit: 'tCO2e/ha' },
      ],
    }),
    template: onMap(`<MapLegend v-model:expanded="expanded" v-model:metric="metric" :metrics="metrics" title="Indice de stock" :ticks="['0,30', '0,45', '0,60']" :legend="legend" />`),
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(await canvas.findByRole('button', { name: /Indicateur affiché/ }))
    await waitFor(() => expect(document.querySelector('[role="menu"]')?.matches(':popover-open')).toBe(true))
    await expect(unfolded(canvasElement)).toBe(true)
  },
}

/**
 * **Mouvement réduit** — sous `prefers-reduced-motion`, la hauteur ne s’anime pas : le bloc est là ou pas, comme toute
 * transition du paquet (`motion.css`). Cette story est la même que « Symboles, déplié » ; activez la réduction des
 * animations du système pour la voir.
 */
export const ReducedMotion: Story = {
  name: 'Mouvement réduit',
  render: () => ({
    components: { MapLegend },
    setup: () => ({ legend: SYMBOLS, expanded: ref(false) }),
    template: onMap(COCKPIT),
  }),
}
