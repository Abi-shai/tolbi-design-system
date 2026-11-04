import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import FormField from '../FormField/FormField.vue'
import InputField from '../InputField/InputField.vue'
import InputDropdown from '../Dropdown/InputDropdown.vue'
import Checkbox from '../Checkbox/Checkbox.vue'
import Button from '../Button/Button.vue'
import IconButton from '../IconButton/IconButton.vue'
import Icon from '../Icon/Icon.vue'
import SectionCard from './SectionCard.vue'
import { MetricValue } from '../MetricValue'
import { ShareBar } from '../ShareBar'
import { StatTile } from '../StatTile'
import { Badge } from '../Badge'
import { ChartFrame } from '../ChartFrame'
import { ChartLegend } from '../ChartLegend'

const COUNTRIES = [
  { value: 'FR', label: 'France', flag: 'FR' },
  { value: 'CI', label: 'Côte d’Ivoire', flag: 'CI' },
  { value: 'DE', label: 'Allemagne', flag: 'DE' },
]
const IDENTIFIERS = [
  { value: 'TVA', label: 'TVA' },
  { value: 'EORI', label: 'EORI' },
]

const meta: Meta<typeof SectionCard> = {
  title: 'Structure/SectionCard',
  component: SectionCard,
  tags: ['wip'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Un bloc titré : un titre, une phrase, puis son contenu, sur le fond `Card sunk` (ADR-0097). C’était ' +
          '`FormSection` (ADR-0094) ; le panneau ARR a dessiné le même objet autour de chiffres et d’une courbe, ' +
          'donc c’est un seul composant, et `FormSection` en reste l’alias. Un titre (`h3`, `headingLevel`), pas ' +
          'un `<fieldset>`. `#actions` sur la ligne du titre : un `Badge`, un lien. 16 entre les enfants, 20 sous ' +
          'l’en-tête et en marge, aucune marge extérieure.',
      },
    },
  },
  args: { title: 'Les chiffres clés', headingLevel: 3 },
  argTypes: { headingLevel: { control: 'select', options: [2, 3, 4, 5, 6] } },
}

export default meta
type Story = StoryObj<typeof SectionCard>

/** Le panneau « Vue d’ensemble » de la Dynamic baseline (ARR) : trois blocs, trois contenus, un seul composant. */
export const Overview: Story = {
  name: 'Bloc titré — Vue d’ensemble (ARR)',
  render: () => ({
    components: { SectionCard, MetricValue, ShareBar, StatTile, Badge, ChartFrame, ChartLegend },
    setup: () => ({
      shares: [{ label: 'Grâce au projet', share: 86 }, { label: 'Sans lui', share: 14, rest: true }],
      lines: [
        { key: 'p', label: 'Points du projet', shape: 'line', color: 'var(--ds-chart-categorical-1)' },
        { key: 'c', label: 'Points de contrôle', shape: 'dashed', color: 'var(--ds-chart-categorical-5)' },
      ],
    }),
    template: `
      <div style="width:368px;display:flex;flex-direction:column;gap:var(--ds-spacing-xl)">
        <SectionCard title="Part créditable">
          <div>
            <MetricValue value="86" unit="%" size="lg" />
            <p style="margin:var(--ds-spacing-xs) 0 0;font:var(--ds-font-body-sm);color:var(--ds-text-default)">du carbone gagné depuis 2016 revient au projet</p>
          </div>
          <ShareBar :items="shares" :show-share="false" />
        </SectionCard>
        <SectionCard title="Les chiffres clés">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--ds-spacing-md)">
            <StatTile label="Crédits estimés" value="65 762" caption="tCO2e" />
            <StatTile label="|Z|, projet face aux points de contrôle" value="15,8" caption="seuil 1,96" />
            <StatTile label="Écart des points de contrôle" value="0,029" caption="seuil 0,25" />
            <StatTile label="Jeux complets" value="39" caption="sur 40 · couverture satellite 98 %" />
          </div>
        </SectionCard>
        <SectionCard title="Indice de stock">
          <template #actions><Badge label="7× plus vite" tone="success" icon="trending-up" size="sm" /></template>
          <ChartFrame :height="96" :grid="false" :x-ticks="['2016', '2021', '2026']">
            <svg viewBox="0 0 300 100" preserveAspectRatio="none" style="width:100%;height:100%;display:block">
              <polyline points="0,92 30,88 60,72 100,62 140,52 180,44 220,32 260,30 300,22" fill="none" stroke="var(--ds-chart-categorical-1)" stroke-width="2" vector-effect="non-scaling-stroke" />
              <polyline points="0,92 60,90 120,88 180,86 240,84 300,80" fill="none" stroke="var(--ds-chart-categorical-5)" stroke-width="2" stroke-dasharray="5 4" vector-effect="non-scaling-stroke" />
            </svg>
          </ChartFrame>
          <ChartLegend :items="lines" />
        </SectionCard>
      </div>
    `,
  }),
}

