import type { Meta, StoryObj } from '@storybook/vue3'
import DropdownTrigger from './DropdownTrigger.vue'
import { Avatar } from '../Avatar'

const meta: Meta = {
  title: 'Superposition/Dropdown/Trigger',
  component: DropdownTrigger,
  tags: ['wip'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          "Le contrôle qui ouvre un `Dropdown`, et le propriétaire de son chrome — padding, bordure, " +
          "rayon, élévation, survol, anneau de focus. Le contenu est un slot. `Dropdown` en rend un " +
          "pour son trigger texte ; tout ce qui a besoin d'une autre forme le slote plutôt que de " +
          'refabriquer une boîte à partir des tokens de contrôle (ADR-0001). Deux chromes : `boxed` ' +
          "est un contrôle avant qu'on le touche, `quiet` n'est rien tant qu'on ne le touche pas. " +
          "Les triggers icône et avatar de `Dropdown` restent nus — il n'y a pas de chrome à posséder.",
      },
    },
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    chrome: { control: 'inline-radio', options: ['boxed', 'quiet'] },
    open: { control: 'boolean' },
    chevron: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { size: 'md', chevron: true },
  render: (args) => ({
    setup: () => ({ args }),
    components: { DropdownTrigger },
    template: '<DropdownTrigger v-bind="args">Compte</DropdownTrigger>',
  }),
}

export const Sizes: Story = {
  name: 'Tailles',
  parameters: {
    docs: {
      description: {
        story:
          '`md` (10/14) est le pas de `Dropdown`. `sm` (8/12) convient à un trigger portant une ' +
          'marque de 24px : les deux atteignent la même hauteur par deux chemins différents.',
      },
    },
  },
  render: () => ({
    components: { DropdownTrigger, Avatar },
    template: `
      <div style="display: flex; align-items: center; gap: 16px;">
        <DropdownTrigger size="md" chevron>Compte</DropdownTrigger>
        <DropdownTrigger size="sm" chevron>
          <Avatar size="xs" initials="CK" alt="Coopérative de Kaolack" />
          <span>Kaolack</span>
        </DropdownTrigger>
      </div>
    `,
  }),
}

export const Open: Story = {
  name: 'Ouvert',
  parameters: {
    docs: {
      description: {
        story: '`open` porte `aria-expanded` et retourne le chevron.',
      },
    },
  },
  render: () => ({
    components: { DropdownTrigger },
    template: '<DropdownTrigger open chevron>Compte</DropdownTrigger>',
  }),
}

export const Disabled: Story = {
  name: 'Désactivé',
  render: () => ({
    components: { DropdownTrigger },
    template: '<DropdownTrigger disabled chevron>Compte</DropdownTrigger>',
  }),
}

export const Quiet: Story = {
  name: 'Chrome discret',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story:
          "`chrome=\"quiet\"` n'est rien au repos et se matérialise à l'interaction : une teinte " +
          "`bg-neutral-subtle` sous le pointeur, puis `bg-default` + `elevation-control` tant que le " +
          "panneau est sorti. L'escalade change de **mécanisme** plutôt que d'intensité — absent, " +
          'teinté, posé — et reste donc monotone en sombre, où les mêmes trois pas vont dans ' +
          "l'autre sens. Il n'a de bordure dans aucun état, d'où 40px en `sm` là où `boxed` fait 42. " +
          "À poser sur un fond récessé uniquement : sur `bg-default`, son repos et son survol sont " +
          'le même pixel. Survolez-le, et tabulez dessus pour l’anneau.',
      },
    },
  },
  render: () => ({
    components: { DropdownTrigger, Avatar },
    template: `
      <div style="display: flex; align-items: center; gap: 16px; padding: 12px 16px;
                  background: var(--ds-bg-neutral); border-radius: var(--ds-radius-surface);">
        <DropdownTrigger size="sm" chrome="quiet" chevron>
          <Avatar size="xs" initials="CK" alt="Coopérative de Kaolack" />
          <span>Repos</span>
        </DropdownTrigger>
        <DropdownTrigger size="sm" chrome="quiet" chevron open>
          <Avatar size="xs" initials="CK" alt="Coopérative de Kaolack" />
          <span>Ouvert</span>
        </DropdownTrigger>
        <DropdownTrigger size="sm" chrome="quiet" chevron disabled>
          <Avatar size="xs" initials="CK" alt="Coopérative de Kaolack" />
          <span>Désactivé</span>
        </DropdownTrigger>
      </div>
    `,
  }),
}
