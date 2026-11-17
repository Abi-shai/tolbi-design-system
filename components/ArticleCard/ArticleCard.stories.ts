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
          '(`label-md-strong`, deux lignes au plus), une ligne de faits écrite par le produit. **18rem** de large, **sans ' +
          'fond ni bordure** (ADR-0198) : la carte est son image et son texte, posés sur la surface du `Tray`. Au survol ' +
          'et au focus elle **prend un fond**, comme une ligne de `ProjectList` (`bg-hover`), et le cadre de l’image fonce ' +
          'd’un cran ; rien ne bouge. **Un lien** : ' +
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

/**
 * La couverture de marque (ADR-0213) : le vert profond, le motif de marque presque invisible (blanc à 3 %, cadré par
 * `seed`), le titre de l’article dessus — `heading-sm` blanc, en bas à gauche, trois lignes au plus. Dessous, la date
 * seule ; le titre reste le nom du lien. Au survol et au focus, le motif s’efface ; rien ne bouge.
 */
export const Cover: Story = {
  name: 'Couverture de marque',
  args: { cover: true, seed: 'collecte-sacs', image: undefined },
}

/** Un titre long sur la couverture : trois lignes, puis l’ellipse. */
export const CoverLongTitle: Story = {
  name: 'Couverture, titre long',
  args: {
    cover: true,
    seed: 'kaffrine',
    image: undefined,
    title: 'Comment une coopérative de Kaffrine a réduit ses pertes au chargement de 18 % en une campagne grâce au suivi des sacs',
    meta: '3 févr. 2026',
  },
}

export const CoverLoading: Story = {
  name: 'Couverture, chargement',
  args: { cover: true, loading: true },
}
