import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import TextareaInputField from './TextareaInputField.vue'
import TextareaInputFieldDocs from './TextareaInputField.mdx'

const meta: Meta<typeof TextareaInputField> = {
  title: 'Components/TextareaInputField',
  component: TextareaInputField,
  tags: ['autodocs'],
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
    label:       'Description',
    placeholder: 'Enter a description...',
    hint:        'This is a hint text to help user.',
    type:        'default',
    destructive: false,
    disabled:    false,
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithValue: Story = {
  name: 'Avec valeur',
  args: {
    modelValue: 'A little about the company and the team that you\'ll be working with.',
  },
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

export const TagsEmpty: Story = {
  name: 'Mode tags — vide',
  args: {
    type:        'tags',
    placeholder: 'Add tags...',
    hint:        'This is a hint text to help user.',
  },
}

export const TagsWithValues: Story = {
  name: 'Mode tags — avec tags',
  render: () => ({
    components: { TextareaInputField },
    setup() {
      const tags = ref(['Design', 'Software'])
      const input = ref('Marketing')
      function addTag(tag: string) { tags.value.push(tag) }
      function removeTag(i: number) { tags.value.splice(i, 1) }
      return { tags, input, addTag, removeTag }
    },
    template: `
      <TextareaInputField
        v-model="input"
        type="tags"
        label="Description"
        placeholder="Add tags..."
        hint="This is a hint text to help user."
        :tags="tags"
        @add-tag="addTag"
        @remove-tag="removeTag"
        style="width:320px"
      />
    `,
  }),
}

export const AllStates: Story = {
  name: 'Tous les états',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { TextareaInputField },
    template: `
      <div style="display:flex;flex-wrap:wrap;gap:24px;align-items:flex-start;">
        <TextareaInputField label="Default" placeholder="Enter a description..." hint="Hint text." style="width:280px" />
        <TextareaInputField label="With value" model-value="A little about the company and the team." hint="Hint text." style="width:280px" />
        <TextareaInputField label="Disabled" placeholder="Enter a description..." hint="Hint text." :disabled="true" style="width:280px" />
        <TextareaInputField label="Destructive" placeholder="Enter a description..." hint="This is an error message." :destructive="true" style="width:280px" />
      </div>
    `,
  }),
}
