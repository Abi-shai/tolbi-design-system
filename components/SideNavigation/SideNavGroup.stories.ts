import { ref } from 'vue'
import type { Meta, StoryObj } from '@storybook/vue3'
import SideNavigation from './SideNavigation.vue'
import SideNavItem from './SideNavItem.vue'
import SideNavGroup from './SideNavGroup.vue'

const meta: Meta = {
  title: 'Navigation/SideNavigation/Group',
  component: SideNavGroup,
  tags: ['wip', 'primitive'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Un groupe de lignes sous un petit titre (`label-md`, `text-subtle`). Il ne porte ni sélection ni ' +
          'position : ses lignes restent inscrites dans la liste au-dessus de lui, une seule pastille court ' +
          "d'un groupe à l'autre. 16px séparent deux groupes, 8px le titre de ses lignes. Dans le rail, le " +
          "titre quitte l'écran mais reste annoncé.",
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    setup: () => ({ current: ref('campagnes') }),
    components: { SideNavigation, SideNavItem, SideNavGroup },
    template: `
      <div style="width: 260px; height: 420px; display: flex;">
        <SideNavigation v-model="current" :toggle="false" aria-label="Navigation principale" style="width: 100%;">
          <SideNavItem value="toutes" icon="list" label="Toutes les parcelles" />
          <SideNavItem value="carte"  icon="map"  label="Carte" />
          <SideNavGroup label="Suivi">
            <SideNavItem value="campagnes"    icon="calendar" label="Campagnes" />
            <SideNavItem value="cultures"     icon="sprout"   label="Cultures" />
            <SideNavItem value="observations" icon="scan"     label="Observations" />
          </SideNavGroup>
          <SideNavGroup label="Données">
            <SideNavItem value="imports" icon="upload"   label="Imports" />
            <SideNavItem value="exports" icon="download" label="Exports" />
          </SideNavGroup>
        </SideNavigation>
      </div>
    `,
  }),
}
