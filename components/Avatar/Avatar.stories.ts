import type { Meta, StoryObj } from '@storybook/vue3'
import Avatar from './Avatar.vue'
import AvatarDocs from './Avatar.mdx'
import StoryGrid from '../../stories/StoryGrid.vue'

const meta: Meta<typeof Avatar> = {
  title: 'Components/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { page: AvatarDocs },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'],
      table: { category: 'Apparence', defaultValue: { summary: "'md'" } },
    },
    src: {
      control: 'text',
      table: { category: 'Contenu' },
    },
    initials: {
      control: 'text',
      table: { category: 'Contenu' },
    },
    alt: {
      control: 'text',
      table: { category: 'Accessibilité' },
    },
    status: {
      control: 'select',
      options: [undefined, 'online', 'company', 'verified'],
      table: { category: 'Statut', defaultValue: { summary: 'undefined' } },
    },
    companySrc: {
      control: 'text',
      table: { category: 'Statut' },
    },
  },
  args: {
    size: 'md',
    initials: 'OR',
  },
}

export default meta
type Story = StoryObj<typeof meta>

// ── Types de contenu ─────────────────────────────────────────────────

export const Initials: Story = {
  name: 'Initiales',
  args: { initials: 'OR' },
}

export const WithImage: Story = {
  name: 'Avec photo',
  args: {
    src: 'https://i.pravatar.cc/150?img=47',
    alt: 'Phoenix Baker',
    initials: undefined,
  },
}

export const Placeholder: Story = {
  name: 'Placeholder',
  args: { initials: undefined, src: undefined },
}

// ── Statuts ──────────────────────────────────────────────────────────

export const Online: Story = {
  name: 'Online indicator',
  args: {
    src: 'https://i.pravatar.cc/150?img=47',
    status: 'online',
  },
}

export const WithCompany: Story = {
  name: 'Company badge',
  args: {
    src: 'https://i.pravatar.cc/150?img=47',
    status: 'company',
    companySrc: 'https://i.pravatar.cc/32?img=10',
  },
}

export const Verified: Story = {
  name: 'Verified',
  args: {
    src: 'https://i.pravatar.cc/150?img=47',
    status: 'verified',
  },
}

// ── Toutes les tailles ───────────────────────────────────────────────

export const AllSizes: Story = {
  name: 'All sizes',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { StoryGrid },
    setup: () => ({
      items: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'].map(size => ({ component: Avatar, props: { size, initials: 'OR' } })),
    }),
    template: `<StoryGrid :items="items" gap="var(--ds-space-4)" align="flex-end" wrap="nowrap" />`,
  }),
}

export const AllSizesWithImage: Story = {
  name: 'All sizes — avec photo',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { StoryGrid },
    setup: () => ({
      items: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'].map(size => ({
        component: Avatar,
        props: { size, src: 'https://i.pravatar.cc/150?img=47' },
      })),
    }),
    template: `<StoryGrid :items="items" gap="var(--ds-space-4)" align="flex-end" wrap="nowrap" />`,
  }),
}

export const AllStatuses: Story = {
  name: 'All statuses',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { Avatar },
    template: `
      <div style="display:flex; gap:24px; align-items:center;">
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
          <Avatar size="md" src="https://i.pravatar.cc/150?img=47" />
          <span style="font-size:11px;color:#666">Aucun</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
          <Avatar size="md" src="https://i.pravatar.cc/150?img=47" status="online" />
          <span style="font-size:11px;color:#666">Online</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
          <Avatar size="md" src="https://i.pravatar.cc/150?img=47" status="company" company-src="https://i.pravatar.cc/32?img=10" />
          <span style="font-size:11px;color:#666">Company</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
          <Avatar size="md" src="https://i.pravatar.cc/150?img=47" status="verified" />
          <span style="font-size:11px;color:#666">Verified</span>
        </div>
      </div>
    `,
  }),
}
