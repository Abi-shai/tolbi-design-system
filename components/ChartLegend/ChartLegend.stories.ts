import type { Meta, StoryObj } from '@storybook/vue3'
import { fn } from '@storybook/test'
import { ref } from 'vue'
import ChartLegend from './ChartLegend.vue'

const SERIES = [
  { key: 'observed', label: 'Rendement observé', color: 'var(--ds-chart-categorical-1)', value: '4,82' },
  { key: 'modelled', label: 'Modélisé', color: 'var(--ds-chart-categorical-2)', value: '4,41' },
  { key: 'baseline', label: 'Référence', color: 'var(--ds-chart-categorical-5)', value: '4,10' },
]

const meta: Meta<typeof ChartLegend> = {
  title: 'Données/ChartLegend',
  tags: ['wip'],
  component: ChartLegend,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Légende de séries. En mode interactif, chaque entrée est un vrai `<button>` avec ' +
          '`aria-pressed`, donc désactiver une série est atteignable au clavier et son état est annoncé. ' +
          'L\'entrée éteinte est estompée en entier, marque comprise.',
      },
    },
  },
  argTypes: {
    items: { control: 'object', table: { category: 'Contenu', type: { summary: 'ChartLegendItem[]' } } },
    shape: {
      control: 'inline-radio',
      options: ['dot', 'line'],
      description: '`dot` pour des aires ou des barres, `line` pour des courbes.',
      table: { category: 'Apparence', type: { summary: "'dot' | 'line'" }, defaultValue: { summary: "'dot'" } },
    },
    interactive: { control: 'boolean', description: 'Rend chaque entrée cliquable ; émet `toggle`.', table: { category: 'Comportement', type: { summary: 'boolean' }, defaultValue: { summary: 'false' } } },
  },
  args: { items: SERIES, shape: 'dot', interactive: false, onToggle: fn() },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const LineShape: Story = {
  name: 'Marque en trait',
  args: { shape: 'line' },
}

export const NoColour: Story = {
  name: 'Séries sans couleur',
  parameters: {
    docs: {
      description: {
        story:
          'Une série sans `color` retombe sur la palette catégorielle **selon sa position**, ' +
          'jamais sur `brand` — ADR-0016 : un graphique n\'est pas une affordance. ' +
          'La palette étant ordonnée par ΔE mesuré, les premières séries sont les plus ' +
          'distinguables ; retomber sur une seule et même étape les peindrait à l\'identique ' +
          'et la légende ne distinguerait plus rien.',
      },
    },
  },
  args: {
    items: [
      { key: 'a', label: 'Sans couleur A', value: '4,82' },
      { key: 'b', label: 'Sans couleur B', value: '4,41' },
      { key: 'c', label: 'Sans couleur C', value: '4,10' },
      { key: 'd', label: 'Sans couleur D', value: '3,96' },
    ],
  },
}

export const Interactive: Story = {
  name: 'Interactive',
  parameters: { docs: { description: { story: 'Cliquer une entrée bascule son état — le graphique reste piloté par le produit.' } } },
  render: () => ({
    components: { ChartLegend },
    setup: () => {
      const off = ref<string[]>(['baseline'])
      const items = ref(SERIES)
      function toggle(key: string) {
        off.value = off.value.includes(key) ? off.value.filter(k => k !== key) : [...off.value, key]
      }
      return { items, off, toggle }
    },
    template: `
      <ChartLegend
        :items="items.map(i => ({ ...i, active: !off.includes(i.key) }))"
        shape="line"
        interactive
        @toggle="toggle"
      />
    `,
  }),
}
