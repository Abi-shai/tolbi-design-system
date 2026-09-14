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
    state: {
      control: 'select',
      options: ['good', 'low', 'empty'],
      table: { category: 'État', defaultValue: { summary: "'good'" } },
    },
    context: {
      control: 'inline-radio',
      options: ['home', 'project'],
      table: { category: 'Contenu', defaultValue: { summary: "'home'" } },
    },
    credits: {
      control: 'number',
      table: { category: 'Contenu' },
    },
    reminder: {
      control: 'text',
      table: { category: 'Contenu' },
    },
  },
  args: {
    credits: 32,
    state:   'good',
    context: 'home',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const GoodHome: Story = {
  name: 'Bon — accueil',
  args: { state: 'good', context: 'home', credits: 32 },
}

export const GoodProject: Story = {
  name: 'Bon — projet',
  args: { state: 'good', context: 'project', credits: 25 },
}

export const Low: Story = {
  name: 'Solde presque vide',
  args: { state: 'low', credits: 5 },
}

export const Empty: Story = {
  name: 'Solde vide',
  args: { state: 'empty', credits: 0 },
}

export const Reminder: Story = {
  name: 'Rappel d’échéance',
  args: { state: 'good', credits: 250, reminder: 'Expire dans 14 jours' },
}

export const AllStates: Story = {
  name: 'Tous les états',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { CreditsChip },
    template: `
      <div style="display:flex;flex-direction:column;gap:16px;align-items:flex-start;">
        <CreditsChip :credits="250" state="good" context="home"    />
        <CreditsChip :credits="250" state="good" reminder="Expire dans 14 jours" />
        <CreditsChip :credits="25" state="good"  context="project" />
        <CreditsChip :credits="5"  state="low"                     />
        <CreditsChip :credits="0"  state="empty"                   />
      </div>
    `,
  }),
}
