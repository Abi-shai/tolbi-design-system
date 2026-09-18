import type { Meta, StoryObj } from '@storybook/vue3'
import InputField from './InputField.vue'
import FormField from '../FormField/FormField.vue'
import InputFieldDocs from './InputField.mdx'

const meta: Meta<typeof InputField> = {
  title: 'Saisie/InputField',
  component: InputField,
  tags: ['autodocs', 'stable'],
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
    placeholder: {
      control: 'text',
      table: { category: 'Contenu' },
    },
    helpTooltip: {
      control: 'text',
      description: 'Rendu **dans** la boîte. Ce qui se rend au-dessus ou au-dessous appartient à `FormField`.',
      table: { category: 'Contenu' },
    },
    destructive: {
      control: 'boolean',
      description: 'Usage isolé seulement. Dans un `FormField`, c\'est la prop `error` du parent qui décide.',
      table: { category: 'État', defaultValue: { summary: 'false' } },
    },
    disabled: {
      control: 'boolean',
      table: { category: 'État', defaultValue: { summary: 'false' } },
    },
    required: {
      control: 'boolean',
      description: 'Usage isolé seulement. Dans un `FormField`, c\'est la prop `required` du parent qui décide.',
      table: { category: 'État', defaultValue: { summary: 'false' } },
    },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search', 'time'],
      table: { category: 'HTML', defaultValue: { summary: "'text'" } },
    },
  },
  args: {
    placeholder: 'olivia@untitledui.com',
    size:        'md',
    destructive: false,
    disabled:    false,
  },
}

export default meta
type Story = StoryObj<typeof meta>

/** Le cas courant : le champ dans son enveloppe. */
export const Default: Story = {
  render: (args) => ({
    components: { InputField, FormField },
    setup: () => ({ args }),
    template: `
      <FormField label="Email" hint="This is a hint text to help user." style="width:320px">
        <InputField v-bind="args" />
      </FormField>
    `,
  }),
}

export const Bare: Story = {
  name: 'Sans enveloppe',
  parameters: {
    docs: {
      description: {
        story:
          'Le champ seul rend uniquement sa boîte : pas de légende, pas de message. ' +
          'C\'est la forme à utiliser quand le contexte porte déjà l\'intitulé — une barre de recherche, ' +
          'une cellule de tableau éditable.',
      },
    },
  },
  render: (args) => ({
    components: { InputField },
    setup: () => ({ args }),
    template: `<InputField v-bind="args" style="width:320px" />`,
  }),
}

export const WithHelpIcon: Story = {
  name: 'Avec help icon',
  render: (args) => ({
    components: { InputField, FormField },
    setup: () => ({ args }),
    template: `
      <FormField label="Email" style="width:320px">
        <InputField v-bind="args" />
      </FormField>
    `,
  }),
  args: {
    helpTooltip: 'Votre adresse email professionnelle.',
  },
}

export const WithIconLeading: Story = {
  name: 'Avec icône leading',
  render: (args) => ({
    components: { InputField, FormField },
    setup: () => ({ args }),
    template: `
      <FormField label="Email" style="width:320px">
        <InputField v-bind="args">
          <template #icon-leading>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 7l-10 7L2 7"/><rect x="2" y="4" width="20" height="16" rx="2"/>
            </svg>
          </template>
        </InputField>
      </FormField>
    `,
  }),
}

export const WithLeadingText: Story = {
  name: 'Avec texte leading',
  render: (args) => ({
    components: { InputField, FormField },
    setup: () => ({ args }),
    template: `
      <FormField label="Website" style="width:320px">
        <InputField v-bind="args">
          <template #leading-text>https://</template>
        </InputField>
      </FormField>
    `,
  }),
  args: { placeholder: 'www.example.com' },
}

export const Destructive: Story = {
  name: 'État destructif',
  parameters: {
    docs: {
      description: {
        story:
          'L\'état invalide ne se déclare pas : il découle de la présence d\'un message d\'erreur sur `FormField`. ' +
          'C\'est ce qui empêche une bordure rouge sans explication.',
      },
    },
  },
  render: (args) => ({
    components: { InputField, FormField },
    setup: () => ({ args }),
    template: `
      <FormField label="Email" error="This is an error message." style="width:320px">
        <InputField v-bind="args" />
      </FormField>
    `,
  }),
}

export const Disabled: Story = {
  name: 'État désactivé',
  render: (args) => ({
    components: { InputField, FormField },
    setup: () => ({ args }),
    template: `
      <FormField label="Email" hint="This is a hint text to help user." disabled style="width:320px">
        <InputField v-bind="args" />
      </FormField>
    `,
  }),
}

export const SizeSm: Story = {
  name: 'Taille sm',
  render: (args) => ({
    components: { InputField, FormField },
    setup: () => ({ args }),
    template: `
      <FormField label="Email" hint="This is a hint text to help user." style="width:320px">
        <InputField v-bind="args" />
      </FormField>
    `,
  }),
  args: { size: 'sm' },
}

export const AllStates: Story = {
  name: 'Tous les états',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { InputField, FormField },
    template: `
      <div style="display:flex;flex-direction:column;gap:24px;width:320px;">
        <FormField label="Default" hint="Hint text.">
          <InputField placeholder="olivia@untitledui.com" />
        </FormField>
        <FormField label="Required" hint="Hint text." required>
          <InputField placeholder="olivia@untitledui.com" />
        </FormField>
        <FormField label="Disabled" hint="Hint text." disabled>
          <InputField placeholder="olivia@untitledui.com" />
        </FormField>
        <FormField label="Destructive" error="This is an error message.">
          <InputField placeholder="olivia@untitledui.com" />
        </FormField>
        <FormField label="With help">
          <InputField placeholder="olivia@untitledui.com" help-tooltip="Additional information." />
        </FormField>
      </div>
    `,
  }),
}
