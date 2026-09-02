import type { Meta, StoryObj } from '@storybook/vue3'
import { fn } from '@storybook/test'
import Toast from './Toast.vue'
import { Button } from '../Button'

const meta: Meta<typeof Toast> = {
  title: 'Superposition/Toast',
  tags: ['wip'],
  component: Toast,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Notification transitoire. Le composant ne gère ni la pile ni le minuteur — c\'est au produit ' +
          'de les porter. Le rôle ARIA suit la teinte : `alert` pour une erreur, qui doit interrompre un ' +
          'lecteur d\'écran, `status` sinon, qui ne doit pas.',
      },
    },
  },
  argTypes: {
    tone: {
      control: 'inline-radio',
      options: ['brand', 'info', 'success', 'warning', 'error'],
      table: { category: 'Apparence', type: { summary: "'brand' | 'info' | 'success' | 'warning' | 'error'" }, defaultValue: { summary: "'info'" } },
    },
    title: { control: 'text', table: { category: 'Contenu', type: { summary: 'string' } } },
    text:  { control: 'text', table: { category: 'Contenu', type: { summary: 'string' } } },
    icon:  { control: 'text', table: { category: 'Apparence', type: { summary: 'IconName' } } },
    pending: { control: 'boolean', description: 'Remplace l\'icône par un Spinner — pour une action encore en vol.', table: { category: 'État', type: { summary: 'boolean' }, defaultValue: { summary: 'false' } } },
    dismissible: { control: 'boolean', table: { category: 'Comportement', type: { summary: 'boolean' }, defaultValue: { summary: 'true' } } },
  },
  args: {
    tone: 'success',
    title: 'Lot généré',
    text: '48 cartes associées aux producteurs de l\'agence de Kaolack.',
    pending: false,
    dismissible: true,
    onDismiss: fn(),
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const AllTones: Story = {
  name: 'Toutes les teintes',
  render: () => ({
    components: { Toast },
    setup: () => ({ tones: ['brand', 'info', 'success', 'warning', 'error'] as const }),
    template: `
      <div style="display:flex; flex-direction:column; gap:1rem">
        <Toast v-for="t in tones" :key="t" :tone="t" :title="t" text="Le rôle ARIA suit la teinte." />
      </div>
    `,
  }),
}

export const Pending: Story = {
  name: 'En cours',
  args: { tone: 'info', title: 'Génération du lot', text: 'Traitement de 48 producteurs…', pending: true, dismissible: false },
}

export const WithAction: Story = {
  name: 'Avec action',
  render: () => ({
    components: { Toast, Button },
    template: `
      <Toast tone="error" title="Import interrompu" text="Trois lignes du fichier n'ont pas pu être appariées.">
        <Button label="Voir le détail" variant="link" size="sm" />
      </Toast>
    `,
  }),
}
