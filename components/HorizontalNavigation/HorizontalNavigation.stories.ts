import { ref, computed } from 'vue'
import type { Meta, StoryObj } from '@storybook/vue3'
import HorizontalNavigation from './HorizontalNavigation.vue'
import { DropdownItem, DropdownDivider } from '../Dropdown'
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
  // The page's column, not the bar's: the bar carries no margins and no ground
  // of its own (ADR-0047). These are the ones Figma's shell gives it — 12 above
  // and to the right, 8 on the sidebar's side, 12 to what follows — on the
  // page's `bg-neutral`, which the current crumb rises off.
  decorators: [
    () => ({
      template: `
        <div style="padding: var(--ds-spacing-lg) var(--ds-spacing-lg) var(--ds-spacing-lg) var(--ds-spacing-md); background: var(--ds-bg-neutral);">
          <story />
        </div>
      `,
    }),
  ],
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
    homeIcon: {
      control: 'inline-radio',
      options: ['house', 'arrow-left'],
      table: { category: 'Contenu', defaultValue: { summary: "'house'" } },
    },
    lockup: {
      control: 'boolean',
      table: { category: 'Contenu', defaultValue: { summary: 'true' } },
    },
    creditsReminder: {
      control: 'text',
      table: { category: 'Contenu' },
    },
    credits: {
      control: 'number',
      table: { category: 'Contenu', defaultValue: { summary: 'undefined — pas de pastille' } },
    },
    userInitials: {
      control: 'text',
      table: { category: 'Contenu', defaultValue: { summary: "'TD'" } },
    },
    userName: {
      control: 'text',
      description: 'L’en-tête du menu du compte — lu seulement quand `#user-menu` est fourni.',
      table: { category: 'Contenu' },
    },
    userEmail: {
      control: 'text',
      description: 'L’en-tête du menu du compte — lu seulement quand `#user-menu` est fourni.',
      table: { category: 'Contenu' },
    },
    hasNotification: {
      control: 'boolean',
      table: { category: 'Contenu', defaultValue: { summary: 'false' } },
    },
  },
  args: {
    credits: 250,
    userInitials: 'MD',
    userName: 'Mariama Diop',
    userEmail: 'mariama.diop@exemple.sn',
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
// Le menu du compte
// ─────────────────────────────────────────────────────────────────────

/**
 * Cliquez l'avatar. `#user-menu` fourni, il ouvre sous lui le menu du compte :
 * qui est connecté, puis les lignes du produit, qu'il ferme avec `close`.
 * Échap et le clic à l'extérieur le ferment. Sans le slot, l'avatar émet `user`.
 */
export const UserMenu: Story = {
  name: 'Le menu du compte',
  render: (args) => ({
    components: { HorizontalNavigation, DropdownItem, DropdownDivider },
    setup: () => ({ args }),
    template: `
      <HorizontalNavigation v-bind="args">
        <template #user-menu="{ close }">
          <DropdownItem icon="user-cog" label="Paramètres du compte" @click="close()" />
          <DropdownDivider />
          <DropdownItem icon="log-out" label="Se déconnecter" @click="close()" />
        </template>
      </HorizontalNavigation>
    `,
  }),
  args: {
    module: 'Yield',
    breadcrumbs: [{ label: 'Projets' }, { label: 'Campagne maïs' }],
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
      <div style="display: flex; flex-direction: column; gap: var(--ds-spacing-lg);">
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
      <div style="display: flex; flex-direction: column; gap: var(--ds-spacing-lg);">
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

// ─────────────────────────────────────────────────────────────────────
// Hors de l'app : Paramètres
// ─────────────────────────────────────────────────────────────────────

/**
 * Paramètres n'est ni un module ni l'accueil (maquette 3A, `2067:5918`) : la
 * fente d'identité se ferme, le bouton de retour ouvre la barre et ramène à la
 * page quittée — d'où la flèche et non la maison. Pas de pastille de crédits :
 * Paramètres a sa page Facturation, et `credits` absent ne rend rien.
 */
export const Settings: Story = {
  name: 'Paramètres — sans identité',
  render: (args) => ({
    components: { HorizontalNavigation },
    setup: () => ({ args }),
    template: `<HorizontalNavigation v-bind="args" :credits="undefined" />`,
  }),
  args: {
    lockup: false,
    homeIcon: 'arrow-left',
    homeLabel: 'Retourner sur l\u2019app',
    breadcrumbs: [{ label: 'Paramètres' }],
  },
}

/**
 * Le passage entre l'app et Paramètres, piloté par la barre elle-même : la roue
 * crantée ouvre Paramètres, « Retourner sur l'app » ramène à la page quittée, la
 * grille change de module. Depuis l'accueil, la roue crantée y mène aussi.
 *
 * Deux temps, et **rien ne glisse** : ce qui part s'efface sur place, la fente
 * s'ouvre ou se ferme entre les deux temps, et ce qui arrive arrive à sa place.
 */
export const SettingsSwap: Story = {
  name: 'Le passage — l\u2019app ⇄ Paramètres',
  parameters: {
    docs: {
      description: {
        story:
          'Cliquez la roue crantée, puis « Retourner sur l\u2019app ». Chaque temps dure ' +
          '`--ds-motion-duration-enter` (200 ms).',
      },
    },
  },
  render: (args) => ({
    components: { HorizontalNavigation },
    setup() {
      // Where the user is in the app, and whether they have stepped out of it.
      // Paramètres remembers the page it was opened from, so the way out can
      // return there rather than home.
      const module     = ref<ModuleName | undefined>('Yield')
      const inSettings = ref(false)

      function onSelect(mod: NavModule) {
        module.value     = mod.name
        inSettings.value = false
      }

      function onHome() {
        if (inSettings.value) inSettings.value = false
        else module.value = undefined
      }

      const crumbs = computed(() =>
        inSettings.value ? [{ label: 'Paramètres' }]
          : module.value ? [{ label: 'Projets' }, { label: 'Campagne maïs' }]
          : [],
      )

      return { args, module, inSettings, onSelect, onHome, crumbs }
    },
    template: `
      <HorizontalNavigation
        v-bind="args"
        :credits="undefined"
        :module="inSettings ? undefined : module"
        :lockup="!inSettings"
        :home-icon="inSettings ? 'arrow-left' : 'house'"
        :home-label="inSettings ? 'Retourner sur l\u2019app' : undefined"
        :breadcrumbs="crumbs"
        @module-select="onSelect"
        @settings="inSettings = true"
        @home="onHome"
      />
    `,
  }),
}
