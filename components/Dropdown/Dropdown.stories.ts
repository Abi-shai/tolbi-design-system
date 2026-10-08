import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import Dropdown from './Dropdown.vue'
import DropdownItem from './DropdownItem.vue'
import DropdownDivider from './DropdownDivider.vue'
import DropdownGroup from './DropdownGroup.vue'
import { InputField } from '../InputField'

const meta: Meta<typeof Dropdown> = {
  title: 'Superposition/Dropdown',
  component: Dropdown,
  tags: ['wip'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Menu déroulant avec trois variantes de déclencheur : bouton, icône, et avatar.',
      },
    },
  },
  argTypes: {
    trigger: {
      control: 'inline-radio',
      options: ['button', 'icon', 'avatar'],
      table: { category: 'Apparence', defaultValue: { summary: "'button'" } },
    },
    open: {
      control: 'boolean',
      table: { category: 'État', defaultValue: { summary: 'false' } },
    },
    buttonLabel: {
      control: 'text',
      table: { category: 'Contenu', defaultValue: { summary: "'Account'" } },
    },
    userName: {
      control: 'text',
      table: { category: 'Contenu' },
    },
    userEmail: {
      control: 'text',
      table: { category: 'Contenu' },
    },
  },
  args: {
    trigger:     'button',
    open:        false,
    buttonLabel: 'Account',
    userName:    'Olivia Rhye',
    userEmail:   'olivia@untitledui.com',
  },
}

export default meta
type Story = StoryObj<typeof meta>

// ── Shared render helper ─────────────────────────────────────────────

const withMenu = (trigger: 'button' | 'icon' | 'avatar') => ({
  components: { Dropdown, DropdownItem, DropdownDivider },
  setup() {
    const open = ref(false)
    return { open, trigger }
  },
  template: `
    <Dropdown
      :trigger="trigger"
      v-model:open="open"
      button-label="Account"
      user-name="Olivia Rhye"
      user-email="olivia@untitledui.com"
    >
      <DropdownItem icon="user"    label="View profile"       shortcut="⌘K→P" @click="open = false" />
      <DropdownItem icon="settings" label="Settings"          shortcut="⌘S"   @click="open = false" />
      <DropdownItem icon="zap"        label="Keyboard shortcuts" shortcut="?"    @click="open = false" />
      <DropdownDivider />
      <DropdownItem icon="house"  label="Company profile"    shortcut="⌘K→C" @click="open = false" />
      <DropdownItem icon="users"   label="Team"               shortcut="⌘K→T" @click="open = false" />
      <DropdownItem icon="user-plus" label="Invite colleagues" shortcut="⌘I"  @click="open = false" />
      <DropdownDivider />
      <DropdownItem icon="layers"      label="Changelog"        shortcut="⌘K→C" @click="open = false" />
      <DropdownItem icon="message-circle-more" label="Slack Community" shortcut="⌘K→S" @click="open = false" />
      <DropdownItem icon="circle-question-mark"        label="Support"          shortcut="⌘/"   @click="open = false" />
      <DropdownItem icon="container"          label="API"              shortcut="⌘A"   @click="open = false" />
      <DropdownDivider />
      <DropdownItem icon="log-out" label="Log out" shortcut="⌥⇧Q" @click="open = false" />
    </Dropdown>
  `,
})

// ── Stories ──────────────────────────────────────────────────────────

export const ButtonTrigger: Story = {
  name: 'Button trigger',
  render: () => withMenu('button'),
}

export const IconTrigger: Story = {
  name: 'Icon trigger',
  render: () => withMenu('icon'),
}

export const AvatarTrigger: Story = {
  name: 'Avatar trigger',
  render: () => withMenu('avatar'),
}

export const AllTriggers: Story = {
  name: 'All triggers',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { Dropdown, DropdownItem, DropdownDivider },
    setup() {
      const openButton = ref(false)
      const openIcon   = ref(false)
      const openAvatar = ref(false)
      return { openButton, openIcon, openAvatar }
    },
    template: `
      <div style="display: flex; gap: 48px; align-items: flex-start; padding: 16px;">
        <Dropdown trigger="button" v-model:open="openButton" button-label="Account" user-name="Olivia Rhye" user-email="olivia@untitledui.com">
          <DropdownItem icon="user"  label="View profile" shortcut="⌘K→P" @click="openButton = false" />
          <DropdownItem icon="settings" label="Settings"  shortcut="⌘S"   @click="openButton = false" />
          <DropdownDivider />
          <DropdownItem icon="log-out" label="Log out"    shortcut="⌥⇧Q"  @click="openButton = false" />
        </Dropdown>

        <Dropdown trigger="icon" v-model:open="openIcon" user-name="Olivia Rhye" user-email="olivia@untitledui.com">
          <DropdownItem icon="user"  label="View profile" shortcut="⌘K→P" @click="openIcon = false" />
          <DropdownItem icon="settings" label="Settings"  shortcut="⌘S"   @click="openIcon = false" />
          <DropdownDivider />
          <DropdownItem icon="log-out" label="Log out"    shortcut="⌥⇧Q"  @click="openIcon = false" />
        </Dropdown>

        <Dropdown trigger="avatar" v-model:open="openAvatar" user-name="Olivia Rhye" user-email="olivia@untitledui.com">
          <DropdownItem icon="user"  label="View profile" shortcut="⌘K→P" @click="openAvatar = false" />
          <DropdownItem icon="settings" label="Settings"  shortcut="⌘S"   @click="openAvatar = false" />
          <DropdownDivider />
          <DropdownItem icon="log-out" label="Log out"    shortcut="⌥⇧Q"  @click="openAvatar = false" />
        </Dropdown>
      </div>
    `,
  }),
}

/**
 * Un en-tête et des groupes (ADR-0069) : `#header` est le jumeau de `#footer`, hors
 * du défilement — une recherche sur les lignes y reste à portée — et `DropdownGroup`
 * titre une suite de lignes, `label-md` en `text-subtle`. `meta` porte l'heure à la
 * place d'un raccourci.
 */
export const HeaderAndGroups: Story = {
  name: 'En-tête et groupes',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { Dropdown, DropdownItem, DropdownGroup, InputField },
    setup() {
      const open = ref(true)
      const query = ref('')
      return { open, query }
    },
    template: `
      <div style="height: 420px; padding: 16px; display: flex; justify-content: flex-end;">
        <Dropdown trigger="button" v-model:open="open" button-label="Conversations">
          <template #header>
            <InputField v-model="query" size="sm" type="search" placeholder="Rechercher une conversation" />
          </template>
          <DropdownGroup label="Aujourd’hui">
            <DropdownItem label="Expliquer les résultats de ce projet" meta="14:32" :selected="true" />
            <DropdownItem label="Quelle parcelle a le plus produit ?" meta="11:05" :selected="false" />
          </DropdownGroup>
          <DropdownGroup label="Hier">
            <DropdownItem label="Comparer avec la campagne 2024" meta="18:10" :selected="false" />
          </DropdownGroup>
          <DropdownGroup label="Plus ancien">
            <DropdownItem label="Préparer le rapport pour la coopérative" meta="28 sept." :selected="false" />
          </DropdownGroup>
        </Dropdown>
      </div>
    `,
  }),
}
