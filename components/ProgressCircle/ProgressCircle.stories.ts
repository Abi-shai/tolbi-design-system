import type { Meta, StoryObj } from '@storybook/vue3'
import ProgressCircle from './ProgressCircle.vue'

const meta: Meta<typeof ProgressCircle> = {
  title: 'Components/ProgressCircle',
  component: ProgressCircle,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Indicateur de progression circulaire. Disponible en cercle complet ou demi-cercle, cinq tailles, avec ou sans label.',
      },
    },
  },
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      table: { category: 'Données', defaultValue: { summary: '0' } },
    },
    size: {
      control: 'select',
      options: ['xxs', 'xs', 'sm', 'md', 'lg'],
      table: {
        category: 'Apparence',
        defaultValue: { summary: "'md'" },
      },
    },
    shape: {
      control: 'inline-radio',
      options: ['circle', 'half-circle'],
      table: {
        category: 'Apparence',
        defaultValue: { summary: "'circle'" },
      },
    },
    label: {
      control: 'text',
      table: { category: 'Contenu', type: { summary: 'string | undefined' } },
    },
  },
  args: {
    value: 40,
    size:  'md',
    shape: 'circle',
    label: undefined,
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithLabel: Story = {
  name: 'With label',
  args: { label: 'Active users' },
}

export const HalfCircle: Story = {
  name: 'Half circle',
  args: { shape: 'half-circle' },
}

export const HalfCircleWithLabel: Story = {
  name: 'Half circle with label',
  args: { shape: 'half-circle', label: 'Active users' },
}

export const AllSizes: Story = {
  name: 'All sizes — circle',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { ProgressCircle },
    setup: () => ({
      sizes: ['xxs', 'xs', 'sm', 'md', 'lg'] as const,
    }),
    template: `
      <div style="display: flex; align-items: flex-end; gap: 32px; flex-wrap: wrap; padding: 24px">
        <ProgressCircle
          v-for="s in sizes"
          :key="s"
          :size="s"
          shape="circle"
          :value="40"
          label="Active users"
        />
      </div>
    `,
  }),
}

export const AllSizesHalf: Story = {
  name: 'All sizes — half circle',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { ProgressCircle },
    setup: () => ({
      sizes: ['xxs', 'xs', 'sm', 'md', 'lg'] as const,
    }),
    template: `
      <div style="display: flex; align-items: flex-end; gap: 32px; flex-wrap: wrap; padding: 24px">
        <ProgressCircle
          v-for="s in sizes"
          :key="s"
          :size="s"
          shape="half-circle"
          :value="40"
          label="Active users"
        />
      </div>
    `,
  }),
}

export const AllValues: Story = {
  name: 'All values',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { ProgressCircle },
    setup: () => ({
      values: [0, 25, 50, 75, 100],
    }),
    template: `
      <div style="display: flex; align-items: center; gap: 24px; flex-wrap: wrap; padding: 24px">
        <ProgressCircle
          v-for="v in values"
          :key="v"
          size="sm"
          shape="circle"
          :value="v"
        />
      </div>
    `,
  }),
}
