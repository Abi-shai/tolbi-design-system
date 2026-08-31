import type { Meta, StoryObj } from '@storybook/vue3'
import ChartTooltip from './ChartTooltip.vue'

const meta: Meta<typeof ChartTooltip> = {
  title: 'Données/ChartTooltip',
  tags: ['wip'],
  component: ChartTooltip,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Infobulle de graphique — **présentation seule** : aucun positionnement, aucun suivi du ' +
          'pointeur, aucune donnée. C\'est le moteur de graphique qui décide où la placer. ' +
          'Une infobulle a **une** valeur héros, pas un tableau de valeurs. ' +
          'Toutes les couleurs viennent de jetons, ce qui est la seule chose que le motif remplacé ' +
          'ratait : sa palette était entièrement en dur.',
      },
    },
  },
  argTypes: {
    title: { control: 'text', description: 'Ce qui est pointé — en général une date formatée.', table: { category: 'Contenu', type: { summary: 'string' } } },
    tag:   { control: 'text', description: 'Qualificatif court sur le relevé — `Mesuré`, `Estimé`.', table: { category: 'Contenu', type: { summary: 'string' } } },
    tagTone: { control: 'text', table: { category: 'Apparence', type: { summary: 'BadgeTone' }, defaultValue: { summary: "'neutral'" } } },
    value: { control: 'text', table: { category: 'Contenu', type: { summary: 'string' } } },
    unit:  { control: 'text', table: { category: 'Contenu', type: { summary: 'string' } } },
    series: { control: 'object', table: { category: 'Contenu', type: { summary: 'ChartTooltipSeries[]' } } },
  },
  args: {
    title: '12 août 2026',
    tag: 'Mesuré',
    value: '4,82',
    unit: 't/ha',
    series: [{ label: 'Rendement observé', color: 'var(--ds-color-brand-500)' }],
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const MultipleSeries: Story = {
  name: 'Plusieurs séries',
  args: {
    series: [
      { label: 'Observé', value: '4,82', color: 'var(--ds-color-brand-500)' },
      { label: 'Modélisé', value: '4,41', color: 'var(--ds-color-accent-400)' },
      { label: 'Référence', value: '4,10', color: 'var(--ds-color-gray-light-400)' },
    ],
  },
}

export const ValueOnly: Story = {
  name: 'Valeur seule',
  args: { tag: undefined, series: [] },
}

export const OnDarkPanel: Story = {
  name: 'Sur panneau sombre',
  parameters: { backgrounds: { default: 'Dark' } },
  render: args => ({
    components: { ChartTooltip },
    setup: () => ({ args }),
    template: `<ChartTooltip v-bind="args" />`,
  }),
}
