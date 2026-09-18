import { ref } from 'vue'
import type { Meta, StoryObj } from '@storybook/vue3'
import SideNavigation from './SideNavigation.vue'
import SideNavItem from './SideNavItem.vue'
import WorkspaceSelector from '../WorkspaceSelector/WorkspaceSelector.vue'

const meta: Meta = {
  title: 'Navigation/SideNavigation',
  tags: ['wip'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          "Colonne de navigation principale du produit. La sélection appartient au groupe (`v-model`), " +
          "pas à l'item : une pastille unique glisse d'une ligne à l'autre. Le fond récessé fait partie " +
          "du composant — la pastille est `bg-default`, elle n'est lisible que posée dessus. " +
          '`v-model:collapsed` la réduit à un rail de 52px où le libellé passe dans un tooltip.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

const ITEMS = `
  <SideNavItem value="accueil"     icon="house"        label="Accueil" />
  <SideNavItem value="parcelles"   icon="map"          label="Parcelles" />
  <SideNavItem value="producteurs" icon="users"        label="Producteurs" />
  <SideNavItem value="rapports"    icon="chart-column" label="Rapports" />
  <SideNavItem value="parametres"  icon="settings"     label="Paramètres" />
`

const workspaces = [
  { id: 'kaolack', name: 'Coopérative de Kaolack' },
  { id: 'nioro',   name: 'Coopérative de Nioro' },
]

export const Default: Story = {
  render: () => ({
    setup: () => ({ current: ref('accueil'), collapsed: ref(false), workspaces }),
    components: { SideNavigation, SideNavItem, WorkspaceSelector },
    template: `
      <div style="width: 260px; height: 520px; display: flex;">
        <SideNavigation
          v-model="current"
          v-model:collapsed="collapsed"
          aria-label="Navigation principale"
          style="width: 100%;"
        >
          <template #header>
            <WorkspaceSelector :workspaces="workspaces" model-value="kaolack" :collapsed="collapsed" />
          </template>
          ${ITEMS}
        </SideNavigation>
      </div>
    `,
  }),
}

export const Toggling: Story = {
  name: 'Repli — le bouton',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story:
          'Le bouton `panel-left` en haut à droite de la colonne, à côté de la marque — le placement ' +
          'de Suno, Sentry, Charma et Clay. Replié, il passe sous la marque : le rail ne tient ' +
          "qu'une colonne. `toggle=false` le retire pour un shell qui place le sien.",
      },
    },
  },
  render: () => ({
    setup: () => ({ current: ref('accueil'), collapsed: ref(false), workspaces }),
    components: { SideNavigation, SideNavItem, WorkspaceSelector },
    template: `
      <div style="display: flex; align-items: flex-start; gap: 24px; height: 520px;">
        <SideNavigation
          v-model="current"
          v-model:collapsed="collapsed"
          aria-label="Navigation principale"
          :style="collapsed ? '' : 'width: 260px;'"
        >
          <template #header>
            <WorkspaceSelector :workspaces="workspaces" model-value="kaolack" :collapsed="collapsed" />
          </template>
          ${ITEMS}
        </SideNavigation>
        <p style="font: var(--ds-font-body-md); color: var(--ds-text-subtle); margin: 0;">
          Réduite : <strong>{{ collapsed }}</strong>
        </p>
      </div>
    `,
  }),
}

export const Collapsed: Story = {
  name: 'Réduite',
  parameters: {
    docs: {
      description: {
        story:
          "Rail icônes seules. Le libellé ne disparaît pas — il passe dans un `Tooltip` au survol " +
          "et dans `aria-label`, sans quoi les lignes n'auraient plus de nom du tout.",
      },
    },
  },
  render: () => ({
    setup: () => ({ current: ref('accueil'), workspaces }),
    components: { SideNavigation, SideNavItem, WorkspaceSelector },
    template: `
      <div style="height: 480px; display: flex;">
        <SideNavigation v-model="current" collapsed aria-label="Navigation principale">
          <template #header>
            <WorkspaceSelector :workspaces="workspaces" model-value="kaolack" collapsed />
          </template>
          ${ITEMS}
        </SideNavigation>
      </div>
    `,
  }),
}

