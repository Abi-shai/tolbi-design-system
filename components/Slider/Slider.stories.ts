import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import Slider from './Slider.vue'

const meta: Meta<typeof Slider> = {
  title: 'Components/Slider',
  component: Slider,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Curseur à double poignée pour sélectionner une plage de valeurs. Supporte trois variantes de label : aucun, bas, et bulle flottante en haut.',
      },
    },
  },
  argTypes: {
    modelValue: {
      control: false,
      table: { category: 'Données' },
    },
    min: {
      control: { type: 'number' },
      table: { category: 'Données', defaultValue: { summary: '0' } },
    },
    max: {
      control: { type: 'number' },
      table: { category: 'Données', defaultValue: { summary: '100' } },
    },
    step: {
      control: { type: 'number' },
      table: { category: 'Données', defaultValue: { summary: '1' } },
    },
    label: {
      control: 'select',
      options: ['none', 'bottom', 'top-floating'],
      table: {
        category: 'Apparence',
        defaultValue: { summary: "'none'" },
      },
    },
  },
  args: {
    min: 0,
    max: 100,
    step: 1,
    label: 'none',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { Slider },
    setup() {
      const value = ref<[number, number]>([25, 75])
      return { args, value }
    },
    template: `<div style="width: 320px"><Slider v-bind="args" v-model="value" /></div>`,
  }),
}

export const LabelBottom: Story = {
  name: 'Label — bottom',
  render: (args) => ({
    components: { Slider },
    setup() {
      const value = ref<[number, number]>([25, 75])
      return { args, value }
    },
    template: `<div style="width: 320px; padding-bottom: 48px"><Slider v-bind="args" v-model="value" label="bottom" /></div>`,
  }),
}

export const LabelTopFloating: Story = {
  name: 'Label — top floating',
  render: (args) => ({
    components: { Slider },
    setup() {
      const value = ref<[number, number]>([25, 75])
      return { args, value }
    },
    template: `<div style="width: 320px; padding-top: 60px"><Slider v-bind="args" v-model="value" label="top-floating" /></div>`,
  }),
}

export const AllLabelTypes: Story = {
  name: 'All label types',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { Slider },
    setup() {
      const none = ref<[number, number]>([25, 75])
      const bottom = ref<[number, number]>([25, 75])
      const floating = ref<[number, number]>([25, 75])
      return { none, bottom, floating }
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 64px; width: 320px; padding: 60px 0 48px">
        <div style="display: flex; flex-direction: column; gap: 8px">
          <span style="font-size: 12px; color: #667085; font-family: Inter, sans-serif">None</span>
          <Slider v-model="none" />
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px">
          <span style="font-size: 12px; color: #667085; font-family: Inter, sans-serif">Bottom</span>
          <Slider v-model="bottom" label="bottom" />
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px">
          <span style="font-size: 12px; color: #667085; font-family: Inter, sans-serif">Top floating</span>
          <Slider v-model="floating" label="top-floating" />
        </div>
      </div>
    `,
  }),
}

export const FullRange: Story = {
  name: 'Full range (0 → 100)',
  render: (args) => ({
    components: { Slider },
    setup() {
      const value = ref<[number, number]>([0, 100])
      return { args, value }
    },
    template: `<div style="width: 320px"><Slider v-bind="args" v-model="value" /></div>`,
  }),
}

export const CollapsedRange: Story = {
  name: 'Collapsed (same value)',
  render: (args) => ({
    components: { Slider },
    setup() {
      const value = ref<[number, number]>([50, 50])
      return { args, value }
    },
    template: `<div style="width: 320px"><Slider v-bind="args" v-model="value" /></div>`,
  }),
}
