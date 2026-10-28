import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import Accordion from './Accordion.vue'
import AccordionItem from './AccordionItem.vue'

const meta: Meta<typeof Accordion> = {
  title: 'Structure/Accordion',
  component: Accordion,
  tags: ['stable'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Des sections qui s’ouvrent sur place (ADR-0088, piste A) : le titre, un chevron à droite qui se retourne, un filet ' +
          'entre les sections. **Une seule ouverte** par défaut (`v-model`), `multiple` + `v-model:values` pour plusieurs. Le ' +
          'titre est un `<button>` dans un titre de niveau `headingLevel`. Le contenu ouvre sa place (0fr → 1fr, ADR-0025) et ' +
          'se ferme plus vite ; fermé, il est `hidden="until-found"` : la recherche du navigateur l’atteint et l’ouvre. Seul, ' +
          '`AccordionItem` est un dépliant (`v-model:open`).',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

const SECTIONS = [
  ['trader', 'Le commerçant', 'Nom, pays, adresse et identifiants de l’entreprise qui place le produit sur le marché.'],
  ['products', 'Les produits', 'Les codes SH, les quantités et la surface des champs liés.'],
  ['documents', 'Les documents', 'Les preuves jointes : titres fonciers, attestations, factures.'],
]

export const Default: Story = {
  name: 'Une seule ouverte',
  render: () => ({
    components: { Accordion, AccordionItem },
    setup: () => ({ open: ref('products'), SECTIONS }),
    template: `
      <div style="max-width:480px">
        <Accordion v-model="open">
          <AccordionItem v-for="[v, t, c] in SECTIONS" :key="v" :value="v" :title="t">{{ c }}</AccordionItem>
          <AccordionItem value="sent" title="L’envoi" disabled>Disponible après la relecture.</AccordionItem>
        </Accordion>
        <p style="margin-top:var(--ds-spacing-lg); font:var(--ds-font-body-sm); color:var(--ds-text-subtle)">v-model : {{ open ?? 'null' }}</p>
      </div>
    `,
  }),
}

export const Multiple: Story = {
  name: 'Plusieurs ouvertes',
  render: () => ({
    components: { Accordion, AccordionItem },
    setup: () => ({ values: ref(['trader', 'documents']), SECTIONS }),
    template: `
      <div style="max-width:480px">
        <Accordion multiple v-model:values="values">
          <AccordionItem v-for="[v, t, c] in SECTIONS" :key="v" :value="v" :title="t">{{ c }}</AccordionItem>
        </Accordion>
      </div>
    `,
  }),
}

/** Seul : un dépliant. */
export const Disclosure: Story = {
  name: 'Seul — un dépliant',
  render: () => ({
    components: { AccordionItem },
    setup: () => ({ open: ref(false) }),
    template: `
      <div style="max-width:480px">
        <AccordionItem v-model:open="open" title="Comment la surface est-elle calculée ?">
          Sur la projection équivalente de la zone, à partir des sommets posés sur la carte.
        </AccordionItem>
      </div>
    `,
  }),
}
