import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import Tabs from './Tabs.vue'
import type { TabsItem } from './Tabs.vue'

const defaultTabs: TabsItem[] = [
  { value: 'my-details', label: 'My details' },
  { value: 'profile',    label: 'Profile' },
  { value: 'password',   label: 'Password' },
  { value: 'team',       label: 'Team', badge: 2 },
  { value: 'plan',       label: 'Plan' },
]

const meta: Meta<typeof Tabs> = {
  title: 'Navigation/Tabs',
  component: Tabs,
  tags: ['stable'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Barre d\'onglets horizontale de style "pill". Deux tailles disponibles : md (44 px) et sm (36 px). Supporte les badges sur chaque onglet.',
      },
    },
  },
  argTypes: {
    modelValue: { control: false },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md'],
      table: { category: 'Apparence', defaultValue: { summary: "'md'" } },
    },
    tabs: { control: false },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const SizeMd: Story = {
  name: 'Size — md',
  render: (args) => ({
    components: { Tabs },
    setup() {
      const active = ref('my-details')
      return { args, active, defaultTabs }
    },
    template: `<Tabs v-model="active" :tabs="defaultTabs" size="md" />`,
  }),
}

export const SizeSm: Story = {
  name: 'Size — sm',
  render: (args) => ({
    components: { Tabs },
    setup() {
      const active = ref('my-details')
      return { args, active, defaultTabs }
    },
    template: `<Tabs v-model="active" :tabs="defaultTabs" size="sm" />`,
  }),
}

/** `xs` (ADR-0102) : changer ce qu’un instrument montre — l’indicateur d’une légende de carte. 28 px, `label-md-strong`, rail de 2 px. */
export const SizeXs: Story = {
  name: 'Size — xs',
  render: (args) => ({
    components: { Tabs },
    setup() {
      const active = ref('carbon')
      const tabs = [
        { value: 'carbon', label: 'Carbone' },
        { value: 'biomass', label: 'Biomasse' },
        { value: 'cover', label: 'Couvert' },
        { value: 'height', label: 'Hauteur' },
      ]
      return { args, active, tabs }
    },
    template: `<div style="max-width:480px"><Tabs v-model="active" :tabs="tabs" size="xs" aria-label="Indicateur affiché" /></div>`,
  }),
}

export const BothSizes: Story = {
  name: 'Both sizes',
  render: () => ({
    components: { Tabs },
    setup() {
      const md = ref('my-details')
      const sm = ref('my-details')
      return { md, sm, defaultTabs }
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 24px">
        <div>
          <p style="font-family: Poppins, sans-serif; font-size: 12px; color: #667085; margin-bottom: 8px">md</p>
          <Tabs v-model="md" :tabs="defaultTabs" size="md" />
        </div>
        <div>
          <p style="font-family: Poppins, sans-serif; font-size: 12px; color: #667085; margin-bottom: 8px">sm</p>
          <Tabs v-model="sm" :tabs="defaultTabs" size="sm" />
        </div>
      </div>
    `,
  }),
}

export const NoBadge: Story = {
  name: 'No badge',
  render: () => ({
    components: { Tabs },
    setup() {
      const active = ref('profile')
      const tabs: TabsItem[] = [
        { value: 'my-details', label: 'My details' },
        { value: 'profile',    label: 'Profile' },
        { value: 'password',   label: 'Password' },
        { value: 'plan',       label: 'Plan' },
      ]
      return { active, tabs }
    },
    template: `<Tabs v-model="active" :tabs="tabs" />`,
  }),
}

/**
 * ADR-0149 — **le badge d’un onglet** : un compte de ce que l’onglet ouvre (parcelles, points, témoins) prend la
 * couleur de la marque, `badgeTone: 'brand'` ; un compte qui signale un problème (alertes, qualité, demandes
 * d’auditeur) garde son ton.
 */
export const BadgeTones: Story = {
  name: 'Ton du badge',
  render: () => ({
    components: { Tabs },
    setup: () => ({
      a: ref('parcels'),
      tabs: [
        { value: 'data', label: 'Données' },
        { value: 'parcels', label: 'Parcelles', badge: 240, badgeTone: 'brand' },
        { value: 'alerts', label: 'Alertes', badge: 3, badgeTone: 'error' },
        { value: 'report', label: 'Rapport' },
      ],
    }),
    template: `<div style="width:30rem"><Tabs v-model="a" :tabs="tabs" size="sm" /></div>`,
  }),
}

/**
 * ADR-0141 — **un onglet ne coupe jamais son contenu** : chacun part de la largeur de ce qu’il porte, la place qui
 * reste est partagée ; si même ainsi ça ne tient pas, le libellé s’ellipse et le compte reste entier. Les cas réels :
 * la tête d’un `MapPanel lg` (25rem moins le bouton replier), « Données · Parcelles 128 · Rapport » ; puis une bande
 * plus étroite encore.
 */
export const ContentWidth: Story = {
  name: 'À la largeur du contenu',
  render: () => ({
    components: { Tabs },
    setup: () => ({
      a: ref('data'), b: ref('parcels'), c: ref('data'),
      dmrv: [{ value: 'data', label: 'Données' }, { value: 'parcels', label: 'Parcelles', badge: 28, badgeTone: 'brand' }, { value: 'report', label: 'Rapport' }],
      arr: [{ value: 'data', label: 'Données' }, { value: 'parcels', label: 'Parcelles', badge: 128, badgeTone: 'brand' }, { value: 'report', label: 'Rapport' }],
    }),
    template: `
      <div style="display:flex;flex-direction:column;gap:24px">
        <div style="width:328px"><Tabs v-model="a" :tabs="dmrv" size="sm" /></div>
        <div style="width:328px"><Tabs v-model="b" :tabs="arr" size="sm" /></div>
        <div style="width:240px"><Tabs v-model="c" :tabs="arr" size="sm" /></div>
      </div>
    `,
  }),
}
