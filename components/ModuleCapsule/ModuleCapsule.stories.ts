import type { Meta, StoryObj } from '@storybook/vue3'
import { ModuleCapsule } from '.'

/**
 * Figma *Sprint 18* `1308:5261` — `Bandeau/Capsule`.
 *
 * The capsule was drawn **in dark mode**, against the tokens ADR-0029 added, so
 * it is the first surface in the catalogue that was designed for the second mode
 * rather than ported into it. Switch the **Mode** toolbar to see it as designed.
 */
const meta: Meta<typeof ModuleCapsule> = {
  title: 'Données/ModuleCapsule',
  component: ModuleCapsule,
  tags: ['autodocs', 'stable'],
  // Drawn in dark (ADR-0029/0031), so it opens in dark. Both modes work —
  // flip the Mode toolbar — but light is not the design this came from.
  globals: { theme: 'dark' },
  // A capsule is bg-default and so is the page, so on its own it has no edge.
  // Figma always sets it in the band, which is bg-neutral-subtle — these stories
  // do the same rather than showing a capsule that cannot be seen.
  decorators: [
    () => ({
      template:
        '<div style="background: var(--ds-bg-neutral-subtle); padding: var(--ds-spacing-sm);">' +
        '<story /></div>',
    }),
  ],
  argTypes: {
    unitPlacement: { control: 'inline-radio', options: ['inline', 'below'] },
  },
}

export default meta
type Story = StoryObj<typeof meta>

/** `1334:4300` — the reference capsule, content for content. */
export const Default: Story = {
  args: {
    module: 'Data',
    title: 'Recensement ménages — Kaolack',
    status: { label: 'Collecte en cours', tone: 'warning', variant: 'pill-color' },
    value: 342,
    unit: 'enregistrements',
    valueBadge: { label: '298 validées', tone: 'success', variant: 'pill-outline' },
    signals: [
      { icon: 'circle-check', label: '298 validés' },
      { icon: 'clock', label: '44 en attente' },
    ],
    freshness: 'Mise à jour il y a 2 h',
  },
}

/**
 * `1334:4333` — no status badge, no second reading of the figure, and the unit
 * set **below** it. Figma carries both placements: a unit wider than its own
 * figure reads better stacked.
 */
export const UnitBelow: Story = {
  args: {
    module: 'ID',
    title: 'Coopérative de Kaolack',
    value: '1 240',
    unit: 'producteurs',
    unitPlacement: 'below',
    signals: [
      { icon: 'land-plot', label: '312 parcelles' },
      { icon: 'ruler', label: '847 ha' },
    ],
    freshness: 'Mise à jour hier',
  },
}

/**
 * `1334:4397` — one signal rather than two, and no status badge.
 *
 * Figma draws this with an `ina` illustration, which has no counterpart in
 * `ModuleName`; `Survey` stands in until the artwork is exported. `moduleLabel`
 * is what lets the two differ.
 */
export const SingleSignal: Story = {
  args: {
    module: 'Survey',
    moduleLabel: 'INA',
    title: 'Coopérative de Kaolack',
    value: '1 024',
    unit: 'identités',
    valueBadge: { label: '981 vérifiées', tone: 'success', variant: 'pill-outline' },
    signals: [{ icon: 'id-card', label: '981 vérifiées' }],
    freshness: 'Mise à jour il y a 6 h',
  },
}

/**
 * `1283:3568` — the progress section, hidden in all six Figma capsules but
 * present in two of them. It opens a fourth column between the figure and the
 * composition.
 */
export const WithProgress: Story = {
  args: {
    module: 'Source',
    title: 'Collecte cacao — 1er kilomètre',
    status: { label: 'Collecte en cours', tone: 'warning', variant: 'pill-color' },
    value: '12,4',
    unit: 'tonnes collectées',
    valueBadge: { label: '46 % tracé', tone: 'success', variant: 'pill-outline' },
    progress: {
      label: 'Progression de la traçabilité',
      value: 46,
      context: 'Sur l’ensemble des étapes du processus',
      badge: { label: '46 %', tone: 'success', variant: 'pill-outline' },
    },
    signals: [
      { icon: 'users', label: '18 agents' },
      { icon: 'rows-3', label: '6 étapes' },
    ],
    freshness: 'Mise à jour il y a 40 min',
  },
}

