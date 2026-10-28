import type { Meta, StoryObj } from '@storybook/vue3'
import { computed, ref } from 'vue'
import OptionTree from './OptionTree.vue'
import type { OptionTreeNode } from './context'
import { Dialog } from '../Dialog'
import { Button } from '../Button'
import { ProgressSteps } from '../ProgressSteps'

const meta: Meta<typeof OptionTree> = {
  title: 'Saisie/OptionTree',
  component: OptionTree,
  tags: ['wip'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Un choix dans une hiérarchie — un code douanier : chapitre → position → sous-position (ADR-0081, la DDR). ' +
          'Chaque niveau est une ligne : le chevron à gauche l’ouvre, le code dans un `Tag`, le libellé, le rond du choix ' +
          'au bout. Un parent se choisit aussi (TRACES). **Un arbre, pas un groupe de ronds** : les flèches d’un groupe de ' +
          'ronds choisissent, celles d’un arbre se déplacent (APG) — ↑ ↓, → ouvre puis entre, ← ferme puis sort, Début / ' +
          'Fin, une lettre saute à la ligne suivante qui commence par elle, Entrée ou Espace choisit. Le rond n’est que le ' +
          'signe ; `aria-selected` est ce qui est lu. La recherche garde ce qu’elle trouve avec ses ancêtres, ouverts, et ' +
          'souligne les mots trouvés — sans compter les accents ni la casse. Le chemin choisi reste écrit au-dessus.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

const HS: OptionTreeNode[] = [
  {
    value: '09', code: '09', label: 'Café, thé, maté et épices',
    children: [
      {
        value: '0901', code: '0901', label: 'Café, même torréfié ou décaféiné ; coques et pellicules de café',
        children: [
          { value: '090111', code: '0901 11', label: 'Café non torréfié, non décaféiné' },
          { value: '090112', code: '0901 12', label: 'Café non torréfié, décaféiné' },
          { value: '090121', code: '0901 21', label: 'Café torréfié, non décaféiné' },
          { value: '090122', code: '0901 22', label: 'Café torréfié, décaféiné' },
        ],
      },
    ],
  },
  {
    value: '12', code: '12', label: 'Graines et fruits oléagineux ; graines, semences et fruits divers',
    children: [
      {
        value: '1201', code: '1201', label: 'Fèves de soja, même concassées',
        children: [
          { value: '120110', code: '1201 10', label: 'Fèves de soja de semence' },
          { value: '120190', code: '1201 90', label: 'Autres fèves de soja' },
        ],
      },
      { value: '1208', code: '1208', label: 'Farines de graines ou de fruits oléagineux' },
    ],
  },
  {
    value: '15', code: '15', label: 'Graisses et huiles animales, végétales ou d’origine microbienne',
    children: [
      {
        value: '1511', code: '1511', label: 'Huile de palme et ses fractions, même raffinées',
        children: [
          { value: '151110', code: '1511 10', label: 'Huile de palme brute' },
          { value: '151190', code: '1511 90', label: 'Autres' },
        ],
      },
    ],
  },
  {
    value: '18', code: '18', label: 'Cacao et ses préparations',
    children: [
      { value: '1801', code: '1801', label: 'Cacao en fèves et brisures de fèves, bruts ou torréfiés' },
      { value: '1802', code: '1802', label: 'Coques, pellicules (pelures) et autres déchets de cacao' },
      {
        value: '1803', code: '1803', label: 'Pâte de cacao, même dégraissée',
        children: [
          { value: '180310', code: '1803 10', label: 'Non dégraissée' },
          { value: '180320', code: '1803 20', label: 'Complètement ou partiellement dégraissée' },
        ],
      },
      { value: '1804', code: '1804', label: 'Beurre, graisse et huile de cacao' },
      { value: '1805', code: '1805', label: 'Poudre de cacao, sans addition de sucre ou d’autres édulcorants' },
      {
        value: '1806', code: '1806', label: 'Chocolat et autres préparations alimentaires contenant du cacao',
        children: [
          { value: '180610', code: '1806 10', label: 'Poudre de cacao, avec addition de sucre ou d’autres édulcorants' },
          { value: '180620', code: '1806 20', label: 'Autres préparations en blocs ou en barres de plus de 2 kg' },
        ],
      },
    ],
  },
  {
    value: '40', code: '40', label: 'Caoutchouc et ouvrages en caoutchouc',
    children: [
      {
        value: '4001', code: '4001', label: 'Caoutchouc naturel, balata, gutta-percha et gommes naturelles analogues',
        children: [
          { value: '400110', code: '4001 10', label: 'Latex de caoutchouc naturel, même prévulcanisé' },
          { value: '400121', code: '4001 21', label: 'Feuilles fumées' },
        ],
      },
    ],
  },
  {
    value: '44', code: '44', label: 'Bois, charbon de bois et ouvrages en bois',
    children: [
      { value: '4401', code: '4401', label: 'Bois de chauffage ; bois en plaquettes ou en particules' },
      { value: '4403', code: '4403', label: 'Bois bruts, même écorcés, désaubiérés ou équarris' },
    ],
  },
]

/** Rien de choisi : les chapitres fermés, la recherche au-dessus. */
export const Default: Story = {
  name: 'Nomenclature',
  render: () => ({
    components: { OptionTree },
    setup: () => ({ value: ref<string | number | null>(null), HS }),
    template: `
      <div style="max-width:960px">
        <OptionTree v-model="value" :nodes="HS" label="Produits" />
        <p style="margin-top:var(--ds-spacing-xl); font:var(--ds-font-body-sm); color:var(--ds-text-subtle)">v-model : {{ value ?? 'null' }}</p>
      </div>
    `,
  }),
}

/** Un choix fait ailleurs : son chapitre s’ouvre, et le chemin est écrit. */
export const Chosen: Story = {
  name: 'Choix déjà fait',
  render: () => ({
    components: { OptionTree },
    setup: () => ({ value: ref<string | number | null>('180610'), HS }),
    template: `<div style="max-width:960px"><OptionTree v-model="value" :nodes="HS" label="Produits" /></div>`,
  }),
}

/** « poudre » : trois lignes trouvées, leurs ancêtres ouverts, les mots soulignés. */
export const Search: Story = {
  name: 'Recherche',
  render: () => ({
    components: { OptionTree },
    setup: () => ({ value: ref<string | number | null>(null), query: ref('poudre'), HS }),
    template: `<div style="max-width:960px"><OptionTree v-model="value" v-model:query="query" :nodes="HS" label="Produits" /></div>`,
  }),
}

const STEPS = [
  { title: 'Sélectionner un produit', description: 'Le produit que vous souhaitez évaluer.' },
  { title: 'Renseigner les détails', description: 'Les quantités et la surface du produit.' },
]

/**
 * La fenêtre de la DDR, « Ajouter un produit » : les étapes à l’horizontale en tête, l’arbre dans le corps, le
 * résumé au début du pied — les trois pièces d’ADR-0081 ensemble.
 */
export const InDialog: Story = {
  name: 'Dans la fenêtre « Ajouter un produit »',
  parameters: { layout: 'fullscreen' },
  render: () => ({
    components: { OptionTree, Dialog, Button, ProgressSteps },
    setup() {
      const open = ref(false)
      const value = ref<string | number | null>(null)
      const find = (nodes: OptionTreeNode[]): OptionTreeNode | null => {
        for (const n of nodes) {
          if (n.value === value.value) return n
          const below = n.children ? find(n.children) : null
          if (below) return below
        }
        return null
      }
      const chosen = computed(() => find(HS))
      const summary = computed(() => [{ label: 'Produit', value: chosen.value ? `${chosen.value.code} · ${chosen.value.label}` : 'Aucun' }])
      return { open, value, HS, STEPS, summary, chosen }
    },
    template: `
      <div style="min-height:100vh; padding:var(--ds-spacing-2xl); background:var(--ds-bg-neutral)">
        <Button label="Ajouter un produit" @click="open = true" />
        <Dialog v-model:open="open" size="xl" title="Ajouter un produit" :summary="summary">
          <template #form>
            <ProgressSteps :steps="STEPS" :current-step="1" orientation="horizontal" />
            <OptionTree v-model="value" :nodes="HS" label="Produits" />
          </template>
          <template #actions>
            <Button label="Annuler" variant="secondary-gray" size="sm" @click="open = false" />
            <Button label="Continuer" size="sm" :disabled="!chosen" @click="open = false" />
          </template>
        </Dialog>
      </div>
    `,
  }),
}
