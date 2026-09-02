import type { Meta, StoryObj } from '@storybook/vue3'
import { fn } from '@storybook/test'
import Callout from './Callout.vue'
import { Button } from '../Button'

const meta: Meta<typeof Callout> = {
  title: 'Feedback & chargement/Callout',
  tags: ['wip'],
  component: Callout,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Encart d\'information dans le flux de la page. La teinte choisit l\'icône, donc le sens n\'est ' +
          'jamais porté par la couleur seule — un avertissement reste lisible en niveaux de gris.',
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
    text:  { control: 'text', description: 'Utiliser le slot par défaut pour plus riche qu\'une phrase.', table: { category: 'Contenu', type: { summary: 'string' } } },
    icon:  { control: 'text', description: 'Remplace l\'icône que la teinte aurait choisie.', table: { category: 'Apparence', type: { summary: 'IconName' } } },
    dismissible: { control: 'boolean', table: { category: 'Comportement', type: { summary: 'boolean' }, defaultValue: { summary: 'false' } } },
  },
  args: {
    tone: 'info',
    title: 'Données de la campagne en cours',
    text: 'Les valeurs affichées proviennent du dernier passage satellite disponible sur la zone.',
    dismissible: false,
    onDismiss: fn(),
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: args => ({
    components: { Callout },
    setup: () => ({ args }),
    template: `<div style="max-width:38rem"><Callout v-bind="args" /></div>`,
  }),
}

export const AllTones: Story = {
  name: 'Toutes les teintes',
  render: () => ({
    components: { Callout },
    setup: () => ({ tones: ['brand', 'info', 'success', 'warning', 'error'] as const }),
    template: `
      <div style="display:flex; flex-direction:column; gap:1rem; max-width:38rem">
        <Callout
          v-for="t in tones"
          :key="t"
          :tone="t"
          :title="t"
          text="Chaque teinte porte sa propre icône, en plus de sa couleur."
        />
      </div>
    `,
  }),
}

export const WithActions: Story = {
  name: 'Avec actions',
  render: () => ({
    components: { Callout, Button },
    template: `
      <div style="max-width:38rem">
        <Callout tone="warning" title="Trois parcelles sans mesure récente" text="La dernière donnée satellite exploitable date de plus de 30 jours.">
          <template #actions>
            <Button label="Relancer l'analyse" variant="secondary-gray" size="sm" />
            <Button label="Voir les parcelles" variant="link" size="sm" />
          </template>
        </Callout>
      </div>
    `,
  }),
}

export const Dismissible: Story = {
  name: 'Refermable',
  args: { dismissible: true, tone: 'brand' },
  render: args => ({
    components: { Callout },
    setup: () => ({ args }),
    template: `<div style="max-width:38rem"><Callout v-bind="args" /></div>`,
  }),
}
