import type { Meta, StoryObj } from '@storybook/vue3'
import DetailRow from './DetailRow.vue'
import { Badge } from '../Badge'

const meta: Meta<typeof DetailRow> = {
  title: 'Données/DetailRow',
  tags: ['wip', 'primitive'],
  component: DetailRow,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Une ligne étiquette / valeur. Rend un couple `dt`/`dd` : **envelopper un groupe dans un `<dl>`** ' +
          'pour que la pile soit une vraie liste de description. Le composant ne fournit pas ce conteneur, ' +
          'parce que l\'inventaire produit comptait « une ligne partagée, trois coquilles ».',
      },
    },
  },
  argTypes: {
    label: { control: 'text', table: { category: 'Contenu', type: { summary: 'string' } } },
    value: { control: 'text', description: 'Texte simple. Utiliser le slot par défaut pour un Badge, un lien ou une puce.', table: { category: 'Contenu', type: { summary: 'string' } } },
    layout: {
      control: 'inline-radio',
      options: ['row', 'stacked'],
      table: { category: 'Apparence', type: { summary: "'row' | 'stacked'" }, defaultValue: { summary: "'row'" } },
    },
    labelWidth: { control: 'text', description: '`row` uniquement.', table: { category: 'Apparence', defaultValue: { summary: "'40%'" } } },
    mono: { control: 'boolean', description: 'Valeur en monospace — pour les identifiants et références.', table: { category: 'Apparence', type: { summary: 'boolean' }, defaultValue: { summary: 'false' } } },
  },
  args: { label: 'Surface déclarée', value: '12,6 ha', layout: 'row', mono: false },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: args => ({
    components: { DetailRow },
    setup: () => ({ args }),
    template: `<dl style="margin:0; max-width:26rem"><DetailRow v-bind="args" /></dl>`,
  }),
}

export const List: Story = {
  name: 'Fiche complète',
  render: () => ({
    components: { DetailRow, Badge },
    template: `
      <dl style="margin:0; max-width:26rem">
        <DetailRow label="Producteur" value="Aminata Bâ" />
        <DetailRow label="Référence" value="TLB-0241-SN" mono />
        <DetailRow label="Surface déclarée" value="12,6 ha" />
        <DetailRow label="Culture" value="Arachide" />
        <DetailRow label="Statut">
          <Badge label="Vérifié" color="success" size="sm" />
        </DetailRow>
      </dl>
    `,
  }),
}

export const Stacked: Story = {
  name: 'Empilé',
  parameters: { docs: { description: { story: 'Pour les panneaux étroits, où la colonne de droite n\'a plus la place.' } } },
  render: () => ({
    components: { DetailRow },
    template: `
      <dl style="margin:0; max-width:16rem">
        <DetailRow layout="stacked" label="Producteur" value="Aminata Bâ" />
        <DetailRow layout="stacked" label="Référence" value="TLB-0241-SN" mono />
      </dl>
    `,
  }),
}
