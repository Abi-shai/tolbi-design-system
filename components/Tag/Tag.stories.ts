import type { Meta, StoryObj } from '@storybook/vue3'
import Tag from './Tag.vue'
import StoryGrid from '../../stories/StoryGrid.vue'

const meta: Meta<typeof Tag> = {
  title: 'Components/Tag',
  component: Tag,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Étiquette filtrable ou informative. Supporte une icône, un avatar, un point coloré, une case à cocher, un compteur ou un bouton de suppression.',
      },
    },
  },
  argTypes: {
    label: {
      control: 'text',
      table: { category: 'Contenu' },
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      table: {
        category: 'Apparence',
        defaultValue: { summary: "'sm'" },
      },
    },
    action: {
      control: 'inline-radio',
      options: [undefined, 'close', 'count'],
      table: {
        category: 'Action',
        defaultValue: { summary: 'undefined' },
      },
    },
    count: {
      control: 'number',
      table: { category: 'Action' },
    },
    dot: {
      control: 'boolean',
      table: { category: 'Contenu', defaultValue: { summary: 'false' } },
    },
    checkbox: {
      control: 'boolean',
      table: { category: 'Contenu', defaultValue: { summary: 'false' } },
    },
    checked: {
      control: 'boolean',
      table: { category: 'Contenu', defaultValue: { summary: 'false' } },
    },
    avatarSrc: {
      control: 'text',
      table: { category: 'Contenu' },
    },
    avatarAlt: {
      control: 'text',
      table: { category: 'Contenu' },
    },
    icon: {
      control: 'text',
      table: { category: 'Contenu', type: { summary: 'IconName' } },
    },
  },
  args: {
    label: 'Label',
    size:  'sm',
  },
}

export default meta
type Story = StoryObj<typeof meta>

// ── Base variants ────────────────────────────────────────────────────

export const Default: Story = {}

export const WithClose: Story = {
  name: 'With close',
  args: { action: 'close' },
}

export const WithCount: Story = {
  name: 'With count',
  args: { action: 'count', count: 5 },
}

export const WithDot: Story = {
  name: 'With dot',
  args: { dot: true },
}

export const WithIcon: Story = {
  name: 'With icon',
  args: { icon: 'house' },
}

export const WithCheckbox: Story = {
  name: 'With checkbox',
  args: { checkbox: true },
}

export const WithCheckboxChecked: Story = {
  name: 'With checkbox — checked',
  args: { checkbox: true, checked: true },
}

// ── Sizes ────────────────────────────────────────────────────────────

export const AllSizes: Story = {
  name: 'All sizes',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { StoryGrid },
    setup: () => ({
      items: [
        { component: Tag, props: { label: 'Small',  size: 'sm' } },
        { component: Tag, props: { label: 'Medium', size: 'md' } },
        { component: Tag, props: { label: 'Large',  size: 'lg' } },
      ],
    }),
    template: `<StoryGrid :items="items" />`,
  }),
}

// ── With close — all sizes ───────────────────────────────────────────

export const AllSizesClose: Story = {
  name: 'All sizes — close',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { StoryGrid },
    setup: () => ({
      items: [
        { component: Tag, props: { label: 'Small',  size: 'sm', action: 'close' } },
        { component: Tag, props: { label: 'Medium', size: 'md', action: 'close' } },
        { component: Tag, props: { label: 'Large',  size: 'lg', action: 'close' } },
      ],
    }),
    template: `<StoryGrid :items="items" />`,
  }),
}

// ── With count — all sizes ───────────────────────────────────────────

export const AllSizesCount: Story = {
  name: 'All sizes — count',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { StoryGrid },
    setup: () => ({
      items: [
        { component: Tag, props: { label: 'Small',  size: 'sm', action: 'count', count: 5 } },
        { component: Tag, props: { label: 'Medium', size: 'md', action: 'count', count: 5 } },
        { component: Tag, props: { label: 'Large',  size: 'lg', action: 'count', count: 5 } },
      ],
    }),
    template: `<StoryGrid :items="items" />`,
  }),
}

// ── With dot — all sizes ─────────────────────────────────────────────

export const AllSizesDot: Story = {
  name: 'All sizes — dot',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { StoryGrid },
    setup: () => ({
      items: [
        { component: Tag, props: { label: 'Small',  size: 'sm', dot: true } },
        { component: Tag, props: { label: 'Medium', size: 'md', dot: true } },
        { component: Tag, props: { label: 'Large',  size: 'lg', dot: true } },
      ],
    }),
    template: `<StoryGrid :items="items" />`,
  }),
}

// ── Checkbox combinations ────────────────────────────────────────────

export const CheckboxVariants: Story = {
  name: 'Checkbox variants',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { StoryGrid },
    setup: () => ({
      items: [
        { component: Tag, props: { label: 'Unchecked', checkbox: true, checked: false } },
        { component: Tag, props: { label: 'Checked',   checkbox: true, checked: true } },
        { component: Tag, props: { label: 'With dot',  checkbox: true, dot: true } },
        { component: Tag, props: { label: 'With close', checkbox: true, action: 'close' } },
        { component: Tag, props: { label: 'With count', checkbox: true, action: 'count', count: 3 } },
      ],
    }),
    template: `<StoryGrid :items="items" gap="var(--ds-space-2)" />`,
  }),
}
