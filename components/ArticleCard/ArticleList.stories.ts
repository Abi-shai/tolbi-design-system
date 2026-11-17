import type { Meta, StoryObj } from '@storybook/vue3'
import ArticleList, { type ArticleListItem } from './ArticleList.vue'
import { Button } from '../Button'

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
    title: 'Partenariat avec l’IITA : la cartographie des cultures au Nigeria',
    href: 'https://tolbi.ai',
    image: './stories/articles/logo-on-white.jpg',
    meta: 'Article · 28 janv. 2026',
  },
  {
    id: 4,
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
          'remplit plus la largeur (ADR-0196). **Une seule rangée** (ADR-0201) : les cartes qui tiennent entières, les ' +
          'autres ne sont pas rendues (« Voir tout » y mène) ; `wrap` les fait passer à la ligne. **Une ' +
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

/**
 * Quatre articles sur une rangée : ceux qui tiennent entiers (trois sous ~1 190px). Le troisième est un logo sur
 * blanc — le filet du cadre dit où l’image s’arrête ; le quatrième n’a pas d’image : le cadre reste, une icône au centre.
 */
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

/** `wrap` : les cartes passent à la ligne plutôt que de n’afficher que celles qui tiennent. */
export const Wrap: Story = {
  name: 'Sur plusieurs rangées',
  args: { wrap: true },
  render: Default.render,
}

/** Le titre dans le plateau (ADR-0205) : « Quelques articles à lire » et « Voir tout », la liste les porte. */
export const Titled: Story = {
  name: 'Avec titre',
  render: (args) => ({
    components: { ArticleList, Button },
    setup: () => ({ args }),
    template: `<div style="max-width:1100px"><ArticleList v-bind="args" title="Quelques articles à lire">
      <template #action><Button variant="link" size="sm" label="Voir tout" icon-trailing="arrow-right" /></template>
    </ArticleList></div>`,
  }),
}

export const TitledLoading: Story = {
  name: 'Avec titre, chargement',
  args: { loading: true },
  render: Titled.render,
}

/**
 * La couverture de marque pour tous (ADR-0213) : la même pour chaque article, le cadrage du motif tiré de l’id — stable
 * pour un article, différent de son voisin. Sous chaque couverture, la date seule.
 */
export const Cover: Story = {
  name: 'Couverture de marque',
  args: { cover: true, items: ARTICLES.map(a => ({ ...a, image: undefined, meta: a.meta?.replace(/^.*· /, '') })) },
  render: Titled.render,
}

export const CoverLoading: Story = {
  name: 'Couverture de marque, chargement',
  args: { cover: true, loading: true },
  render: Titled.render,
}
