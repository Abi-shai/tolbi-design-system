import { ref } from 'vue'
import type { Meta, StoryObj } from '@storybook/vue3'
import CreditsChip from './CreditsChip.vue'
import { Button } from '../Button'
import Docs from './CreditsChip.mdx'

const meta: Meta<typeof CreditsChip> = {
  title: 'Étiquettes/CreditsChip',
  component: CreditsChip,
  tags: ['autodocs', 'stable'],
  parameters: {
    layout: 'centered',
    docs: { page: Docs },
  },
  argTypes: {
    credits:  {
      control: 'number',
      description: '`null` : un solde existe et n’est pas encore arrivé — un emplacement tient la place du nombre.',
      table: { category: 'Contenu', type: { summary: 'number | null' } },
    },
    unit:     { control: 'text',   table: { category: 'Contenu', defaultValue: { summary: "'crédits'" } } },
    reminder: { control: 'text',   table: { category: 'Contenu' } },
    tone: {
      control: 'inline-radio',
      options: ['default', 'warning', 'error'],
      table: { category: 'État', defaultValue: { summary: "'default'" } },
    },
  },
  args: { credits: 250 },
}

export default meta
type Story = StoryObj<typeof meta>

/** Hors démo : un seul compteur, et c'est le chip qui porte l'état. */
export const Compact: Story = {
  name: 'Compacte',
  args: { credits: 250 },
}

/** En démo il y a deux quantités : le chip redevient neutre, le badge prend la teinte. */
export const Reminder: Story = {
  name: 'Avec échéance',
  args: { credits: 250, reminder: 'Expire dans 14 jours', tone: 'warning' },
}

/**
 * Les cinq états, et la règle qui les sépare : **le badge existe quand il y a
 * deux quantités à montrer**. Hors démo il n'y en a qu'une, et le chip la
 * porte ; en démo il y a des crédits *et* une fenêtre de temps, et un seul
 * compteur ne peut pas les dire tous les deux.
 */
export const Tones: Story = {
  name: 'Les cinq états',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { CreditsChip },
    template: `
      <div style="display:flex;flex-direction:column;gap:14px;align-items:flex-start;">
        <CreditsChip :credits="250" />
        <CreditsChip :credits="12" tone="warning" />
        <CreditsChip :credits="0" tone="error" />
        <CreditsChip :credits="250" reminder="Expire dans 14 jours" tone="warning" />
        <CreditsChip :credits="250" reminder="Vos crédits ont expiré" tone="error" />
      </div>
    `,
  }),
}

/** Le chiffre est tabulaire : un solde qui descend ne décale pas ses voisins. */
export const TabularCount: Story = {
  name: 'Chiffres tabulaires',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { CreditsChip },
    template: `
      <div style="display:flex;flex-direction:column;gap:14px;align-items:flex-start;">
        <CreditsChip :credits="1111" />
        <CreditsChip :credits="250" />
        <CreditsChip :credits="8" />
      </div>
    `,
  }),
}

/** Le solde roule : l'ancien sort par le haut, le nouveau entre par le bas, et le ton passe en fondu. */
export const Rolling: Story = {
  name: 'Le solde roule',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { CreditsChip, Button },
    setup() {
      const steps = [
        { credits: 250, tone: 'default' as const },
        { credits: 180, tone: 'default' as const },
        { credits: 12, tone: 'warning' as const },
        { credits: 0, tone: 'error' as const },
      ]
      const at = ref(0)
      return { steps, at }
    },
    template: `
      <div style="display:flex;gap:14px;align-items:center;">
        <CreditsChip :credits="steps[at].credits" :tone="steps[at].tone" />
        <Button label="Dépenser" variant="secondary-gray" size="sm" data-step @click="at = (at + 1) % steps.length" />
      </div>
    `,
  }),
}

/** `credits: null` — un emplacement à la place du nombre, aucun ton. */
export const Pending: Story = {
  name: 'En attente',
  args: { credits: null, tone: 'warning' },
}
