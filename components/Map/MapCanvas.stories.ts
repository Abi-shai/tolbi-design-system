import type { Meta, StoryObj } from '@storybook/vue3'
import { onBeforeUnmount, ref } from 'vue'
import MapCanvas, { type MapCanvasBasemap } from './MapCanvas.vue'
import MapOverlay from './MapOverlay.vue'
import MapNavigator from './MapNavigator.vue'
import MapHoverCard from './MapHoverCard.vue'
import { Button } from '../Button'

const meta: Meta<typeof MapCanvas> = {
  title: 'Données/Map/Canvas',
  component: MapCanvas,
  tags: ['wip'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'La **place de la carte** (ADR-0122) : le conteneur positionné où se posent les `MapOverlay`, et le sol qui tient ' +
          'la place du moteur tant que son fond n’est pas là. Le moteur est celui du produit (`#engine`, le conteneur ' +
          'Mapbox) — le système dessine l’attente autour, jamais le canevas.\n\n' +
          'Le sol est `--ds-map-land`, la terre du style TOLBI (23 produits sur 32 tiennent le canevas par un aplat, ' +
          'presque toujours la couleur de leur style). Le moteur reste **caché jusqu’à ce que son fond soit complet**, puis ' +
          'entre **d’un seul tenant**, en fondu sur `ambient` — au lieu de se peindre par carreaux. Un fond pas fini **2 s ' +
          'après `loading`** est montré quand même (`ceiling`). Rien ne fond sous `prefers-reduced-motion`.\n\n' +
          '`basemap` : `pending` avant que le style soit résolu, `loading` quand les tuiles sont en route, `ready` au ' +
          '`idle` du moteur.\n\n' +
          '**Le curseur dit ce que fait le geste** (ADR-0190) : la flèche sur la carte, la main pointée seulement au-dessus ' +
          'd’un objet (`overObject`, que le produit allume d’après son test de clic), la main fermée pendant un glisser. ' +
          'Jamais de curseur posé en ligne sur le canevas : il passerait devant celui du glisser.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof MapCanvas>

const ENGINE = `<div style="background:url('./stories/map-loading/base.webp') center/cover"></div>`

/** Le sol, puis le fond qui entre d’un seul tenant au `ready` ; « Rejouer » relance l’attente. */
export const Default: Story = {
  name: 'Le sol, puis le fond d’un seul tenant',
  render: () => ({
    components: { MapCanvas, MapOverlay, MapNavigator, Button },
    setup() {
      const basemap = ref<MapCanvasBasemap>('pending')
      let timers: ReturnType<typeof setTimeout>[] = []
      const play = () => {
        timers.forEach(clearTimeout)
        basemap.value = 'pending'
        timers = [setTimeout(() => { basemap.value = 'loading' }, 800), setTimeout(() => { basemap.value = 'ready' }, 1800)]
      }
      play()
      onBeforeUnmount(() => timers.forEach(clearTimeout))
      return { basemap, play }
    },
    template: `
      <div style="display:flex;flex-direction:column;gap:12px">
        <div style="display:flex;gap:12px;align-items:center">
          <Button label="Rejouer" variant="secondary-gray" size="sm" icon-leading="refresh-cw" @click="play" />
          <span style="font:var(--ds-font-label-md);color:var(--ds-text-subtle)">basemap : {{ basemap }}</span>
        </div>
        <MapCanvas :basemap="basemap" style="height:420px;border-radius:var(--ds-radius-surface)">
          <template #engine>${ENGINE}</template>
          <MapOverlay position="end"><MapNavigator :disabled="basemap === 'pending'" /></MapOverlay>
        </MapCanvas>
      </div>
    `,
  }),
}

/** Le plafond : un fond qui traîne est montré 2 s après `loading`, fini ou non — le fondu ne devient pas une seconde attente. */
export const Ceiling: Story = {
  name: 'Le plafond de 2 s',
  render: () => ({
    components: { MapCanvas },
    setup: () => ({ basemap: ref<MapCanvasBasemap>('loading') }),
    template: `
      <MapCanvas :basemap="basemap" style="height:420px;border-radius:var(--ds-radius-surface)">
        <template #engine>${ENGINE}</template>
      </MapCanvas>
    `,
  }),
}

/* Mapbox's own cursor rules, as its stylesheet ships them: the canvas would otherwise say « grab » everywhere. */
const MAPBOX_CURSOR = `<style>
  .mapboxgl-canvas-container.mapboxgl-interactive { cursor: grab; }
  .mapboxgl-canvas-container.mapboxgl-interactive:active { cursor: grabbing; }
</style>`

/**
 * Le curseur et la bulle : la flèche sur la carte, la main pointée au-dessus d’un point, la main fermée en
 * glissant ; la bulle (`MapHoverCard at`) se place d’elle-même à droite du pointeur, centrée sur lui, à gauche près
 * du bord droit — le produit ne donne que `event.point`.
 */
export const Cursor: Story = {
  name: 'Curseur et bulle de survol',
  render: () => ({
    components: { MapCanvas, MapHoverCard },
    setup() {
      const points = [
        { x: 140, y: 120, code: 'P-2041', meta: 'Koné Affoué · 18,5 ha' },
        { x: 420, y: 260, code: 'P-2042', meta: 'Diallo Awa · 6,2 ha' },
        { x: 860, y: 180, code: 'P-2043', meta: 'Traoré Ibrahim · 31,0 ha' },
      ]
      const at = ref<{ x: number; y: number } | null>(null)
      const over = ref<(typeof points)[number] | null>(null)
      function move(e: MouseEvent) {
        const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
        const p = { x: Math.round(e.clientX - r.left), y: Math.round(e.clientY - r.top) }
        over.value = points.find((q) => Math.hypot(q.x - p.x, q.y - p.y) <= 20) ?? null
        at.value = over.value ? p : null
      }
      function leave() {
        over.value = null
        at.value = null
      }
      return { points, at, over, move, leave, MAPBOX_CURSOR }
    },
    template: `
      <div>
        <div v-html="MAPBOX_CURSOR" />
        <MapCanvas :over-object="!!over" style="height:360px; width:960px; border-radius:var(--ds-radius-surface)">
          <template #engine>
            <div class="mapboxgl-canvas-container mapboxgl-interactive" data-engine
              style="position:relative; background:url('./stories/map-loading/base.webp') center/cover" @mousemove="move" @mouseleave="leave">
              <span v-for="p in points" :key="p.code" :style="{ position:'absolute', left: p.x - 16 + 'px', top: p.y - 16 + 'px', width:'32px', height:'32px', borderRadius:'50%', background:'var(--ds-chart-sequential-4)', boxShadow:'0 0 0 2px white, 0 0 0 3.4px var(--ds-color-gray-light-900)' }" />
            </div>
          </template>
          <MapHoverCard v-if="over && at" :at="at" :title="over.code" status="Éligible" status-tone="success" :meta="over.meta" value="412" unit="tCO2e" />
        </MapCanvas>
      </div>
    `,
  }),
}
