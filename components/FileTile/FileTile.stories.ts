import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import { within, userEvent, expect, fn } from '@storybook/test'
import FileTile from './FileTile.vue'
import { ModuleIcon } from '../ModuleIcon'
import { FILES, PREVIEWS } from '../../stories/fixtures/report-files'

const meta: Meta<typeof FileTile> = {
  title: 'Navigation/FileTile',
  component: FileTile,
  /* wip: first release — the « Rapporter » view is its one consumer, not moved yet. */
  tags: ['wip'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Un fichier choisi par son image (ADR-0234) : sa miniature (l’emplacement `#picture`, ou `src` ; le cadre de ' +
          'la vignette de fond de carte, 16/10), son nom, son format. **Toute la tuile choisit** le fichier affiché à ' +
          'côté ; le téléchargement est un `IconButton xs surface` sur l’image, au survol, au focus clavier, et toujours ' +
          'sur un écran tactile. Le fichier actif prend l’état choisi du sélecteur de fond de carte : la tuile sur ' +
          '`bg-brand-subtle`, levée ; l’image dans l’anneau de la marque ; le texte en `text-on-brand-subtle`.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

/** Les fichiers d’un rapport, en grille de deux colonnes : le rapport d’abord, actif. Sans image, le glyphe du format sur la plaque. */
export const Grid: Story = {
  name: 'Grille',
  args: { onSelect: fn(), onDownload: fn() } as never,
  render: (args) => ({
    components: { FileTile },
    setup: () => {
      const active = ref('report')
      return { args, active, FILES, PREVIEWS }
    },
    template: `
      <div style="max-width:28rem;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--ds-spacing-sm)">
        <FileTile
          v-for="f in FILES" :key="f.id"
          :name="f.name" :format="f.format" :icon="f.icon" :active="active === f.id"
          @select="active = f.id; args.onSelect(f.id)" @download="args.onDownload(f.id)"
        >
          <template v-if="f.preview" #picture><div style="width:100%;height:100%" v-html="PREVIEWS[f.preview]" /></template>
        </FileTile>
      </div>`,
  }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const report = canvas.getByRole('button', { name: /Rapport de suivi 2026/ })
    await expect(report).toHaveAttribute('aria-current', 'true')
    await userEvent.click(canvas.getByRole('button', { name: /Indicateurs par parcelle/ }))
    await expect(canvas.getByRole('button', { name: /Indicateurs par parcelle/ })).toHaveAttribute('aria-current', 'true')
    await expect(report).not.toHaveAttribute('aria-current')
    const downloads = canvas.getAllByRole('button', { name: 'Télécharger' })
    await expect(downloads).toHaveLength(FILES.length)
    await userEvent.click(downloads[1])
    await expect((args as unknown as { onDownload: ReturnType<typeof fn> }).onDownload).toHaveBeenCalledWith('parcels')
  },
}

/** Sans téléchargement : la tuile choisit, rien d’autre. */
export const NotDownloadable: Story = {
  name: 'Sans téléchargement',
  render: () => ({
    components: { FileTile },
    setup: () => ({ PREVIEWS }),
    template: `
      <div style="width:13rem">
        <FileTile name="Rapport de suivi 2026" format="Document · PDF" :downloadable="false">
          <template #picture><div style="width:100%;height:100%" v-html="PREVIEWS.doc" /></template>
        </FileTile>
      </div>`,
  }),
}

/**
 * En tête (ADR-0235, les cartes d’Obvious) : le glyphe du format et le nom sur une ligne, puis l’image, sur blanc quel
 * que soit le fichier ; rien dessous. Un document d’un organisme connu prend sa marque à la place du glyphe (`#glyph`,
 * à 20) — ici une marque de module pour l’exemple.
 */
export const Header: Story = {
  name: 'En tête',
  render: () => ({
    components: { FileTile, ModuleIcon },
    setup: () => ({ active: ref('report'), FILES, PREVIEWS }),
    template: `
      <div style="max-width:28rem;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--ds-spacing-sm)">
        <FileTile
          v-for="f in FILES" :key="f.id" layout="header"
          :name="f.name" :glyph="f.glyph" :active="active === f.id" @select="active = f.id"
        >
          <template v-if="f.preview" #picture><div style="width:100%;height:100%" v-html="PREVIEWS[f.preview]" /></template>
        </FileTile>
        <FileTile layout="header" name="Description de projet (PD)" :active="active === 'pd'" @select="active = 'pd'">
          <template #glyph><ModuleIcon module="Inset" variant="illustration" :size="20" :aria-label="null" /></template>
          <template #picture><div style="width:100%;height:100%" v-html="PREVIEWS.doc" /></template>
        </FileTile>
      </div>`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: /Zones exclues/ }))
    await expect(canvas.getByRole('button', { name: /Zones exclues/ })).toHaveAttribute('aria-current', 'true')
  },
}
