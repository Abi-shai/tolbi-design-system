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
          'le panneau, `DropdownTrigger` pour le contrôle, `Avatar` pour la marque, `DropdownItem` ' +
          "pour les lignes. Le trigger est en `chrome=\"surface\"` — une pastille blanche posée dès " +
          "le repos, un contour `border-default` et l'encre promue au survol, le même contour en " +
          '`border-brand` tant que le panneau est sorti. ' +
          'Il occupe 48px (8 + marque de 32 + 8) ; replié, il devient un carré de la ligne du rail. ' +
          'Les vues ci-dessous sont posées sur `bg-neutral` — sur blanc, la pastille disparaît dans ' +
          'la page.',
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
      <div style="width: 228px; padding: 12px 16px; box-sizing: content-box;
                  background: var(--ds-bg-neutral); border-radius: var(--ds-radius-surface);">
        <WorkspaceSelector v-model="current" :workspaces="workspaces" />
      </div>
    `,
  }),
}

export const States: Story = {
  name: 'États',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story:
          "L'échelle complète, dans les deux formes et les deux modes. Le repos prend la surface, " +
          'ce qui la retire de tous les autres états : sur la pastille blanche, toutes les teintes ' +
          'neutres mesurent ≤ 1,474:1 et `bg-hover` tombe à 1,045:1. Restent deux axes, et ' +
          "l'échelle en prend un par état.\n\n" +
          '| état | étendu | réduit |\n' +
          '| --- | --- | --- |\n' +
          '| repos | `bg-default` + `elevation-surface`, `text-default` | idem, carré de 36px |\n' +
          "| survol | **le contour** `border-default` + l'encre → `text-strong` (17,75:1 clair · 12,58:1 sombre) | même contour, pas de libellé à promouvoir |\n" +
          '| focus | survol + `focus-ring-gray-shadow-sm` — le même état, atteint par l’autre entrée | idem |\n' +
          '| ouvert | **le contour** `border-brand` (3,29:1 · 5,06:1) + chevron retourné | même contour |\n' +
          "| désactivé | la pastille rend sa surface — pas d'ombre, `bg-neutral-subtle` | idem |\n\n" +
          'Survol et focus sont interactifs : passe la souris, puis tabule. `border-brand` est le ' +
          'seul token de marque au-dessus de 3:1 dans les deux modes — le fichier sombre garde ' +
          'brand.300, là où `bg-brand-solid` descend à brand.500 et mesure 2,445:1 sur la pastille. ' +
          "C'est mesuré par `scripts/contrast.test.mjs`, pas décrit ici.",
      },
    },
  },
  render: () => ({
    setup: () => ({ a: ref('kaolack'), b: ref('kaolack'), c: ref('kaolack'), d: ref('kaolack'), workspaces }),
    components: { WorkspaceSelector },
    template: `
      <div style="display: flex; gap: 24px; align-items: flex-start;">
        <div style="display: flex; gap: 16px; align-items: flex-start; padding: 16px;
                    background: var(--ds-bg-neutral); border-radius: var(--ds-radius-surface);">
          <div style="width: 228px; flex: none;">
            <WorkspaceSelector v-model="a" :workspaces="workspaces" />
          </div>
          <WorkspaceSelector v-model="b" :workspaces="workspaces" collapsed />
        </div>

        <div data-theme="dark"
             style="display: flex; gap: 16px; align-items: flex-start; padding: 16px;
                    background: var(--ds-bg-neutral); border-radius: var(--ds-radius-surface);">
          <div style="width: 228px; flex: none;">
            <WorkspaceSelector v-model="c" :workspaces="workspaces" />
          </div>
          <WorkspaceSelector v-model="d" :workspaces="workspaces" collapsed />
        </div>
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
      <div style="width: 228px; padding: 12px 16px; box-sizing: content-box;
                  background: var(--ds-bg-neutral); border-radius: var(--ds-radius-surface);">
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
      <div style="width: 228px; padding: 12px 16px; box-sizing: content-box;
                  background: var(--ds-bg-neutral); border-radius: var(--ds-radius-surface);">
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
      <div style="width: 60px; padding: 12px; background: var(--ds-bg-neutral); box-sizing: border-box;">
        <WorkspaceSelector v-model="current" :workspaces="workspaces" collapsed />
      </div>
    `,
  }),
}
