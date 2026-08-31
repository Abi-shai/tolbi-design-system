import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import FormField from './FormField.vue'
import InputField from '../InputField/InputField.vue'
import InputDropdown from '../Dropdown/InputDropdown.vue'
import TextareaInputField from '../TextareaInputField/TextareaInputField.vue'
import Checkbox from '../Checkbox/Checkbox.vue'
import Toggle from '../Toggle/Toggle.vue'
import Slider from '../Slider/Slider.vue'
import PhoneField from '../PhoneField/PhoneField.vue'

const meta: Meta<typeof FormField> = {
  title: 'Saisie/FormField',
  component: FormField,
  tags: ['wip'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'L\'enveloppe d\'un champ : légende, marqueur d\'obligation, texte d\'aide, message d\'erreur — ' +
          'et tout le câblage `id` / `for` / `aria-describedby` / `aria-invalid` qui va avec.\n\n' +
          '**Elle en est le seul propriétaire.** Aucun contrôle de saisie ne porte plus de `label` ni de ' +
          '`hint` : ils rendent leur boîte, rien d\'autre. Avant, dix composants ré-implémentaient ce bloc ' +
          'avec trois noms de prop différents (`hint`, `supportingText`, `hintText`) et quatre niveaux ' +
          'd\'accessibilité — voir ADR-0008.\n\n' +
          'La transmission passe par `provide`/`inject` : le contrôle reçoit ce dont il a besoin sans ' +
          'qu\'on le câble à la main, et continue de fonctionner seul en dehors de toute enveloppe.',
      },
    },
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'Omise pour un contrôle qui porte déjà son intitulé en ligne — `Checkbox`, `Toggle`.',
      table: { category: 'Contenu' },
    },
    hint: {
      control: 'text',
      description: 'Texte d\'aide sous le contrôle. Remplacé par `error` quand il y en a un.',
      table: { category: 'Contenu' },
    },
    error: {
      control: 'text',
      description:
        'Message d\'erreur. **Sa présence est ce qui rend le champ invalide** — il n\'y a pas de ' +
        'booléen séparé, donc pas de bordure rouge sans explication.',
      table: { category: 'Contenu' },
    },
    required: {
      control: 'boolean',
      table: { category: 'État', defaultValue: { summary: 'false' } },
    },
    disabled: {
      control: 'boolean',
      table: { category: 'État', defaultValue: { summary: 'false' } },
    },
    id: {
      control: 'text',
      description: 'Posé ici, jamais sur le contrôle : c\'est ce qui garantit que `for` résout.',
      table: { category: 'HTML' },
    },
  },
  args: {
    label:    'Superficie (ha)',
    hint:     'Surface déclarée de la parcelle.',
    required: false,
    disabled: false,
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { FormField, InputField },
    setup: () => ({ args, value: ref('') }),
    template: `
      <div style="width:320px">
        <FormField v-bind="args">
          <InputField v-model="value" placeholder="12,5" />
        </FormField>
      </div>
    `,
  }),
}

export const States: Story = {
  name: 'Les quatre états',
  parameters: {
    docs: {
      description: {
        story:
          'L\'invalidité découle du message, elle ne se déclare pas. Et l\'erreur porte un glyphe ' +
          'en plus de sa couleur : la teinte ne porte jamais le sens seule (ADR-0006).',
      },
    },
  },
  render: () => ({
    components: { FormField, InputField },
    template: `
      <div style="display:flex;flex-direction:column;gap:24px;width:320px;">
        <FormField label="Par défaut" hint="Surface déclarée de la parcelle.">
          <InputField placeholder="12,5" />
        </FormField>
        <FormField label="Obligatoire" hint="Surface déclarée de la parcelle." required>
          <InputField placeholder="12,5" />
        </FormField>
        <FormField label="En erreur" error="La superficie doit être un nombre positif.">
          <InputField placeholder="12,5" model-value="-3" />
        </FormField>
        <FormField label="Désactivé" hint="Surface déclarée de la parcelle." disabled>
          <InputField placeholder="12,5" />
        </FormField>
      </div>
    `,
  }),
}

