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
    state: {
      control: 'select',
      options: ['Accueil', 'Module', 'Project', 'tabs'],
      table: { category: 'État', defaultValue: { summary: "'Accueil'" } },
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
    state: 'Accueil',
    credits: 250,
    userInitials: 'MD',
    hasNotification: false,
    modules: ALL_MODULES,
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Accueil: Story = {
  args: { state: 'Accueil' },
}

export const Module: Story = {
  args: {
    state: 'Module',
    breadcrumbs: [
      { label: 'Analyses', active: true },
    ],
  },
}

export const Project: Story = {
  args: {
    state: 'Project',
    breadcrumbs: [
      { label: 'Carbone' },
      { label: 'Analyses' },
      { label: 'Tolbi', active: true },
    ],
  },
}

export const Tabs: Story = {
  name: 'Tabs (profondeur max)',
  args: {
    state: 'tabs',
    breadcrumbs: [
      { label: 'Carbone' },
      { label: 'Analyses' },
      { label: 'Tolbi' },
      { label: 'Dashboard', active: true },
    ],
  },
}

export const WithNotification: Story = {
  name: 'Avec notification non lue',
  args: {
    state: 'Module',
    hasNotification: true,
    breadcrumbs: [{ label: 'Analyses', active: true }],
  },
}

export const WithActiveModule: Story = {
  name: 'Module actif dans le dropdown',
  args: {
    state: 'Module',
    breadcrumbs: [{ label: 'Analyses', active: true }],
    modules: ALL_MODULES.map(m => ({ ...m, active: m.name === 'Carbone' })),
  },
}

export const WithCreditsReminder: Story = {
  name: 'Avec rappel d’échéance',
  args: {
    state: 'Accueil',
    credits: 250,
    creditsReminder: 'Expire dans 14 jours',
    creditsTone: 'warning',
  },
}

export const CreditsExpired: Story = {
  name: 'Crédits expirés',
  args: {
    state: 'Accueil',
    credits: 250,
    creditsReminder: 'Vos crédits ont expiré',
    creditsTone: 'error',
  },
}
