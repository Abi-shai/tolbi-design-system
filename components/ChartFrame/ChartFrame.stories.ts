import type { Meta, StoryObj } from '@storybook/vue3'
import ChartFrame from './ChartFrame.vue'
import { ChartLegend } from '../ChartLegend'
import { Card } from '../Card'

/* A flat SVG stand-in for whatever engine the product picks. */
const FAKE_PLOT = `
  <svg viewBox="0 0 300 100" preserveAspectRatio="none" style="width:100%; height:100%; display:block">
    <polyline
      points="0,80 40,62 80,68 120,40 160,46 200,24 240,30 300,12"
      fill="none"
      stroke="var(--ds-chart-categorical-1)"
      stroke-width="2"
      vector-effect="non-scaling-stroke"
    />
  </svg>
`

const meta: Meta<typeof ChartFrame> = {
  title: 'Données/ChartFrame',
  tags: ['wip'],
  component: ChartFrame,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Le cadre autour d\'un graphique : titre, légende, axes, grille, chargement et état vide. ' +
          '**Le design system ne fournit aucun moteur de rendu** — le tracé arrive par le slot par défaut, ' +
          'et le produit garde sa bibliothèque. Le SVG des exemples n\'est qu\'un bouchon.',
      },
    },
  },
  argTypes: {
    title:  { control: 'text', table: { category: 'Contenu', type: { summary: 'string' } } },
    height: { control: 'text', description: 'Hauteur de la zone de tracé. Le cadre ne la devine jamais du contenu.', table: { category: 'Apparence', type: { summary: 'number | string' }, defaultValue: { summary: '240' } } },
    yTicks: { control: 'object', description: 'Graduations de gauche, de haut en bas.', table: { category: 'Contenu', type: { summary: 'string[]' } } },
    xTicks: { control: 'object', description: 'Libellés du bas, de gauche à droite.', table: { category: 'Contenu', type: { summary: 'string[]' } } },
    grid:    { control: 'boolean', table: { category: 'Apparence', type: { summary: 'boolean' }, defaultValue: { summary: 'true' } } },
    loading: { control: 'boolean', table: { category: 'État', type: { summary: 'boolean' }, defaultValue: { summary: 'false' } } },
    empty:   { control: 'boolean', table: { category: 'État', type: { summary: 'boolean' }, defaultValue: { summary: 'false' } } },
    emptyTitle:       { control: 'text', table: { category: 'État', type: { summary: 'string' } } },
    emptyDescription: { control: 'text', table: { category: 'État', type: { summary: 'string' } } },
  },
  args: {
    title: 'Rendement observé',
    height: 240,
    yTicks: ['6', '5', '4', '3', '2'],
    xTicks: ['Mai', 'Juin', 'Juil.', 'Août'],
    grid: true,
    loading: false,
    empty: false,
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: args => ({
    components: { ChartFrame },
    setup: () => ({ args, FAKE_PLOT }),
    template: `<div style="max-width:40rem"><ChartFrame v-bind="args"><div v-html="FAKE_PLOT" style="height:100%" /></ChartFrame></div>`,
  }),
}

export const WithLegend: Story = {
  name: 'Avec légende',
  render: args => ({
    components: { ChartFrame, ChartLegend },
    setup: () => ({
      args,
      FAKE_PLOT,
      series: [
        { key: 'observed', label: 'Observé', color: 'var(--ds-chart-categorical-1)' },
        { key: 'modelled', label: 'Modélisé', color: 'var(--ds-chart-categorical-2)' },
      ],
    }),
    template: `
      <div style="max-width:40rem">
        <ChartFrame v-bind="args">
          <template #legend><ChartLegend :items="series" shape="line" /></template>
          <div v-html="FAKE_PLOT" style="height:100%" />
        </ChartFrame>
      </div>
    `,
  }),
}

export const Loading: Story = {
  name: 'Chargement',
  args: { loading: true },
  render: args => ({
    components: { ChartFrame },
    setup: () => ({ args }),
    template: `<div style="max-width:40rem"><ChartFrame v-bind="args" /></div>`,
  }),
}

export const Empty: Story = {
  name: 'État vide',
  args: {
    empty: true,
    emptyDescription: 'Élargissez la plage de dates ou vérifiez la synchronisation des relevés.',
  },
  render: args => ({
    components: { ChartFrame },
    setup: () => ({ args }),
    template: `<div style="max-width:40rem"><ChartFrame v-bind="args" /></div>`,
  }),
}

export const InCard: Story = {
  name: 'Dans une carte',
  render: args => ({
    components: { ChartFrame, Card },
    setup: () => ({ args, FAKE_PLOT }),
    template: `
      <Card style="max-width:40rem">
        <ChartFrame v-bind="args"><div v-html="FAKE_PLOT" style="height:100%" /></ChartFrame>
      </Card>
    `,
  }),
}
