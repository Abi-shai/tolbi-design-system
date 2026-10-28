import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import InputDropdown from './InputDropdown.vue'
import FormField from '../FormField/FormField.vue'
import type { InputDropdownOption } from './InputDropdown.vue'

const teamMembers: InputDropdownOption[] = [
  { value: 'phoenix', label: 'Phoenix Baker',  supportingText: '@phoenix' },
  { value: 'olivia',  label: 'Olivia Rhye',    supportingText: '@olivia'  },
  { value: 'lana',    label: 'Lana Steiner',   supportingText: '@lana'    },
  { value: 'demi',    label: 'Demi Wilkinson', supportingText: '@demi'    },
  { value: 'candice', label: 'Candice Wu',     supportingText: '@candice' },
  { value: 'natali',  label: 'Natali Craig',   supportingText: '@natali'  },
  { value: 'drew',    label: 'Drew Cano',      supportingText: '@drew'    },
  { value: 'orlando', label: 'Orlando Diggs',  supportingText: '@orlando' },
]

const iconMembers: InputDropdownOption[] = teamMembers.map(m => ({ ...m, icon: 'user' as const }))

const dotMembers: InputDropdownOption[] = [
  { value: 'active',   label: 'Active',   supportingText: 'Online now',    dotColor: 'var(--ds-text-success)' },
  { value: 'away',     label: 'Away',     supportingText: 'Be right back', dotColor: 'var(--ds-text-warning)' },
  { value: 'offline',  label: 'Offline',  supportingText: 'Not available', dotColor: 'var(--ds-text-subtlest)'      },
  { value: 'busy',     label: 'Busy',     supportingText: 'Do not disturb',dotColor: 'var(--ds-text-error)'   },
]

const meta: Meta<typeof InputDropdown> = {
  title: 'Saisie/InputDropdown',
  component: InputDropdown,
  tags: ['stable'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A form field-style select dropdown. Supports default, icon-leading, avatar-leading, dot-leading, and search types.',
      },
    },
  },
  argTypes: {
    type: {
      control: 'inline-radio',
      options: ['default', 'icon-leading', 'avatar-leading', 'dot-leading', 'search'],
      table: { category: 'Apparence', defaultValue: { summary: "'default'" } },
    },
    placeholder: {
      control: 'text',
      table: { category: 'Contenu', defaultValue: { summary: "'Select...'" } },
    },
    modelValue: {
      control: 'text',
      table: { category: 'État' },
    },
  },
  args: {
    type: 'default',
    placeholder: 'Select team member',
    options: teamMembers,
    modelValue: null,
  },
}

export default meta
type Story = StoryObj<typeof meta>

// ── Playground ───────────────────────────────────────────────────────

export const Playground: Story = {
  name: 'Playground',
  render: (args) => ({
    components: { InputDropdown, FormField },
    setup() {
      const value = ref(args.modelValue ?? null)
      return { args, value }
    },
    template: `
      <FormField label="Team member" hint="This is a hint text to help user." style="width: 320px;">
        <InputDropdown
          v-bind="args"
          v-model="value"
        />
      </FormField>
    `,
  }),
}

// ── All types ────────────────────────────────────────────────────────

export const AllTypes: Story = {
  name: 'All types',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { InputDropdown, FormField },
    setup() {
      const defaultVal     = ref('olivia')
      const iconVal        = ref('olivia')
      const avatarVal      = ref('olivia')
      const dotVal         = ref('active')
      const searchVal      = ref('olivia')
      const teamMembers: InputDropdownOption[] = [
        { value: 'phoenix', label: 'Phoenix Baker',  supportingText: '@phoenix' },
        { value: 'olivia',  label: 'Olivia Rhye',    supportingText: '@olivia'  },
        { value: 'lana',    label: 'Lana Steiner',   supportingText: '@lana'    },
        { value: 'demi',    label: 'Demi Wilkinson', supportingText: '@demi'    },
        { value: 'candice', label: 'Candice Wu',     supportingText: '@candice' },
        { value: 'natali',  label: 'Natali Craig',   supportingText: '@natali'  },
        { value: 'drew',    label: 'Drew Cano',      supportingText: '@drew'    },
      ]
      const iconMembers: InputDropdownOption[]   = teamMembers.map(m => ({ ...m, icon: 'user' as const }))
      const dotMembers: InputDropdownOption[] = [
        { value: 'active',  label: 'Active',  supportingText: 'Online now',     dotColor: 'var(--ds-text-success)' },
        { value: 'away',    label: 'Away',    supportingText: 'Be right back',  dotColor: 'var(--ds-text-warning)' },
        { value: 'offline', label: 'Offline', supportingText: 'Not available',  dotColor: 'var(--ds-text-subtlest)'      },
      ]
      return { defaultVal, iconVal, avatarVal, dotVal, searchVal, teamMembers, iconMembers, dotMembers }
    },
    template: `
      <div style="display: flex; gap: 48px; align-items: flex-start; padding: 24px; flex-wrap: wrap;">
        <div style="width: 320px;">
          <FormField label="Default">
            <InputDropdown type="default" placeholder="Select team member" hint-text="This is a hint text to help user." :options="teamMembers" v-model="defaultVal" />
          </FormField>
        </div>
        <div style="width: 320px;">
          <FormField label="Icon leading">
            <InputDropdown type="icon-leading" placeholder="Select team member" hint-text="This is a hint text to help user." leading-icon="user" :options="iconMembers" v-model="iconVal" />
          </FormField>
        </div>
        <div style="width: 320px;">
          <FormField label="Avatar leading">
            <InputDropdown type="avatar-leading" placeholder="Select team member" hint-text="This is a hint text to help user." :options="teamMembers" v-model="avatarVal" />
          </FormField>
        </div>
        <div style="width: 320px;">
          <FormField label="Dot leading">
            <InputDropdown type="dot-leading" placeholder="Select status" hint-text="This is a hint text to help user." :options="dotMembers" v-model="dotVal" />
          </FormField>
        </div>
        <div style="width: 320px;">
          <FormField label="Search">
            <InputDropdown type="search" placeholder="Search team member" hint-text="This is a hint text to help user." :options="teamMembers" v-model="searchVal" />
          </FormField>
        </div>
      </div>
    `,
  }),
}

