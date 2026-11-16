import type { Meta, StoryObj } from '@storybook/vue3'
import ArticleList, { type ArticleListItem } from './ArticleList.vue'

const ARTICLES: ArticleListItem[] = [
  {
    id: 1,
    title: 'Collecte d’arachide : suivre les sacs du champ au magasin',
    href: 'https://tolbi.ai',
    image: './stories/articles/collecte-sacs.jpg',
    meta: 'Article · 24 févr. 2026',
  },
  {
    id: 2,
    title: 'Comment une coopérative de Kaffrine a réduit ses pertes au chargement de 18 % en une campagne',
    href: 'https://tolbi.ai',
    image: './stories/articles/collecte-chargement.jpg',
    meta: 'Étude de cas · 3 févr. 2026',
  },
  {
    id: 3,
    title: 'Ce que mesure l’indice de stock carbone',
    href: 'https://tolbi.ai',
    meta: 'Article · 12 janv. 2026',
  },
]

const meta: Meta<typeof ArticleList> = {
  title: 'Données/ArticleList',
  component: ArticleList,
  tags: ['wip'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'La rangée « À lire » de l’accueil (ADR-0195) — l’équivalent de `ProjectList` : le paquet pose les cartes, le ' +
          'produit les remplit, **sur le même `Tray` que `ProjectList`** (ADR-0198) : le plateau regroupe, les cartes ' +
          'n’ont plus de fond. Des cartes de **18rem**, alignées au début, `spacing-lg` entre elles — la rangée ne ' +
          'remplit plus la largeur (ADR-0196) ; à court de place elles passent à la ligne, jamais sous 18rem. **Une ' +
          'colonne pleine largeur sous 40rem de sa propre largeur** (requête de conteneur — le paquet n’a pas de points de ' +
          'rupture). Le titre de section (« À lire », ' +
          '`heading-md`) et « Voir tout » sont au produit. Rien à montrer et rien en chargement : rien.',
      },
    },
  },
  args: { items: ARTICLES },
}

export default meta
type Story = StoryObj<typeof meta>

const SECTION = (inner: string) => `
  <section style="display:flex;flex-direction:column;gap:var(--ds-spacing-xl);max-width:1100px">
    <h2 style="margin:0;font:var(--ds-font-heading-md);color:var(--ds-text-strong)">À lire</h2>
    ${inner}
  </section>`

/** Trois articles ; le troisième sans image : le cadre 16:9 reste, une icône au centre. */
export const Default: Story = {
  render: (args) => ({
    components: { ArticleList },
    setup: () => ({ args }),
    template: SECTION(`<ArticleList v-bind="args" />`),
  }),
}

/** En chargement : la même géométrie, trois cartes. */
export const Loading: Story = {
  name: 'Chargement',
  args: { loading: true },
  render: Default.render,
}

/** Étroite (moins de 40rem) : une colonne. */
export const Narrow: Story = {
  name: 'Une colonne',
  render: (args) => ({
    components: { ArticleList },
    setup: () => ({ args }),
    template: `<div style="width:420px">${SECTION(`<ArticleList v-bind="args" />`)}</div>`,
  }),
}
