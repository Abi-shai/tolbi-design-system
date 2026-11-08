import type { Meta, StoryObj } from '@storybook/vue3'
import EmptyState from './EmptyState.vue'
import { Button } from '../Button'
import { Card } from '../Card'
import { SectionCard } from '../SectionCard'

const meta: Meta<typeof EmptyState> = {
  title: 'Feedback & chargement/EmptyState',
  tags: ['stable'],
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

/**
 * ADR-0134 — **sans icône ni description, une phrase** : dans un bloc déjà titré (une carte en creux d'un panneau de
 * lecture), l'état vide n'est pas un second titre. Le titre devient du texte courant (`body-md`, `text-subtle`),
 * aligné au début comme le contenu du bloc, sur sa marge ; l'action se place dessous. La forme centrée, glyphe et
 * titre fort, reste pour un vrai écran vide.
 */
export const InTitledBlock: Story = {
  name: 'Dans un bloc titré',
  render: () => ({
    components: { EmptyState, Button, SectionCard },
    template: `
      <div style="display:flex;flex-direction:column;gap:var(--ds-spacing-xl);max-width:23rem">
        <SectionCard title="Données de terrain">
          <EmptyState title="Aucune collecte pour l’instant." size="sm">
            <Button label="Lancer une collecte" variant="secondary-gray" size="sm" />
          </EmptyState>
        </SectionCard>
        <SectionCard title="Demandes de l’auditeur">
          <EmptyState title="Aucune demande de l’auditeur." size="sm" />
        </SectionCard>
      </div>
    `,
  }),
}
