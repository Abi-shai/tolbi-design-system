import type { Meta, StoryObj } from '@storybook/vue3'
import PanelBlock from './PanelBlock.vue'
import { Badge } from '../Badge'
import { MetricValue } from '../MetricValue'
import { OptionCard } from '../OptionCard'
import { ProjectGlyph } from '../ProjectGlyph'
import { StatusList, StatusRow } from '../StatusList'
import { within, userEvent, expect, waitFor } from '@storybook/test'
import { reactive } from 'vue'

const meta: Meta<typeof PanelBlock> = {
  title: 'Structure/PanelBlock',
  component: PanelBlock,
  tags: ['stable'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Le bloc de lecture d’un panneau de carte (ADR-0143) : la surface en creux, un titre (avec son `HelpIcon` si le ' +
          'terme en demande un), `#aside` sur la ligne du titre, puis le corps en colonne. C’est `SectionCard` en densité ' +
          '**compacte** (12 autour, 8 entre), rendu et non redessiné (ADR-0001) — le `ArrPanelBlock` du produit. Un filet ' +
          '`border-subtle` le détache du blanc du panneau (ADR-0148). Avec **`limit`**, le corps devient une liste qui garde ' +
          'ses premiers éléments et déplie le reste sur place : « Tout voir (n) », puis « Réduire » (`v-model:expanded`).',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof PanelBlock>

export const Default: Story = {
  name: 'Un bloc de panneau',
  render: () => ({
    components: { PanelBlock, Badge, MetricValue },
    template: `
      <div style="width:23rem">
        <PanelBlock title="Gain de carbone" help="Le carbone stocké par le projet depuis le point de départ.">
          <template #aside><Badge label="+6,2 %" tone="success" size="sm" /></template>
          <MetricValue value="+575" unit="tCO2e" size="lg" />
          <span style="font:var(--ds-font-body-sm);color:var(--ds-text-subtle)">depuis le point de départ (2021)</span>
        </PanelBlock>
      </div>
    `,
  }),
}

const MOTIFS = [
  { id: 'forest', label: 'Était une forêt il y a moins de 10 ans', count: 15, status: 'forest' },
  { id: 'invalid', label: 'Contour invalide', count: 6, status: 'invalid' },
  { id: 'overlap', label: 'Chevauche une autre parcelle', count: 2, status: 'monitored' },
  { id: 'wetland', label: 'Zone humide', count: 1, status: 'monitored' },
]

/**
 * ADR-0148 — **le panneau d’une zone éligible** (Figma `4058:1446`) : les motifs d’exclusion, chacun sa pile de
 * glyphes (`ProjectGlyph count`) dans le `#media` d’une `OptionCard` qui porte une action (l’œil) ; puis les
 * critères, le mot seul (`StatusRow :glyph="false"`). Au-delà de deux motifs, la liste se replie (`limit`). L’œil
 * masque les parcelles d’un motif : la ligne prend l’air désactivé (`OptionCard muted`), l’œil barré reste net et la
 * réaffiche, son nom passe de « Masquer… » à « Afficher… » (ADR-0151).
 */
export const EligibleZone: Story = {
  name: 'Zone éligible',
  render: () => ({
    components: { PanelBlock, Badge, OptionCard, ProjectGlyph, StatusList, StatusRow },
    setup: () => {
      /* The eye masks a motif's parcels on the map (ADR-0151): the row is muted, the action stays live. */
      const masked = reactive<Record<string, boolean>>({})
      return { MOTIFS, masked }
    },
    template: `
      <div style="width:25rem;display:flex;flex-direction:column;gap:16px;padding:16px;background:var(--ds-bg-default)">
        <PanelBlock title="Parcelles écartées" help="Les parcelles retirées de la zone, par motif." :limit="2">
          <template #aside><Badge label="24" tone="warning" size="sm" /></template>
          <OptionCard
            v-for="m in MOTIFS"
            :key="m.id"
            :label="m.label"
            :description="m.count + (m.count > 1 ? ' parcelles' : ' parcelle')"
            :label-lines="1"
            :muted="masked[m.id]"
            :action-icon="masked[m.id] ? 'eye-off' : 'eye'"
            :action-label="(masked[m.id] ? 'Afficher ' : 'Masquer ') + m.label"
            @action="masked[m.id] = !masked[m.id]"
          >
            <template #media><ProjectGlyph kind="parcel" :status="m.status" :seed="m.id" :count="m.count" /></template>
          </OptionCard>
        </PanelBlock>
        <PanelBlock title="Critères d’éligibilité" help="Ce que la zone doit remplir pour être éligible.">
          <template #aside><Badge label="3 sur 6" tone="warning" size="sm" /></template>
          <StatusList>
            <StatusRow :glyph="false" label="Terre agricole" tone="success" status="Oui" />
            <StatusRow :glyph="false" label="Pas une forêt il y a moins de 10 ans" tone="error" status="Non" />
            <StatusRow :glyph="false" label="Contour valide" tone="error" status="Non" />
            <StatusRow :glyph="false" label="Droits fonciers sur les parcelles" tone="neutral" status="À prouver" />
          </StatusList>
        </PanelBlock>
      </div>
    `,
  }),
  /* Guarded: two motifs shown, « Tout voir (4) » unfolds the other two, « Réduire » folds them. */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const shown = () => [...canvasElement.querySelectorAll('.ds-option-card')].filter((c) => getComputedStyle(c.closest('.ds-panel-block__rest') ?? c).visibility === 'visible').length
    await expect(shown()).toBe(2)
    const all = await canvas.findByRole('button', { name: 'Tout voir (4)' })
    await expect(all).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(all)
    await waitFor(() => expect(shown()).toBe(4))
    await userEvent.click(await canvas.findByRole('button', { name: 'Réduire' }))
    await waitFor(() => expect(shown()).toBe(2))
    /* The eye: masks the motif, the row mutes, the action turns and stays live, and brings it back. */
    const hide = await canvas.findByRole('button', { name: 'Masquer Contour invalide' })
    await userEvent.click(hide)
    const show = await canvas.findByRole('button', { name: 'Afficher Contour invalide' })
    await expect(show).toBeEnabled()
    await expect(show.closest('.ds-option-card')).toHaveClass('ds-option-card--muted')
    await userEvent.click(show)
    await expect(await canvas.findByRole('button', { name: 'Masquer Contour invalide' })).toBeEnabled()
    await expect(canvasElement.querySelector('.ds-option-card--muted')).toBeNull()
  },
}
