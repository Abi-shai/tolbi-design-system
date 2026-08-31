import type { Meta, StoryObj } from '@storybook/vue3'
import ProgressBar from './ProgressBar.vue'

const meta: Meta<typeof ProgressBar> = {
  title: 'Feedback & chargement/ProgressBar',
  component: ProgressBar,
  tags: ['autodocs', 'wip'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Barre de progression horizontale. Supporte cinq positions de label : aucun, droite, bas, bulle flottante au-dessus, bulle flottante en-dessous.',
      },
    },
  },
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      table: { category: 'Données', defaultValue: { summary: '0' } },
    },
    label: {
      control: 'select',
      options: ['none', 'right', 'bottom', 'top-floating', 'bottom-floating'],
      table: {
        category: 'Apparence',
        defaultValue: { summary: "'none'" },
      },
    },
  },
  args: {
    value: 40,
    label: 'none',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const LabelRight: Story = {
  name: 'Label — right',
  args: { label: 'right' },
}

export const LabelBottom: Story = {
  name: 'Label — bottom',
  args: { label: 'bottom' },
}

export const LabelTopFloating: Story = {
  name: 'Label — top floating',
  parameters: { layout: 'padded' },
  args: { label: 'top-floating', value: 40 },
  decorators: [() => ({ template: '<div style="padding-top: 60px; width: 320px"><story /></div>' })],
}

export const LabelBottomFloating: Story = {
  name: 'Label — bottom floating',
  parameters: { layout: 'padded' },
  args: { label: 'bottom-floating', value: 40 },
  decorators: [() => ({ template: '<div style="padding-bottom: 60px; width: 320px"><story /></div>' })],
}

export const AllValues: Story = {
  name: 'All values',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { ProgressBar },
    setup: () => ({
      values: [0, 10, 25, 50, 75, 90, 100],
    }),
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px; width: 320px">
        <ProgressBar v-for="v in values" :key="v" :value="v" label="right" />
      </div>
    `,
  }),
}

export const AllLabelTypes: Story = {
  name: 'All label types',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { ProgressBar },
    setup: () => ({
      labels: [
        { label: 'none',           name: 'None' },
        { label: 'right',          name: 'Right' },
        { label: 'bottom',         name: 'Bottom' },
        { label: 'top-floating',   name: 'Top floating' },
        { label: 'bottom-floating',name: 'Bottom floating' },
      ],
    }),
    template: `
      <div style="display: flex; flex-direction: column; gap: 40px; width: 320px; padding: 60px 0">
        <div v-for="item in labels" :key="item.label" style="display: flex; flex-direction: column; gap: 8px">
          <span style="font-size: 12px; color: #667085; font-family: Poppins, sans-serif">{{ item.name }}</span>
          <ProgressBar :label="item.label" :value="60" />
        </div>
      </div>
    `,
  }),
}
