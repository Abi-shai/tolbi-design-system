import type { Meta, StoryObj } from '@storybook/vue3'
import ColorScale from './ColorScale.vue'
import { MapPanel } from '../Map'

const meta: Meta<typeof ColorScale> = {
  title: 'Données/ColorScale',
  component: ColorScale,
  tags: ['wip'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'L’**échelle de couleurs** d’une carte (ADR-0100, piste A) : le titre au-dessus, un dégradé ' +
          '**continu** — l’indice l’est, des paliers inventeraient des seuils —, ses valeurs dessous, et la clé ' +
          'des symboles en bas (`ChartLegend`, ses formes).\n\n' +
          'La rampe est `--ds-chart-sequential-*` (ADR-0096) : sa clarté baisse à chaque pas, elle se lit dans ' +
          'toutes les visions. Un lecteur d’écran entend le dégradé **une fois** — « Indice de stock, de 0,30 à ' +
          '0,60 » —, pas ses graduations une à une.',
      },
    },
  },
  args: {
    title: 'Indice de stock',
    ticks: ['0,30', '0,45', '0,60'],
  },
}

export default meta
type Story = StoryObj<typeof ColorScale>

export const Default: Story = {
  name: 'Échelle seule',
  render: (args) => ({
    components: { ColorScale },
    setup: () => ({ args }),
    template: `<div style="width:280px"><ColorScale v-bind="args" /></div>`,
  }),
}

/** L’encart de l’ARR : l’échelle et les symboles, dans un `MapPanel`. */
export const WithSymbols: Story = {
  name: 'Avec la clé des symboles (encart de carte)',
  render: (args) => ({
    components: { ColorScale, MapPanel },
    setup: () => ({
      args,
      legend: [
        { key: 'project', label: 'Point du projet', shape: 'square', color: 'var(--ds-text-strong)' },
        { key: 'control', label: 'Point de contrôle', shape: 'circle', color: 'var(--ds-chart-sequential-4)' },
        { key: 'reserve', label: 'Réserve', shape: 'point', color: 'var(--ds-chart-threshold)' },
        { key: 'excluded', label: 'Zone exclue', shape: 'zone', color: 'var(--ds-chart-categorical-3)' },
      ],
    }),
    template: `
      <div style="background:var(--ds-bg-neutral);padding:24px;border-radius:12px">
        <MapPanel><ColorScale v-bind="args" :legend="legend" /></MapPanel>
      </div>
    `,
  }),
}
