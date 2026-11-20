import type { Meta, StoryObj } from '@storybook/vue3'
import { computed, ref } from 'vue'
import { within, userEvent, expect, waitFor } from '@storybook/test'
import FileViewer from './FileViewer.vue'
import { Tray } from '../Tray'
import { FileTile } from '../FileTile'
import { IconButton } from '../IconButton'
import { Button } from '../Button'
import { FILES, PREVIEWS, PAGE } from '../../stories/fixtures/report-files'

const meta: Meta<typeof FileViewer> = {
  title: 'Données/FileViewer',
  component: FileViewer,
  /* wip: first release — the « Rapporter » view is its one consumer, not moved yet. */
  tags: ['wip'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'La visionneuse à côté d’une liste de fichiers (ADR-0235) : un document à la fois, et la **passation** d’un ' +
          'document à l’autre — le nouveau arrive en fondu et monte de 8px (`enter`, `easing-out`), l’ancien s’efface ' +
          '(`exit`, `easing-in`) : `SwapTransition rise`, clé `documentKey`. Pas de glissement latéral : les fichiers ' +
          'n’ont pas d’ordre. Un document paginé (`pages`) a sa colonne de `PageThumbs`, en fondu, qui arrive avec lui. ' +
          'Un document lourd arrive avec son cadre, son contenu résout dedans (`loading`) : une seule passation par geste.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

const SHOWN = [
  FILES[0],
  FILES[2],
  FILES[1],
  { id: 'pd', name: 'Description de projet (PD)', format: 'Document · Word', icon: 'file-text', preview: 'doc', glyph: 'doc' },
] as const

/**
 * La vue « Rapporter » : les fichiers en `FileTile` en tête à gauche, la visionneuse à droite. Le rapport est paginé
 * (sa colonne de pages) ; le tableau et les contours ne le sont pas ; la description de projet est lourde — son cadre
 * arrive tout de suite, son contenu une seconde après.
 */
export const Report: Story = {
  name: 'Rapporter',
  render: () => ({
    components: { FileViewer, Tray, FileTile, IconButton, Button },
    setup: () => {
      const active = ref<string>('report')
      const page = ref(1)
      const loading = ref(false)
      const shown = computed(() => SHOWN.find((f) => f.id === active.value)!)
      function choose(id: string) {
        if (id === active.value) return
        active.value = id
        page.value = 1
        if (id === 'pd') {
          loading.value = true
          setTimeout(() => (loading.value = false), 1000)
        } else loading.value = false
      }
      return { SHOWN, PREVIEWS, PAGE, active, page, loading, shown, choose }
    },
    template: `
      <div style="box-sizing:border-box;height:40rem;display:grid;grid-template-columns:26rem minmax(0,1fr);gap:var(--ds-spacing-xl);padding:var(--ds-spacing-xl) var(--ds-spacing-xl) 0;background:var(--ds-bg-default)">
        <Tray title="Fichiers" :badge="String(SHOWN.length)" bleed="bottom">
          <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--ds-spacing-sm)">
            <FileTile v-for="f in SHOWN" :key="f.id" layout="header" :name="f.name" :glyph="f.glyph" :active="active === f.id" @select="choose(f.id)">
              <template #picture><div style="width:100%;height:100%" v-html="PREVIEWS[f.preview]" /></template>
            </FileTile>
          </div>
          <template #footer><Button label="Soumettre comme dossier" /></template>
        </Tray>
        <Tray :title="shown.name" bleed="bottom">
          <template #action><IconButton icon="download" size="sm" ariaLabel="Télécharger" /></template>
          <FileViewer :document-key="active" :pages="active === 'report' ? 6 : undefined" v-model:page="page" :loading="loading">
            <template #page="{ page: n }"><div style="width:100%;height:100%" v-html="PAGE(n)" /></template>
            <div style="flex:1;min-height:0;overflow:hidden;padding:var(--ds-spacing-3xl) var(--ds-spacing-3xl) 0">
              <div style="max-width:40rem;height:60rem;margin:0 auto;border:1px solid var(--ds-border-subtle);border-bottom:0;border-radius:var(--ds-radius-inner) var(--ds-radius-inner) 0 0;overflow:hidden"
                v-html="active === 'report' ? PAGE(page) : PREVIEWS[shown.preview]" />
            </div>
            <template #loading>
              <div style="flex:1;padding:var(--ds-spacing-3xl) var(--ds-spacing-3xl) 0">
                <div style="max-width:40rem;height:60rem;margin:0 auto;border:1px solid var(--ds-border-subtle);border-bottom:0;border-radius:var(--ds-radius-inner) var(--ds-radius-inner) 0 0" />
              </div>
            </template>
          </FileViewer>
        </Tray>
      </div>`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('navigation', { name: 'Pages' })).toBeTruthy()
    await userEvent.click(canvas.getByRole('button', { name: /Indicateurs par parcelle/ }))
    await waitFor(() => expect(canvas.queryByRole('navigation', { name: 'Pages' })).toBeNull())
    await userEvent.click(canvas.getByRole('button', { name: /Rapport de suivi 2026/ }))
    await waitFor(() => expect(canvas.getByRole('navigation', { name: 'Pages' })).toBeTruthy())
  },
}
