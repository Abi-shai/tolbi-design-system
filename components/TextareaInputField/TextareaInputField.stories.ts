import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import TextareaInputField from './TextareaInputField.vue'
import FormField from '../FormField/FormField.vue'
import TextareaInputFieldDocs from './TextareaInputField.mdx'

const meta: Meta<typeof TextareaInputField> = {
  title: 'Saisie/TextareaInputField',
  component: TextareaInputField,
  tags: ['autodocs', 'stable'],
  parameters: {
    layout: 'centered',
    docs: { page: TextareaInputFieldDocs },
  },
  argTypes: {
    type: {
      control: 'inline-radio',
      options: ['default', 'tags'],
      table: { category: 'Apparence', defaultValue: { summary: "'default'" } },
    },
    placeholder: {
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
  },
  args: {
    placeholder: 'Enter a description...',
    type:        'default',
    destructive: false,
    disabled:    false,
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { TextareaInputField, FormField },
    setup: () => ({ args }),
    template: `
      <FormField label="Description" hint="This is a hint text to help user." style="width:320px">
        <TextareaInputField v-bind="args" />
      </FormField>
    `,
  }),
}

export const WithValue: Story = {
  name: 'Avec valeur',
  args: {
    modelValue: 'A little about the company and the team that you\'ll be working with.',
  },
}

export const Destructive: Story = {
  name: 'État destructif',
  render: (args) => ({
    components: { TextareaInputField, FormField },
    setup: () => ({ args }),
    template: `
      <FormField label="Description" error="This is an error message." style="width:320px">
        <TextareaInputField v-bind="args" />
      </FormField>
    `,
  }),
}

export const Disabled: Story = {
  name: 'État désactivé',
  render: (args) => ({
    components: { TextareaInputField, FormField },
    setup: () => ({ args }),
    template: `
      <FormField label="Description" hint="This is a hint text to help user." disabled style="width:320px">
        <TextareaInputField v-bind="args" />
      </FormField>
    `,
  }),
}

export const TagsEmpty: Story = {
  name: 'Mode tags — vide',
  render: (args) => ({
    components: { TextareaInputField, FormField },
    setup: () => ({ args }),
    template: `
      <FormField label="Description" hint="This is a hint text to help user." style="width:320px">
        <TextareaInputField v-bind="args" />
      </FormField>
    `,
  }),
  args: {
    type:        'tags',
    placeholder: 'Add tags...',
  },
}

export const TagsWithValues: Story = {
  name: 'Mode tags — avec tags',
  render: () => ({
    components: { TextareaInputField, FormField },
    setup() {
      const tags = ref(['Design', 'Software'])
      const input = ref('Marketing')
      function addTag(tag: string) { tags.value.push(tag) }
      function removeTag(i: number) { tags.value.splice(i, 1) }
      return { tags, input, addTag, removeTag }
    },
    template: `
      <FormField label="Description" hint="This is a hint text to help user." style="width:320px">
        <TextareaInputField
          v-model="input"
          type="tags"
          placeholder="Add tags..."
          :tags="tags"
          @add-tag="addTag"
          @remove-tag="removeTag"
        />
      </FormField>
    `,
  }),
}

export const AllStates: Story = {
  name: 'Tous les états',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { TextareaInputField, FormField },
    template: `
      <div style="display:flex;flex-wrap:wrap;gap:24px;align-items:flex-start;">
        <FormField label="Default" hint="Hint text." style="width:280px">
          <TextareaInputField placeholder="Enter a description..." />
        </FormField>
        <FormField label="With value" hint="Hint text." style="width:280px">
          <TextareaInputField model-value="A little about the company and the team." />
        </FormField>
        <FormField label="Disabled" hint="Hint text." disabled style="width:280px">
          <TextareaInputField placeholder="Enter a description..." />
        </FormField>
        <FormField label="Destructive" error="This is an error message." style="width:280px">
          <TextareaInputField placeholder="Enter a description..." />
        </FormField>
      </div>
    `,
  }),
}
