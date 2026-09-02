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
  tags: ['autodocs', 'wip'],
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
