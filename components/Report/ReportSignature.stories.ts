import type { Meta, StoryObj } from '@storybook/vue3'
import ReportSignature from './ReportSignature.vue'

const meta: Meta<typeof ReportSignature> = {
  title: 'Structure/Report/Signature',
  component: ReportSignature,
  tags: ['wip'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Le bloc de signature de l’**annexe II** du règlement (UE) 2023/1115 (ADR-0089) : l’engagement, ' +
          'puis les champs. **Aucun des dix documents comparés n’en avait un** — c’est le règlement qui le ' +
          'demande, pas l’usage.\n\n' +
          'Un champ sans valeur devient **un trait pour l’écrire** : le même bloc sert au dossier rempli et ' +
          'à celui qu’on imprime pour signer à la main. Il ne se coupe jamais entre deux pages ' +
          '(`break-inside: avoid`).',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof ReportSignature>

const STATEMENT = `
  <p style="margin:0">
    En signant la présente déclaration, l’opérateur confirme que la diligence raisonnée a été exercée
    conformément au règlement (UE) 2023/1115 et qu’aucun risque, ou un risque négligeable, n’a été identifié.
  </p>
`

/** Rempli : les valeurs sont posées sur les traits. */
export const Default: Story = {
  name: 'Rempli',
  render: () => ({
    components: { ReportSignature },
    template: `
      <div style="max-width:640px;font:var(--ds-font-body-md);color:var(--ds-text-default)">
        <ReportSignature
          on-behalf-of="Coopérative de Soubré"
          date="27 octobre 2026"
          name="Awa Diop, responsable conformité"
        >${STATEMENT}</ReportSignature>
      </div>
    `,
  }),
}

/** Vide : chaque champ devient une ligne où écrire. */
export const Blank: Story = {
  name: 'À signer à la main',
  render: () => ({
    components: { ReportSignature },
    template: `
      <div style="max-width:640px;font:var(--ds-font-body-md);color:var(--ds-text-default)">
        <ReportSignature>${STATEMENT}</ReportSignature>
      </div>
    `,
  }),
}
