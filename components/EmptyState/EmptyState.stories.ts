import type { Meta, StoryObj } from '@storybook/vue3'
import EmptyState from './EmptyState.vue'
import { Button } from '../Button'
import { Card } from '../Card'

const meta: Meta<typeof EmptyState> = {
  title: 'Feedback & chargement/EmptyState',
  tags: ['wip'],
  component: EmptyState,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Ce qui s\'affiche à la place du contenu quand il n\'y en a pas. La description dit **quoi faire**, ' +
          'pas seulement que c\'est vide. L\'inventaire produit relevait « le même état vide, écrit deux fois ».',
      },
    },
  },
  argTypes: {
    title:       { control: 'text', table: { category: 'Contenu', type: { summary: 'string' } } },
    description: { control: 'text', description: 'Une phrase sur ce qu\'il y a à faire.', table: { category: 'Contenu', type: { summary: 'string' } } },
    icon:        { control: 'text', table: { category: 'Apparence', type: { summary: 'IconName' }, defaultValue: { summary: "'inbox'" } } },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md'],
      table: { category: 'Apparence', type: { summary: "'sm' | 'md'" }, defaultValue: { summary: "'md'" } },
    },
  },
  args: {
    title: 'Aucune carte INA générée',
    description: 'Générez un premier lot pour associer des cartes aux producteurs de cette agence.',
    icon: 'id-card',
    size: 'md',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithAction: Story = {
  name: 'Avec action',
  render: args => ({
    components: { EmptyState, Button },
    setup: () => ({ args }),
    template: `<EmptyState v-bind="args"><Button label="Générer un lot" variant="primary" /></EmptyState>`,
  }),
}

export const InCard: Story = {
  name: 'Dans une carte',
  parameters: { docs: { description: { story: 'Le cas courant : l\'état vide remplace le contenu d\'un panneau, pas la page entière.' } } },
  render: () => ({
    components: { EmptyState, Button, Card },
    template: `
      <Card padding="none" style="max-width:34rem">
        <EmptyState
          icon="chart-line"
          title="Aucune donnée sur la période"
          description="Élargissez la plage de dates ou vérifiez que les relevés ont bien été synchronisés."
        >
          <Button label="Modifier la période" variant="secondary-gray" size="sm" />
        </EmptyState>
      </Card>
    `,
  }),
}

export const Small: Story = {
  name: 'Compact',
  args: { size: 'sm', description: undefined },
}
