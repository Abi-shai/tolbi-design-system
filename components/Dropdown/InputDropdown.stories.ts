import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import InputDropdown from './InputDropdown.vue'
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

const iconMembers: InputDropdownOption[] = teamMembers.map(m => ({ ...m, icon: 'user-01' as const }))

const dotMembers: InputDropdownOption[] = [
  { value: 'active',   label: 'Active',   supportingText: 'Online now',    dotColor: 'var(--ds-semantic-fg-success-primary)' },
  { value: 'away',     label: 'Away',     supportingText: 'Be right back', dotColor: 'var(--ds-semantic-fg-warning-primary)' },
  { value: 'offline',  label: 'Offline',  supportingText: 'Not available', dotColor: 'var(--ds-semantic-fg-quaternary)'      },
  { value: 'busy',     label: 'Busy',     supportingText: 'Do not disturb',dotColor: 'var(--ds-semantic-fg-error-primary)'   },
]

const meta: Meta<typeof InputDropdown> = {
  title: 'Components/InputDropdown',
  component: InputDropdown,
  tags: ['autodocs'],
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
    label: {
      control: 'text',
      table: { category: 'Contenu' },
    },
    placeholder: {
      control: 'text',
      table: { category: 'Contenu', defaultValue: { summary: "'Select...'" } },
    },
    hintText: {
      control: 'text',
      table: { category: 'Contenu' },
    },
    modelValue: {
      control: 'text',
      table: { category: 'État' },
    },
  },
  args: {
    type: 'default',
    label: 'Team member',
    placeholder: 'Select team member',
    hintText: 'This is a hint text to help user.',
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
    components: { InputDropdown },
    setup() {
      const value = ref(args.modelValue ?? null)
      return { args, value }
    },
    template: `
      <div style="width: 320px;">
        <InputDropdown
          v-bind="args"
          v-model="value"
        />
      </div>
    `,
  }),
}

// ── All types ────────────────────────────────────────────────────────

export const AllTypes: Story = {
  name: 'All types',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { InputDropdown },
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
      const iconMembers: InputDropdownOption[]   = teamMembers.map(m => ({ ...m, icon: 'user-01' as const }))
      const dotMembers: InputDropdownOption[] = [
        { value: 'active',  label: 'Active',  supportingText: 'Online now',     dotColor: 'var(--ds-semantic-fg-success-primary)' },
        { value: 'away',    label: 'Away',    supportingText: 'Be right back',  dotColor: 'var(--ds-semantic-fg-warning-primary)' },
        { value: 'offline', label: 'Offline', supportingText: 'Not available',  dotColor: 'var(--ds-semantic-fg-quaternary)'      },
      ]
      return { defaultVal, iconVal, avatarVal, dotVal, searchVal, teamMembers, iconMembers, dotMembers }
    },
    template: `
      <div style="display: flex; gap: 48px; align-items: flex-start; padding: 24px; flex-wrap: wrap;">
        <div style="width: 320px;">
          <InputDropdown
            type="default"
            label="Default"
            placeholder="Select team member"
            hint-text="This is a hint text to help user."
            :options="teamMembers"
            v-model="defaultVal"
          />
        </div>
        <div style="width: 320px;">
          <InputDropdown
            type="icon-leading"
            label="Icon leading"
            placeholder="Select team member"
            hint-text="This is a hint text to help user."
            leading-icon="user-01"
            :options="iconMembers"
            v-model="iconVal"
          />
        </div>
        <div style="width: 320px;">
          <InputDropdown
            type="avatar-leading"
            label="Avatar leading"
            placeholder="Select team member"
            hint-text="This is a hint text to help user."
            :options="teamMembers"
            v-model="avatarVal"
          />
        </div>
        <div style="width: 320px;">
          <InputDropdown
            type="dot-leading"
            label="Dot leading"
            placeholder="Select status"
            hint-text="This is a hint text to help user."
            :options="dotMembers"
            v-model="dotVal"
          />
        </div>
        <div style="width: 320px;">
          <InputDropdown
            type="search"
            label="Search"
            placeholder="Search team member"
            hint-text="This is a hint text to help user."
            :options="teamMembers"
            v-model="searchVal"
          />
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
    components: { InputDropdown },
    setup() {
      const teamMembers: InputDropdownOption[] = [
        { value: 'olivia', label: 'Olivia Rhye', supportingText: '@olivia' },
        { value: 'lana',   label: 'Lana Steiner', supportingText: '@lana'  },
      ]
      const iconMembers = teamMembers.map(m => ({ ...m, icon: 'user-01' as const }))
      const dotMembers: InputDropdownOption[] = [
        { value: 'active', label: 'Active', supportingText: 'Online now', dotColor: 'var(--ds-semantic-fg-success-primary)' },
      ]
      return { teamMembers, iconMembers, dotMembers }
    },
    template: `
      <div style="display: flex; gap: 32px; align-items: flex-start; padding: 24px; flex-wrap: wrap;">
        <div style="width: 320px;">
          <InputDropdown type="default"       label="Default"       placeholder="Select team member" :options="teamMembers" />
        </div>
        <div style="width: 320px;">
          <InputDropdown type="icon-leading"  label="Icon leading"  placeholder="Select team member" leading-icon="user-01" :options="iconMembers" />
        </div>
        <div style="width: 320px;">
          <InputDropdown type="avatar-leading" label="Avatar leading" placeholder="Select team member" :options="teamMembers" />
        </div>
        <div style="width: 320px;">
          <InputDropdown type="dot-leading"   label="Dot leading"   placeholder="Select status"      :options="dotMembers" />
        </div>
        <div style="width: 320px;">
          <InputDropdown type="search"        label="Search"        placeholder="Search team member" :options="teamMembers" />
        </div>
      </div>
    `,
  }),
}
