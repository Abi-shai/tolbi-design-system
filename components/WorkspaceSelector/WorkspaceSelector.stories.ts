import { ref } from 'vue'
import type { Meta, StoryObj } from '@storybook/vue3'
import WorkspaceSelector from './WorkspaceSelector.vue'

const meta: Meta = {
  title: 'Navigation/WorkspaceSelector',
  tags: ['wip'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          "L'espace de travail courant, et le passage à un autre. Ne dessine rien : `Dropdown` pour " +
          'le panneau, `DropdownTrigger` pour la boîte, `Avatar` pour la marque, `DropdownItem` pour ' +
          'les lignes. Le trigger est en `size="sm"` — avec une marque de 24px il atteint les 40px ' +
          "que le trigger texte de `Dropdown` atteint en `md` avec une ligne de 20px.",
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

const workspaces = [
  { id: 'kaolack',   name: 'Coopérative de Kaolack' },
  { id: 'nioro',     name: 'Coopérative de Nioro' },
  { id: 'guinguineo', name: 'Guinguinéo — périmètre sud' },
]

export const Default: Story = {
  render: () => ({
    setup: () => ({ current: ref('kaolack'), workspaces }),
    components: { WorkspaceSelector },
    template: `
      <div style="width: 228px;">
        <WorkspaceSelector v-model="current" :workspaces="workspaces" />
      </div>
    `,
  }),
}

export const LongName: Story = {
  name: 'Nom long',
  parameters: {
    docs: {
      description: {
        story:
          "Un nom d'espace est saisi par l'utilisateur : il tronque, la boîte ne s'élargit pas.",
      },
    },
  },
  render: () => ({
    setup: () => ({
      current: ref('long'),
      workspaces: [
        { id: 'long', name: 'Union des coopératives arachidières du bassin de Kaolack' },
        ...workspaces,
      ],
    }),
    components: { WorkspaceSelector },
    template: `
      <div style="width: 228px;">
        <WorkspaceSelector v-model="current" :workspaces="workspaces" />
      </div>
    `,
  }),
}

export const Disabled: Story = {
  name: 'Désactivé',
  parameters: {
    docs: {
      description: {
        story: "Un seul espace de travail — il n'y a nulle part où aller.",
      },
    },
  },
  render: () => ({
    setup: () => ({ current: ref('kaolack'), workspaces: [workspaces[0]] }),
    components: { WorkspaceSelector },
    template: `
      <div style="width: 228px;">
        <WorkspaceSelector v-model="current" :workspaces="workspaces" disabled />
      </div>
    `,
  }),
}

export const Collapsed: Story = {
  name: 'Réduit',
  parameters: {
    docs: {
      description: {
        story:
          "Dans un rail icônes seules la boîte disparaît et il ne reste que la marque — ce que font " +
          'Weavy, Midday, Aboard et Shop. Le panneau ne peut pas s’aligner sur un déclencheur de ' +
          '36px : il garde sa largeur et s’ouvre à côté du rail.',
      },
    },
  },
  render: () => ({
    setup: () => ({ current: ref('kaolack'), workspaces }),
    components: { WorkspaceSelector },
    template: `
      <div style="width: 52px; padding: 8px; background: var(--ds-bg-neutral); box-sizing: border-box;">
        <WorkspaceSelector v-model="current" :workspaces="workspaces" collapsed />
      </div>
    `,
  }),
}
