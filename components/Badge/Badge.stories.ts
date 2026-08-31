import type { Meta, StoryObj } from '@storybook/vue3'
import Badge from './Badge.vue'
import StoryGrid from '../../stories/StoryGrid.vue'

// ADR-0010: two axes, because they route differently. A tone states a role and
// resolves through the semantic layer; a colour states an identity and resolves
// straight to the display palette.
const ALL_TONES  = ['neutral', 'error', 'warning', 'success'] as const
const ALL_COLORS = [
  'blue', 'blue-light', 'blue-gray',
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
    tone: {
      control: 'select',
      options: ALL_TONES,
      table: {
        category: 'Apparence',
        type: { summary: 'BadgeTone' },
        defaultValue: { summary: "'neutral'" },
      },
    },
    color: {
      control: 'select',
      options: [undefined, ...ALL_COLORS],
      table: {
        category: 'Apparence',
        type: { summary: 'BadgeColor' },
        defaultValue: { summary: 'undefined' },
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
    tone: 'neutral',
    color: undefined,
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
  name: 'Tones and colors — pill color',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { StoryGrid },
    setup: () => ({
      items: [
        ...ALL_TONES.map(tone   => ({ component: Badge, props: { label: tone,  tone,  variant: 'pill-color' } })),
        ...ALL_COLORS.map(color => ({ component: Badge, props: { label: color, color, variant: 'pill-color' } })),
      ],
    }),
    template: `<StoryGrid :items="items" gap="var(--ds-space-2)" />`,
  }),
}

export const AllColorsOutline: Story = {
  name: 'Tones and colors — pill outline',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { StoryGrid },
    setup: () => ({
      items: [
        ...ALL_TONES.map(tone   => ({ component: Badge, props: { label: tone,  tone,  variant: 'pill-outline' } })),
        ...ALL_COLORS.map(color => ({ component: Badge, props: { label: color, color, variant: 'pill-outline' } })),
      ],
    }),
    template: `<StoryGrid :items="items" gap="var(--ds-space-2)" />`,
  }),
}

export const AllColorsWithDot: Story = {
  name: 'Tones and colors — with dot',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { StoryGrid },
    setup: () => ({
      items: [
        ...ALL_TONES.map(tone   => ({ component: Badge, props: { label: tone,  tone,  dot: true } })),
        ...ALL_COLORS.map(color => ({ component: Badge, props: { label: color, color, dot: true } })),
      ],
    }),
    template: `<StoryGrid :items="items" gap="var(--ds-space-2)" />`,
  }),
}
