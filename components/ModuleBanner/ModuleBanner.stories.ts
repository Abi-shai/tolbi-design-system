import type { Meta, StoryObj } from '@storybook/vue3'
import { ModuleBanner } from '.'
import { ref } from 'vue'
import { ModuleCapsule } from '../ModuleCapsule'
import { RevealTransition } from '../RevealTransition'
import { Button } from '../Button'

/**
 * Figma *Sprint 18* `1308:5261` — the band that carries the capsules.
 *
 * The band is the half of the design that is pure colour: it is
 * `bg-neutral-subtle`, every capsule inside it is `bg-default`, and that pair is
 * what gives a capsule an edge. Sampled off the Figma render, the band is
 * `#26312B` (`gray-forest/800`) and the capsules `#18201C` (`gray-forest/900`) —
 * so in dark the capsules are **recessed** into a raised tray, and in light the
 * same two tokens read as white cards in a grey one.
 *
 * Switch the **Mode** toolbar to see both.
 *
 * **If nothing moves here**, check *System Settings → Accessibility → Display →
 * Reduce motion*. The whole catalogue honours it: `motion.css` collapses every
 * transition and `useMarquee` sets its speed to nought, so the band lands at its
 * full height on the first frame and the row sits still. That is correct, and it
 * looks exactly like a bug. The row stays scrollable by hand in that case —
 * asking for less motion must not cost you the capsules past the fold.
 */
const meta: Meta<typeof ModuleBanner> = {
  title: 'Données/ModuleBanner',
  component: ModuleBanner,
  tags: ['autodocs', 'stable'],
  // Drawn in dark (ADR-0029/0031), so it opens in dark. Both modes work —
  // flip the Mode toolbar — but light is not the design this came from.
  globals: { theme: 'dark' },
}

export default meta
type Story = StoryObj<typeof meta>

const YIELD = {
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
}

/** The seven capsules of the Figma frame, in its order. */
const ROW = [
  YIELD,
  {
    module: 'Source',
    title: 'Collecte cacao — 1er kilomètre',
    status: { label: 'Collecte en cours', tone: 'warning', variant: 'pill-color' },
    value: '12,4',
    unit: 'tonnes collectées',
    valueBadge: { label: '46 % tracé', tone: 'success', variant: 'pill-outline' },
    signals: [
      { icon: 'users', label: '18 agents' },
      { icon: 'rows-3', label: '6 étapes' },
    ],
    freshness: 'Mise à jour il y a 40 min',
  },
  {
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
  {
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
  {
    module: 'Survey',
    moduleLabel: 'INA',
    title: 'Coopérative de Kaolack',
    value: '1 024',
    unit: 'identités',
    valueBadge: { label: '981 vérifiées', tone: 'success', variant: 'pill-outline' },
    signals: [{ icon: 'id-card', label: '981 vérifiées' }],
    freshness: 'Mise à jour il y a 6 h',
  },
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
]

const render = (rows: unknown[], motion = 'scroll') => () => ({
  components: { ModuleBanner, ModuleCapsule },
  setup: () => ({ rows, motion }),
  template: `
    <ModuleBanner :motion="motion" label="Vos modules">
      <ModuleCapsule v-for="(row, i) in rows" :key="i" v-bind="row" />
    </ModuleBanner>
  `,
})

/** The whole frame — 6138px of capsules, which is why the band scrolls. */
export const Default: Story = { render: render(ROW) }

/** One capsule in the band: the pair of surfaces with nothing else going on. */
export const Single: Story = { render: render([YIELD]) }

/** Three, the width a real dashboard is more likely to give it. */
export const Three: Story = { render: render(ROW.slice(0, 3)) }

/**
 * The product's dashboard behaviour, extracted (ADR-0032): the band scrolls
 * itself at 60 px/s, ramps over `considered` rather than stopping dead, pauses
 * under the pointer and can be dragged. The run is rendered twice — the loop
 * wraps by subtracting half the track, so the halves must match.
 *
 * Speed is per second, not per frame: the first version in the product added
 * 2px per `requestAnimationFrame`, which ran a 120Hz screen at double speed.
 */
export const Marquee: Story = { render: render(ROW, 'marquee') }

/**
 * The entrance, with `RevealTransition` — the band opens its own height once
 * the data lands, and the content follows a step later. Toggle it.
 */
export const Reveal: Story = {
  render: () => ({
    components: { ModuleBanner, ModuleCapsule, RevealTransition, Button },
    setup() {
      const shown = ref(false)
      return { shown, rows: ROW.slice(0, 3) }
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--ds-spacing-xl); align-items: flex-start;">
        <Button size="sm" @click="shown = !shown">{{ shown ? 'Replier' : 'Faire arriver les données' }}</Button>
        <RevealTransition :show="shown" style="width: 100%;">
          <ModuleBanner motion="marquee" label="Vos modules">
            <ModuleCapsule v-for="(row, i) in rows" :key="i" v-bind="row" />
          </ModuleBanner>
        </RevealTransition>
      </div>
    `,
  }),
}