// ── Placeholder states ───────────────────────────────────────────────

export const Placeholder: Story = {
  name: 'Placeholder states',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { InputDropdown, FormField },
    setup() {
      const teamMembers: InputDropdownOption[] = [
        { value: 'olivia', label: 'Olivia Rhye', supportingText: '@olivia' },
        { value: 'lana',   label: 'Lana Steiner', supportingText: '@lana'  },
      ]
      const iconMembers = teamMembers.map(m => ({ ...m, icon: 'user' as const }))
      const dotMembers: InputDropdownOption[] = [
        { value: 'active', label: 'Active', supportingText: 'Online now', dotColor: 'var(--ds-text-success)' },
      ]
      return { teamMembers, iconMembers, dotMembers }
    },
    template: `
      <div style="display: flex; gap: 32px; align-items: flex-start; padding: 24px; flex-wrap: wrap;">
        <div style="width: 320px;">
          <FormField label="Default">
            <InputDropdown type="default" placeholder="Select team member" :options="teamMembers" />
          </FormField>
        </div>
        <div style="width: 320px;">
          <FormField label="Icon leading">
            <InputDropdown type="icon-leading" placeholder="Select team member" leading-icon="user" :options="iconMembers" />
          </FormField>
        </div>
        <div style="width: 320px;">
          <FormField label="Avatar leading">
            <InputDropdown type="avatar-leading" placeholder="Select team member" :options="teamMembers" />
          </FormField>
        </div>
        <div style="width: 320px;">
          <FormField label="Dot leading">
            <InputDropdown type="dot-leading" placeholder="Select status" :options="dotMembers" />
          </FormField>
        </div>
        <div style="width: 320px;">
          <FormField label="Search">
            <InputDropdown type="search" placeholder="Search team member" :options="teamMembers" />
          </FormField>
        </div>
      </div>
    `,
  }),
}

// ── In a box that scrolls ────────────────────────────────────────────

const statuses: InputDropdownOption[] = [
  { value: 'all',       label: 'Tous' },
  { value: 'done',      label: 'Terminé' },
  { value: 'running',   label: 'En cours' },
  { value: 'failed',    label: 'Échoué' },
  { value: 'draft',     label: 'Brouillon' },
]

