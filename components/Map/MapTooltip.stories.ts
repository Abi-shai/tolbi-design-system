import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import MapTooltip from './MapTooltip.vue'

const meta: Meta<typeof MapTooltip> = {
  title: 'Données/Map/Tooltip',
  component: MapTooltip,
  tags: ['wip'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Ce que dit un **clic sur un point de la carte** (ADR-0100, Figma `3667:2638`) : un titre et sa fermeture, ' +
          'une phrase, puis une ligne par chose — une marque, un mot, une valeur.\n\n' +
          '**Ce n’est pas `ChartTooltip`** : celle-là suit un pointeur sur un graphique et ne contient rien ; celle-ci ' +
          's’ouvre par un clic et reste, c’est donc un petit dialogue non modal nommé par son titre. Le focus y entre ' +
          'à l’ouverture et revient à ce qui le tenait à la fermeture ; Échap la ferme. Le moteur de carte la place, ' +
          'au point. Le mot porte la classe, la couleur la répète.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof MapTooltip>

const rows = [
  { label: 'Faible', value: '0,083', color: 'var(--ds-chart-sequential-1)' },
  { label: 'Moyen', value: '0,232', color: 'var(--ds-chart-sequential-3)' },
  { label: 'Moyen', value: '0,264', color: 'var(--ds-chart-sequential-3)' },
  { label: 'Fort', value: '0,274', color: 'var(--ds-chart-sequential-5)' },
  { label: 'Fort', value: '0,353', color: 'var(--ds-chart-sequential-5)' },
]

export const Default: Story = {
  name: 'Un point du projet',
  render: () => ({
    components: { MapTooltip },
    setup: () => ({ open: ref(true), rows }),
    template: `
      <div style="min-height:300px;display:flex;flex-direction:column;align-items:flex-start;gap:12px">
        <button type="button" :aria-expanded="open" @click="open = true">Point du projet P-17</button>
        <MapTooltip
          v-if="open"
          title="Point du projet P-17"
          description="Ses 5 points de contrôle, du plus proche au plus éloigné"
          :rows="rows"
          @close="open = false"
        />
      </div>
    `,
  }),
}
