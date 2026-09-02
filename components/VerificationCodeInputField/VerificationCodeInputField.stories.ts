import type { Meta, StoryObj } from '@storybook/vue3'
import VerificationCodeInputField from './VerificationCodeInputField.vue'
import FormField from '../FormField/FormField.vue'
import Docs from './VerificationCodeInputField.mdx'

const meta: Meta<typeof VerificationCodeInputField> = {
  title: 'Saisie/VerificationCodeInputField',
  component: VerificationCodeInputField,
  tags: ['autodocs', 'stable'],
  parameters: {
    layout: 'centered',
    docs: { page: Docs },
  },
  argTypes: {
    digits: {
      control: 'inline-radio',
      options: [4, 6],
      table: { category: 'Contenu', defaultValue: { summary: '4' } },
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      table: { category: 'Apparence', defaultValue: { summary: "'md'" } },
    },
    disabled: {
      control: 'boolean',
      table: { category: 'État', defaultValue: { summary: 'false' } },
    },
  },
  args: {
    digits:   4,
    size:     'md',
    disabled: false,
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const FourDigits: Story = {
  name: '4 chiffres — md',
  render: (args) => ({
    components: { VerificationCodeInputField, FormField },
    setup: () => ({ args }),
    template: `
      <FormField label="Secure code" hint="This is a hint text to help user.">
        <VerificationCodeInputField v-bind="args" />
      </FormField>
    `,
  }),
}

export const SixDigits: Story = {
  name: '6 chiffres — md',
  render: (args) => ({
    components: { VerificationCodeInputField, FormField },
    setup: () => ({ args }),
    template: `
      <FormField label="Secure code" hint="This is a hint text to help user.">
        <VerificationCodeInputField v-bind="args" />
      </FormField>
    `,
  }),
  args: { digits: 6 },
}

export const AllSizes: Story = {
  name: 'Toutes les tailles (4 chiffres)',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { VerificationCodeInputField, FormField },
    template: `
      <div style="display:flex;flex-direction:column;gap:32px;align-items:flex-start;">
        <FormField label="sm — 64px" hint="Hint text.">
          <VerificationCodeInputField :digits="4" size="sm" />
        </FormField>
        <FormField label="md — 80px" hint="Hint text.">
          <VerificationCodeInputField :digits="4" size="md" />
        </FormField>
        <FormField label="lg — 96px" hint="Hint text.">
          <VerificationCodeInputField :digits="4" size="lg" />
        </FormField>
      </div>
    `,
  }),
}

export const AllSizesSix: Story = {
  name: 'Toutes les tailles (6 chiffres)',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { VerificationCodeInputField, FormField },
    template: `
      <div style="display:flex;flex-direction:column;gap:32px;align-items:flex-start;">
        <FormField label="sm — 64px" hint="Hint text.">
          <VerificationCodeInputField :digits="6" size="sm" />
        </FormField>
        <FormField label="md — 80px" hint="Hint text.">
          <VerificationCodeInputField :digits="6" size="md" />
        </FormField>
        <FormField label="lg — 96px" hint="Hint text.">
          <VerificationCodeInputField :digits="6" size="lg" />
        </FormField>
      </div>
    `,
  }),
}

export const Disabled: Story = {
  name: 'Désactivé',
  render: (args) => ({
    components: { VerificationCodeInputField, FormField },
    setup: () => ({ args }),
    template: `
      <FormField label="Secure code" hint="This is a hint text to help user." disabled>
        <VerificationCodeInputField v-bind="args" />
      </FormField>
    `,
  }),
  args: { disabled: true },
}