/**
 * `1283:3552` — **the full banner**, and the one Figma publishes as a component
 * (`1219:3489`). Every section is on at once: the third identity line, the delta
 * under the figure, the phenology column with its own delta, and three climate
 * measures — the middle one past its threshold, which it says in its own colour.
 *
 * Figma's own description names the two axes: *Campagne* drives the status badge
 * and the wording of the figure's badge together ("Rendement prévu" while
 * running, "Rendement estimé" once closed), and *Comparaison* is the delta —
 * hausse, baisse, or aucune, the last showing only the date.
 */
export const FullBanner: Story = {
  args: {
    module: 'Yield',
    title: 'Périmètre de Podor',
    status: { label: 'Campagne en cours', tone: 'warning', variant: 'pill-color' },
    attribute: { label: 'Culture', badge: { label: 'Mil, contre saison froide' } },
    value: '4,82',
    unit: 't/ha',
    unitStyle: 'symbol',
    valueBadge: { label: 'Rendement prévu', icon: 'trending-up' },
    delta: { icon: 'trending-up', value: '12 %', comparison: 'comparé au 08 septembre 2025' },
    progress: {
      label: 'Progression de la campagne',
      value: 46,
      badge: { label: '46%' },
      delta: { icon: 'trending-up', value: '5 %', comparison: 'comparé au 08 septembre 2025' },
    },
    signals: [
      { icon: 'cloud-rain', label: '12,4 mm' },
      { icon: 'droplets', label: '18,2 %', tone: 'warning' },
      { icon: 'thermometer', label: '31 °C' },
    ],
    freshness: 'Prévision du 08 septembre 2025',
  },
}

/** Campagne closed: the status turns success and the figure's badge re-words. */
export const CampaignClosed: Story = {
  args: {
    ...FullBanner.args,
    status: { label: 'Campagne close', tone: 'success', variant: 'pill-color' },
    valueBadge: { label: 'Rendement estimé', icon: 'trending-up' },
  },
}

/** Comparaison = *baisse*: the delta turns and its glyph turns with it. */
export const DeltaDown: Story = {
  args: {
    ...FullBanner.args,
    delta: {
      icon: 'trending-down',
      value: '8 %',
      comparison: 'comparé au 08 septembre 2025',
      tone: 'error',
    },
  },
}

/** Comparaison = *aucune*: only the date, no glyph and no figure. */
export const DeltaNone: Story = {
  args: {
    ...FullBanner.args,
    delta: { comparison: 'Relevé du 08 septembre 2025' },
    progress: { ...FullBanner.args!.progress!, delta: { comparison: 'Relevé du 08 septembre 2025' } },
  },
}

/** The identity block alone — everything past the first rule is optional. */
export const IdentityOnly: Story = {
  args: {
    module: 'Scan',
    title: 'Périmètre de Podor',
    status: { label: 'Analyse terminée', tone: 'success', variant: 'pill-color' },
  },
}

/** The six capsules as they sit in the Figma frame, stacked. */
export const Gallery: Story = {
  render: () => ({
    components: { ModuleCapsule },
    setup: () => ({
      rows: [
        FullBanner.args,
        Default.args,
        WithProgress.args,
        UnitBelow.args,
        {
          module: 'Scan',
          title: 'Périmètre de Podor',
          status: { label: 'Analyse terminée', tone: 'success', variant: 'pill-color' },
          value: '2 480',
          unit: 'hectares cartographiés',
          unitPlacement: 'below',
          signals: [
            { icon: 'wheat', label: '4 cultures' },
            { icon: 'sprout', label: '92 % couverture' },
          ],
          freshness: 'Mise à jour il y a 3 j',
        },
        SingleSignal.args,
        {
          module: 'Carbone',
          title: 'Bassin arachidier — Kaffrine',
          value: '1 860',
          unit: 't CO₂e',
          valueBadge: { label: 'Vérifié', tone: 'success', variant: 'pill-outline' },
          signals: [
            { icon: 'land-plot', label: '540 parcelles' },
            { icon: 'globe', label: 'Scope 3' },
          ],
          freshness: 'Mise à jour il y a 1 j',
        },
      ],
    }),
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--ds-spacing-md); align-items: flex-start;">
        <ModuleCapsule v-for="(row, i) in rows" :key="i" v-bind="row" />
      </div>
    `,
  }),
}
