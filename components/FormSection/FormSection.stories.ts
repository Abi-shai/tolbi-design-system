import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import FormSection from '../SectionCard/SectionCard.vue'
import FormField from '../FormField/FormField.vue'
import InputField from '../InputField/InputField.vue'
import InputDropdown from '../Dropdown/InputDropdown.vue'
import Checkbox from '../Checkbox/Checkbox.vue'
import Button from '../Button/Button.vue'
import IconButton from '../IconButton/IconButton.vue'
import Icon from '../Icon/Icon.vue'

const COUNTRIES = [
  { value: 'FR', label: 'France', flag: 'FR' },
  { value: 'CI', label: 'Côte d’Ivoire', flag: 'CI' },
  { value: 'DE', label: 'Allemagne', flag: 'DE' },
]
const IDENTIFIERS = [
  { value: 'TVA', label: 'TVA' },
  { value: 'EORI', label: 'EORI' },
]

const meta: Meta<typeof FormSection> = {
  title: 'Saisie/FormSection',
  component: FormSection,
  tags: ['wip'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Une partie titrée d’un formulaire : un titre, une phrase, puis les champs (ADR-0094). La section ' +
          '**découpe** le formulaire, elle ne **relie** pas ses champs — c’est un titre (`h3` par défaut, ' +
          '`headingLevel`), pas un `<fieldset>` : certains lecteurs d’écran lisent la légende avant chaque champ, ' +
          'et « Informations du commerçant » serait entendu cinq fois. Des champs liés ont déjà leur groupe : ' +
          '`FormField group`.\n\n' +
          'La surface est `Card sunk`, rendue et non redessinée (ADR-0001), et ce n’est pas une prop. L’espacement ' +
          'est la piste A du benchmark : **16** entre les champs, **20** sous l’en-tête et en marge. Les **24** entre ' +
          'deux sections sont à `FormLayout`, qui les empile.',
      },
    },
  },
  args: {
    title: 'Informations du commerçant',
    description: 'Entrez les informations sur le commerçant.',
    headingLevel: 3,
  },
  argTypes: {
    headingLevel: { control: 'select', options: [2, 3, 4, 5, 6] },
  },
}

export default meta
type Story = StoryObj<typeof FormSection>

/** Le bloc du panneau « Créer une déclaration » : des champs seuls, puis un groupe sous un libellé. */
export const Default: Story = {
  name: 'Informations du commerçant',
  render: (args) => ({
    components: { FormSection, FormField, InputField, InputDropdown, Button, IconButton, Icon },
    setup: () => ({
      args,
      COUNTRIES,
      IDENTIFIERS,
      name: ref('Tolbi'),
      country: ref<string | number | null>('FR'),
      address: ref('13 Rue Saint Ursule à Paris'),
      phone: ref(''),
      ids: ref([{ type: 'TVA', value: '' }, { type: 'EORI', value: '' }]),
    }),
    template: `
      <div style="width:472px">
        <FormSection v-bind="args">
          <FormField label="Nom" required><InputField v-model="name" placeholder="Entrez le nom de la société" /></FormField>
          <FormField label="Pays" required>
            <InputDropdown v-model="country" type="flag-leading" :options="COUNTRIES" placeholder="Choisissez le pays" />
          </FormField>
          <FormField label="Adresse" required><InputField v-model="address" placeholder="Entrez la rue et le numéro"><template #icon-leading><Icon name="map-pin" :size="20" /></template></InputField></FormField>
          <FormField label="Téléphone"><InputField v-model="phone" placeholder="Entrez un numéro de téléphone"><template #icon-leading><Icon name="phone" :size="20" /></template></InputField></FormField>
          <FormField label="Identifiants" group>
            <div style="display:flex;flex-direction:column;gap:var(--ds-spacing-md)">
              <div v-for="(id, i) in ids" :key="i" style="display:flex;align-items:center;gap:var(--ds-spacing-md)">
                <div style="flex:1;min-width:0">
                  <InputField v-model="id.value" v-model:option="id.type" :options="IDENTIFIERS" option-label="Type d’identifiant" placeholder="Entrez le numéro de votre identifiant" />
                </div>
                <IconButton icon="circle-x" :aria-label="'Retirer l’identifiant ' + id.type" variant="subtle" size="sm" @click="ids.splice(i, 1)" />
              </div>
            </div>
            <template #label-action>
              <Button variant="link" size="sm" icon-leading="plus" label="Ajouter un identifiant" @click="ids.push({ type: 'TVA', value: '' })" />
            </template>
          </FormField>
        </FormSection>
      </div>
    `,
  }),
}

/** Des choix en ligne puis des listes : la section accepte n’importe quels enfants et les espace de 16. */
export const WithChoices: Story = {
  name: 'Choix et listes',
  args: {
    title: 'Activités du commerçant',
    description: 'Entrez les informations en rapport avec le type d’activité du commerçant.',
  },
  render: (args) => ({
    components: { FormSection, FormField, InputDropdown, Checkbox },
    setup: () => ({ args, COUNTRIES, activity: ref('IMPORT'), a: ref(null), b: ref(null) }),
    template: `
      <div style="width:472px">
        <FormSection v-bind="args">
          <FormField label="Type d’activité" group>
            <div style="display:flex;flex-wrap:wrap;gap:var(--ds-spacing-3xl)">
              <Checkbox v-for="o in [['IMPORT','Import'],['EXPORT','Export'],['DOMESTIC','Domestique']]" :key="o[0]"
                type="radio" name="activity" :value="o[0]" :label="o[1]"
                :model-value="activity === o[0]" @update:model-value="c => c && (activity = o[0])" />
            </div>
          </FormField>
          <FormField label="Pays d’activité">
            <InputDropdown v-model="a" type="flag-leading" :options="COUNTRIES" placeholder="Sélectionnez le pays d’activité" />
          </FormField>
          <FormField label="Pays d’entrée">
            <InputDropdown v-model="b" type="flag-leading" :options="COUNTRIES" placeholder="Sélectionnez le pays d’entrée" />
          </FormField>
        </FormSection>
      </div>
    `,
  }),
}

/** Sans phrase : le titre seul, et les 20 px avant les champs ne bougent pas. */
export const TitleOnly: Story = {
  name: 'Titre seul',
  args: { title: 'Produits à évaluer', description: undefined },
  render: (args) => ({
    components: { FormSection, Button },
    setup: () => ({ args }),
    template: `
      <div style="width:472px">
        <FormSection v-bind="args">
          <div><Button variant="secondary-gray" icon-leading="plus" label="Ajouter un produit" /></div>
        </FormSection>
      </div>
    `,
  }),
}

/** `#description` quand la phrase porte un lien — du contenu de phrase, il tient dans un `<p>`. */
export const DescriptionSlot: Story = {
  name: 'Phrase avec un lien',
  args: { title: 'Société représentée', description: undefined },
  render: (args) => ({
    components: { FormSection, FormField, InputField },
    setup: () => ({ args, v: ref('') }),
    template: `
      <div style="width:472px">
        <FormSection v-bind="args">
          <template #description>
            Tolbi dépose la déclaration en tant que représentant autorisé.
            <a href="#" style="color:var(--ds-text-brand)">En savoir plus</a>
          </template>
          <FormField label="Nom" required><InputField v-model="v" placeholder="Entrez le nom de la société" /></FormField>
        </FormSection>
      </div>
    `,
  }),
}
