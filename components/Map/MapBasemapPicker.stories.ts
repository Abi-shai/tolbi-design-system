import type { Meta, StoryObj } from '@storybook/vue3'
import { within, expect, userEvent } from '@storybook/test'
import { ref } from 'vue'
import MapBasemapPicker from './MapBasemapPicker.vue'

const BASEMAPS = [
  { value: 'tolbi', label: 'TOLBI', src: './stories/map-loading/base-thumb.webp' },
  { value: 'satellite', label: 'Satellite', src: './stories/map-loading/satellite.webp' },
]

const meta: Meta<typeof MapBasemapPicker> = {
  title: 'Données/Map/BasemapPicker',
  component: MapBasemapPicker,
  /* wip: first release, one consumer (MapTopBar). */
  tags: ['wip'],
  parameters: {
    docs: {
      description: {
        component:
          'Le fond de carte choisi par son image (ADR-0221). Le déclencheur est le fond actif, 28 px dans un cadre blanc ' +
          'de 2 px ; ouvert, l’anneau de la marque et un halo. Le panneau pose les fonds côte à côte, 72 px et leur ' +
          'nom ; l’actif sur `bg-selected`, son image cerclée de `border-brand-solid`. Les images sont au produit.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

/** Ouvert : le fond actif marqué ; un clic choisit et ferme. */
export const Open: Story = {
  name: 'Ouvert',
  render: () => ({
    components: { MapBasemapPicker },
    setup: () => ({ BASEMAPS, basemap: ref('tolbi') }),
    template: `
      <div style="display:flex; justify-content:flex-end; height:220px; padding:var(--ds-spacing-xl)">
        <MapBasemapPicker :basemaps="BASEMAPS" v-model="basemap" />
      </div>`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const page = within(document.body)
    const trigger = canvas.getByRole('button', { name: 'Fond de carte : TOLBI' })
    await userEvent.click(trigger)
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await expect(await page.findByRole('menuitemradio', { name: 'TOLBI' })).toHaveAttribute('aria-checked', 'true')
    await userEvent.click(page.getByRole('menuitemradio', { name: 'Satellite' }))
    await expect(canvas.getByRole('button', { name: 'Fond de carte : Satellite' })).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(canvas.getByRole('button', { name: 'Fond de carte : Satellite' }))
  },
}
