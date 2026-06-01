import type { Meta, StoryObj } from '@storybook/vue3'
import BadgeGroup from './BadgeGroup.vue'

const COLORS = ['brand', 'error', 'warning', 'success', 'gray'] as const

const meta: Meta<typeof BadgeGroup> = {
  title: 'Components/BadgeGroup',
  component: BadgeGroup,
  tags: [],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: "Bannière d'annonce combinant un pill-badge et un texte. Usage typique : release notes, alertes système, statuts inline.",
      },
    },
  },
  argTypes: {
    label: {
      control: 'text',
      table: { category: 'Contenu' },
    },
    message: {
      control: 'text',
      table: { category: 'Contenu' },
    },
    color: {
      control: 'select',
      options: COLORS,
      table: { category: 'Apparence', defaultValue: { summary: "'brand'" } },
    },
    size: {
      control: 'inline-radio',
      options: ['md', 'lg'],
      table: { category: 'Apparence', defaultValue: { summary: "'md'" } },
    },
    badge: {
      control: 'inline-radio',
      options: ['leading', 'trailing'],
      table: { category: 'Apparence', defaultValue: { summary: "'leading'" } },
    },
    icon: {
      control: 'text',
      table: { category: 'Contenu', type: { summary: 'IconName' } },
    },
  },
  args: {
    label:   'New feature',
    message: "We've just released a new feature",
    color:   'brand',
    size:    'md',
    badge:   'leading',
    icon:    'edit-01',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Leading: Story = {
  args: { badge: 'leading' },
}

export const Trailing: Story = {
  args: {
    badge:   'trailing',
    label:   'New feature',
    message: "We've just released a new feature",
  },
}

export const Large: Story = {
  args: { size: 'lg', badge: 'leading' },
}

export const NoIcon: Story = {
  name: 'Without icon',
  args: { icon: undefined },
}

export const AllColors: Story = {
  name: 'All colors — leading',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { BadgeGroup },
    setup: () => ({
      items: [
        { color: 'brand',   label: 'New feature', message: "We've just released a new feature" },
        { color: 'error',   label: 'Error',        message: 'There was a problem with that action' },
        { color: 'warning', label: 'Warning',      message: 'Just to let you know this might be a problem' },
        { color: 'success', label: 'Success',      message: "You've updated your profile and details" },
        { color: 'gray',    label: 'Version 4.0',  message: "We've just released a new feature" },
      ],
    }),
    template: `
      <div style="display:flex; flex-direction:column; gap:10px;">
        <BadgeGroup
          v-for="item in items"
          :key="item.color"
          :label="item.label"
          :message="item.message"
          :color="item.color"
          badge="leading"
          icon="edit-01"
        />
      </div>
    `,
  }),
}

export const AllColorsTrailing: Story = {
  name: 'All colors — trailing',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { BadgeGroup },
    setup: () => ({
      items: [
        { color: 'brand',   label: 'New feature', message: "We've just released a new feature" },
        { color: 'error',   label: 'Fix now',      message: 'There was a problem with that action' },
        { color: 'warning', label: 'Warning',      message: 'Just to let you know this might be a problem' },
        { color: 'success', label: 'Success',      message: "You've updated your profile and details" },
        { color: 'gray',    label: 'Version 4.0',  message: "We've just released a new feature" },
      ],
    }),
    template: `
      <div style="display:flex; flex-direction:column; gap:10px;">
        <BadgeGroup
          v-for="item in items"
          :key="item.color"
          :label="item.label"
          :message="item.message"
          :color="item.color"
          badge="trailing"
          icon="edit-01"
        />
      </div>
    `,
  }),
}
