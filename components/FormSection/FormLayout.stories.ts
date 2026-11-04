import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import FormLayout from './FormLayout.vue'
import FormSection from '../SectionCard/SectionCard.vue'
import FormField from '../FormField/FormField.vue'
import InputField from '../InputField/InputField.vue'
import InputDropdown from '../Dropdown/InputDropdown.vue'
import TextareaInputField from '../TextareaInputField/TextareaInputField.vue'
import Checkbox from '../Checkbox/Checkbox.vue'
import Button from '../Button/Button.vue'
import Badge from '../Badge/Badge.vue'
import Icon from '../Icon/Icon.vue'

const COUNTRIES = [
  { value: 'FR', label: 'France', flag: 'FR' },
  { value: 'CI', label: 'Côte d’Ivoire', flag: 'CI' },
  { value: 'DE', label: 'Allemagne', flag: 'DE' },
]

const meta: Meta<typeof FormLayout> = {
  title: 'Saisie/FormLayout',
  component: FormLayout,
  tags: ['wip'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'La colonne où se tiennent les blocs d’un formulaire, et un seul fait : **24 px** entre eux (ADR-0094). ' +
          'Les blocs sont des `FormSection` et des `FormField` seuls, mêlés — un formulaire alterne les deux, et seul ' +
          'le conteneur peut les espacer tous pareil. Ni fond, ni marge : le `<form>` reste au produit, qui sait où ' +
          'il envoie.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof FormLayout>

/**
 * Le corps du panneau « Créer une déclaration » (EUDR), écrit sans une classe d’espacement :
 * les champs, leur ordre et leurs règles sont au produit, la grammaire au paquet.
 */
export const Declaration: Story = {
  name: 'Créer une déclaration',
  render: () => ({
    components: { FormLayout, FormSection, FormField, InputField, InputDropdown, TextareaInputField, Checkbox, Button, Badge, Icon },
    setup: () => ({
      COUNTRIES,
      reference: ref(''),
      name: ref(''),
      country: ref<string | number | null>(null),
      address: ref(''),
      activity: ref('IMPORT'),
      activityCountry: ref<string | number | null>(null),
      entryCountry: ref<string | number | null>(null),
      comment: ref(''),
    }),
    template: `
      <div style="width:472px">
        <FormLayout>
          <FormField label="Numéro de référence" hint="Ce numéro est la référence interne de votre DDR. Laissez-le vide et le système vous en attribuera un.">
            <InputField v-model="reference" placeholder="Entrez un numéro de référence" />
          </FormField>
          <FormSection title="Informations du commerçant" description="Entrez les informations sur le commerçant.">
            <FormField label="Nom" required><InputField v-model="name" placeholder="Entrez le nom de la société" /></FormField>
            <FormField label="Pays" required>
              <InputDropdown v-model="country" type="flag-leading" :options="COUNTRIES" placeholder="Choisissez le pays" />
            </FormField>
            <FormField label="Adresse" required>
              <InputField v-model="address" placeholder="Entrez la rue et le numéro"><template #icon-leading><Icon name="map-pin" :size="20" /></template></InputField>
            </FormField>
          </FormSection>
          <FormSection title="Activités du commerçant" description="Entrez les informations en rapport avec le type d’activité du commerçant.">
            <FormField label="Type d’activité" group>
              <div style="display:flex;flex-wrap:wrap;gap:var(--ds-spacing-3xl)">
                <Checkbox v-for="o in [['IMPORT','Import'],['EXPORT','Export'],['DOMESTIC','Domestique']]" :key="o[0]"
                  type="radio" name="activity-layout" :value="o[0]" :label="o[1]"
                  :model-value="activity === o[0]" @update:model-value="c => c && (activity = o[0])" />
              </div>
            </FormField>
            <FormField label="Pays d’activité">
              <InputDropdown v-model="activityCountry" type="flag-leading" :options="COUNTRIES" placeholder="Sélectionnez le pays d’activité" />
            </FormField>
            <FormField label="Pays d’entrée">
              <InputDropdown v-model="entryCountry" type="flag-leading" :options="COUNTRIES" placeholder="Sélectionnez le pays d’entrée" />
            </FormField>
          </FormSection>
          <FormField label="Informations supplémentaires">
            <TextareaInputField v-model="comment" />
          </FormField>
          <FormSection title="Produits à évaluer" description="Rajouter des marchandises ou des produits à évaluer.">
            <div style="display:flex;align-items:center;gap:var(--ds-spacing-md)">
              <Button variant="secondary-gray" size="sm" icon-leading="plus" label="Ajouter un produit" />
              <Badge tone="success" label="3 produits sélectionnés" />
            </div>
          </FormSection>
        </FormLayout>
      </div>
    `,
  }),
}
