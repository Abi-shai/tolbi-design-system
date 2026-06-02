import type { Meta, StoryObj } from '@storybook/vue3'
import VerificationCodeInputField from './VerificationCodeInputField.vue'
import Docs from './VerificationCodeInputField.mdx'

const meta: Meta<typeof VerificationCodeInputField> = {
  title: 'Components/VerificationCodeInputField',
  component: VerificationCodeInputField,
  tags: ['autodocs'],
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
    label: {
      control: 'text',
      table: { category: 'Contenu' },
    },
    hint: {
      control: 'text',
      table: { category: 'Contenu' },
    },
    disabled: {
      control: 'boolean',
      table: { category: 'État', defaultValue: { summary: 'false' } },
    },
  },
  args: {
    digits:   4,
    size:     'md',
    label:    'Secure code',
    hint:     'This is a hint text to help user.',
    disabled: false,
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const FourDigits: Story = {
  name: '4 chiffres — md',
}

export const SixDigits: Story = {
  name: '6 chiffres — md',
  args: { digits: 6 },
}

export const AllSizes: Story = {
  name: 'Toutes les tailles (4 chiffres)',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { VerificationCodeInputField },
    template: `
      <div style="display:flex;flex-direction:column;gap:32px;align-items:flex-start;">
        <VerificationCodeInputField :digits="4" size="sm" label="sm — 64px" hint="Hint text." />
        <VerificationCodeInputField :digits="4" size="md" label="md — 80px" hint="Hint text." />
        <VerificationCodeInputField :digits="4" size="lg" label="lg — 96px" hint="Hint text." />
      </div>
    `,
  }),
}

export const AllSizesSix: Story = {
  name: 'Toutes les tailles (6 chiffres)',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { VerificationCodeInputField },
    template: `
      <div style="display:flex;flex-direction:column;gap:32px;align-items:flex-start;">
        <VerificationCodeInputField :digits="6" size="sm" label="sm — 64px" hint="Hint text." />
        <VerificationCodeInputField :digits="6" size="md" label="md — 80px" hint="Hint text." />
        <VerificationCodeInputField :digits="6" size="lg" label="lg — 96px" hint="Hint text." />
      </div>
    `,
  }),
}

export const Disabled: Story = {
  name: 'Désactivé',
  args: { disabled: true },
}
