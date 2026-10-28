import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import AccordionItem from './AccordionItem.vue'

const meta: Meta<typeof AccordionItem> = {
  title: 'Structure/Accordion/Item',
  component: AccordionItem,
  tags: ['stable'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Une section d’accordéon (ADR-0088). Dans un `Accordion`, c’est le groupe qui tient l’ouverture ' +
          '(`value`) ; **seule, elle la tient elle-même** avec `v-model:open` — et c’est alors un simple ' +
          'disclosure, ce dont la moitié des écrans ont besoin.\n\n' +
          'Le déclencheur est un `<button>` dans un titre dont le niveau est celui de la page ' +
          '(`headingLevel`), jamais un `<div>` qui émet un clic. Fermée, la section est ' +
          '`hidden="until-found"` une fois la fermeture jouée : la recherche du navigateur y trouve ses ' +
          'mots et l’ouvre.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof AccordionItem>

const TEXT = 'L’opérateur réunit les informations, évalue le risque et l’atténue avant de déposer sa déclaration.'

/** Seule, elle tient son ouverture : un disclosure. */
export const Default: Story = {
  name: 'Seule — un disclosure',
  render: () => ({
    components: { AccordionItem },
    setup: () => ({ open: ref(false), TEXT }),
    template: `
      <div style="max-width:520px">
        <AccordionItem v-model:open="open" title="Diligence raisonnée">{{ TEXT }}</AccordionItem>
      </div>
    `,
  }),
}

/** Désactivée : le titre et le chevron reculent, et rien ne s’ouvre. */
export const Disabled: Story = {
  name: 'Désactivée',
  render: () => ({
    components: { AccordionItem },
    setup: () => ({ TEXT }),
    template: `
      <div style="max-width:520px">
        <AccordionItem title="Géolocalisation des parcelles" disabled>{{ TEXT }}</AccordionItem>
      </div>
    `,
  }),
}

/** Le niveau du titre est celui de la page, pas celui du composant. */
export const HeadingLevel: Story = {
  name: 'Le niveau du titre',
  render: () => ({
    components: { AccordionItem },
    setup: () => ({ TEXT }),
    template: `
      <div style="max-width:520px;display:flex;flex-direction:column;gap:24px">
        <div>
          <h2 style="margin:0 0 8px;font:var(--ds-font-heading-sm);color:var(--ds-text-strong)">Sous un h2</h2>
          <AccordionItem title="La section est un h3" :heading-level="3">{{ TEXT }}</AccordionItem>
        </div>
      </div>
    `,
  }),
}
