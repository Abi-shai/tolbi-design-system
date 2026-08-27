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
  title: 'Components/Tabs',
  component: Tabs,
  tags: ['autodocs'],
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
      options: ['sm', 'md'],
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
