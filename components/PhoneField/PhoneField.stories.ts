import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import PhoneField from './PhoneField.vue'
import FormField from '../FormField/FormField.vue'
import { dialCodes, dialCodesFor } from './dialCodes'

const meta: Meta<typeof PhoneField> = {
  title: 'Saisie/PhoneField',
  tags: ['wip'],
  component: PhoneField,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Indicatif pays + numéro national, dans une seule boîte bordée. L\'indicatif est un `<select>` ' +
          'natif soudé au slot de tête plutôt qu\'un `InputDropdown` : il doit tenir **à l\'intérieur** du ' +
          'même cadre que le numéro, ce qu\'un popover ne permet pas — et on garde ainsi le sélecteur ' +
          'clavier et le picker natif sur mobile. Le design system porte le **jeu de référence ' +
          'complet** — 245 indicatifs générés depuis libphonenumber — et laisse au produit le choix ' +
          'du sous-ensemble à proposer via `countries`.',
      },
    },
  },
  argTypes: {
    modelValue: { control: 'text', description: 'Le numéro national, sans indicatif.', table: { category: 'Contenu', type: { summary: 'string' } } },
    country:    { control: 'text', description: 'Code ISO du pays sélectionné.', table: { category: 'Contenu', type: { summary: 'string' } } },
    countries: {
      control: false,
      description:
        'Par défaut le jeu complet (245 entrées). Passer un sous-ensemble avec ' +
        '`dialCodesFor([\'SN\', \'CI\'])` : quels pays un produit sert n\'est pas une décision du design system.',
      table: { category: 'Contenu', type: { summary: 'readonly DialCode[]' }, defaultValue: { summary: 'dialCodes' } },
    },
    priority: {
      control: 'object',
      description: 'Codes ISO remontés dans un premier groupe, quand la liste complète est trop longue à parcourir.',
      table: { category: 'Contenu', type: { summary: 'readonly string[]' } },
    },
    placeholder: { control: 'text', table: { category: 'Contenu', type: { summary: 'string' } } },
    size: { control: 'inline-radio', options: ['sm', 'md'], table: { category: 'Apparence', defaultValue: { summary: "'md'" } } },
    destructive: { control: 'boolean', table: { category: 'État', type: { summary: 'boolean' }, defaultValue: { summary: 'false' } } },
    disabled:    { control: 'boolean', table: { category: 'État', type: { summary: 'boolean' }, defaultValue: { summary: 'false' } } },
  },
  args: {
    placeholder: '77 123 45 67',
    size: 'md',
    destructive: false,
    disabled: false,
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: args => ({
    components: { PhoneField, FormField },
    setup: () => ({ args, value: ref(''), country: ref('SN') }),
    template: `
      <FormField label="Numéro de téléphone" style="max-width:22rem">
        <PhoneField v-bind="args" v-model="value" v-model:country="country" />
      </FormField>
    `,
  }),
}

export const Filled: Story = {
  name: 'Renseigné',
  render: args => ({
    components: { PhoneField, FormField },
    setup: () => ({ args, value: ref('77 123 45 67'), country: ref('SN') }),
    template: `
      <FormField label="Numéro de téléphone" style="max-width:22rem">
        <PhoneField v-bind="args" v-model="value" v-model:country="country" />
      </FormField>
    `,
  }),
}

export const OtherCountry: Story = {
  name: 'Autre indicatif',
  render: args => ({
    components: { PhoneField, FormField },
    setup: () => ({ args, value: ref('07 45 12 88'), country: ref('CI') }),
    template: `
      <FormField label="Numéro de téléphone" style="max-width:22rem">
        <PhoneField v-bind="args" v-model="value" v-model:country="country" />
      </FormField>
    `,
  }),
}

export const Destructive: Story = {
  name: 'En erreur',
  render: args => ({
    components: { PhoneField, FormField },
    setup: () => ({ args, value: ref('77 000 00 00'), country: ref('SN') }),
    template: `
      <FormField label="Numéro de téléphone" error="Numéro déjà associé à un autre producteur." style="max-width:22rem">
        <PhoneField v-bind="args" v-model="value" v-model:country="country" />
      </FormField>
    `,
  }),
}

export const FullReferenceSet: Story = {
  name: 'Jeu de référence complet',
  parameters: {
    docs: {
      description: {
        story:
          'Sans `countries`, le champ propose les 245 indicatifs, triés par nom de pays avec un ' +
          'collateur français — « Afrique du Sud » avant « Albanie », « Algérie » avant « Allemagne ».',
      },
    },
  },
  render: args => ({
    components: { PhoneField, FormField },
    setup: () => ({ args, value: ref(''), country: ref('SN'), total: dialCodes.length }),
    template: `
      <div style="max-width:22rem; display:flex; flex-direction:column; gap:0.75rem">
        <PhoneField v-bind="args" v-model="value" v-model:country="country" />
        <p style="margin:0; font-family:monospace; font-size:0.72rem; color:var(--ds-text-subtle)">
          {{ total }} indicatifs disponibles
        </p>
      </div>
    `,
  }),
}

export const WithPriority: Story = {
  name: 'Avec pays fréquents',
  args: { priority: ['SN', 'CI', 'ML', 'BF'] },
  parameters: {
    docs: {
      description: {
        story:
          'Les codes de `priority` remontent dans un premier `<optgroup>`, le reste suit. La donnée ' +
          'reste entière — on ne fourche pas la liste pour prioriser.',
      },
    },
  },
  render: args => ({
    components: { PhoneField, FormField },
    setup: () => ({ args, value: ref(''), country: ref('SN') }),
    template: `
      <FormField label="Numéro de téléphone" style="max-width:22rem">
        <PhoneField v-bind="args" v-model="value" v-model:country="country" />
      </FormField>
    `,
  }),
}

export const RestrictedSet: Story = {
  name: 'Sous-ensemble',
  args: { countries: dialCodesFor(['SN', 'CI', 'ML', 'BF', 'FR']) },
  parameters: {
    docs: {
      description: {
        story: '`dialCodesFor` rend les entrées dans l\'ordre demandé — pour un formulaire qui ne sert qu\'une zone.',
      },
    },
  },
  render: args => ({
    components: { PhoneField, FormField },
    setup: () => ({ args, value: ref(''), country: ref('SN') }),
    template: `
      <FormField label="Numéro de téléphone" style="max-width:22rem">
        <PhoneField v-bind="args" v-model="value" v-model:country="country" />
      </FormField>
    `,
  }),
}
