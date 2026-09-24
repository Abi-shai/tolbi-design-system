import { ref } from 'vue'
import type { Meta, StoryObj } from '@storybook/vue3'
import HorizontalNavigation from './HorizontalNavigation.vue'
import type { ModuleName } from '../ModuleIcon'
import type { NavModule } from './HorizontalNavigation.vue'
import HorizontalNavigationDocs from './HorizontalNavigation.mdx'

const ALL_MODULES = [
  { name: 'Carbone' as const, label: 'Carbone' },
  { name: 'Source'  as const, label: 'Source'  },
  { name: 'Call'    as const, label: 'Call'     },
  { name: 'Scan'    as const, label: 'Scan'     },
  { name: 'Data'    as const, label: 'Data'     },
  { name: 'ID'      as const, label: 'ID'       },
  { name: 'Redd+'   as const, label: 'Redd+'    },
  { name: 'Survey'  as const, label: 'Survey'   },
  { name: 'Yield'   as const, label: 'Yield'    },
  { name: 'Forest'  as const, label: 'Forest'   },
  { name: 'Trace'   as const, label: 'Trace'    },
]

const meta: Meta<typeof HorizontalNavigation> = {
  title: 'Navigation/HorizontalNavigation',
  component: HorizontalNavigation,
  tags: ['autodocs', 'stable'],
  parameters: {
    layout: 'fullscreen',
    docs: { page: HorizontalNavigationDocs },
  },
  argTypes: {
    module: {
      control: 'select',
      options: [undefined, ...ALL_MODULES.map(m => m.name)],
      table: { category: 'Contenu' },
    },
    moduleLabel: {
      control: 'text',
      table: { category: 'Contenu' },
    },
    homeLabel: {
      control: 'text',
      table: { category: 'Contenu', defaultValue: { summary: "'Retourner sur l\u2019accueil'" } },
    },
    creditsReminder: {
      control: 'text',
      table: { category: 'Contenu' },
    },
    credits: {
      control: 'number',
      table: { category: 'Contenu', defaultValue: { summary: '0' } },
    },
    userInitials: {
      control: 'text',
      table: { category: 'Contenu', defaultValue: { summary: "'TD'" } },
    },
    hasNotification: {
      control: 'boolean',
      table: { category: 'Contenu', defaultValue: { summary: 'false' } },
    },
  },
  args: {
    credits: 250,
    userInitials: 'MD',
    hasNotification: false,
    modules: ALL_MODULES,
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Accueil: Story = {
  args: { breadcrumbs: [] },
}

export const Module: Story = {
  name: 'ID — 3 nœuds',
  args: {
    module: 'ID',
    breadcrumbs: [{ label: 'Statistiques' }],
  },
}

export const Project: Story = {
  name: 'Yield — 5 nœuds, le seuil',
  args: {
    module: 'Yield',
    breadcrumbs: [
      { label: 'Projets' },
      { label: 'Campagne maïs' },
      { label: 'Dashboard' },
    ],
  },
}

export const Tabs: Story = {
  name: 'Data OS — 6 nœuds, replié',
  args: {
    module: 'Data',
    moduleLabel: 'Data OS',
    breadcrumbs: [
      { label: 'Projets' },
      { label: 'Forums' },
      { label: 'Forum 123' },
      { label: 'Assurance' },
      { label: 'Contrats' },
      { label: 'Avenant 4' },
    ],
  },
}

export const WithNotification: Story = {
  name: 'Avec notification non lue',
  args: {
    module: 'ID',
    hasNotification: true,
    breadcrumbs: [{ label: 'Statistiques' }],
  },
}

export const WithActiveModule: Story = {
  name: 'Module actif dans le dropdown',
  args: {
    module: 'Yield',
    breadcrumbs: [{ label: 'Projets' }],
  },
}

export const WithCreditsReminder: Story = {
  name: 'Avec rappel d\u2019\u00e9ch\u00e9ance',
  args: {
    credits: 250,
    creditsReminder: 'Expire dans 14 jours',
    creditsTone: 'warning',
  },
}

export const CreditsExpired: Story = {
  name: 'Crédits expirés',
  args: {
    credits: 0,
    creditsReminder: 'Crédits expirés',
    creditsTone: 'error',
  },
}

// ─────────────────────────────────────────────────────────────────────
// L'identité : la marque, ou le module
// ─────────────────────────────────────────────────────────────────────

/**
 * Le seul état qui montre la transition : choisissez un module dans la grille
 * (icône ⊞), la marque Tolbi laisse la place à celle du module ; la maison du
 * fil d'Ariane ramène à l'accueil et la marque revient.
 *
 * La barre ne route pas — elle émet `module-select`, et c'est le produit qui
 * repose `module`. Ici, c'est le `ref` ci-dessous.
 */
export const IdentitySwap: Story = {
  name: 'Le passage — marque ⇄ module',
  parameters: {
    docs: {
      description: {
        story:
          'Cliquez la grille des modules puis un module. La croisée dure ' +
          '`--ds-motion-duration-moderate` (150 ms) en `--ds-motion-easing-default`.',
      },
    },
  },
  render: (args) => ({
    components: { HorizontalNavigation },
    setup() {
      const current = ref<ModuleName | undefined>(undefined)
      const label   = ref<string | undefined>(undefined)

      function onSelect(mod: NavModule) {
        current.value = mod.name
        label.value   = mod.label
      }

      function onHome() {
        current.value = undefined
        label.value   = undefined
      }

      const crumbs = () =>
        current.value ? [{ label: 'Projets' }, { label: 'Campagne maïs' }] : []

      return { args, current, label, onSelect, onHome, crumbs }
    },
    template: `
      <HorizontalNavigation
        v-bind="args"
        :module="current"
        :module-label="label"
        :breadcrumbs="crumbs()"
        @module-select="onSelect"
        @home="onHome"
      />
    `,
  }),
}

/**
 * Les onze marques à 32px, dans la fente. 24px ne tient pas : l'ADR-0041 a
 * mesuré le trait de Yield à 0,89px à cette taille.
 */
export const EveryModule: Story = {
  name: 'Les onze marques',
  parameters: { layout: 'fullscreen' },
  render: (args) => ({
    components: { HorizontalNavigation },
    setup: () => ({ args, all: ALL_MODULES }),
    template: `
      <div>
        <HorizontalNavigation v-bind="args" :breadcrumbs="[]" />
        <HorizontalNavigation
          v-for="m in all"
          :key="m.name"
          v-bind="args"
          :module="m.name"
          :breadcrumbs="[{ label: 'Projets' }]"
        />
      </div>
    `,
  }),
}

/**
 * La maison porte son mot maintenant. Dans la barre elle n'est **jamais** la
 * page courante — le fil n'est plus rendu à la profondeur 0 — donc l'impératif
 * y est toujours juste, là où `Breadcrumbs` seul doit rester sur un lieu.
 */
export const HomeLabel: Story = {
  name: 'Le retour à l\u2019accueil — le mot',
  parameters: { layout: 'fullscreen' },
  render: (args) => ({
    components: { HorizontalNavigation },
    setup: () => ({ args, labels: [undefined, 'Accueil', 'Revenir sur l\u2019accueil'] }),
    template: `
      <div>
        <HorizontalNavigation
          v-for="(l, i) in labels"
          :key="i"
          v-bind="args"
          module="Yield"
          :home-label="l"
          :breadcrumbs="[{ label: 'Projets' }, { label: 'Campagne maïs' }]"
        />
      </div>
    `,
  }),
}