/** Sans phrase, avec une action en tête. */
export const WithActions: Story = {
  name: 'Avec une action',
  render: (args) => ({
    components: { SectionCard, Badge },
    setup: () => ({ args }),
    template: `
      <div style="width:368px">
        <SectionCard v-bind="args" title="Indice de stock">
          <template #actions><Badge label="7× plus vite" tone="success" icon="trending-up" size="sm" /></template>
          <p style="margin:0;font:var(--ds-font-body-md);color:var(--ds-text-default)">Le contenu du bloc.</p>
        </SectionCard>
      </div>
    `,
  }),
}

export const InAForm: Story = {
  name: 'Dans un formulaire (FormSection) — Informations du commerçant',
  args: { title: 'Informations du commerçant', description: 'Entrez les informations sur le commerçant.' },
  render: (args) => ({
    components: { SectionCard, FormField, InputField, InputDropdown, Button, IconButton, Icon },
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
        <SectionCard v-bind="args">
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
        </SectionCard>
      </div>
    `,
  }),
}

/** Des choix en ligne puis des listes : la section accepte n’importe quels enfants et les espace de 16. */
export const InAFormChoices: Story = {
  name: 'Dans un formulaire — choix et listes',
  args: {
    title: 'Activités du commerçant',
    description: 'Entrez les informations en rapport avec le type d’activité du commerçant.',
  },
  render: (args) => ({
    components: { SectionCard, FormField, InputDropdown, Checkbox },
    setup: () => ({ args, COUNTRIES, activity: ref('IMPORT'), a: ref(null), b: ref(null) }),
    template: `
      <div style="width:472px">
        <SectionCard v-bind="args">
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
        </SectionCard>
      </div>
    `,
  }),
}

/** Sans phrase : le titre seul, et les 20 px avant les champs ne bougent pas. */
export const TitleOnly: Story = {
  name: 'Titre seul',
  args: { title: 'Produits à évaluer', description: undefined },
  render: (args) => ({
    components: { SectionCard, Button },
    setup: () => ({ args }),
    template: `
      <div style="width:472px">
        <SectionCard v-bind="args">
          <div><Button variant="secondary-gray" icon-leading="plus" label="Ajouter un produit" /></div>
        </SectionCard>
      </div>
    `,
  }),
}

/** `#description` quand la phrase porte un lien — du contenu de phrase, il tient dans un `<p>`. */
export const DescriptionSlot: Story = {
  name: 'Phrase avec un lien',
  args: { title: 'Société représentée', description: undefined },
  render: (args) => ({
    components: { SectionCard, FormField, InputField },
    setup: () => ({ args, v: ref('') }),
    template: `
      <div style="width:472px">
        <SectionCard v-bind="args">
          <template #description>
            Tolbi dépose la déclaration en tant que représentant autorisé.
            <a href="#" style="color:var(--ds-text-brand)">En savoir plus</a>
          </template>
          <FormField label="Nom" required><InputField v-model="v" placeholder="Entrez le nom de la société" /></FormField>
        </SectionCard>
      </div>
    `,
  }),
}
