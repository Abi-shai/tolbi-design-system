import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import MapPin from './MapPin.vue'

const meta: Meta<typeof MapPin> = {
  title: 'Données/Map/Pin',
  component: MapPin,
  tags: ['wip'],
  parameters: {
    docs: {
      description: {
        component:
          'L’endroit choisi sur une carte (ADR-0169, le « point forecast » de Google Weather Lab) : tout clic pose ' +
          'l’épingle, la fiche à droite (`MapPanel lg closable`) donne les données de l’endroit. Une goutte à l’encre de ' +
          'la marque, un rond blanc, un liseré blanc pour se détacher de toute imagerie, une ombre courte — des encres ' +
          'qui ne suivent pas le thème, comme la carte dessous. **Sa pointe est le point** : boîte 24 × 32, pointe au ' +
          'milieu du bord bas ; le produit l’ancre en bas au centre (`translate(-50%, -100%)`). Elle **tombe** à la pose ' +
          '(`enter`), **tombe de nouveau** ailleurs quand `at` change (pas de glissé), **s’efface** au retrait (`exit`) ; ' +
          'rien sous mouvement réduit. Décorative et sans pointeur : un clic à travers elle reste un clic sur la carte.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

/* The two grounds it must hold on: the TOLBI basemap and the parcels' imagery over it. */
const GROUND =
  'position:relative; height:360px; border-radius:var(--ds-radius-surface); overflow:hidden; cursor:crosshair; ' +
  "background: url('./stories/map-loading/parcels.webp') center / cover no-repeat, " +
  "url('./stories/map-loading/base.webp') center / cover no-repeat;"

/** Cliquer pose l’épingle ; cliquer ailleurs la repose ; Échap l’enlève. Sur le fond TOLBI comme sur l’imagerie des parcelles. */
export const Default: Story = {
  render: () => ({
    components: { MapPin },
    setup() {
      const pin = ref<{ x: number; y: number } | null>({ x: 160, y: 170 })
      const place = (e: MouseEvent) => {
        const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
        pin.value = { x: Math.round(e.clientX - r.left), y: Math.round(e.clientY - r.top) }
      }
      return { pin, place, GROUND }
    },
    template: `
      <div :style="GROUND" tabindex="0"
        @click="place" @keydown.esc="pin = null" data-ground>
        <div v-if="pin" :style="{ position: 'absolute', left: pin.x + 'px', top: pin.y + 'px', transform: 'translate(-50%, -100%)', zIndex: 2 }">
          <MapPin :at="pin.x + ',' + pin.y" />
        </div>
      </div>`,
  }),
}
