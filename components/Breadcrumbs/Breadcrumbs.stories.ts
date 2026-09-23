import type { Meta, StoryObj } from '@storybook/vue3'
import Breadcrumbs from './Breadcrumbs.vue'

const meta: Meta<typeof Breadcrumbs> = {
  title: 'Navigation/Breadcrumbs',
  component: Breadcrumbs,
  tags: ['autodocs', 'stable'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: [
          'Fil d’Ariane **de localisation**, pas de parcours : il dit où la page se situe dans',
          'l’arborescence, jamais par où l’utilisateur est passé (la distinction que le NN/g tient',
          'depuis 1995). Deux pages atteintes par deux chemins différents portent donc le même fil.',
          '',
          '### Les paliers',
          '',
          'Le fil se lit **racine → ancêtres → page courante**. Les trois scénarios de Tolbi ne font',
          'pas la même profondeur, et c’est normal :',
          '',
          '| Scénario | Fil | Nœuds |',
          '|---|---|---|',
          '| **ID** | 🏠 › ID › Statistiques | 3 |',
          '| **Yield** | 🏠 › Yield › Projets › Campagne maïs › Dashboard | 5 |',
          '| **Data OS** | 🏠 › Data OS › Projets › Forums › Forum 123 › Assurance | 6 |',
          '',
          '**Un palier sans page n’est pas un segment.** C’est ce qui fait qu’ID marche tout seul :',
          'ce module n’a ni index ni entité, donc il a simplement deux ancêtres de moins. À',
          'l’inverse, quand un palier *a* une page — « Projets », « Forums », les index qui listent —',
          'il apparaît **comme son propre segment**, jamais comme un préfixe sur son enfant.',
          '',
          'Le composant ne connaît ni les paliers, ni les routes, ni les titres : il reçoit une liste',
          'plate et la rend. C’est le consommateur qui branche ses `href` et ses libellés, ce qui',
          'est exactement ce qui rend le fil adaptable module par module. Les stories ci-dessous',
          'sont donc une **échelle de profondeur**, de 1 nœud à plus de 5 — le contenu n’y est',
          'qu’un exemple.',
          '',
          '### Libellés',
          '',
          'Un maillon porte **le titre de sa page, nu** — `Campagne maïs`, jamais `Projet Campagne',
          'maïs`. Fluent 2 en fait une règle : *« each breadcrumb item will match a page title',
          'exactly »*, et Helios la montre sur une arborescence identique à la nôtre',
          '(`My org / Consul / my-consul-cluster / Overview`).',
          '',
          '### Les deux troncatures',
          '',
          'Elles répondent à deux débordements différents, et aucune ne touche les extrémités —',
          'la racine et la page courante sont toujours lisibles.',
          '',
          '- **Trop de nœuds** → au-delà de **cinq, maison comprise**, le milieu se replie en « … ».',
          '  Le seuil est celui que Spectrum, Carbon et Fluent partagent. Restent le premier ancêtre',
          '  — le module, qui dit où on est — et les deux derniers. L’ellipse est un vrai bouton :',
          '  elle rouvre le fil **sur place**, et son infobulle nomme ce qu’elle cache.',
          '- **Un libellé trop long** → coupé **à la largeur** (`20ch`), infobulle avec le nom entier.',
          '  Une largeur et non un compte de caractères, parce qu’en typo proportionnelle quinze `W`',
          '  font le double de quinze `i` — et parce qu’aucun produit mesuré ne compte les caractères.',
          '  `20ch` est relevé : la seule troncature trouvée dans la nature coupe vers vingt, et la',
          '  bande de ce que les autres affichent entier va de 17 à 28. C’est la troncature qui mord',
          '  vraiment ici : un projet est nommé par l’utilisateur, donc un seul libellé déborde la',
          '  barre bien avant que la hiérarchie ne le fasse.',
          '',
          '### L’état courant',
          '',
          'Le dernier segment est la page courante et **n’est jamais un lien**. Il n’y a qu’un',
          'traitement pour le dire : fond `bg-neutral`, encre `text-strong` — sur la maison comme',
          'sur un libellé.',
        ].join('\n'),
      },
    },
  },
  argTypes: {
    items: {
      control: 'object',
      description: 'Les ancêtres puis la page courante. La maison n’y est pas : le composant la pose.',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

/* Le contenu n'est qu'un exemple : le consommateur branche ses propres titres. */
const YIELD  = 'Yield'
const PROJETS = 'Projets'
const CAMPAGNE = 'Campagne maïs'

export const Un: Story = {
  name: '1 nœud',
  args: { items: [] },
  parameters: {
    docs: {
      description: {
        story:
          'La racine seule, et elle est la page courante. `items` vide n’est pas « pas de fil d’Ariane », c’est un fil qui n’a rien à remonter.',
      },
    },
  },
}

export const Deux: Story = {
  name: '2 nœuds',
  args: { items: [{ label: YIELD }] },
  parameters: {
    docs: {
      description: {
        story:
          'Un seul ancêtre remonte quand même : la maison prend son chevron comme n’importe quel parent.',
      },
    },
  },
}

export const Trois: Story = {
  name: '3 nœuds',
  args: { items: [{ label: 'ID' }, { label: 'Statistiques' }] },
  parameters: {
    docs: {
      description: {
        story:
          'La profondeur d’un module qui n’a ni index ni entité : on passe du module à la page. Rien n’est sauté — ces paliers n’existent pas ici.',
      },
    },
  },
}

export const Quatre: Story = {
  name: '4 nœuds',
  args: { items: [{ label: YIELD }, { label: PROJETS }, { label: CAMPAGNE }] },
}

export const Cinq: Story = {
  name: '5 nœuds',
  args: {
    items: [
      { label: YIELD }, { label: PROJETS }, { label: CAMPAGNE }, { label: 'Dashboard' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Le seuil : le fil le plus long qui tienne entier. Un nœud de plus et le milieu se replie.',
      },
    },
  },
}

export const PlusDeCinq: Story = {
  name: 'Plus de 5 nœuds',
  args: {
    items: [
      { label: 'Data OS' }, { label: PROJETS }, { label: 'Forums' },
      { label: 'Forum 123' }, { label: 'Assurance' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Le milieu passe derrière l’ellipse ; le premier ancêtre et les deux derniers restent. L’ellipse se survole pour lire ce qu’elle cache, et se clique pour rouvrir le fil sur place.',
      },
    },
  },
}

export const LibelleLong: Story = {
  name: 'Libellé trop long',
  args: {
    items: [
      { label: YIELD },
      { label: PROJETS },
      { label: 'Campagne maïs irriguée — Kaolack Nord 2026' },
      { label: 'Dashboard' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Le second débordement, indépendant du nombre de nœuds. Le libellé est coupé à `20ch` par le CSS ; le nom entier revient dans l’infobulle au survol ou au focus, et seulement s’il a **réellement** débordé — c’est l’élément qu’on interroge, pas la chaîne.',
      },
    },
  },
}

export const AsLinks: Story = {
  name: 'Ancêtres cliquables',
  args: {
    homeHref: '#',
    items: [
      { label: YIELD, href: '#' },
      { label: PROJETS, href: '#' },
      { label: CAMPAGNE, href: '#' },
      { label: 'Dashboard' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Avec `href` un ancêtre devient un `<a>` — survol et focus apparaissent. La page courante n’en prend jamais : elle ne mène nulle part, c’est `aria-current="page"` qui la nomme.',
      },
    },
  },
}