export const SideBySide: Story = {
  name: 'Déployée vs réduite',
  parameters: {
    docs: {
      description: {
        story:
          'Les deux formes du même composant, une seule prop les sépare. La ligne garde sa hauteur ' +
          'de 36px : en se repliant la pastille se déplace et se rétrécit, elle ne change jamais de ' +
          'hauteur.',
      },
    },
  },
  render: () => ({
    setup: () => ({ a: ref('accueil'), b: ref('accueil'), workspaces }),
    components: { SideNavigation, SideNavItem, WorkspaceSelector },
    template: `
      <div style="display: flex; gap: 80px; height: 480px; padding: 24px;">
        <div style="width: 260px; display: flex;">
          <SideNavigation v-model="a" aria-label="Déployée" style="width: 100%;">
            <template #header>
              <WorkspaceSelector :workspaces="workspaces" model-value="kaolack" />
            </template>
            ${ITEMS}
          </SideNavigation>
        </div>
        <SideNavigation v-model="b" collapsed aria-label="Réduite">
          <template #header>
            <WorkspaceSelector :workspaces="workspaces" model-value="kaolack" collapsed />
          </template>
          ${ITEMS}
        </SideNavigation>
      </div>
    `,
  }),
}

export const AsLinks: Story = {
  name: 'Liens',
  parameters: {
    docs: {
      description: {
        story: "Avec `href`, l'item rend un `<a>` et porte `aria-current=\"page\"` (ADR-0014).",
      },
    },
  },
  render: () => ({
    setup: () => ({ current: ref('parcelles') }),
    components: { SideNavigation, SideNavItem },
    template: `
      <div style="width: 260px; height: 320px; display: flex;">
        <SideNavigation v-model="current" :toggle="false" aria-label="Navigation principale" style="width: 100%;">
          <SideNavItem value="accueil"   icon="house" label="Accueil"   href="#accueil" />
          <SideNavItem value="parcelles" icon="map"   label="Parcelles" href="#parcelles" />
          <SideNavItem value="rapports"  icon="chart-column" label="Rapports" href="#rapports" />
        </SideNavigation>
      </div>
    `,
  }),
}

export const WithDisabled: Story = {
  name: 'Item désactivé',
  parameters: {
    docs: {
      description: { story: 'Un module auquel le compte n’a pas accès.' },
    },
  },
  render: () => ({
    setup: () => ({ current: ref('accueil') }),
    components: { SideNavigation, SideNavItem },
    template: `
      <div style="width: 260px; height: 320px; display: flex;">
        <SideNavigation v-model="current" :toggle="false" aria-label="Navigation principale" style="width: 100%;">
          <SideNavItem value="accueil"   icon="house"        label="Accueil" />
          <SideNavItem value="parcelles" icon="map"          label="Parcelles" />
          <SideNavItem value="rapports"  icon="chart-column" label="Rapports" disabled />
        </SideNavigation>
      </div>
    `,
  }),
}

export const LongLabel: Story = {
  name: 'Libellé long',
  parameters: {
    docs: {
      description: {
        story:
          'Le libellé tronque plutôt que de passer à la ligne : la pastille glisse entre des lignes ' +
          'de même hauteur, une ligne plus haute la ferait se redimensionner en cours de trajet.',
      },
    },
  },
  render: () => ({
    setup: () => ({ current: ref('suivi') }),
    components: { SideNavigation, SideNavItem },
    template: `
      <div style="width: 260px; height: 320px; display: flex;">
        <SideNavigation v-model="current" :toggle="false" aria-label="Navigation principale" style="width: 100%;">
          <SideNavItem value="accueil"  icon="house" label="Accueil" />
          <SideNavItem value="suivi"    icon="map"   label="Suivi des parcelles cartographiées" />
          <SideNavItem value="rapports" icon="chart-column" label="Rapports" />
        </SideNavigation>
      </div>
    `,
  }),
}
