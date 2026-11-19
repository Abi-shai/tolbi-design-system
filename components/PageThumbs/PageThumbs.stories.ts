import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import { within, userEvent, expect } from '@storybook/test'
import PageThumbs from './PageThumbs.vue'
import { PAGE } from '../../stories/fixtures/report-files'

const meta: Meta<typeof PageThumbs> = {
  title: 'Navigation/PageThumbs',
  component: PageThumbs,
  /* wip: first release — the « Rapporter » view is its one consumer, not moved yet. */
  tags: ['wip'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Les pages d’un document en colonne de vignettes (ADR-0234) : une par page A4, la page à l’écran marquée, un ' +
          'clic y mène (`v-model`, à partir de 1). La vignette est au produit (`#page`, la page dessinée à 88px de ' +
          'large), dans le cadre de la vignette de fond de carte. La page à l’écran prend le traitement du fichier ' +
          'actif (`FileTile`) : le vert pâle enveloppe la vignette et son numéro, la vignette dans l’anneau de la ' +
          'marque. La colonne défile et garde la page à l’écran en vue.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

/** Six pages, la deuxième à l’écran ; la colonne prend la hauteur qu’on lui donne et défile. */
export const Default: Story = {
  name: 'Colonne',
  render: () => ({
    components: { PageThumbs },
    setup: () => ({ page: ref(2), PAGE }),
    template: `
      <div style="height:30rem;display:flex">
        <PageThumbs v-model="page" :count="6">
          <template #page="{ page: n }"><div style="width:100%;height:100%" v-html="PAGE(n)" /></template>
        </PageThumbs>
      </div>`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('navigation', { name: 'Pages' })).toBeTruthy()
    await expect(canvas.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page')
    await userEvent.click(canvas.getByRole('button', { name: 'Page 4' }))
    await expect(canvas.getByRole('button', { name: 'Page 4' })).toHaveAttribute('aria-current', 'page')
    await expect(canvas.getByRole('button', { name: 'Page 2' })).not.toHaveAttribute('aria-current')
  },
}
