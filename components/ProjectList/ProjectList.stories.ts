import type { Meta, StoryObj } from '@storybook/vue3'
import { within, expect, userEvent, fn } from '@storybook/test'
import ProjectList from './ProjectList.vue'
import type { ProjectListItem } from './ProjectList.vue'

const RECENT: ProjectListItem[] = [
  { id: 'y-412', title: 'Rendement arachide Nord', href: '#y-412', module: 'Yield', glyph: { status: 'running' }, date: '12 nov.' },
  { id: 's-88', title: 'Cacao Soubré — campagne 2026', href: '#s-88', module: 'Scan', glyph: { status: 'done' }, date: '9 nov.' },
  { id: 'y-demo', title: 'Maïs Kaffrine', href: '#y-demo', module: 'Yield', glyph: { status: 'done' }, date: '3 nov.', badge: 'Projet démo' },
  { id: 's-71', title: 'Anacarde Korhogo', href: '#s-71', module: 'Scan', glyph: { status: 'failed' }, date: '28 oct.' },
  { id: 'y-390', title: 'Mil et sorgho — coopérative de Kolda, parcelles irriguées', href: '#y-390', module: 'Yield', date: '20 juin', badge: 'Projet démo' },
  { id: 's-12', title: 'Hévéa Gagnoa', href: '#s-12', module: 'Scan', glyph: { status: 'done' }, date: '14 déc. 2025' },
]

const meta: Meta<typeof ProjectList> = {
  title: 'Données/ProjectList',
  component: ProjectList,
  /* wip: first release — the home page is its one consumer, and it was recomposed by hand until now. */
  tags: ['wip'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Les derniers projets, une ligne chacun (ADR-0166) — l’accueil d’etolbi, sur le modèle du widget Drive : le ' +
          'dessin du projet (`ProjectGlyph`, qui porte le statut), le nom (et un badge « Projet démo »), la date à ' +
          'droite, le module dessous. Pas de chiffres : ce sont ceux de `ProjectCard`, dans la liste du module. ' +
          'Chaque ligne est un lien (`href`) qui émet `select(item, event)` au clic simple, rien avec ⌘/Ctrl/Maj/Alt. ' +
          'Rien n’est rendu quand la liste est vide hors chargement : l’état vide est au produit.',
      },
    },
  },
  args: { items: RECENT, onSelect: fn() },
  render: args => ({
    components: { ProjectList },
    setup: () => ({ args }),
    template: `<div style="max-width: 1100px"><ProjectList v-bind="args" /></div>`,
  }),
}

export default meta
type Story = StoryObj<typeof meta>

/** Les six derniers, deux colonnes au bureau. Le nom se tronque d’abord : ni le badge ni la date ne quittent la ligne. */
export const Default: Story = {
  name: 'Les six derniers',
  /* Guarded: six links; a modified click is the browser's, a plain one emits `select`. */
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const links = canvas.getAllByRole('link')
    await expect(links).toHaveLength(6)
    const first = links[0]
    for (const mod of ['ctrlKey', 'metaKey', 'shiftKey', 'altKey'] as const) {
      first.addEventListener('click', e => e.preventDefault(), { once: true })
      first.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, [mod]: true }))
    }
    await expect(args.onSelect).not.toHaveBeenCalled()
    first.addEventListener('click', e => e.preventDefault(), { once: true })
    await userEvent.click(first)
    await expect(args.onSelect).toHaveBeenCalledTimes(1)
  },
}

/** Chargement : six lignes squelette — la case et deux lignes de texte. */
export const Loading: Story = {
  name: 'Chargement',
  args: { loading: true },
}

/** Une colonne quand la place manque (sous 2 × 24rem). */
export const Narrow: Story = {
  name: 'Colonne étroite',
  render: args => ({
    components: { ProjectList },
    setup: () => ({ args }),
    template: `<div style="max-width: 420px"><ProjectList v-bind="args" /></div>`,
  }),
}
