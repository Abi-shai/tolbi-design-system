import { ref, watch } from 'vue'
import type { Meta, StoryObj } from '@storybook/vue3'
import SideNavigation from './SideNavigation.vue'
import SideNavItem from './SideNavItem.vue'
import SideNavGroup from './SideNavGroup.vue'
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
          '`v-model:collapsed` la réduit à un rail de 68px où le libellé passe dans un tooltip. ' +
          'Rempli, le slot `#panel` ajoute un second niveau : le rail garde les rubriques, un panneau ' +
          'de 200px titré par la rubrique sélectionnée porte ses pages (`v-model:page`).',
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
      <div style="width: 260px; height: 100vh; display: flex;">
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
      <div style="height: 480px; display: flex; align-items: stretch;">
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
        <SideNavigation v-model="b" collapsed aria-label="Réduite" style="align-self: stretch;">
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

/* ── Deux niveaux ─────────────────────────────────────────────────── */

interface Page { value: string; icon: string; label: string }
interface PageGroup { label?: string; pages: Page[] }

const SECTIONS = [
  { value: 'accueil',     icon: 'house',        label: 'Accueil' },
  { value: 'parcelles',   icon: 'map',          label: 'Parcelles' },
  { value: 'producteurs', icon: 'users',        label: 'Producteurs' },
  { value: 'rapports',    icon: 'chart-column', label: 'Rapports' },
  { value: 'parametres',  icon: 'settings',     label: 'Paramètres' },
]

/** Accueil has no pages: the panel is absent there, and so is the toggle. */
const PAGES: Record<string, PageGroup[]> = {
  accueil: [],
  parcelles: [
    { pages: [
      { value: 'toutes', icon: 'list', label: 'Toutes les parcelles' },
      { value: 'carte',  icon: 'map',  label: 'Carte' },
    ] },
    { label: 'Suivi', pages: [
      { value: 'campagnes',    icon: 'calendar', label: 'Campagnes' },
      { value: 'cultures',     icon: 'sprout',   label: 'Cultures' },
      { value: 'observations', icon: 'scan',     label: 'Observations' },
    ] },
    { label: 'Données', pages: [
      { value: 'imports', icon: 'upload',   label: 'Imports' },
      { value: 'exports', icon: 'download', label: 'Exports' },
    ] },
  ],
  producteurs: [
    { pages: [
      { value: 'tous',        icon: 'users',      label: 'Tous les producteurs' },
      { value: 'groupements', icon: 'building-2', label: 'Groupements' },
    ] },
    { label: 'Terrain', pages: [
      { value: 'enquetes',       icon: 'clipboard-list', label: 'Enquêtes' },
      { value: 'certifications', icon: 'shield-check',   label: 'Certifications' },
    ] },
  ],
  rapports: [
    { pages: [
      { value: 'tableaux', icon: 'chart-column', label: 'Tableaux de bord' },
      { value: 'fichiers', icon: 'file-text',    label: 'Rapports exportés' },
    ] },
  ],
  parametres: [
    { label: 'Compte', pages: [
      { value: 'profil',        icon: 'user',   label: 'Profil' },
      { value: 'notifications', icon: 'bell',   label: 'Notifications' },
      { value: 'securite',      icon: 'shield', label: 'Sécurité' },
    ] },
    { label: 'Organisation', pages: [
      { value: 'general',     icon: 'building-2',  label: 'Général' },
      { value: 'membres',     icon: 'users',       label: 'Membres' },
      { value: 'facturation', icon: 'credit-card', label: 'Facturation' },
    ] },
  ],
}

const firstPage = (section: string) => PAGES[section]?.[0]?.pages[0]?.value ?? ''

/** A shell's own job, not the component's: a new section lands on its first page. */
function useTwoTier(initial: string, collapsedAtStart = false) {
  const section = ref(initial)
  const page = ref(firstPage(initial))
  const collapsed = ref(collapsedAtStart)
  watch(section, (s) => { page.value = firstPage(s) })
  return { section, page, collapsed }
}

const TWO_TIER = `
  <SideNavigation
    v-model="section"
    v-model:page="page"
    v-model:collapsed="collapsed"
    aria-label="Navigation principale"
  >
    <template #header="header">
      <WorkspaceSelector :workspaces="workspaces" model-value="kaolack" :collapsed="header.collapsed" />
    </template>

    <SideNavItem v-for="s in SECTIONS" :key="s.value" :value="s.value" :icon="s.icon" :label="s.label" />

    <template #panel>
      <template v-for="(g, i) in PAGES[section]" :key="section + i">
        <SideNavGroup v-if="g.label" :label="g.label">
          <SideNavItem v-for="p in g.pages" :key="p.value" :value="p.value" :icon="p.icon" :label="p.label" />
        </SideNavGroup>
        <template v-else>
          <SideNavItem v-for="p in g.pages" :key="p.value" :value="p.value" :icon="p.icon" :label="p.label" />
        </template>
      </template>
    </template>
  </SideNavigation>
`

const twoTierStory = (initial: string, collapsedAtStart = false) => () => ({
  setup: () => ({ ...useTwoTier(initial, collapsedAtStart), workspaces, SECTIONS, PAGES }),
  components: { SideNavigation, SideNavItem, SideNavGroup, WorkspaceSelector },
  template: `
    <div style="height: 100vh; display: flex; background: var(--ds-bg-neutral);">
      ${TWO_TIER}
      <main style="flex: 1; margin: 12px 12px 12px 0; border-radius: 12px; background: var(--ds-bg-default); padding: 24px; font: var(--ds-font-body-md); color: var(--ds-text-subtle);">
        <p style="font: var(--ds-font-heading-lg); color: var(--ds-text-strong); margin: 0 0 8px;">{{ SECTIONS.find(s => s.value === section)?.label }}</p>
        <p style="margin: 0;">Page : <strong>{{ page || '—' }}</strong> · réduite : <strong>{{ collapsed }}</strong></p>
      </main>
    </div>
  `,
})

export const TwoTier: Story = {
  name: 'Deux niveaux',
  parameters: {
    docs: {
      description: {
        story:
          'Le rail porte les rubriques, le panneau les pages de la rubrique sélectionnée — titré par elle, ' +
          'lu sur le rail plutôt que passé en prop. Deux sélections, deux pastilles : `v-model` pour la ' +
          'rubrique, `v-model:page` pour la page. La bascule est dessinée dans la ligne du titre ; ' +
          'repliée, elle rejoint le rail au-dessus de la marque en suivant le bord du panneau.',
      },
    },
  },
  render: twoTierStory('parcelles'),
}

export const TwoTierCollapsed: Story = {
  name: 'Deux niveaux — réduite',
  parameters: {
    docs: {
      description: {
        story:
          "Réduite, il ne reste que le rail : c'est la forme réduite d'une seule colonne, à l'identique. " +
          '`collapsed` ne ferme que le panneau — le rail, lui, ne se replie jamais.',
      },
    },
  },
  render: twoTierStory('parcelles', true),
}

export const TwoTierNoPages: Story = {
  name: 'Deux niveaux — rubrique sans pages',
  parameters: {
    docs: {
      description: {
        story:
          "Accueil n'a pas de pages : le slot ne rend rien, le panneau se ferme et la bascule disparaît " +
          "avec lui — elle n'aurait rien à montrer ni à cacher. La colonne reste un rail : c'est la " +
          'déclaration de `#panel`, pas son contenu, qui la met sur deux niveaux.',
      },
    },
  },
  render: twoTierStory('accueil'),
}
