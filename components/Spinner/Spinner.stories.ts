import type { Meta, StoryObj } from '@storybook/vue3'
import Spinner from './Spinner.vue'

const meta: Meta<typeof Spinner> = {
  title: 'Feedback & chargement/Spinner',
  tags: ['wip', 'primitive'],
  component: Spinner,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Indicateur d\'attente indéterminé. La couleur suit `currentColor`, donc il s\'accorde ' +
          'toujours au texte qui l\'entoure et n\'a pas besoin de prop de teinte. ' +
          '`Button` le consomme avec `size="1em"` (ADR-0001).',
      },
    },
  },
  argTypes: {
    size: {
      control: 'text',
      description: 'Toute longueur CSS. `1em` pour suivre la taille de police environnante.',
      table: { category: 'Apparence', type: { summary: 'number | string' }, defaultValue: { summary: '24' } },
    },
    thickness: {
      control: { type: 'range', min: 1, max: 6, step: 1 },
      description: 'Épaisseur de l\'anneau en px.',
      table: { category: 'Apparence', type: { summary: 'number' }, defaultValue: { summary: '2' } },
    },
    label: {
      control: 'text',
      description: 'Nom accessible. Omis, le spinner est masqué aux lecteurs d\'écran — à faire quand un texte voisin annonce déjà le chargement.',
      table: { category: 'Accessibilité', type: { summary: 'string' } },
    },
  },
  args: { size: 24, thickness: 2 },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Sizes: Story = {
  name: 'Tailles',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { Spinner },
    setup: () => ({ sizes: [16, 20, 24, 32, 48] }),
    template: `
      <div style="display:flex; align-items:center; gap:2rem; color:var(--ds-text-brand)">
        <div v-for="s in sizes" :key="s" style="display:flex; flex-direction:column; align-items:center; gap:0.5rem">
          <Spinner :size="s" />
          <span style="font-family:monospace; font-size:0.7rem; color:var(--ds-text-subtle)">{{ s }}</span>
        </div>
      </div>
    `,
  }),
}

export const FollowsText: Story = {
  name: 'Suit le texte',
  parameters: {
    layout: 'padded',
    docs: { description: { story: '`size="1em"` et `currentColor` : le spinner hérite de la taille et de la couleur du texte.' } },
  },
  render: () => ({
    components: { Spinner },
    template: `
      <div style="display:flex; flex-direction:column; gap:1rem; font-family:var(--ds-typography-font-family-poppins)">
        <p style="margin:0; display:flex; align-items:center; gap:0.5rem; font-size:var(--ds-font-size-body-sm); color:var(--ds-text-subtle)">
          <Spinner size="1em" /> Chargement des parcelles
        </p>
        <p style="margin:0; display:flex; align-items:center; gap:0.5rem; font-size:var(--ds-font-size-heading-lg); color:var(--ds-text-brand)">
          <Spinner size="1em" /> Analyse en cours
        </p>
      </div>
    `,
  }),
}
