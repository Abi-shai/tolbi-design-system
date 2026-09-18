import { ref } from 'vue'
import type { Meta, StoryObj } from '@storybook/vue3'
import SideNavigation from './SideNavigation.vue'
import SideNavItem from './SideNavItem.vue'

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
          "du composant — la pastille est `bg-default`, elle n'est lisible que posée dessus.",
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    setup: () => ({ current: ref('accueil') }),
    components: { SideNavigation, SideNavItem },
    template: `
      <div style="width: 260px; height: 480px;">
        <SideNavigation v-model="current" aria-label="Navigation principale" style="height: 100%;">
          <SideNavItem value="accueil"    icon="house"        label="Accueil" />
          <SideNavItem value="parcelles"  icon="map"          label="Parcelles" />
          <SideNavItem value="producteurs" icon="users"       label="Producteurs" />
          <SideNavItem value="rapports"   icon="chart-column" label="Rapports" />
          <SideNavItem value="parametres" icon="settings"     label="Paramètres" />
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
        story:
          "Avec `href`, l'item rend un `<a>` et porte `aria-current=\"page\"` (ADR-0014).",
      },
    },
  },
  render: () => ({
    setup: () => ({ current: ref('parcelles') }),
    components: { SideNavigation, SideNavItem },
    template: `
      <div style="width: 260px; height: 320px;">
        <SideNavigation v-model="current" aria-label="Navigation principale" style="height: 100%;">
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
      description: {
        story: 'Un module auquel le compte n’a pas accès.',
      },
    },
  },
  render: () => ({
    setup: () => ({ current: ref('accueil') }),
    components: { SideNavigation, SideNavItem },
    template: `
      <div style="width: 260px; height: 320px;">
        <SideNavigation v-model="current" aria-label="Navigation principale" style="height: 100%;">
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
          "Le libellé tronque plutôt que de passer à la ligne : la pastille glisse entre des lignes " +
          'de même hauteur, une ligne plus haute la ferait se redimensionner en cours de trajet.',
      },
    },
  },
  render: () => ({
    setup: () => ({ current: ref('suivi') }),
    components: { SideNavigation, SideNavItem },
    template: `
      <div style="width: 260px; height: 320px;">
        <SideNavigation v-model="current" aria-label="Navigation principale" style="height: 100%;">
          <SideNavItem value="accueil" icon="house" label="Accueil" />
          <SideNavItem value="suivi"   icon="map"   label="Suivi des parcelles cartographiées" />
          <SideNavItem value="rapports" icon="chart-column" label="Rapports" />
        </SideNavigation>
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
          "et dans `aria-label`, sans quoi les lignes n'auraient plus de nom du tout. Survole une " +
          'ligne pour le voir.',
      },
    },
  },
  render: () => ({
    setup: () => ({ current: ref('accueil') }),
    components: { SideNavigation, SideNavItem },
    template: `
      <div style="height: 480px; display: flex;">
        <SideNavigation v-model="current" collapsed aria-label="Navigation principale">
          <SideNavItem value="accueil"    icon="house"        label="Accueil" />
          <SideNavItem value="parcelles"  icon="map"          label="Parcelles" />
          <SideNavItem value="producteurs" icon="users"       label="Producteurs" />
          <SideNavItem value="rapports"   icon="chart-column" label="Rapports" />
          <SideNavItem value="parametres" icon="settings"     label="Paramètres" />
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
          "de 36px : en se repliant la pastille se déplace et se rétrécit, elle ne change jamais de " +
          'hauteur.',
      },
    },
  },
  render: () => ({
    setup: () => ({ a: ref('accueil'), b: ref('accueil') }),
    components: { SideNavigation, SideNavItem },
    template: `
      <div style="display: flex; gap: 80px; height: 480px; padding: 24px;">
        <div style="width: 260px; display: flex;">
          <SideNavigation v-model="a" aria-label="Déployée" style="width: 100%;">
          <SideNavItem value="accueil"    icon="house"        label="Accueil" />
          <SideNavItem value="parcelles"  icon="map"          label="Parcelles" />
          <SideNavItem value="producteurs" icon="users"       label="Producteurs" />
          <SideNavItem value="rapports"   icon="chart-column" label="Rapports" />
          <SideNavItem value="parametres" icon="settings"     label="Paramètres" />
          </SideNavigation>
        </div>
        <SideNavigation v-model="b" collapsed aria-label="Réduite">
          <SideNavItem value="accueil"    icon="house"        label="Accueil" />
          <SideNavItem value="parcelles"  icon="map"          label="Parcelles" />
          <SideNavItem value="producteurs" icon="users"       label="Producteurs" />
          <SideNavItem value="rapports"   icon="chart-column" label="Rapports" />
          <SideNavItem value="parametres" icon="settings"     label="Paramètres" />
        </SideNavigation>
      </div>
    `,
  }),
}
