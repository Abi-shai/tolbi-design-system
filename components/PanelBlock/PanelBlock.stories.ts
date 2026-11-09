import type { Meta, StoryObj } from '@storybook/vue3'
import PanelBlock from './PanelBlock.vue'
import { Badge } from '../Badge'
import { MetricValue } from '../MetricValue'

const meta: Meta<typeof PanelBlock> = {
  title: 'Structure/PanelBlock',
  component: PanelBlock,
  tags: ['stable'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Le bloc de lecture d’un panneau de carte (ADR-0143) : la surface en creux, un titre (avec son `HelpIcon` si le ' +
          'terme en demande un), `#aside` sur la ligne du titre, puis le corps en colonne. C’est `SectionCard` en densité ' +
          '**compacte** (12 autour, 8 entre), rendu et non redessiné (ADR-0001) — le `ArrPanelBlock` du produit.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof PanelBlock>

export const Default: Story = {
  name: 'Un bloc de panneau',
  render: () => ({
    components: { PanelBlock, Badge, MetricValue },
    template: `
      <div style="width:23rem">
        <PanelBlock title="Gain de carbone" help="Le carbone stocké par le projet depuis le point de départ.">
          <template #aside><Badge label="+6,2 %" tone="success" size="sm" /></template>
          <MetricValue value="+575" unit="tCO2e" size="lg" />
          <span style="font:var(--ds-font-body-sm);color:var(--ds-text-subtle)">depuis le point de départ (2021)</span>
        </PanelBlock>
      </div>
    `,
  }),
}
