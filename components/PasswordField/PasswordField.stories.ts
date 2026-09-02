import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import PasswordField from './PasswordField.vue'
import FormField from '../FormField/FormField.vue'

const meta: Meta<typeof PasswordField> = {
  title: 'Saisie/PasswordField',
  tags: ['wip'],
  component: PasswordField,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Champ mot de passe avec bascule de révélation et liste de règles. La bascule est un vrai ' +
          '`<button>` avec `aria-pressed`, atteignable au clavier — le slot `trailing` d\'`InputField` a ' +
          'd\'ailleurs été rendu accessible pour ce cas. Les règles reçoivent leur état **déjà évalué** : ' +
          'le composant ne porte aucune politique de mot de passe.',
      },
    },
  },
  argTypes: {
    modelValue: { control: 'text', table: { category: 'Contenu', type: { summary: 'string' } } },
    placeholder: { control: 'text', table: { category: 'Contenu', type: { summary: 'string' } } },
    rules: { control: 'object', description: 'Liste `{ label, met }`. L\'état est fourni, pas calculé.', table: { category: 'Contenu', type: { summary: 'PasswordRule[]' } } },
    size: { control: 'inline-radio', options: ['sm', 'md'], table: { category: 'Apparence', defaultValue: { summary: "'md'" } } },
    destructive: { control: 'boolean', table: { category: 'État', type: { summary: 'boolean' }, defaultValue: { summary: 'false' } } },
    disabled:    { control: 'boolean', table: { category: 'État', type: { summary: 'boolean' }, defaultValue: { summary: 'false' } } },
    required:    { control: 'boolean', table: { category: 'État', type: { summary: 'boolean' }, defaultValue: { summary: 'false' } } },
  },
  args: {
    placeholder: '••••••••',
    size: 'md',
    destructive: false,
    disabled: false,
    required: true,
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: args => ({
    components: { PasswordField, FormField },
    setup: () => ({ args, value: ref('') }),
    template: `
      <FormField label="Mot de passe" required style="max-width:22rem">
        <PasswordField v-bind="args" v-model="value" />
      </FormField>
    `,
  }),
}

export const WithRules: Story = {
  name: 'Avec règles',
  parameters: { docs: { description: { story: 'La couleur **et** le glyphe changent ensemble : l\'état satisfait n\'est pas porté par la couleur seule.' } } },
  render: () => ({
    components: { PasswordField, FormField },
    setup: () => {
      const value = ref('Tolbi26')
      return { value }
    },
    template: `
      <FormField label="Mot de passe" style="max-width:22rem">
        <PasswordField
          v-model="value"
          :rules="[
            { label: 'Au moins 8 caractères', met: value.length >= 8 },
            { label: 'Une majuscule', met: /[A-Z]/.test(value) },
            { label: 'Un chiffre', met: /[0-9]/.test(value) },
            { label: 'Un caractère spécial', met: /[^A-Za-z0-9]/.test(value) },
          ]"
        />
      </FormField>
    `,
  }),
}

export const Destructive: Story = {
  name: 'En erreur',
  render: args => ({
    components: { PasswordField, FormField },
    setup: () => ({ args, value: ref('azerty') }),
    template: `
      <FormField label="Mot de passe" error="Ce mot de passe figure dans une fuite connue." style="max-width:22rem">
        <PasswordField v-bind="args" v-model="value" />
      </FormField>
    `,
  }),
}

export const Disabled: Story = {
  name: 'Désactivé',
  render: args => ({
    components: { PasswordField, FormField },
    setup: () => ({ args, value: ref('secret') }),
    template: `
      <FormField label="Mot de passe" disabled style="max-width:22rem">
        <PasswordField v-bind="args" v-model="value" />
      </FormField>
    `,
  }),
}
