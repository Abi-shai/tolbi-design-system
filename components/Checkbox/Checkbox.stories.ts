import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import Checkbox from './Checkbox.vue'

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A checkbox or radio button with optional label and supporting text. Two sizes (sm/md), two types (checkbox/radio).',
      },
    },
  },
  argTypes: {
    type: {
      control: 'inline-radio',
      options: ['checkbox', 'radio'],
      table: { category: 'Apparence', defaultValue: { summary: "'checkbox'" } },
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md'],
      table: { category: 'Apparence', defaultValue: { summary: "'sm'" } },
    },
    modelValue: {
      control: 'boolean',
      table: { category: 'État', defaultValue: { summary: 'false' } },
    },
    indeterminate: {
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
    type: 'checkbox',
    size: 'sm',
    modelValue: false,
    indeterminate: false,
    disabled: false,
    label: 'Remember me',
    supportingText: 'Save my login details for next time.',
  },
}

export default meta
type Story = StoryObj<typeof meta>

// ── Playground ───────────────────────────────────────────────────────

export const Playground: Story = {
  name: 'Playground',
  render: (args) => ({
    components: { Checkbox },
    setup() {
      const value = ref(args.modelValue ?? false)
      return { args, value }
    },
    template: `<Checkbox v-bind="args" v-model="value" />`,
  }),
}

// ── Checkbox — all states ────────────────────────────────────────────

export const CheckboxStates: Story = {
  name: 'Checkbox — all states',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { Checkbox },
    setup() {
      const sm_off = ref(false)
      const sm_on  = ref(true)
      const sm_ind = ref(true)
      const md_off = ref(false)
      const md_on  = ref(true)
      const md_ind = ref(true)
      return { sm_off, sm_on, sm_ind, md_off, md_on, md_ind }
    },
    template: `
      <div style="display: flex; gap: 48px; padding: 24px; flex-wrap: wrap;">
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <p style="font: 600 12px/1 sans-serif; color: #667085; margin: 0;">sm</p>
          <Checkbox size="sm" v-model="sm_off" />
          <Checkbox size="sm" v-model="sm_on" />
          <Checkbox size="sm" v-model="sm_ind" :indeterminate="true" />
          <Checkbox size="sm" :model-value="false" disabled />
          <Checkbox size="sm" :model-value="true" disabled />
          <Checkbox size="sm" :model-value="true" :indeterminate="true" disabled />
        </div>
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <p style="font: 600 12px/1 sans-serif; color: #667085; margin: 0;">md</p>
          <Checkbox size="md" v-model="md_off" />
          <Checkbox size="md" v-model="md_on" />
          <Checkbox size="md" v-model="md_ind" :indeterminate="true" />
          <Checkbox size="md" :model-value="false" disabled />
          <Checkbox size="md" :model-value="true" disabled />
          <Checkbox size="md" :model-value="true" :indeterminate="true" disabled />
        </div>
      </div>
    `,
  }),
}

// ── Radio — all states ───────────────────────────────────────────────

export const RadioStates: Story = {
  name: 'Radio — all states',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { Checkbox },
    setup() {
      const sm_off = ref(false)
      const sm_on  = ref(true)
      const md_off = ref(false)
      const md_on  = ref(true)
      return { sm_off, sm_on, md_off, md_on }
    },
    template: `
      <div style="display: flex; gap: 48px; padding: 24px; flex-wrap: wrap;">
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <p style="font: 600 12px/1 sans-serif; color: #667085; margin: 0;">sm</p>
          <Checkbox type="radio" size="sm" v-model="sm_off" />
          <Checkbox type="radio" size="sm" v-model="sm_on" />
          <Checkbox type="radio" size="sm" :model-value="false" disabled />
          <Checkbox type="radio" size="sm" :model-value="true" disabled />
        </div>
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <p style="font: 600 12px/1 sans-serif; color: #667085; margin: 0;">md</p>
          <Checkbox type="radio" size="md" v-model="md_off" />
          <Checkbox type="radio" size="md" v-model="md_on" />
          <Checkbox type="radio" size="md" :model-value="false" disabled />
          <Checkbox type="radio" size="md" :model-value="true" disabled />
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
    components: { Checkbox },
    setup() {
      const a = ref(false)
      const b = ref(true)
      const c = ref(false)
      const d = ref(true)
      return { a, b, c, d }
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 24px; padding: 24px; width: 360px;">
        <Checkbox
          size="sm"
          v-model="a"
          label="Remember me"
          supporting-text="Save my login details for next time."
        />
        <Checkbox
          size="sm"
          v-model="b"
          label="Remember me"
          supporting-text="Save my login details for next time."
        />
        <Checkbox
          size="md"
          v-model="c"
          label="Remember me"
          supporting-text="Save my login details for next time."
        />
        <Checkbox
          size="md"
          v-model="d"
          label="Remember me"
          supporting-text="Save my login details for next time."
        />
        <Checkbox
          size="sm"
          :model-value="false"
          disabled
          label="Remember me"
          supporting-text="Save my login details for next time."
        />
        <Checkbox
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

// ── Radio with label ─────────────────────────────────────────────────

export const RadioWithLabel: Story = {
  name: 'Radio with label',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { Checkbox },
    setup() {
      const a = ref(false)
      const b = ref(true)
      const c = ref(false)
      const d = ref(true)
      return { a, b, c, d }
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 24px; padding: 24px; width: 360px;">
        <Checkbox
          type="radio"
          size="sm"
          v-model="a"
          label="Remember me"
          supporting-text="Save my login details for next time."
        />
        <Checkbox
          type="radio"
          size="sm"
          v-model="b"
          label="Remember me"
          supporting-text="Save my login details for next time."
        />
        <Checkbox
          type="radio"
          size="md"
          v-model="c"
          label="Remember me"
          supporting-text="Save my login details for next time."
        />
        <Checkbox
          type="radio"
          size="md"
          v-model="d"
          label="Remember me"
          supporting-text="Save my login details for next time."
        />
        <Checkbox
          type="radio"
          size="sm"
          :model-value="false"
          disabled
          label="Remember me"
          supporting-text="Save my login details for next time."
        />
        <Checkbox
          type="radio"
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
