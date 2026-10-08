import type { Meta, StoryObj } from '@storybook/vue3'
import IconButton from './IconButton.vue'

const meta: Meta<typeof IconButton> = {
  title: 'Actions/IconButton',
  component: IconButton,
  tags: ['autodocs', 'stable'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          "Bouton d'action rond : 8px autour du glyphe. En `sm` (36px, Figma `Nav/IconButton`) " +
          "c'est le bouton de la barre de navigation, et le plancher que partagent tous les " +
          'contrôles ronds du catalogue — `Button --icon-only` et `CloseButton` démarrent là aussi.\n\n' +
          "**`xs` (32px) passe en dessous**, pour un bouton posé sur le contenu de quelqu'un d'autre " +
          "plutôt que dans une barre à lui. C'est le glyphe qui cède, pas le padding : au-dessus de " +
          '36px le catalogue fait le contraire (`Button` garde son icône à 20 de `sm` à `xl`), mais ' +
          "20px dans 32 ne laisse que 6px et le glyphe touche presque l'anneau.\n\n" +
          'Le fond est transparent : il prend la surface derrière lui.',
      },
    },
  },
  argTypes: {
    icon:      { control: 'text', table: { category: 'Contenu' } },
    ariaLabel: { control: 'text', table: { category: 'Contenu' } },
    size: {
      control: 'inline-radio',
      options: ['xs', 'sm'],
      table: { category: 'Apparence', type: { summary: "'xs' | 'sm'" }, defaultValue: { summary: "'sm'" } },
    },
    variant: {
      control: 'inline-radio',
      options: ['ghost', 'primary', 'surface', 'neutral', 'subtle'],
      description:
        '`ghost` prend la surface derrière lui. `primary` porte le remplissage brand : ' +
        'l\'action autour de laquelle un composite est construit (la saisie de Tolbi AI).',
      table: { category: 'Apparence', type: { summary: "'ghost' | 'primary' | 'surface' | 'neutral' | 'subtle'" }, defaultValue: { summary: "'ghost'" } },
    },
    active:    { control: 'boolean', table: { category: 'État', defaultValue: { summary: 'false' } } },
    disabled:  { control: 'boolean', table: { category: 'État', defaultValue: { summary: 'false' } } },
  },
  args: { icon: 'settings', ariaLabel: 'Paramètres', size: 'sm' },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { name: 'Par défaut' }

/** `active` is the trigger holding a surface open — it reads as hovered until it closes. */
export const Active: Story = {
  name: 'Actif (surface ouverte)',
  args: { icon: 'layout-grid', ariaLabel: 'Modules', active: true },
}

export const Disabled: Story = {
  name: 'Désactivé',
  args: { disabled: true },
}

/**
 * Les deux tailles. `sm` est le plancher partagé (36px) ; `xs` descend à 32 en
 * rétrécissant le glyphe, pas la marge — les deux anneaux ont la même respiration.
 */
export const Sizes: Story = {
  name: 'Les deux tailles',
  render: () => ({
    components: { IconButton },
    template: `
      <div style="display:flex;gap:16px;align-items:center;">
        <IconButton icon="ellipsis" ariaLabel="Actions" size="xs" />
        <IconButton icon="ellipsis" ariaLabel="Actions" size="sm" />
      </div>
    `,
  }),
}

/**
 * `primary` : le remplissage brand, pour l'action autour de laquelle un
 * composite est construit — Envoyer et le micro de la saisie de Tolbi AI
 * (ADR-0059). Le vert est l'action.
 */
export const Primary: Story = {
  name: 'Primary',
  render: () => ({
    components: { IconButton },
    template: `
      <div style="display:flex;gap:16px;align-items:center;">
        <IconButton icon="arrow-up" ariaLabel="Envoyer" size="xs" variant="primary" />
        <IconButton icon="mic" ariaLabel="Envoyer un vocal" size="xs" variant="primary" />
        <IconButton icon="arrow-up" ariaLabel="Envoyer" size="xs" variant="primary" disabled />
        <IconButton icon="arrow-up" ariaLabel="Envoyer" size="sm" variant="primary" />
      </div>
    `,
  }),
}

/**
 * `surface` : un disque blanc, pour un bouton posé sur un fond teinté — la
 * lecture d'un vocal sur sa bulle `bg-neutral` (ADR-0060). Au survol, un
 * contour : sur du blanc, aucune teinte ne se lit.
 */
export const Surface: Story = {
  name: 'Surface',
  render: () => ({
    components: { IconButton },
    template: `
      <div style="display:flex;gap:16px;align-items:center;padding:12px;border-radius:var(--ds-radius-surface-sm);background:var(--ds-bg-neutral);">
        <IconButton icon="play" ariaLabel="Écouter le vocal" size="xs" variant="surface" />
        <IconButton icon="pause" ariaLabel="Mettre en pause" size="xs" variant="surface" />
        <IconButton icon="play" ariaLabel="Écouter le vocal" size="xs" variant="surface" active />
        <IconButton icon="play" ariaLabel="Écouter le vocal" size="xs" variant="surface" disabled />
      </div>
    `,
  }),
}

/** `neutral` : le même disque à l'envers, teinté sur un fond blanc — « Réécouter » dans la saisie (ADR-0061). */
export const Neutral: Story = {
  name: 'Neutral',
  render: () => ({
    components: { IconButton },
    template: `
      <div style="display:flex;gap:16px;align-items:center;padding:12px;border-radius:var(--ds-radius-surface-sm);background:var(--ds-bg-default);border:var(--ds-border-width-default) solid var(--ds-border-subtle);">
        <IconButton icon="play" ariaLabel="Réécouter" size="xs" variant="neutral" />
        <IconButton icon="pause" ariaLabel="Arrêter l’écoute" size="xs" variant="neutral" />
        <IconButton icon="play" ariaLabel="Réécouter" size="xs" variant="neutral" active />
      </div>
    `,
  }),
}

/** `subtle` : un ghost dont l'encre se retire — les actions sous une réponse de Tolbi AI, qui appartiennent au contenu (ADR-0066). L'encre revient au survol et quand le jugement est posé. */
export const Subtle: Story = {
  name: 'Subtle',
  render: () => ({
    components: { IconButton },
    template: `
      <div style="display:flex;align-items:center;">
        <IconButton icon="copy" ariaLabel="Copier la réponse" size="xs" variant="subtle" />
        <IconButton icon="thumbs-up" ariaLabel="Réponse utile" size="xs" variant="subtle" active />
        <IconButton icon="thumbs-down" ariaLabel="Réponse non utile" size="xs" variant="subtle" />
        <IconButton icon="refresh-cw" ariaLabel="Générer une autre réponse" size="xs" variant="subtle" />
      </div>
    `,
  }),
}

export const TheNavSet: Story = {
  name: 'Le jeu de la barre de navigation',
  render: () => ({
    components: { IconButton },
    template: `
      <div style="display:flex;gap:8px;align-items:center;">
        <IconButton icon="settings"    ariaLabel="Paramètres" />
        <IconButton icon="bell"        ariaLabel="Notifications" />
        <IconButton icon="layout-grid" ariaLabel="Modules" />
      </div>
    `,
  }),
}
