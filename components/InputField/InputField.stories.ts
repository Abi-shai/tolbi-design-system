import type { Meta, StoryObj } from '@storybook/vue3'
import InputField from './InputField.vue'
import InputFieldDocs from './InputField.mdx'

const meta: Meta<typeof InputField> = {
  title: 'Components/InputField',
  component: InputField,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { page: InputFieldDocs },
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['sm', 'md'],
      table: { category: 'Apparence', defaultValue: { summary: "'md'" } },
    },
    label: {
      control: 'text',
      table: { category: 'Contenu' },
    },
    placeholder: {
      control: 'text',
      table: { category: 'Contenu' },
    },
    hint: {
      control: 'text',
      table: { category: 'Contenu' },
    },
    helpTooltip: {
      control: 'text',
      table: { category: 'Contenu' },
    },
    destructive: {
      control: 'boolean',
      table: { category: 'État', defaultValue: { summary: 'false' } },
    },
    disabled: {
      control: 'boolean',
      table: { category: 'État', defaultValue: { summary: 'false' } },
    },
    required: {
      control: 'boolean',
      table: { category: 'État', defaultValue: { summary: 'false' } },
    },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'],
      table: { category: 'HTML', defaultValue: { summary: "'text'" } },
    },
  },
  args: {
    label:       'Email',
    placeholder: 'olivia@untitledui.com',
    hint:        'This is a hint text to help user.',
    size:        'md',
    destructive: false,
    disabled:    false,
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithHelpIcon: Story = {
  name: 'Avec help icon',
  args: {
    helpTooltip: 'Votre adresse email professionnelle.',
  },
}

export const WithIconLeading: Story = {
  name: 'Avec icône leading',
  render: (args) => ({
    components: { InputField },
    setup: () => ({ args }),
    template: `
      <InputField v-bind="args" style="width:320px">
        <template #icon-leading>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 7l-10 7L2 7"/><rect x="2" y="4" width="20" height="16" rx="2"/>
          </svg>
        </template>
      </InputField>
    `,
  }),
  args: { label: 'Email', placeholder: 'olivia@untitledui.com' },
}

export const WithLeadingText: Story = {
  name: 'Avec texte leading',
  render: (args) => ({
    components: { InputField },
    setup: () => ({ args }),
    template: `
      <InputField v-bind="args" style="width:320px">
        <template #leading-text>https://</template>
      </InputField>
    `,
  }),
  args: { label: 'Website', placeholder: 'www.example.com', hint: '' },
}

export const Destructive: Story = {
  name: 'État destructif',
  args: {
    destructive: true,
    hint:        'This is an error message.',
  },
}

export const Disabled: Story = {
  name: 'État désactivé',
  args: { disabled: true },
}

export const SizeSm: Story = {
  name: 'Taille sm',
  args: { size: 'sm' },
}

export const AllStates: Story = {
  name: 'Tous les états',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { InputField },
    template: `
      <div style="display:flex;flex-direction:column;gap:24px;width:320px;">
        <InputField label="Default" placeholder="olivia@untitledui.com" hint="Hint text." />
        <InputField label="Disabled" placeholder="olivia@untitledui.com" hint="Hint text." :disabled="true" />
        <InputField label="Destructive" placeholder="olivia@untitledui.com" hint="This is an error message." :destructive="true" />
        <InputField label="With help" placeholder="olivia@untitledui.com" help-tooltip="Additional information." hint="Hint text." />
      </div>
    `,
  }),
}
