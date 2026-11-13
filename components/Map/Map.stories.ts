import type { Meta, StoryObj } from '@storybook/vue3'
import { computed, onBeforeUnmount, ref } from 'vue'
import MapOverlay from './MapOverlay.vue'
import MapPanel from './MapPanel.vue'
import MapControls from './MapControls.vue'
import MapNavigator from './MapNavigator.vue'
import MapTimeline from './MapTimeline.vue'
import MapLegend from './MapLegend.vue'
import MapTooltip from './MapTooltip.vue'
import MapHoverCard from './MapHoverCard.vue'
import MapPin from './MapPin.vue'
import { OptionList, OptionCard } from '../OptionCard'
import MapCanvas, { type MapCanvasBasemap } from './MapCanvas.vue'
import MapStatus, { type MapStatusState } from './MapStatus.vue'
import { SOUBRE_PARCELS, SOUBRE_SIZE } from './MapLoading.demo'
import { ButtonGroup, ButtonGroupItem } from '../ButtonGroup'
import { Tabs } from '../Tabs'
import { Button } from '../Button'
import { ChartLegend } from '../ChartLegend'
import { InputDropdown } from '../Dropdown'

const meta: Meta<typeof MapOverlay> = {
  title: 'Données/Map',
  component: MapOverlay,
  tags: ['wip'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '**La famille Carte (SIG)** — tout ce qui se pose sur une carte, au même endroit. Le moteur de carte ' +
          'reste celui du produit (ADR-0006) : le système fournit les instruments autour.\n\n' +
          '| Pièce | Ce qu’elle fait |\n|---|---|\n' +
          '| `MapOverlay` | Une place — un coin, le milieu du haut ou du bas, ou tout un bord (`start`, `end`) — à 16 px des bords |\n' +
          '| `MapPanel` | La surface d’un encart ; `lg` : le panneau d’où l’on lit l’écran, repliable en un contrôle |\n' +
          '| `MapControls` | La pile de boutons de la carte (couches, tracer…) |\n' +
          '| `MapNavigator` | La mini-carte, − la jauge de zoom + et recentrer ; replié en barre |\n' +
          '| `MapTimeline` | La frise du temps : année / mois / jour, comparer deux dates |\n' +
          '| `MapLegend` | La légende : l’indicateur affiché, son dégradé, ses bornes, les symboles |\n' +
          '| `MapTooltip` | Ce que dit un clic sur un point : un petit dialogue que le moteur place |\n' +
          '| `MapHoverCard` | Ce que le pointeur survole : une petite carte, non interactive, que le moteur place |\n' +
          '| `MapPin` | L’endroit cliqué : une épingle, sa pointe sur le point, décorative |\n\n' +
          'Voir l’histoire « Écran SIG — toutes les pièces » pour les voir ensemble.\n\n' +
          'Ce qui se pose sur une carte (ADR-0087), d’après le dessin du propriétaire (« Tester la conformité ») : ' +
          '`MapOverlay` est une place — six, les quatre coins et le milieu du haut et du bas — à 16 px des bords, qui empile ' +
          'ce qu’elle tient vers le centre, 8 px d’écart ; `MapPanel` est la surface (bg-default, border-subtle, ' +
          'elevation-raised, radius-surface-sm, 12 px dedans), repliable en un bouton ; `MapControls` est la pile de boutons ' +
          '— `Button` icône seule de 36 px, infobulle à gauche, un outil actif enfoncé. La légende est `ChartLegend` en ' +
          'liste (`orientation="vertical"`). Le conteneur de la carte doit être positionné.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

/* A stand-in for imagery: the story has no tiles to load. */
const MAP = 'position:relative; height:560px; margin:var(--ds-spacing-2xl); overflow:hidden; border-radius:var(--ds-radius-surface); background:' +
  'repeating-linear-gradient(35deg, transparent 0 46px, color-mix(in srgb, var(--ds-bg-success-solid) 10%, transparent) 46px 92px),' +
  'repeating-linear-gradient(-55deg, transparent 0 60px, color-mix(in srgb, var(--ds-border-default) 40%, transparent) 60px 120px),' +
  'var(--ds-bg-neutral);'

/* The retained frames' map: 1424 × 828 inside a 1440 page. */
/* The product's tools, as Carbone's column has them (ADR-0171). */
const TOOLS = [
  { value: 'search', icon: 'search' as const, label: 'Rechercher' },
  { value: 'filters', icon: 'filter' as const, label: 'Filtres' },
  { value: 'layers', icon: 'layers' as const, label: 'Couches' },
]

const GIS_MAP = MAP.replace('height:560px', 'height:828px').replace('margin:var(--ds-spacing-2xl)', 'margin:var(--ds-spacing-md)')

/** Le dessin : la consigne et l’année en haut à gauche, les contrôles en haut à droite, la barre d’outils en bas à droite, la légende en bas à gauche. */
export const OnAMap: Story = {
  name: 'Sur la carte',
  render: () => ({
    components: { MapOverlay, MapPanel, MapControls, Button, ChartLegend, InputDropdown },
    setup() {
      const drawing = ref(true)
      const zoom = ref(14)
      const year = ref('2025')
      const last = ref('—')
      const controls = computed(() => [
        { key: 'zoom-in', icon: 'plus', label: 'Zoomer', disabled: zoom.value >= 18 },
        { key: 'zoom-out', icon: 'minus', label: 'Dézoomer', disabled: zoom.value <= 3 },
        { key: 'draw', icon: 'pencil', label: 'Tracer une parcelle', pressed: drawing.value },
        { key: 'layers', icon: 'layers', label: 'Couches' },
      ])
      function act(key: string) {
        last.value = key
        if (key === 'zoom-in') zoom.value++
        if (key === 'zoom-out') zoom.value--
        if (key === 'draw') drawing.value = !drawing.value
      }
      const legend = [
        { key: 'ok', label: 'Conforme', color: 'var(--ds-bg-success-solid)', value: '61' },
        { key: 'check', label: 'À vérifier', color: 'var(--ds-bg-warning-solid)', value: '12' },
        { key: 'ko', label: 'Non conforme', color: 'var(--ds-bg-error-solid)', value: '26' },
      ]
      const years = ['2023', '2024', '2025'].map(y => ({ value: y, label: 'Campagne ' + y }))
      return { MAP, controls, act, legend, years, year, zoom, last }
    },
    template: `
      <div :style="MAP">
        <MapOverlay position="top-start">
          <MapPanel>
            <p style="margin:0; max-width:18rem; font:var(--ds-font-body-md); color:var(--ds-text-default)">Cliquez sur la carte pour poser le premier sommet de la parcelle.</p>
            <p style="margin:0; font:var(--ds-font-label-md); color:var(--ds-text-subtle)">3 parcelles · 10,7 ha</p>
          </MapPanel>
          <div style="width:13rem"><InputDropdown v-model="year" :options="years" size="sm" aria-label="Campagne" /></div>
        </MapOverlay>
        <MapOverlay position="top-end">
          <MapControls :controls="controls" @action="act" />
        </MapOverlay>
        <MapOverlay position="bottom-end">
          <MapPanel>
            <div style="display:flex; gap:var(--ds-spacing-md)">
              <Button label="Annuler le point" variant="secondary-gray" size="sm" icon-leading="undo-2" />
              <Button label="Terminer la parcelle" size="sm" />
            </div>
          </MapPanel>
        </MapOverlay>
        <MapOverlay position="bottom-start">
          <MapPanel title="Conformité EUDR" collapsible>
            <ChartLegend :items="legend" orientation="vertical" />
          </MapPanel>
        </MapOverlay>
        <MapOverlay position="bottom">
          <span style="font:var(--ds-font-label-md); color:var(--ds-text-subtle); background:var(--ds-bg-default); padding:var(--ds-spacing-xs) var(--ds-spacing-md); border-radius:var(--ds-radius-pill)">zoom {{ zoom }} · dernier : {{ last }}</span>
        </MapOverlay>
      </div>
    `,
  }),
}

/**
 * L’écran SIG, placé comme les cadres retenus de l’ARR (Figma section 15, carte de 1424 × 828) — ADR-0103 :
 * le panneau de lecture sur **tout le bord gauche** (`MapOverlay position="start"`, 400 px, 16 px du haut et du
 * bas), la **légende en haut** et la **frise en bas**, centrées sur un même axe de 560 px, le **navigateur en haut à
 * droite**. Un point ouvre sa bulle. Chaque pièce est vivante ; le fond tient lieu d’imagerie.
 */
export const GisScreen: Story = {
  name: 'Écran SIG — toutes les pièces',
  render: () => ({
    components: { MapOverlay, MapPanel, MapNavigator, MapTimeline, MapLegend, MapTooltip, Tabs, Button },
    setup() {
      const tab = ref('data')
      const zoom = ref(9)
      const year = ref('2026')
      const comparison = ref<string | null>(null)
      const scale = ref('year')
      const years = Array.from({ length: 10 }, (_, i) => String(2017 + i)).map(y => ({ value: y, label: y }))
      const metric = ref('carbon')
      const SCALES: Record<string, { title: string; unit: string; ticks: string[] }> = {
        carbon: { title: 'Carbone', unit: 'CO2e/ha', ticks: ['0 t', '8 t', '16 t'] },
        biomass: { title: 'Biomasse', unit: 't/ha', ticks: ['0', '60', '120'] },
        cover: { title: 'Couvert', unit: '%', ticks: ['0', '50', '100'] },
        height: { title: 'Hauteur', unit: 'm', ticks: ['0', '15', '30'] },
      }
      const metrics = [{ value: 'carbon', label: 'Carbone' }, { value: 'biomass', label: 'Biomasse' }, { value: 'cover', label: 'Couvert' }, { value: 'height', label: 'Hauteur' }]
      const legendScale = computed(() => SCALES[metric.value])
      const point = ref(false)
      const rows = [
        { label: 'Faible', value: '0,083', color: 'var(--ds-chart-sequential-1)' },
        { label: 'Moyen', value: '0,232', color: 'var(--ds-chart-sequential-3)' },
        { label: 'Fort', value: '0,353', color: 'var(--ds-chart-sequential-5)' },
      ]
      return { GIS_MAP, TOOLS, tab, zoom, year, comparison, scale, years, metric, metrics, legendScale, point, rows, SCALES_LIST: [{ value: 'year', label: 'Année' }, { value: 'month', label: 'Mois' }, { value: 'day', label: 'Jour' }] }
    },
    template: `
      <div :style="GIS_MAP">
        <MapOverlay position="start">
          <MapPanel size="lg" title="Baseline" collapsible expand-label="Afficher le panneau">
            <template #header>
              <Tabs v-model="tab" size="sm" :tabs="[{ value: 'data', label: 'Données' }, { value: 'plots', label: 'Parcelles' }]" />
            </template>
            <p style="margin:0; font:var(--ds-font-heading-xl); color:var(--ds-text-strong)">+3 120 <span style="font:var(--ds-font-body-sm); color:var(--ds-text-subtle)">tCO2e</span></p>
            <p style="margin:0; font:var(--ds-font-body-md); color:var(--ds-text-default)">Le panneau d’où l’on lit l’écran : tout le bord gauche, 400 px ; sa tête et son pied restent, son corps défile.</p>
            <template #footer>
              <Button label="Voir toutes les données" variant="secondary-gray" size="sm" />
            </template>
          </MapPanel>
        </MapOverlay>
        <MapOverlay position="top">
          <MapLegend v-model:metric="metric" :metrics="metrics" :title="legendScale.title" :unit="legendScale.unit" :ticks="legendScale.ticks" />
        </MapOverlay>
        <MapOverlay position="end">
          <MapNavigator v-model:zoom="zoom" :tools="TOOLS">
            <svg viewBox="0 0 148 96" style="display:block;width:100%;height:100%;background:var(--ds-bg-neutral-subtle)">
              <circle cx="74" cy="48" r="40" fill="none" stroke="var(--ds-bg-brand-solid)" stroke-dasharray="3 3" />
              <rect x="29" y="3" width="91" height="91" rx="3" fill="none" stroke="var(--ds-text-strong)" stroke-width="1.2" />
            </svg>
          </MapNavigator>
        </MapOverlay>
        <MapOverlay position="bottom">
          <MapTimeline v-model="year" v-model:scale="scale" v-model:comparison="comparison" :scales="SCALES_LIST" :periods="years" label="Année" compare />
        </MapOverlay>
        <button type="button" aria-label="Point du projet P-17" :aria-expanded="point" @click="point = !point"
          style="position:absolute; left:62%; top:46%; width:14px; height:14px; padding:0; border:2px solid var(--ds-bg-default); border-radius:3px; background:var(--ds-bg-brand-solid); cursor:pointer"></button>
        <div v-if="point" style="position:absolute; left:calc(62% + 22px); top:calc(46% - 12px)">
          <MapTooltip title="Point du projet P-17" description="Ses points de contrôle, du plus proche au plus éloigné" :rows="rows" @close="point = false" />
        </div>
      </div>
    `,
  }),
}

/*
  Selecting an object, Weather Lab's way (ADR-0168): the pointer over a parcel
  shows its card beside it and underlines its row in the panel's list; a row
  hovered lights the parcel back; a click opens its sheet at the end, which
  arrives from its edge. Every click sets a pin where it landed (ADR-0169) —
  on a parcel, its sheet; elsewhere, the place's. The legend and the timeline
  stay centred on the whole map — nothing on the map moves when a panel opens,
  folds or closes.
*/
const PARCELS = [
  { id: 'P-2041', owner: 'Koné Affoué', area: '18,5 ha', carbon: '412', status: 'Éligible', tone: 'success' as const, left: '46%', top: '38%' },
  { id: 'P-2042', owner: 'Yao Kouassi', area: '7,2 ha', carbon: '96', status: 'À revoir', tone: 'warning' as const, left: '58%', top: '54%' },
  { id: 'P-2047', owner: 'Bamba Mariam', area: '12,0 ha', carbon: '238', status: 'Éligible', tone: 'success' as const, left: '66%', top: '30%' },
]

/** ADR-0168 — sélectionner un objet : survol (carte résumé + ligne soulignée), clic (l’épingle se pose, la fiche entre de son bord — d’une parcelle ou d’un simple lieu) ; la légende et la frise restent centrées sur la carte. */
export const Selection: Story = {
  name: 'Sélection d’un objet',
  render: () => ({
    components: { MapOverlay, MapPanel, MapTimeline, MapLegend, MapHoverCard, MapPin, MapNavigator, OptionList, OptionCard },
    setup() {
      const hovered = ref<string | null>(null)
      const chosen = ref<string | null>(null)
      const year = ref('2026')
      const years = Array.from({ length: 6 }, (_, i) => String(2021 + i)).map(y => ({ value: y, label: y }))
      const current = computed(() => PARCELS.find(p => p.id === hovered.value) ?? null)
      const sheet = computed(() => PARCELS.find(p => p.id === chosen.value) ?? null)
      /* Every click sets the pin where it landed (ADR-0169): on a parcel, its sheet; elsewhere, the place's. */
      const pin = ref<{ x: number; y: number } | null>(null)
      const at = (e: MouseEvent) => {
        const map = (e.currentTarget as HTMLElement).closest('[data-map]')!.getBoundingClientRect()
        return { x: Math.round(e.clientX - map.left), y: Math.round(e.clientY - map.top) }
      }
      const onMap = (e: MouseEvent) => { if (e.target !== e.currentTarget) return; pin.value = at(e); chosen.value = null }
      const onParcel = (id: string, e: MouseEvent) => { pin.value = at(e); chosen.value = id }
      const close = () => { pin.value = null; chosen.value = null }
      const choose = (id: string | null) => { chosen.value = id; pin.value = null }
      const zoom = ref(12)
      return { GIS_MAP, TOOLS, PARCELS, hovered, chosen, year, years, current, sheet, pin, onMap, onParcel, close, choose, zoom }
    },
    template: `
      <div :style="GIS_MAP" data-map @click="onMap">
        <MapOverlay position="start">
          <MapPanel size="lg" title="Parcelles">
            <OptionList :model-value="chosen" :highlighted="hovered" aria-label="Parcelles" @update:model-value="choose" @hover="hovered = $event">
              <OptionCard v-for="p in PARCELS" :key="p.id" :value="p.id" density="row" icon="land-plot" :label="p.id" :meta="p.area" :badge="p.status" :badge-tone="p.tone" />
            </OptionList>
          </MapPanel>
        </MapOverlay>
        <MapOverlay position="top">
          <MapLegend title="Carbone" unit="CO2e/ha" :ticks="['0 t', '8 t', '16 t']" />
        </MapOverlay>
        <MapOverlay position="bottom">
          <MapTimeline v-model="year" :periods="years" label="Année" />
        </MapOverlay>
        <MapOverlay position="end">
          <!-- As in Carbone: the navigator, then the sheet under it — it stays at the edge (ADR-0170). -->
          <MapNavigator v-model:zoom="zoom" :tools="TOOLS" />
          <MapPanel v-if="sheet" :key="sheet.id" size="lg" :title="sheet.id" closable @close="close">
            <p style="margin:0; font:var(--ds-font-body-md); color:var(--ds-text-default)">{{ sheet.owner }} · {{ sheet.area }}</p>
            <p style="margin:0; font:var(--ds-font-heading-xl); color:var(--ds-text-strong)">{{ sheet.carbon }} <span style="font:var(--ds-font-body-sm); color:var(--ds-text-subtle)">tCO2e</span></p>
          </MapPanel>
          <MapPanel v-else-if="pin" :key="'place-' + pin.x + ',' + pin.y" size="lg" title="Lieu" closable @close="close">
            <p style="margin:0; font:var(--ds-font-body-md); color:var(--ds-text-default)">6,07° N · 6,61° O — hors des parcelles</p>
            <p style="margin:0; font:var(--ds-font-heading-xl); color:var(--ds-text-strong)">4,2 <span style="font:var(--ds-font-body-sm); color:var(--ds-text-subtle)">tCO2e/ha</span></p>
          </MapPanel>
        </MapOverlay>
        <button v-for="p in PARCELS" :key="p.id" type="button" :aria-label="'Parcelle ' + p.id" :data-parcel="p.id"
          @mouseenter="hovered = p.id" @mouseleave="hovered = null" @click="onParcel(p.id, $event)"
          :style="{ position: 'absolute', left: p.left, top: p.top, width: '72px', height: '52px', padding: 0, cursor: 'pointer', borderRadius: '6px',
            border: '2px solid ' + (hovered === p.id || chosen === p.id ? 'var(--ds-border-brand)' : 'var(--ds-bg-default)'),
            background: 'color-mix(in srgb, var(--ds-bg-success-solid) 35%, transparent)' }"></button>
        <div v-if="pin" :style="{ position: 'absolute', left: pin.x + 'px', top: pin.y + 'px', transform: 'translate(-50%, -100%)', zIndex: 2 }">
          <MapPin :at="pin.x + ',' + pin.y" />
        </div>
        <div v-if="current" :style="{ position: 'absolute', left: 'calc(' + current.left + ' + 84px)', top: current.top, zIndex: 2 }">
          <MapHoverCard :title="current.id" :status="current.status" :status-tone="current.tone" :meta="current.owner + ' · ' + current.area" :value="current.carbon" unit="tCO2e" />
        </div>
      </div>
    `,
  }),
}

/* ── Loading (ADR-0122) ─────────────────────────────────────────────────
   The engine is the product's; here an SVG stands in for it — the TOLBI
   basemap of the owner's frame (© Mapbox © OpenStreetMap) and its 89
   parcels, each an outline in `--ds-map-pending` until its image arrives. */
const ASSETS = './stories/map-loading'
const ENGINE = {
  components: {},
  props: { arrived: { type: Array, default: () => [] }, outlines: { type: Boolean, default: true } },
  setup: () => ({ PARCELS: SOUBRE_PARCELS, W: SOUBRE_SIZE.width, H: SOUBRE_SIZE.height, ASSETS }),
  template: `
    <svg :viewBox="'0 0 ' + W + ' ' + H" preserveAspectRatio="xMidYMid slice" style="display:block">
      <defs><clipPath v-for="(p, i) in PARCELS" :id="'soubre-' + i" :key="i"><polygon :points="p" /></clipPath></defs>
      <image :href="ASSETS + '/base.webp'" :width="W" :height="H" />
      <g v-for="(p, i) in PARCELS" :key="i">
        <polygon v-if="outlines" :points="p" fill="none" stroke="var(--ds-map-pending)" stroke-width="1.5" stroke-dasharray="3 2.25" vector-effect="non-scaling-stroke"
          :style="{ opacity: arrived.includes(i) ? 0 : 1, transition: 'opacity var(--ds-motion-duration-enter) var(--ds-motion-easing-out)' }" />
        <image :href="ASSETS + '/parcels.webp'" :width="W" :height="H" :clip-path="'url(#soubre-' + i + ')'"
          :style="{ opacity: arrived.includes(i) ? 1 : 0, transition: 'opacity var(--ds-motion-duration-enter) var(--ds-motion-easing-out)' }" />
      </g>
    </svg>`,
}

const LOADING_SCREEN = `
  <MapCanvas :basemap="basemap" style="height:828px; margin:var(--ds-spacing-md); border-radius:var(--ds-radius-surface)">
    <template #engine><MapEngine :arrived="arrived" :outlines="outlines" /></template>
    <MapOverlay position="start">
      <MapPanel size="lg" title="Suivi" :loading="!data">
        <template #header>
          <Tabs v-model="tab" size="sm" :tabs="[{ value: 'data', label: 'Données' }, { value: 'plots', label: 'Parcelles' }]" />
        </template>
        <p style="margin:0; font:var(--ds-font-heading-xl); color:var(--ds-text-strong)">{{ empty ? '—' : '+3 120' }} <span v-if="!empty" style="font:var(--ds-font-body-sm); color:var(--ds-text-subtle)">tCO2e</span></p>
        <p style="margin:0; font:var(--ds-font-body-md); color:var(--ds-text-default)">Le carbone gagné sur les 89 parcelles du projet, face à la baseline.</p>
        <template #footer>
          <Button label="Voir toutes les données" variant="secondary-gray" size="sm" />
        </template>
      </MapPanel>
    </MapOverlay>
    <MapOverlay position="top">
      <MapLegend v-model:metric="metric" :metrics="metrics" title="Carbone" unit="CO2e/ha" :ticks="empty ? [] : ['0 t', '8 t', '16 t']" :loading="!data" />
    </MapOverlay>
    <MapOverlay position="end">
      <MapNavigator v-model:zoom="zoom" :disabled="basemap === 'pending'" />
    </MapOverlay>
    <MapOverlay position="bottom">
      <MapTimeline v-if="!empty" v-model="year" :periods="years" label="Année" :loading="!data" compare />
      <MapStatus :state="status" :label="statusLabel" :loaded="arrived.length" :total="89" :action-label="actionLabel" />
    </MapOverlay>
  </MapCanvas>`

const LOADING_PIECES = { MapCanvas, MapOverlay, MapPanel, MapNavigator, MapTimeline, MapLegend, MapStatus, Tabs, Button, ButtonGroup, ButtonGroupItem, MapEngine: ENGINE }

const shuffled = () => { let seed = 7; const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647); return SOUBRE_PARCELS.map((_, i) => i).sort(() => r() - 0.5) }

/**
 * Du clic à une carte lisible, sur un seul écran qui se remplit (ADR-0122, piste C) — les temps du produit, rejoués :
 * le projet est lu (0,8 s), ses données (1,2 s), le style se résout (0,6 s), le fond arrive (1,2 s) puis entre **en
 * fondu d’un seul tenant** (`MapCanvas`, `ambient`), et les 89 parcelles passent du contour en tirets à leur image, que
 * `MapStatus` compte. Rien ne remplace la carte ; à la fin, la pastille part.
 */
export const Loading: Story = {
  name: 'Chargement — du clic à la carte',
  render: () => ({
    components: LOADING_PIECES,
    setup() {
      const tab = ref('data'); const zoom = ref(11); const year = ref('2026'); const metric = ref('carbon')
      const metrics = [{ value: 'carbon', label: 'Carbone' }, { value: 'biomass', label: 'Biomasse' }, { value: 'cover', label: 'Couvert' }, { value: 'height', label: 'Hauteur' }]
      const years = ['2020', '2021', '2022', '2023', '2024', '2025', '2026'].map(y => ({ value: y, label: y }))
      const data = ref(false); const basemap = ref<MapCanvasBasemap>('pending'); const arrived = ref<number[]>([])
      const status = ref<MapStatusState | null>(null)
      let timers: ReturnType<typeof setTimeout>[] = []
      const at = (ms: number, f: () => void) => timers.push(setTimeout(f, ms))
      function play() {
        timers.forEach(clearTimeout); timers = []
        data.value = false; basemap.value = 'pending'; arrived.value = []; status.value = null
        at(2000, () => { data.value = true })
        at(2600, () => { basemap.value = 'loading' })
        at(3800, () => { basemap.value = 'ready' })
        const order = shuffled()
        order.forEach((p, k) => at(4300 + k * 36, () => { if (k === 0) status.value = 'loading'; arrived.value = [...arrived.value, p] }))
        at(4300 + order.length * 36 + 300, () => { status.value = null })
      }
      play()
      onBeforeUnmount(() => timers.forEach(clearTimeout))
      return { tab, zoom, year, metric, metrics, years, data, basemap, arrived, status, play, empty: false, outlines: true, statusLabel: 'Images des parcelles', actionLabel: undefined }
    },
    template: `
      <div>
        <div style="display:flex; gap:var(--ds-spacing-md); align-items:center; margin:var(--ds-spacing-md) var(--ds-spacing-md) 0">
          <Button label="Rejouer" variant="secondary-gray" size="sm" icon-leading="refresh-cw" @click="play" />
          <span style="font:var(--ds-font-label-md); color:var(--ds-text-subtle)">fond : {{ basemap }} · données : {{ data ? 'lues' : 'en cours' }} · images : {{ arrived.length }} / 89</span>
        </div>
        ${LOADING_SCREEN}
      </div>
    `,
  }),
}

/**
 * Les quatre états, chacun **sur la carte et non à sa place** (ADR-0122) : la pastille de `MapStatus` au-dessus de la
 * frise, son glyphe et son encre choisis par l’état. Le chargement des couches (la pastille qui compte), données partielles (les 12 parcelles sans image gardent leur contour), rien à montrer (un projet en calcul : les
 * valeurs en « — », pas de frise), échec (le fond reste, l’action est sur la pastille). Le repli au satellite n’est pas
 * un état : il reste silencieux (ADR-0124).
 */
export const LoadingStates: Story = {
  name: 'Chargement — les quatre états',
  render: () => ({
    components: LOADING_PIECES,
    setup() {
      const tab = ref('data'); const zoom = ref(11); const year = ref('2026'); const metric = ref('carbon')
      const metrics = [{ value: 'carbon', label: 'Carbone' }, { value: 'biomass', label: 'Biomasse' }, { value: 'cover', label: 'Couvert' }, { value: 'height', label: 'Hauteur' }]
      const years = ['2020', '2021', '2022', '2023', '2024', '2025', '2026'].map(y => ({ value: y, label: y }))
      const which = ref<'loading' | 'partial' | 'empty' | 'failed'>('loading')
      const all = SOUBRE_PARCELS.map((_, i) => i)
      const missing = shuffled().slice(0, 12)
      const arrived = computed(() => which.value === 'partial' ? all.filter(i => !missing.includes(i)) : which.value === 'loading' ? shuffled().slice(0, 33) : [])
      const COPY = {
        loading: { label: 'Images des parcelles', action: undefined },
        partial: { label: '12 parcelles sur 89 sans image', action: 'Voir lesquelles' },
        empty: { label: 'Pas encore de mesure : le premier calcul est en cours', action: undefined },
        failed: { label: 'Les mesures n’ont pas pu être lues', action: 'Réessayer' },
      }
      return {
        tab, zoom, year, metric, metrics, years, which, arrived,
        data: true, basemap: 'ready',
        status: computed(() => which.value),
        statusLabel: computed(() => COPY[which.value].label),
        actionLabel: computed(() => COPY[which.value].action),
        empty: computed(() => which.value === 'empty' || which.value === 'failed'),
        outlines: computed(() => which.value !== 'failed'),
      }
    },
    template: `
      <div>
        <div style="margin:var(--ds-spacing-md) var(--ds-spacing-md) 0">
          <ButtonGroup v-model="which" size="sm" aria-label="État">
            <ButtonGroupItem value="loading" label="Couches en cours" />
            <ButtonGroupItem value="partial" label="Données partielles" />
            <ButtonGroupItem value="empty" label="Rien à montrer" />
            <ButtonGroupItem value="failed" label="Échec" />
          </ButtonGroup>
        </div>
        ${LOADING_SCREEN}
      </div>
    `,
  }),
}
