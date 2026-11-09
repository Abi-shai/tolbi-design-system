import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import { expect, userEvent, waitFor, within } from '@storybook/test'
import AlertsBlock, { type AlertsBlockItem } from './AlertsBlock.vue'

const meta: Meta<typeof AlertsBlock> = {
  title: 'Feedback & chargement/AlertsBlock',
  component: AlertsBlock,
  tags: ['wip'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Les alertes d’un projet, dans son panneau (ADR-0143, « Couche Alertes » `4037:5437`, décidé) : un `PanelBlock` ' +
          '« Alertes » et son compte, puis les alertes **en lignes** — `OptionCard density="row"` : le type en glyphe, ' +
          '« code · objet », la gravité en badge, le délai, un chevron. **Trois lignes au plus** ; au-delà, « Tout voir (n) » ' +
          'déplie le bloc sur place et devient « Réduire » — **un seul bouton** ; un clic ailleurs sur le bloc le déplie aussi ' +
          '(`v-model:expanded`). ' +
          '**Une alerte qui bloque** (`followUps`) : sa ligne seule, puis ses suites, sans « Tout voir ». **Sans alerte, pas ' +
          'de bloc.** Chaque ligne émet `select` avec son objet ; le produit décide (carte et fiche, ou fenêtre de données).',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof AlertsBlock>

const ground = (inner: string) =>
  `<div style="width:25rem;background:var(--ds-bg-default);padding:16px;border:1px solid var(--ds-border-subtle);border-radius:16px">${inner}</div>`

const FIVE: AlertsBlockItem[] = [
  { id: 'k2', label: 'K2 · Projet', icon: 'sprout', severity: 'blocking', meta: 'immédiat' },
  { id: 'c1', label: 'C1 · FPH-SBR-005', icon: 'sprout', severity: 'blocking', meta: 'sous 15 j' },
  { id: 'b2', label: 'B2 · FPH-SBR-031', icon: 'sprout', severity: 'watch', meta: '60 j' },
  { id: 't2', label: 'T2 · FPH-SBR-044', icon: 'satellite', severity: 'watch', meta: '60 j' },
  { id: 'b3', label: 'B3 · FPH-SBR-008', icon: 'satellite', severity: 'review', meta: 'avant consolidation' },
]

/** **Avec alertes** — cinq : les trois premières, « Tout voir (5) » déplie le bloc et devient « Réduire ». */
export const WithAlerts: Story = {
  name: 'Avec alertes',
  render: () => ({
    components: { AlertsBlock },
    setup: () => ({ alerts: FIVE, expanded: ref(false), last: ref('') }),
    template: ground(`<AlertsBlock v-model:expanded="expanded" :alerts="alerts" @select="last = $event.label" />
      <p style="margin:12px 0 0;font:var(--ds-font-body-sm);color:var(--ds-text-subtle)">Dernier choix : {{ last || '—' }}</p>`),
  }),
}

/** **Trois alertes ou moins** — tout est montré : ni « Tout voir », ni dépli. */
export const Three: Story = {
  name: 'Trois alertes ou moins',
  render: () => ({
    components: { AlertsBlock },
    setup: () => ({ alerts: FIVE.slice(0, 3) }),
    template: ground(`<AlertsBlock :alerts="alerts" />`),
  }),
}

/** **Une alerte qui bloque** — sa ligne seule en tête, puis ses suites (sans gravité) ; pas de « Tout voir ». */
export const Blocking: Story = {
  name: 'Une alerte qui bloque',
  render: () => ({
    components: { AlertsBlock },
    setup: () => ({
      alerts: [{ id: 'z', label: 'Ne se distingue pas · Projet', icon: 'scale', severity: 'blocking', meta: '|Z| 1,4' }],
      followUps: [
        { id: 'redo', label: 'Refaire le calcul l’an prochain', icon: 'calendar', meta: '2027' },
        { id: 'zone', label: 'Resserrer la zone sur les parties plantées', icon: 'sprout' },
        { id: 'expert', label: 'En parler à un expert Tolbi', icon: 'message-square', meta: 'sous 48 h' },
      ],
    }),
    template: ground(`<AlertsBlock :alerts="alerts" :follow-ups="followUps" />`),
  }),
}

/** **Sans alerte** — le composant ne rend rien : pas d’état vide. Le cadre ci-dessous reste vide. */
export const None: Story = {
  name: 'Sans alerte',
  render: () => ({
    components: { AlertsBlock },
    template: ground(`<AlertsBlock :alerts="[]" />`),
  }),
}

/*
  Guarded: a press on the block (not on a line) unfolds it and shows all five;
  the one button then says « Réduire » and folds it; « Tout voir (5) » unfolds
  it again; a line emits `select` and does not unfold.
*/
export const Unfolds: Story = {
  name: 'Se déplie au clic',
  render: () => ({
    components: { AlertsBlock },
    setup: () => ({ alerts: FIVE, expanded: ref(false), last: ref('') }),
    template: ground(`<AlertsBlock v-model:expanded="expanded" :alerts="alerts" @select="last = $event.label" /><output data-last>{{ last }}</output>`),
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const visible = () => [...canvasElement.querySelectorAll('.ds-option-card')].filter((c) => getComputedStyle(c.closest('.ds-alerts-block__rest') ?? c).visibility === 'visible').length
    await expect(visible()).toBe(3)
    await userEvent.click(canvasElement.querySelector('.ds-section-card__title')!)
    await waitFor(() => expect(visible()).toBe(5))
    await expect(canvas.queryByRole('button', { name: /Tout voir/ })).toBeNull()
    await userEvent.click(await canvas.findByRole('button', { name: 'Réduire' }))
    await waitFor(() => expect(visible()).toBe(3))
    const seeAll = await canvas.findByRole('button', { name: 'Tout voir (5)' })
    await expect(seeAll).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(seeAll)
    await waitFor(() => expect(visible()).toBe(5))
    await userEvent.click(await canvas.findByRole('button', { name: 'Réduire' }))
    await waitFor(() => expect(visible()).toBe(3))
    await userEvent.click(await canvas.findByRole('button', { name: /C1 · FPH-SBR-005/ }))
    await expect(canvasElement.querySelector('[data-last]')!.textContent).toBe('C1 · FPH-SBR-005')
    await expect(visible()).toBe(3)
  },
}
