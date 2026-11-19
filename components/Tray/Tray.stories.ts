import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import { within, expect } from '@storybook/test'
import Tray from './Tray.vue'
import { Button } from '../Button'
import { IconButton } from '../IconButton'
import { FileTile } from '../FileTile'
import { PageThumbs } from '../PageThumbs'
import { FILES, PREVIEWS, PAGE } from '../../stories/fixtures/report-files'

const meta: Meta<typeof Tray> = {
  title: 'Structure/Tray',
  component: Tray,
  tags: ['wip'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Le plateau (ADR-0198) : le fond gris qui **regroupe un bloc** — une seule surface blanche posée dessus, le ' +
          'contenu du bloc posé sur elle. C’était le cadre de `ProjectList` (ADR-0166) ; c’est un motif de regroupement, ' +
          'réservé à certains blocs pour distinguer un bloc d’un autre, et les deux listes de l’accueil le partagent ' +
          '(`ProjectList`, `ArticleList`). `bg-neutral` (ADR-0234), `spacing-md` autour, `radius-surface-lg` ; dedans ' +
          '`bg-default`, `spacing-md`, `radius-surface`. Un titre et sa pastille dans le gris (ADR-0205, 0234) ; ouvert en ' +
          'bas pour un bloc qui remplit l’écran (`bleed="bottom"`) ; un pied d’action (`#footer`), celui de `Dialog`.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: { Tray },
    template: `
      <Tray>
        <p style="margin:0;padding:var(--ds-spacing-md);font:var(--ds-font-body-md);color:var(--ds-text-default)">
          Ce que le bloc porte, posé sur la surface blanche.
        </p>
      </Tray>`,
  }),
}

/**
 * Avec son titre (ADR-0205, piste T1) : le titre dans le gris, au-dessus de la surface blanche, « Voir tout » au bout de
 * sa ligne — le gris porte le titre, le blanc le contenu. Le plateau devient une région nommée par le titre.
 */
export const Titled: Story = {
  name: 'Avec titre',
  render: () => ({
    components: { Tray, Button },
    template: `
      <Tray title="Derniers projets">
        <template #action><Button variant="link" size="sm" label="Voir tout" icon-trailing="arrow-right" /></template>
        <p style="margin:0;padding:var(--ds-spacing-md);font:var(--ds-font-body-md);color:var(--ds-text-default)">
          Ce que le bloc porte, posé sur la surface blanche.
        </p>
      </Tray>`,
  }),
}

/** Une pastille après le titre (ADR-0234) : un compte, un état — le `Badge sm` de `TrayCell`. */
export const WithBadge: Story = {
  name: 'Avec pastille',
  render: () => ({
    components: { Tray, Button },
    template: `
      <Tray title="Fichiers" badge="19">
        <template #action><Button variant="secondary-gray" size="sm" label="Tout télécharger" /></template>
        <p style="margin:0;padding:var(--ds-spacing-md);font:var(--ds-font-body-md);color:var(--ds-text-default)">
          Ce que le bloc porte, posé sur la surface blanche.
        </p>
      </Tray>`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('region', { name: 'Fichiers' })).toBeTruthy()
    await expect(canvas.getByText('19')).toBeTruthy()
  },
}

/**
 * La vue « Rapporter » (ADR-0234) : deux plateaux qui vont jusqu’au bord bas de la page (`bleed="bottom"` — coins
 * hauts seulement, ni filet ni rembourrage en bas, la surface blanche ouverte elle aussi). À gauche les fichiers en
 * `FileTile`, le pied « Soumettre comme dossier » sous un filet en retrait, la grille qui défile et s’efface au-dessus ;
 * à droite le document, sa colonne de pages (`PageThumbs`) et la feuille.
 */
export const Report: Story = {
  name: 'Rapporter',
  parameters: { layout: 'fullscreen' },
  render: () => ({
    components: { Tray, Button, IconButton, FileTile, PageThumbs },
    setup: () => ({ active: ref('report'), page: ref(1), files: [...FILES, ...FILES.slice(1, 4).map((x) => ({ ...x, id: x.id + '-2' }))], PREVIEWS, PAGE }),
    template: `
      <div style="box-sizing:border-box;height:40rem;display:grid;grid-template-columns:28rem minmax(0,1fr);gap:var(--ds-spacing-xl);padding:var(--ds-spacing-xl) var(--ds-spacing-xl) 0;background:var(--ds-bg-default)">
        <Tray title="Fichiers" :badge="String(files.length)" bleed="bottom">
          <template #action><Button variant="secondary-gray" size="sm" label="Tout télécharger" /></template>
          <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--ds-spacing-sm)">
            <FileTile v-for="f in files" :key="f.id" :name="f.name" :format="f.format" :icon="f.icon" :active="active === f.id" @select="active = f.id">
              <template v-if="f.preview" #picture><div style="width:100%;height:100%" v-html="PREVIEWS[f.preview]" /></template>
            </FileTile>
          </div>
          <template #footer><Button label="Soumettre comme dossier" /></template>
        </Tray>
        <Tray title="Rapport de suivi 2026" badge="Prêt" badge-tone="success" bleed="bottom">
          <template #action><IconButton icon="download" size="sm" ariaLabel="Télécharger le rapport" /></template>
          <div style="display:flex;flex:1;min-height:0">
            <PageThumbs v-model="page" :count="6">
              <template #page="{ page: n }"><div style="width:100%;height:100%" v-html="PAGE(n)" /></template>
            </PageThumbs>
            <div style="flex:1;min-width:0;padding:var(--ds-spacing-3xl) var(--ds-spacing-3xl) 0;overflow:hidden">
              <div style="max-width:40rem;height:60rem;margin:0 auto;border:1px solid var(--ds-border-subtle);border-bottom:0;border-radius:var(--ds-radius-inner) var(--ds-radius-inner) 0 0" v-html="PAGE(page)" />
            </div>
          </div>
        </Tray>
      </div>`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('region', { name: 'Fichiers' })).toBeTruthy()
    await expect(canvas.getByRole('button', { name: 'Soumettre comme dossier' })).toBeTruthy()
    await expect(canvas.getByRole('navigation', { name: 'Pages' })).toBeTruthy()
  },
}