export const AnyControl: Story = {
  name: 'Une enveloppe, tous les contrôles',
  parameters: {
    docs: {
      description: {
        story:
          'C\'est la raison d\'être du composant. Le produit le fait déjà sans le savoir : ' +
          '`RecordKeyInput` aligne trois champs avec le même habillage, dont un menu déroulant — ' +
          'l\'enveloppe était donc déjà indépendante du contrôle, elle n\'était juste écrite nulle part.',
      },
    },
  },
  render: () => ({
    components: { FormField, InputField, InputDropdown, TextareaInputField, PhoneField },
    setup: () => ({
      cultures: [
        { value: 'mais',   label: 'Maïs' },
        { value: 'sorgho', label: 'Sorgho' },
        { value: 'mil',    label: 'Mil' },
      ],
      country: ref('SN'),
    }),
    template: `
      <div style="display:flex;flex-direction:column;gap:24px;width:360px;">
        <FormField label="Nom du producteur" required>
          <InputField placeholder="Nom du producteur" />
        </FormField>
        <FormField label="Superficie (ha)" hint="Surface déclarée de la parcelle.">
          <InputField type="number" placeholder="12,5" />
        </FormField>
        <FormField label="Type de culture">
          <InputDropdown :options="cultures" placeholder="Type de culture" />
        </FormField>
        <FormField label="Numéro de téléphone">
          <PhoneField v-model:country="country" placeholder="77 123 45 67" />
        </FormField>
        <FormField label="Observations" hint="Facultatif.">
          <TextareaInputField placeholder="Notes de terrain…" />
        </FormField>
      </div>
    `,
  }),
}

export const InlineLabelControls: Story = {
  name: 'Contrôles à label en ligne',
  parameters: {
    docs: {
      description: {
        story:
          '`Checkbox`, `Toggle` et `Slider` gardent leur propre intitulé, parce qu\'il se place **à côté** ' +
          'du contrôle et non au-dessus. Ils entrent quand même dans l\'enveloppe, mais pour son message : ' +
          'on lui laisse alors sa `label` vide.\n\n' +
          'Sur `Slider`, la prop qui s\'appelait `label` a été renommée `value-display` — elle ne désignait ' +
          'pas un intitulé mais l\'endroit où s\'affiche la valeur, et l\'homonymie était un piège.',
      },
    },
  },
  render: () => ({
    components: { FormField, Checkbox, Toggle, Slider },
    setup: () => ({ range: ref<[number, number]>([25, 75]), on: ref(true), checked: ref(false) }),
    template: `
      <div style="display:flex;flex-direction:column;gap:32px;width:360px;">
        <FormField error="Vous devez accepter pour continuer.">
          <Checkbox v-model="checked" label="J'accepte les conditions" supporting-text="Vous pourrez les relire à tout moment." />
        </FormField>
        <FormField hint="Un SMS par lot validé, au plus un par jour.">
          <Toggle v-model="on" label="Recevoir les alertes" supporting-text="Par SMS, au numéro déclaré." />
        </FormField>
        <FormField label="Plage de rendement (t/ha)" hint="Bornes incluses.">
          <div style="padding-bottom:20px">
            <Slider v-model="range" value-display="bottom" />
          </div>
        </FormField>
      </div>
    `,
  }),
}

export const Accessibility: Story = {
  name: 'Ce que le câblage produit',
  parameters: {
    docs: {
      description: {
        story:
          'Inspecter le champ ci-dessous : `for` du label et `id` de l\'input concordent, ' +
          '`aria-describedby` pointe sur le message, `aria-invalid` est posé, et l\'astérisque est ' +
          '`aria-hidden` — c\'est l\'attribut natif `required` qui porte l\'information.\n\n' +
          'Avant, quatre composants sur dix seulement rattachaient leur texte d\'aide. `Checkbox` et ' +
          '`Toggle` le repliaient même dans le **nom** accessible : un lecteur d\'écran annonçait ' +
          '« Recevoir les alertes Par SMS, au numéro déclaré » comme un seul nom.',
      },
    },
  },
  render: () => ({
    components: { FormField, InputField },
    template: `
      <div style="width:360px">
        <FormField
          id="demo-superficie"
          label="Superficie (ha)"
          error="La superficie doit être un nombre positif."
          required
        >
          <InputField model-value="-3" />
        </FormField>
      </div>
    `,
  }),
}
