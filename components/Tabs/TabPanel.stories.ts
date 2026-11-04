import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import TabPanel from './TabPanel.vue'
import Tabs from './Tabs.vue'

const meta: Meta<typeof TabPanel> = {
  title: 'Navigation/Tabs/Panel',
  component: TabPanel,
  tags: ['wip'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Ce qu’un onglet montre (ADR-0098). `Tabs` n’est que la liste ; le panneau vit où il veut — sous elle, ou ' +
          'dans le corps d’un `Dialog` pendant que la liste reste dans son `#nav`. Même `id` des deux côtés ' +
          '(`tabs-id`), et le panneau est rendu pour la valeur courante. **Changer d’onglet est un échange** : fondu ' +
          'sortant puis entrant à `quick` (ADR-0026), et le nouveau contenu **commence en haut** — le défilement ' +
          'revient pendant que rien n’est montré.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof TabPanel>

/** Deux onglets, deux contenus de hauteurs différentes : défilez le premier, passez au second — il commence en haut. */
export const Default: Story = {
  name: 'Panneau d’onglet',
  render: () => ({
    components: { Tabs, TabPanel },
    setup: () => ({
      tab: ref('points'),
      tabs: [{ value: 'points', label: 'Points du projet' }, { value: 'qualite', label: 'Qualité des mesures' }],
    }),
    template: `
      <div style="width:480px;display:flex;flex-direction:column;gap:var(--ds-spacing-xl)">
        <Tabs id="exemple" v-model="tab" :tabs="tabs" size="sm" />
        <div style="height:240px;overflow-y:auto">
          <TabPanel tabs-id="exemple" :value="tab">
            <ol v-if="tab === 'points'" style="margin:0;font:var(--ds-font-body-md);color:var(--ds-text-default)">
              <li v-for="n in 30" :key="n">Point du projet P-{{ String(n).padStart(2, '0') }}</li>
            </ol>
            <p v-else style="margin:0;font:var(--ds-font-body-md);color:var(--ds-text-default)">Couverture satellite 98 % · 39 jeux complets sur 40.</p>
          </TabPanel>
        </div>
      </div>
    `,
  }),
}
