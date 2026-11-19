import type { Meta, StoryObj } from '@storybook/vue3'
import Tray from './Tray.vue'
import TrayGrid from './TrayGrid.vue'
import TrayCell from './TrayCell.vue'
import { ModuleIcon } from '../ModuleIcon'

const meta: Meta<typeof TrayGrid> = {
  title: 'Structure/Tray/Grid',
  component: TrayGrid,
  /* wip: first release, one consumer (the credits door). */
  tags: ['wip'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Une case blanche par élément sur un plateau (ADR-0231) : `TrayGrid` dans un `Tray :surface="false"`, une ' +
          '`TrayCell` par élément — sa marque (`#media`), son nom, une pastille facultative, une valeur au bout. Colonnes ' +
          'de 14rem au moins, `spacing-sm` entre elles ; la liste défile, son bout s’efface sur 64px, la barre dans sa ' +
          'propre marge.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

const ITEMS = [
  ['Yield', '1 240', true], ['Scan', '312 900', false], ['Inset', '214 600', false], ['Redd+', '160 000', false],
  ['Data', '98 214', false], ['Survey', '52 300', false], ['ID', '24 860', false], ['Forest', '10 200', false],
] as const

/** Plafonnée à 13rem : la liste défile et son bout s’efface. */
export const Default: Story = {
  render: () => ({
    components: { Tray, TrayGrid, TrayCell, ModuleIcon },
    setup: () => ({ ITEMS }),
    template: `
      <div style="max-width:40rem">
        <Tray title="Par module" :heading-level="3" :surface="false">
          <TrayGrid label="Crédits par module" max-height="13rem">
            <TrayCell v-for="[m, v, low] in ITEMS" :key="m" :label="m" :value="v" :badge="low ? 'Bas' : undefined" badge-tone="error">
              <template #media><ModuleIcon :module="m" variant="logo" :size="32" :aria-label="null" /></template>
            </TrayCell>
          </TrayGrid>
        </Tray>
      </div>`,
  }),
}
