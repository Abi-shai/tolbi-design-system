import type { Meta, StoryObj } from '@storybook/vue3'
import { computed, defineComponent, ref } from 'vue'
import MapNavigator from './MapNavigator.vue'
import MapOverlay from './MapOverlay.vue'
import MapPanel from './MapPanel.vue'
import MapSearch from './MapSearch.vue'
import MapFilters from './MapFilters.vue'
import MapFilterSection from './MapFilterSection.vue'
import MapFilterOption from './MapFilterOption.vue'
import { Tag } from '../Tag'
import { Slider } from '../Slider'
import { ProjectGlyph } from '../ProjectGlyph'
import { TolbiAiLauncher } from '../TolbiAiLauncher'
import { easing } from '../../tokens/dist/index.js'

const meta: Meta<typeof MapNavigator> = {
  title: 'Données/Map/Navigator',
  component: MapNavigator,
  tags: ['wip'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'La **colonne d’outils** d’une carte (ADR-0171, après Google Weather Lab, Felt, OneSoil, Google Maps, Global ' +
          'Nature Watch, Copernicus Browser) : **rien ne s’ajoute sur la carte hors d’un groupe d’outils**. Au bord de ' +
          'fin, sous le haut, de haut en bas : les **outils du produit** (`tools` — icône, nom, compte, allumé ou non), ' +
          '« Mini-carte » s’il y en a une (`#default`), un filet, + **la jauge** −, un filet, « Recentrer ».\n\n' +
          'Un outil qui a quelque chose à montrer (`#tool-<value>`, ou la mini-carte) l’ouvre **dans une carte à gauche ' +
          'de la colonne**, alignée en haut sur son bouton, à `spacing-md` ; le bouton reste allumé tant qu’elle est ' +
          'ouverte (`v-model:tool`). Échap, un clic dehors ou un nouveau clic la ferment. **Une seule chose à droite à la ' +
          'fois** : une fiche qui arrive dans le même `MapOverlay position="end"` la ferme. Un outil sans contenu est un ' +
          'interrupteur : il émet `press`, le produit dit s’il est allumé (`pressed`).\n\n' +
          '**Un contrôle ne bouge jamais quand un panneau apparaît** : dans `MapOverlay position="end"`, la colonne reste ' +
          'au bord, la fiche (`MapPanel lg`) se pose à sa gauche, pleine hauteur, et Tolbi xAI (`TolbiAiLauncher ' +
          'placement="map"`) à son pied, sur son axe.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof MapNavigator>

const minimap = `
  <svg viewBox="0 0 200 128" style="display:block;width:100%;height:100%;background:var(--ds-bg-neutral-subtle)">
    <circle cx="100" cy="64" r="52" fill="none" stroke="var(--ds-bg-brand-solid)" stroke-dasharray="3 3" />
    <rect x="70" y="40" width="60" height="48" rx="3" fill="none" stroke="var(--ds-text-strong)" stroke-width="1.2" />
    <circle cx="96" cy="62" r="5" fill="var(--ds-bg-brand-solid)" />
  </svg>`

const GROUND = 'position:relative; height:640px; margin:var(--ds-spacing-md); border-radius:var(--ds-radius-surface); overflow:hidden; ' +
  "background:url('./stories/map-loading/parcels.webp') center / cover no-repeat, url('./stories/map-loading/base.webp') center / cover no-repeat;"

const RESULTS = [
  { label: 'Parcelles', items: [
    { value: 'FPH-SBR-008', label: 'FPH-SBR-008', meta: 'Koné Affoué · Lot 2023', badge: 'En alerte', badgeTone: 'error' as const },
    { value: 'FPH-SBR-004', label: 'FPH-SBR-004', meta: 'Konan Brou · Lot 2021', badge: 'Suivie', badgeTone: 'success' as const },
  ] },
  { label: 'Producteurs', items: [{ value: 'p-kone', label: 'Koné Affoué', meta: '2 parcelles', icon: 'user' as const }] },
  { label: 'Lieux', items: [{ value: 'l-konan-kro', label: 'Konan-Kro', meta: 'Nawa, Côte d’Ivoire', icon: 'map-pin' as const }] },
]

/* The whole column on a map, every tool with its card — the product's demo. */
const TOOLS_SCREEN = defineComponent({
  components: { MapNavigator, MapOverlay, MapPanel, MapSearch, MapFilters, MapFilterSection, MapFilterOption, Tag, Slider, ProjectGlyph, TolbiAiLauncher },
  props: { initialTool: { type: String, default: null }, sheetOpen: { type: Boolean, default: false } },
  setup(props) {
    const tool = ref<string | null>(props.initialTool)
    const zoom = ref(12)
    const query = ref('Kon')
    const layers = ref(false)
    const alerts = ref<Record<string, boolean>>({ Bloque: true, 'À surveiller': true, 'À revoir': false, 'Sans alerte': false })
    const lots = ref<string[]>(['2023'])
    const area = ref<[number, number]>([5, 18])
    const sheet = ref(props.sheetOpen)
    const results = computed(() => (query.value.trim() ? RESULTS : []))
    const active = computed(() => Object.values(alerts.value).filter(Boolean).length + (lots.value.length ? 1 : 0) + (area.value[0] > 0 || area.value[1] < 30 ? 1 : 0))
    const tools = computed(() => [
      { value: 'search', icon: 'search', label: 'Rechercher' },
      { value: 'filters', icon: 'filter', label: 'Filtres', badge: active.value },
      { value: 'layers', icon: 'layers', label: 'Couches', pressed: layers.value },
    ])
    const toggleLot = (y: string) => (lots.value = lots.value.includes(y) ? lots.value.filter((l) => l !== y) : [...lots.value, y])
    const clear = () => { alerts.value = { Bloque: false, 'À surveiller': false, 'À revoir': false, 'Sans alerte': false }; lots.value = []; area.value = [0, 30] }
    const colors: Record<string, string> = { Bloque: 'var(--ds-chart-status-critical)', 'À surveiller': 'var(--ds-chart-status-warning)', 'À revoir': 'var(--ds-chart-status-neutral)', 'Sans alerte': 'var(--ds-chart-categorical-1)' }
    const counts: Record<string, number> = { Bloque: 9, 'À surveiller': 4, 'À revoir': 2, 'Sans alerte': 13 }
    const choose = () => { sheet.value = true }
    return { tool, zoom, query, layers, alerts, lots, area, sheet, results, tools, toggleLot, clear, colors, counts, choose, minimap, GROUND }
  },
  template: `
    <div :style="GROUND">
      <MapOverlay position="end">
        <MapNavigator v-model:tool="tool" v-model:zoom="zoom" :tools="tools" @press="v => v === 'layers' && (layers = !layers)">
          <template #tool-search>
            <MapSearch v-model="query" :groups="results" @select="choose">
              <template #media="{ item }">
                <ProjectGlyph v-if="item.value.startsWith('FPH')" kind="parcel" :status="item.badgeTone === 'error' ? 'alert' : 'monitored'" :seed="item.value" :size="32" />
              </template>
            </MapSearch>
          </template>
          <template #tool-filters>
            <MapFilters :result-label="(4 + lots.length) + ' parcelles'" :clear-disabled="!tools[1].badge" @clear="clear">
              <MapFilterSection title="Alerte">
                <MapFilterOption v-for="(on, name) in alerts" :key="name" v-model="alerts[name]" :label="name" :color="colors[name]" :count="counts[name]" />
              </MapFilterSection>
              <MapFilterSection title="Lot">
                <div style="display:flex; flex-wrap:wrap; gap:var(--ds-spacing-xs)">
                  <Tag v-for="y in ['2021', '2022', '2023']" :key="y" :label="y" checkbox :checked="lots.includes(y)" @update:checked="toggleLot(y)" />
                </div>
              </MapFilterSection>
              <MapFilterSection title="Surface (ha)">
                <Slider v-model="area" :min="0" :max="30" value-display="bottom" />
              </MapFilterSection>
            </MapFilters>
          </template>
          <div v-html="minimap" style="width:100%;height:100%" />
        </MapNavigator>
        <MapPanel v-if="sheet" size="lg" title="FPH-SBR-008" closable @close="sheet = false">
          <p style="margin:0; font:var(--ds-font-body-md); color:var(--ds-text-default)">Koné Affoué · Lot 2023 · 18,5 ha</p>
        </MapPanel>
        <TolbiAiLauncher placement="map" :shortcut="false" />
      </MapOverlay>
    </div>`,
})

export const Default: Story = {
  name: 'La colonne d’outils',
  render: () => ({ components: { TOOLS_SCREEN }, template: '<TOOLS_SCREEN />' }),
}

/** « Rechercher » ouvert : le champ, puis les résultats groupés par type ; ↓ ↑ et Entrée au clavier. */
export const Search: Story = {
  name: 'Rechercher',
  render: () => ({ components: { TOOLS_SCREEN }, template: '<TOOLS_SCREEN initial-tool="search" />' }),
}

/** « Filtres » ouvert : des sections, appliquées en direct ; le compte sur l’entonnoir, « Effacer » et ce qui reste au pied. */
export const Filters: Story = {
  name: 'Filtres',
  render: () => ({ components: { TOOLS_SCREEN }, template: '<TOOLS_SCREEN initial-tool="filters" />' }),
}

/** La mini-carte est un outil : elle s’ouvre à gauche de la colonne, comme la recherche. */
export const Minimap: Story = {
  name: 'Mini-carte',
  render: () => ({ components: { TOOLS_SCREEN }, template: '<TOOLS_SCREEN initial-tool="minimap" />' }),
}

/**
 * Une fiche (`MapPanel lg closable`) se pose à gauche de la colonne, pleine hauteur ; la colonne et Tolbi xAI ne
 * bougent pas. Ouvrir une fiche ferme la carte d’outil ouverte : une seule chose à droite à la fois.
 */
export const WithSheet: Story = {
  name: 'Fiche ouverte',
  render: () => ({ components: { TOOLS_SCREEN }, template: '<TOOLS_SCREEN sheet-open />' }),
}

/* A map that moves as an engine does: a requested zoom is travelled over
   300ms, and the zoom it passes through is written back every frame —
   fractional, as `v-model:zoom` receives it from the product. */
export const FollowsTheMap: Story = {
  name: 'Suit une carte qui bouge',
  parameters: {
    docs: {
      description: {
        story:
          'Le produit passe le zoom de la carte **en continu** (13,62…) : la jauge montre toute valeur, sans arrondi. ' +
          'Molette, « Recentrer » : le curseur suit la carte image par image, sans transition. − / + et les flèches : ' +
          'le curseur glisse vers le niveau visé sur `duration-process` + `easing-in-out`, au rythme de la carte, ' +
          'sans être tiré en arrière par les valeurs qu’elle traverse. Glisser : le curseur reste sous le doigt. ' +
          'Rien ne glisse sous `prefers-reduced-motion`.',
      },
    },
  },
  render: () => ({
    components: { MapNavigator, MapOverlay },
    setup() {
      const zoom = ref(10)
      let raf = 0
      const fly = (to: number) => {
        cancelAnimationFrame(raf)
        const from = zoom.value
        const t0 = performance.now()
        const tick = (now: number) => {
          const t = Math.min(1, (now - t0) / 300)
          zoom.value = from + (to - from) * easing.inOut(t)
          if (t < 1) raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
      }
      const wheel = (e: WheelEvent) => {
        e.preventDefault()
        cancelAnimationFrame(raf)
        zoom.value = Math.min(20, Math.max(0, zoom.value - e.deltaY / 120))
      }
      const scale = () => 2 ** ((zoom.value - 10) / 2)
      return { zoom, fly, wheel, scale }
    },
    template: `
      <div @wheel="wheel" style="position:relative;height:420px;margin:var(--ds-spacing-md);background:var(--ds-bg-neutral);border-radius:12px;overflow:hidden">
        <svg viewBox="-100 -100 200 200" style="position:absolute;inset:0;width:100%;height:100%">
          <g :transform="'scale(' + scale() + ')'">
            <rect x="-60" y="-40" width="120" height="80" rx="6" fill="none" stroke="var(--ds-border-default)" stroke-dasharray="3 3" />
            <circle r="18" fill="none" stroke="var(--ds-bg-brand-solid)" />
            <rect x="-3" y="-3" width="6" height="6" rx="1.5" fill="var(--ds-bg-brand-solid)" />
          </g>
        </svg>
        <MapOverlay position="end">
          <MapNavigator :zoom="zoom" @update:zoom="fly" @recenter="fly(10)" />
        </MapOverlay>
        <span style="position:absolute;left:16px;bottom:12px;font:var(--ds-font-body-sm);color:var(--ds-text-subtle)">Zoom {{ zoom.toFixed(2) }}</span>
      </div>
    `,
  }),
}

/**
 * **Avant la carte** (ADR-0122) : tant que la carte n’existe pas, chaque commande est là et éteinte — la colonne garde
 * sa forme, rien ne bouge quand la carte arrive. Jamais après : une carte se zoome toujours.
 */
export const Disabled: Story = {
  name: 'Avant la carte',
  render: () => ({
    components: { MapNavigator, MapOverlay },
    setup: () => ({ GROUND, tools: [{ value: 'search', icon: 'search', label: 'Rechercher' }, { value: 'filters', icon: 'filter', label: 'Filtres' }] }),
    template: `
      <div :style="GROUND">
        <MapOverlay position="end"><MapNavigator disabled :tools="tools" /></MapOverlay>
      </div>
    `,
  }),
}
