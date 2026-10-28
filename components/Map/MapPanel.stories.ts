import type { Meta, StoryObj } from '@storybook/vue3'
import MapPanel from './MapPanel.vue'
import { ChartLegend } from '../ChartLegend'
import { Button } from '../Button'

const meta: Meta<typeof MapPanel> = {
  title: 'Données/Map/Panel',
  component: MapPanel,
  tags: ['wip'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'La **surface** d’un encart de carte (ADR-0087) : `bg-default`, `border-subtle`, ' +
          '`elevation-raised`, `radius-surface-sm`, 12 px dedans. Elle ne décide pas de sa place — c’est ' +
          '`MapOverlay` qui la pose.\n\n' +
          'Elle est plafonnée à **20rem, et ce plafond est pour du texte** : `min-width: min-content` laisse ' +
          'une rangée de boutons l’élargir, parce qu’un plafond qui coupe un contrôle en deux n’est pas un ' +
          'plafond, c’est un bug.\n\n' +
          '`collapsible` la replie en un `Button` portant son titre, à sa place, et **le focus suit** : qui ' +
          'vient de replier le panneau se retrouve sur le bouton qui le rouvre.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof MapPanel>

const SERIES = [
  { key: 'cacao', label: 'Cacao', value: '128 ha', color: 'var(--ds-chart-categorical-1)' },
  { key: 'hevea', label: 'Hévéa', value: '74 ha', color: 'var(--ds-chart-categorical-2)' },
  { key: 'palmier', label: 'Palmier à huile', value: '41 ha', color: 'var(--ds-chart-categorical-3)' },
]

/** Un titre et ce qu’il tient. */
export const Default: Story = {
  name: 'Titré',
  render: () => ({
    components: { MapPanel, ChartLegend },
    setup: () => ({ SERIES }),
    template: `
      <div style="background:var(--ds-bg-neutral);padding:24px;border-radius:12px">
        <MapPanel title="Couverture 2024">
          <ChartLegend orientation="vertical" :items="SERIES" />
        </MapPanel>
      </div>
    `,
  }),
}

/** Repliable : le chevron plie le panneau en un bouton, à sa place. */
export const Collapsible: Story = {
  name: 'Repliable',
  render: () => ({
    components: { MapPanel, ChartLegend },
    setup: () => ({ SERIES }),
    template: `
      <div style="background:var(--ds-bg-neutral);padding:24px;border-radius:12px;min-height:200px">
        <MapPanel title="Couverture 2024" collapsible>
          <ChartLegend orientation="vertical" :items="SERIES" />
        </MapPanel>
      </div>
    `,
  }),
}

/** Le plafond de 20rem tient le texte ; une rangée de boutons l’élargit. */
export const Ceiling: Story = {
  name: 'Le plafond est pour le texte',
  render: () => ({
    components: { MapPanel, Button },
    template: `
      <div style="display:flex;gap:24px;align-items:flex-start;background:var(--ds-bg-neutral);padding:24px;border-radius:12px">
        <MapPanel title="Du texte">
          <p style="margin:0;font:var(--ds-font-body-sm);color:var(--ds-text-subtle)">
            Une phrase assez longue pour atteindre le plafond de vingt rem et se replier dessous, comme elle le doit.
          </p>
        </MapPanel>
        <MapPanel title="Des contrôles">
          <div style="display:flex;gap:8px">
            <Button variant="secondary-gray" size="sm" label="Exporter la sélection" />
            <Button variant="primary" size="sm" label="Tracer" />
          </div>
        </MapPanel>
      </div>
    `,
  }),
}
