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
          'Le fond de carte choisi par son image (ADR-0221/0222). Le déclencheur est le fond actif, 28 px dans un cadre ' +
          'blanc de 2 px ; ouvert, l’anneau de la marque et un halo. Le panneau est le plateau de l’accueil, titré ' +
          '« Fond de carte » : sur sa surface blanche, une tuile de 7,5 rem par fond, l’image en 4:3 et son nom ; ' +
          'l’actif sur `bg-selected`, son image cerclée de `border-brand-solid`. Les images sont au produit.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

/** Ouvert : le plateau, le fond actif marqué ; les flèches déplacent le choix, un clic choisit et ferme. */
export const Open: Story = {
  name: 'Ouvert',
  render: () => ({
    components: { MapBasemapPicker },
    setup: () => ({ BASEMAPS, basemap: ref('tolbi') }),
    template: `
      <div style="display:flex; justify-content:flex-end; height:280px; padding:var(--ds-spacing-xl)">
        <MapBasemapPicker :basemaps="BASEMAPS" v-model="basemap" />
      </div>`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const page = within(document.body)
    const trigger = canvas.getByRole('button', { name: 'Fond de carte : TOLBI' })
    await userEvent.click(trigger)
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await expect(await page.findByRole('radio', { name: 'TOLBI' })).toHaveAttribute('aria-checked', 'true')
    await expect(page.getByRole('dialog', { name: 'Fond de carte' })).toBeTruthy()
    page.getByRole('radio', { name: 'TOLBI' }).focus()
    await userEvent.keyboard('{ArrowRight}')
    await expect(page.getByRole('radio', { name: 'Satellite' })).toHaveFocus()
    await expect(page.getByRole('radio', { name: 'Satellite' })).toHaveAttribute('aria-checked', 'true')
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await userEvent.click(page.getByRole('radio', { name: 'TOLBI' }))
    await userEvent.click(canvas.getByRole('button', { name: 'Fond de carte : TOLBI' }))
    await userEvent.click(await page.findByRole('radio', { name: 'Satellite' }))
    await expect(canvas.getByRole('button', { name: 'Fond de carte : Satellite' })).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(canvas.getByRole('button', { name: 'Fond de carte : Satellite' }))
  },
}
