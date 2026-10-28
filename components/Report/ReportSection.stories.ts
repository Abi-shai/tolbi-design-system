import type { Meta, StoryObj } from '@storybook/vue3'
import ReportSection from './ReportSection.vue'

const meta: Meta<typeof ReportSection> = {
  title: 'Structure/Report/Section',
  component: ReportSection,
  tags: ['wip'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Une section numérotée d’un `Report` (ADR-0089). **Le numéro vient d’un compteur CSS** : l’ordre ' +
          'du document le décide, personne ne le tape — et insérer une section au milieu renumérote le reste ' +
          'sans qu’on y touche, comme les champs numérotés de la DDS officielle.\n\n' +
          'Sur le papier, son titre **ne termine jamais une page** (`break-after: avoid`).\n\n' +
          'Le compteur est remis à zéro par `.ds-report` : hors d’un rapport, les sections continuent de ' +
          'compter depuis le début du document — c’est pourquoi la démonstration ci-dessous pose son propre ' +
          '`counter-reset`.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof ReportSection>

/** Trois sections qui se numérotent toutes seules, dans l’ordre où elles sont écrites. */
export const Default: Story = {
  name: 'Elles se numérotent',
  render: () => ({
    components: { ReportSection },
    template: `
      <div style="counter-reset:ds-report-section;display:flex;flex-direction:column;gap:24px;max-width:640px;font:var(--ds-font-body-md);color:var(--ds-text-default)">
        <ReportSection title="Objet de la déclaration">
          <p style="margin:0">La présente déclaration couvre les lots de cacao de la campagne 2024-2025 mis sur le marché de l’Union européenne.</p>
        </ReportSection>
        <ReportSection title="Géolocalisation des parcelles">
          <p style="margin:0">Les 128 parcelles sont décrites par un polygone, sauf celles de moins de quatre hectares, décrites par un point.</p>
        </ReportSection>
        <ReportSection title="Évaluation du risque">
          <p style="margin:0">Aucun risque, ou un risque négligeable, n’a été identifié au terme de l’analyse satellitaire et documentaire.</p>
        </ReportSection>
      </div>
    `,
  }),
}
