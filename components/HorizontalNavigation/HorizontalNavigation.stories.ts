import type { Meta, StoryObj } from '@storybook/vue3'
import HorizontalNavigation from './HorizontalNavigation.vue'
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
    breadcrumbs: [{ label: 'ID' }, { label: 'Statistiques' }],
  },
}

export const Project: Story = {
  name: 'Yield — 5 nœuds, le seuil',
  args: {
    breadcrumbs: [
      { label: 'Yield' },
      { label: 'Projets' },
      { label: 'Campagne maïs' },
      { label: 'Dashboard' },
    ],
  },
}

export const Tabs: Story = {
  name: 'Data OS — 6 nœuds, replié',
  args: {
    breadcrumbs: [
      { label: 'Data OS' },
      { label: 'Projets' },
      { label: 'Forums' },
      { label: 'Forum 123' },
      { label: 'Assurance' },
    ],
  },
}

export const WithNotification: Story = {
  name: 'Avec notification non lue',
  args: {
    hasNotification: true,
    breadcrumbs: [{ label: 'ID' }, { label: 'Statistiques' }],
  },
}

export const WithActiveModule: Story = {
  name: 'Module actif dans le dropdown',
  args: {
    breadcrumbs: [{ label: 'Yield' }, { label: 'Projets' }],
    modules: ALL_MODULES.map(m => ({ ...m, active: m.name === 'Yield' })),
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
