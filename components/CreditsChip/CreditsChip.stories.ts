import type { Meta, StoryObj } from '@storybook/vue3'
import CreditsChip from './CreditsChip.vue'
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
    credits:  { control: 'number', table: { category: 'Contenu' } },
    unit:     { control: 'text',   table: { category: 'Contenu', defaultValue: { summary: "'crédits'" } } },
    reminder: { control: 'text',   table: { category: 'Contenu' } },
    reminderTone: {
      control: 'inline-radio',
      options: ['info', 'soon', 'expired'],
      table: { category: 'État', defaultValue: { summary: "'info'" } },
    },
  },
  args: { credits: 250 },
}

export default meta
type Story = StoryObj<typeof meta>

/** Sans échéance : la pastille reste compacte et teintée accent. */
export const Compact: Story = {
  name: 'Compacte',
  args: { credits: 250 },
}

/** Avec échéance : elle s'étale et confie la teinte au badge. */
export const Reminder: Story = {
  name: 'Avec échéance',
  args: { credits: 250, reminder: 'Expirent dans 14 jours' },
}

/**
 * Trois crans d'une même escalade. Le dernier change de registre : fond plein
 * plutôt que teinte, parce qu'une teinte ne sait pas dire « trop tard ».
 */
export const ReminderTones: Story = {
  name: 'Échéance — les trois crans',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { CreditsChip },
    template: `
      <div style="display:flex;flex-direction:column;gap:14px;align-items:flex-start;">
        <CreditsChip :credits="250" reminder="Expirent dans 14 jours"  reminder-tone="info" />
        <CreditsChip :credits="250" reminder="Expirent dans 7 jours"   reminder-tone="soon" />
        <CreditsChip :credits="250" reminder="Vos crédits ont expirés" reminder-tone="expired" />
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
