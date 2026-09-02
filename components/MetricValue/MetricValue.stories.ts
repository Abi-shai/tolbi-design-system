import type { Meta, StoryObj } from '@storybook/vue3'
import MetricValue from './MetricValue.vue'

const meta: Meta<typeof MetricValue> = {
  title: 'Données/MetricValue',
  tags: ['wip'],
  component: MetricValue,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Étiquette + valeur + variation. Le composant le plus réutilisé de l\'inventaire produit ' +
          '(6 références). La direction de la variation change **la couleur et la flèche**, donc le sens ' +
          'survit en niveaux de gris.\n\nLe composant ne se pose **que sur la surface par défaut** : il n\'existe pas de variante sur fond ' +
          'de marque. Le défaut relevé en production — une valeur de marque sur un panneau sombre, ~1,1:1 — ' +
          'devient ainsi impossible par construction, plutôt qu\'un piège dont il faudrait penser à sortir.',
      },
    },
  },
  argTypes: {
    label: { control: 'text', table: { category: 'Contenu', type: { summary: 'string' } } },
    value: { control: 'text', table: { category: 'Contenu', type: { summary: 'string' } } },
    unit:  { control: 'text', description: 'Affichée après la valeur, à taille réduite.', table: { category: 'Contenu', type: { summary: 'string' } } },
    delta: { control: 'text', description: 'Variation signée, par ex. `+12 %`.', table: { category: 'Contenu', type: { summary: 'string' } } },
    trend: {
      control: 'inline-radio',
      options: ['up', 'down', 'flat'],
      table: { category: 'Contenu', type: { summary: "'up' | 'down' | 'flat'" }, defaultValue: { summary: "'flat'" } },
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      table: { category: 'Apparence', type: { summary: "'sm' | 'md' | 'lg'" }, defaultValue: { summary: "'md'" } },
    },
  },
  args: { label: 'Rendement', value: '4,82', unit: 't/ha', delta: '+12 %', trend: 'up', size: 'md' },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Trends: Story = {
  name: 'Les trois directions',
  render: () => ({
    components: { MetricValue },
    template: `
      <div style="display:flex; gap:3rem; flex-wrap:wrap">
        <MetricValue label="Rendement" value="4,82" unit="t/ha" delta="+12 %" trend="up" />
        <MetricValue label="Écart" value="3,10" unit="t/ha" delta="−3,4 %" trend="down" />
        <MetricValue label="Surface" value="1 248" unit="ha" delta="stable" trend="flat" />
      </div>
    `,
  }),
}

export const Sizes: Story = {
  name: 'Tailles',
  render: () => ({
    components: { MetricValue },
    setup: () => ({ sizes: ['sm', 'md', 'lg'] as const }),
    template: `
      <div style="display:flex; gap:3rem; align-items:flex-end; flex-wrap:wrap">
        <MetricValue v-for="s in sizes" :key="s" :size="s" :label="s" value="4,82" unit="t/ha" />
      </div>
    `,
  }),
}
