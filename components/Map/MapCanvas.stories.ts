import type { Meta, StoryObj } from '@storybook/vue3'
import { onBeforeUnmount, ref } from 'vue'
import MapCanvas, { type MapCanvasBasemap } from './MapCanvas.vue'
import MapOverlay from './MapOverlay.vue'
import MapNavigator from './MapNavigator.vue'
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
          '`idle` du moteur.',
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