export const InAScrollingBox: Story = {
  name: 'Dans une boîte qui défile',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story:
          'La liste est dans la couche supérieure, placée sur le champ (ADR-0078) : au bas du corps d\'un ' +
          'panneau latéral ou d\'une fenêtre, elle passe par-dessus au lieu d\'allonger son défilement, et ' +
          's\'ouvre au-dessus du champ quand la place manque en dessous. Dans une barre de filtres en ' +
          '`overflow`, elle n\'est plus coupée.',
      },
    },
  },
  render: () => ({
    components: { InputDropdown, FormField },
    setup: () => ({ statuses, a: ref(null), b: ref('all') }),
    template: `
      <div style="display: flex; gap: 32px; align-items: flex-start; flex-wrap: wrap;">
        <div data-box style="width: 360px; height: 280px; overflow: auto; border: 1px solid var(--ds-border-subtle); border-radius: 12px; padding: 16px; box-sizing: border-box; display: flex; flex-direction: column; gap: 16px;">
          <p style="margin: 0; font: var(--ds-font-body-md); color: var(--ds-text-subtle);">Le corps d'un panneau latéral : il défile, et le dernier champ est en bas.</p>
          <div style="height: 120px; flex-shrink: 0; border-radius: 8px; background: var(--ds-bg-neutral-subtle);" />
          <FormField label="Statut">
            <InputDropdown placeholder="Choisir un statut" :options="statuses" v-model="a" />
          </FormField>
        </div>
        <div data-bar style="width: 360px; overflow-x: auto; display: flex; gap: 12px; padding: 4px; border-bottom: 1px solid var(--ds-border-subtle);">
          <div style="width: 160px; flex-shrink: 0;"><InputDropdown :options="statuses" v-model="b" /></div>
          <div style="width: 160px; flex-shrink: 0;"><InputDropdown placeholder="Norme" :options="statuses" /></div>
          <div style="width: 160px; flex-shrink: 0;"><InputDropdown placeholder="Année" :options="statuses" /></div>
        </div>
      </div>
    `,
  }),
}

/** `sm` : un contrôle posé dans une barre — les lignes par page du pied de tableau (ADR-0080). Il épouse sa valeur ; sa liste est au moins aussi large que lui. */
export const Small: Story = {
  name: 'Taille sm',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { InputDropdown },
    setup: () => ({ size: ref(10), sizes: [10, 20, 50, 100].map(n => ({ value: n, label: String(n) })) }),
    template: `
      <div style="display:flex; align-items:center; gap:var(--ds-spacing-md); font:var(--ds-font-body-md); color:var(--ds-text-subtle);">
        <span aria-hidden="true">Lignes par page</span>
        <InputDropdown size="sm" aria-label="Lignes par page" :options="sizes" v-model="size" />
      </div>
    `,
  }),
}

const COUNTRIES = [
  { value: 'SN', label: 'Sénégal', flag: 'SN' },
  { value: 'CI', label: 'Côte d’Ivoire', flag: 'CI' },
  { value: 'ML', label: 'Mali', flag: 'ML' },
  { value: 'BF', label: 'Burkina Faso', flag: 'BF' },
  { value: 'GH', label: 'Ghana', flag: 'GH' },
  { value: 'CM', label: 'Cameroun', flag: 'CM' },
  { value: 'FR', label: 'France', flag: 'FR' },
  { value: 'NL', label: 'Pays-Bas', flag: 'NL' },
  { value: 'BE', label: 'Belgique', flag: 'BE' },
  { value: 'DE', label: 'Allemagne', flag: 'DE' },
]

/** ADR-0085 — le drapeau du pays devant chaque option et devant la valeur (`type="flag-leading"`, `option.flag`). */
export const FlagLeading: Story = {
  name: 'Drapeau en tête',
  render: () => ({
    components: { InputDropdown, FormField },
    setup: () => ({ value: ref('SN'), COUNTRIES }),
    template: `
      <div style="width:320px">
        <FormField label="Pays d’origine">
          <InputDropdown v-model="value" type="flag-leading" :options="COUNTRIES" placeholder="Choisir un pays" />
        </FormField>
      </div>
    `,
  }),
}

const PRODUCTS = ['Cacao', 'Café', 'Hévéa', 'Palmier à huile', 'Soja', 'Bois', 'Bovins'].map(p => ({ value: p, label: p }))

/**
 * ADR-0085 — plusieurs choix (`multiple`, `v-model:values`) : les choix en étiquettes sur une ligne, le reste en
 * « +N » — le champ ne grandit pas. La liste mène chaque ligne d’une case et reste ouverte ; « Effacer » au pied.
 * Retour arrière sur le champ retire le dernier choix.
 */
export const Multiple: Story = {
  name: 'Plusieurs choix',
  render: () => ({
    components: { InputDropdown, FormField },
    setup: () => ({ values: ref(['Cacao', 'Café', 'Hévéa', 'Soja']), none: ref([]), countries: ref(['SN', 'CI']), PRODUCTS, COUNTRIES }),
    template: `
      <div style="display:flex; flex-direction:column; gap:var(--ds-spacing-2xl); width:320px">
        <FormField label="Produits">
          <InputDropdown multiple v-model:values="values" :options="PRODUCTS" placeholder="Choisir des produits" />
        </FormField>
        <FormField label="Produits — aucun choisi">
          <InputDropdown multiple v-model:values="none" :options="PRODUCTS" placeholder="Choisir des produits" />
        </FormField>
        <FormField label="Pays d’origine">
          <InputDropdown multiple type="flag-leading" v-model:values="countries" :options="COUNTRIES" placeholder="Choisir des pays" />
        </FormField>
      </div>
    `,
  }),
}

