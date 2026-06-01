import type { Meta, StoryObj } from '@storybook/vue3'
import Badge from './Badge.vue'

const ALL_COLORS = [
  'brand', 'error', 'warning', 'success', 'gray',
  'blue', 'blue-light', 'blue-gray', 'gray-blue',
  'indigo', 'orange', 'pink', 'purple',
] as const

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  tags: [],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Étiquette de statut ou de catégorie. Non interactive — pour des actions de suppression utiliser `dismissible`.',
      },
    },
  },
  argTypes: {
    label: {
      control: 'text',
      table: { category: 'Contenu' },
    },
    color: {
      control: 'select',
      options: ALL_COLORS,
      table: {
        category: 'Apparence',
        defaultValue: { summary: "'brand'" },
      },
    },
    variant: {
      control: 'inline-radio',
      options: ['pill-color', 'pill-outline'],
      table: {
        category: 'Apparence',
        defaultValue: { summary: "'pill-color'" },
      },
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      table: {
        category: 'Apparence',
        defaultValue: { summary: "'sm'" },
      },
    },
    dot: {
      control: 'boolean',
      table: { category: 'Contenu', defaultValue: { summary: 'false' } },
    },
    dismissible: {
      control: 'boolean',
      table: { category: 'Contenu', defaultValue: { summary: 'false' } },
    },
    icon: {
      control: 'text',
      table: { category: 'Contenu', type: { summary: 'IconName' } },
    },
  },
  args: {
    label: 'Label',
    color: 'brand',
    variant: 'pill-color',
    size: 'sm',
    dot: false,
    dismissible: false,
  },
}

export default meta
type Story = StoryObj<typeof meta>

// ── Variants ────────────────────────────────────────────────────────

export const Default: Story = {}

export const Outline: Story = {
  args: { variant: 'pill-outline' },
}

export const WithDot: Story = {
  name: 'With dot',
  args: { dot: true },
}

export const WithIcon: Story = {
  name: 'With icon',
  args: { icon: 'check' },
}

export const Dismissible: Story = {
  args: { dismissible: true },
}

// ── Sizes ────────────────────────────────────────────────────────────

export const AllSizes: Story = {
  name: 'All sizes',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { Badge },
    template: `
      <div style="display:flex; gap:12px; align-items:center;">
        <Badge label="Small"  size="sm" />
        <Badge label="Medium" size="md" />
        <Badge label="Large"  size="lg" />
      </div>
    `,
  }),
}

// ── Couleurs ─────────────────────────────────────────────────────────

export const AllColors: Story = {
  name: 'All colors — pill color',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { Badge },
    setup: () => ({ colors: ALL_COLORS }),
    template: `
      <div style="display:flex; gap:8px; flex-wrap:wrap;">
        <Badge
          v-for="color in colors"
          :key="color"
          :label="color"
          :color="color"
          variant="pill-color"
        />
      </div>
    `,
  }),
}

export const AllColorsOutline: Story = {
  name: 'All colors — pill outline',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { Badge },
    setup: () => ({ colors: ALL_COLORS }),
    template: `
      <div style="display:flex; gap:8px; flex-wrap:wrap;">
        <Badge
          v-for="color in colors"
          :key="color"
          :label="color"
          :color="color"
          variant="pill-outline"
        />
      </div>
    `,
  }),
}

export const AllColorsWithDot: Story = {
  name: 'All colors — with dot',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { Badge },
    setup: () => ({ colors: ALL_COLORS }),
    template: `
      <div style="display:flex; gap:8px; flex-wrap:wrap;">
        <Badge
          v-for="color in colors"
          :key="color"
          :label="color"
          :color="color"
          :dot="true"
        />
      </div>
    `,
  }),
}
