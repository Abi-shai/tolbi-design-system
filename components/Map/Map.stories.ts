import type { Meta, StoryObj } from '@storybook/vue3'
import { computed, ref } from 'vue'
import MapOverlay from './MapOverlay.vue'
import MapPanel from './MapPanel.vue'
import MapControls from './MapControls.vue'
import MapNavigator from './MapNavigator.vue'
import MapTimeline from './MapTimeline.vue'
import MapLegend from './MapLegend.vue'
import MapTooltip from './MapTooltip.vue'
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
          '| `MapTooltip` | Ce que dit un clic sur un point : un petit dialogue que le moteur place |\n\n' +
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
 * bas), la **légende en haut** et la **frise en bas**, centrées sur un même axe de 480 px, le **navigateur en haut à
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
      return { GIS_MAP, tab, zoom, year, comparison, scale, years, metric, metrics, legendScale, point, rows, SCALES_LIST: [{ value: 'year', label: 'Année' }, { value: 'month', label: 'Mois' }, { value: 'day', label: 'Jour' }] }
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
        <MapOverlay position="top-end">
          <MapNavigator v-model:zoom="zoom">
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
