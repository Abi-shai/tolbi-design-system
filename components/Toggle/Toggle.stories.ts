import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import Toggle from './Toggle.vue'

const meta: Meta<typeof Toggle> = {
  title: 'Saisie/Toggle',
  component: Toggle,
  tags: ['autodocs', 'wip'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A toggle switch. Two sizes (sm/md), with optional label and supporting text.',
      },
    },
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['sm', 'md'],
      table: { category: 'Apparence', defaultValue: { summary: "'sm'" } },
    },
    modelValue: {
      control: 'boolean',
      table: { category: 'État', defaultValue: { summary: 'false' } },
    },
    disabled: {
      control: 'boolean',
      table: { category: 'État', defaultValue: { summary: 'false' } },
    },
    label: {
      control: 'text',
      table: { category: 'Contenu' },
    },
    supportingText: {
      control: 'text',
      table: { category: 'Contenu' },
    },
  },
  args: {
    size: 'sm',
    modelValue: false,
    disabled: false,
  },
}

export default meta
type Story = StoryObj<typeof meta>

// ── Playground ───────────────────────────────────────────────────────

export const Playground: Story = {
  name: 'Playground',
  render: (args) => ({
    components: { Toggle },
    setup() {
      const value = ref(args.modelValue ?? false)
      return { args, value }
    },
    template: `<Toggle v-bind="args" v-model="value" />`,
  }),
}

// ── All sizes & states ───────────────────────────────────────────────

export const AllStates: Story = {
  name: 'All states',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { Toggle },
    setup() {
      const off_sm = ref(false)
      const on_sm  = ref(true)
      const off_md = ref(false)
      const on_md  = ref(true)
      return { off_sm, on_sm, off_md, on_md }
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 32px; padding: 24px;">
        <div style="display: flex; gap: 32px; align-items: center;">
          <span style="font: 500 13px/1 sans-serif; color: #667085; width: 80px;">sm / off</span>
          <Toggle size="sm" v-model="off_sm" />
          <Toggle size="sm" :model-value="false" disabled />
        </div>
        <div style="display: flex; gap: 32px; align-items: center;">
          <span style="font: 500 13px/1 sans-serif; color: #667085; width: 80px;">sm / on</span>
          <Toggle size="sm" v-model="on_sm" />
          <Toggle size="sm" :model-value="true" disabled />
        </div>
        <div style="display: flex; gap: 32px; align-items: center;">
          <span style="font: 500 13px/1 sans-serif; color: #667085; width: 80px;">md / off</span>
          <Toggle size="md" v-model="off_md" />
          <Toggle size="md" :model-value="false" disabled />
        </div>
        <div style="display: flex; gap: 32px; align-items: center;">
          <span style="font: 500 13px/1 sans-serif; color: #667085; width: 80px;">md / on</span>
          <Toggle size="md" v-model="on_md" />
          <Toggle size="md" :model-value="true" disabled />
        </div>
      </div>
    `,
  }),
}

// ── With label ───────────────────────────────────────────────────────

export const WithLabel: Story = {
  name: 'With label',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { Toggle },
    setup() {
      const a = ref(false)
      const b = ref(true)
      const c = ref(false)
      const d = ref(true)
      return { a, b, c, d }
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 24px; padding: 24px; width: 360px;">
        <Toggle
          size="sm"
          v-model="a"
          label="Remember me"
          supporting-text="Save my login details for next time."
        />
        <Toggle
          size="sm"
          v-model="b"
          label="Remember me"
          supporting-text="Save my login details for next time."
        />
        <Toggle
          size="md"
          v-model="c"
          label="Remember me"
          supporting-text="Save my login details for next time."
        />
        <Toggle
          size="md"
          v-model="d"
          label="Remember me"
          supporting-text="Save my login details for next time."
        />
        <Toggle
          size="sm"
          :model-value="false"
          disabled
          label="Remember me"
          supporting-text="Save my login details for next time."
        />
        <Toggle
          size="md"
          :model-value="true"
          disabled
          label="Remember me"
          supporting-text="Save my login details for next time."
        />
      </div>
    `,
  }),
}
