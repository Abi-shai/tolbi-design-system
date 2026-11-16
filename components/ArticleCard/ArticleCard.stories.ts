import type { Meta, StoryObj } from '@storybook/vue3'
import ArticleCard from './ArticleCard.vue'

const meta: Meta<typeof ArticleCard> = {
  title: 'Données/ArticleList/Card',
  component: ArticleCard,
  tags: ['wip'],
  parameters: {
    docs: {
      description: {
        component:
          'Un article de Tolbi sur l’accueil (ADR-0195, piste B / G2) : l’image 16:9 dans la marge de la carte, le titre ' +
          '(`label-md-strong`, deux lignes au plus), une ligne de faits écrite par le produit. **18rem** de large, fond ' +
          '`bg-neutral-subtle` (celui de `Card sunk`), sans bordure (ADR-0196) ; au survol et au focus il **fonce d’un ' +
          'cran** (`bg-neutral-subtle-hover`), rien ne bouge. **Un lien** : ' +
          'l’article sur tolbi.ai dans un nouvel onglet, annoncé comme tel ; le nom du lien est le titre. Image absente ou ' +
          'cassée : le cadre reste, avec `file-text`.',
      },
    },
  },
  args: {
    title: 'Collecte d’arachide : suivre les sacs du champ au magasin',
    href: 'https://tolbi.ai',
    image: './stories/articles/collecte-sacs.jpg',
    meta: 'Article · 24 févr. 2026',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Un titre long : deux lignes, puis l’ellipse. */
export const LongTitle: Story = {
  name: 'Titre long',
  args: { title: 'Comment une coopérative de Kaffrine a réduit ses pertes au chargement de 18 % en une campagne grâce au suivi des sacs', meta: 'Étude de cas · 3 févr. 2026' },
}

/** Sans image, ou une image cassée : le cadre 16:9 reste, `file-text` au centre — la carte ne change pas de taille. */
export const NoImage: Story = {
  name: 'Sans image',
  args: { image: undefined },
}

export const BrokenImage: Story = {
  name: 'Image cassée',
  args: { image: './stories/articles/introuvable.jpg' },
}

export const Loading: Story = {
  name: 'Chargement',
  args: { loading: true },
}
