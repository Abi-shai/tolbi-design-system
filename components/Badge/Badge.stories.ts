import type { Meta, StoryObj } from '@storybook/vue3'
import Badge from './Badge.vue'
import StoryGrid from '../../stories/StoryGrid.vue'

const ALL_COLORS = [
  'brand', 'error', 'warning', 'success', 'gray',
  'blue', 'blue-light', 'blue-gray', 'gray-blue',
  'indigo', 'orange', 'pink', 'purple',
] as const

const meta: Meta<typeof Badge> = {
  title: 'Étiquettes/Badge',
  component: Badge,
  tags: ['wip'],
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
    components: { StoryGrid },
    setup: () => ({
      items: [
        { component: Badge, props: { label: 'Small',  size: 'sm' } },
        { component: Badge, props: { label: 'Medium', size: 'md' } },
        { component: Badge, props: { label: 'Large',  size: 'lg' } },
      ],
    }),
    template: `<StoryGrid :items="items" />`,
  }),
}

// ── Couleurs ─────────────────────────────────────────────────────────

export const AllColors: Story = {
  name: 'All colors — pill color',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { StoryGrid },
    setup: () => ({
      items: ALL_COLORS.map(color => ({ component: Badge, props: { label: color, color, variant: 'pill-color' } })),
    }),
    template: `<StoryGrid :items="items" gap="var(--ds-space-2)" />`,
  }),
}

export const AllColorsOutline: Story = {
  name: 'All colors — pill outline',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { StoryGrid },
    setup: () => ({
      items: ALL_COLORS.map(color => ({ component: Badge, props: { label: color, color, variant: 'pill-outline' } })),
    }),
    template: `<StoryGrid :items="items" gap="var(--ds-space-2)" />`,
  }),
}

export const AllColorsWithDot: Story = {
  name: 'All colors — with dot',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { StoryGrid },
    setup: () => ({
      items: ALL_COLORS.map(color => ({ component: Badge, props: { label: color, color, dot: true } })),
    }),
    template: `<StoryGrid :items="items" gap="var(--ds-space-2)" />`,
  }),
}
