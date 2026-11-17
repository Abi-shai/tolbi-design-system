import type { Meta, StoryObj } from '@storybook/vue3'
import { ModuleBanner } from '.'
import { ref } from 'vue'
import { ModuleCapsule } from '../ModuleCapsule'
import { RevealTransition } from '../RevealTransition'
import { Button } from '../Button'

/**
 * The home page's dark band — **the band of 14 September, compact** (ADR-0202, variant N2): dark on any page and
 * neutral (`gray-light`, never the app's green-grey), the capsules hollowed into it (900 in 800), about 56px each.
 *
 * **If nothing moves here**, check *System Settings → Accessibility → Display → Reduce motion*. The whole catalogue
 * honours it: `motion.css` collapses every transition and `useMarquee` sets its speed to nought, so the band lands at
 * its full height on the first frame and the row sits still. The row stays scrollable by hand in that case — asking for
 * less motion must not cost you the capsules past the fold.
 */
const meta: Meta<typeof ModuleBanner> = {
  title: 'Données/ModuleBanner',
  component: ModuleBanner,
  tags: ['stable'],
}

export default meta
type Story = StoryObj<typeof meta>

/* The product's capsules, as it passes them today (`section-project-metric.vue`) — no prop changed. */
const ID = {
  module: 'ID',
  moduleLabel: 'TOLBI ID',
  title: 'Cacao Démo SA',
  value: '1 284',
  unit: 'producteurs',
  signals: [
    { icon: 'land-plot', label: '2 316 parcelles' },
    { icon: 'ruler', label: '4 120 ha' },
  ],
  freshness: 'Mis à jour hier',
}

const SCAN = {
  module: 'Scan',
  moduleLabel: 'TOLBI Scan',
  title: 'Kaolack — campagne 2026',
  status: { label: 'Terminé', tone: 'success', variant: 'pill-outline' },
  value: '3 812,40',
  unit: 'ha cartographiés',
  signals: [
    { icon: 'sprout', label: 'Arachide 58 %' },
    { icon: 'wheat', label: 'Mil 27 %' },
  ],
  freshness: '2026',
}

const DATA = {
  module: 'Data',
  moduleLabel: 'TOLBI Data',
  title: 'Recensement ménages — Kaolack',
  status: { label: 'Collecte en cours', tone: 'warning', variant: 'pill-outline' },
  value: '342',
  unit: 'enregistrements',
  valueBadge: { label: '298 validées', tone: 'success' },
  signals: [
    { icon: 'circle-check', label: '298 validés' },
    { icon: 'clock', label: '44 en attente' },
  ],
  freshness: 'Mis à jour hier',
}

const SOURCE = {
  module: 'Source',
  moduleLabel: 'TOLBI Source',
  title: 'Collecte cacao — 1er kilomètre',
  status: { label: 'En cours', tone: 'warning', variant: 'pill-outline' },
  value: '12,4',
  unit: 'tonnes collectées',
  progress: { label: 'Traçabilité', value: 46, context: 'Toutes étapes', badge: { label: '46%', tone: 'success' } },
  signals: [
    { icon: 'users', label: '18 agents' },
    { icon: 'rows-3', label: '6 étapes' },
  ],
  freshness: 'Dernière saisie il y a 40 min',
}

const SCAN_2 = { ...SCAN, title: 'Kaffrine — campagne 2026', value: '2 140,15', signals: [{ icon: 'wheat', label: 'Mil 64 %' }, { icon: 'sprout', label: 'Arachide 21 %' }] }

const ROW = [ID, SCAN, DATA, SOURCE, SCAN_2]

const render = (rows: unknown[], motion = 'scroll') => () => ({
  components: { ModuleBanner, ModuleCapsule },
  setup: () => ({ rows, motion }),
  template: `
    <ModuleBanner :motion="motion" label="Vos modules">
      <ModuleCapsule v-for="(row, i) in rows" :key="i" v-bind="row" />
    </ModuleBanner>
  `,
})

/** The home page's row, as the product fills it: ID, Scan, Data, Source, Scan. */
export const Default: Story = { render: render(ROW) }

/** One capsule in the band: the capsule hollowed into it. */
export const Single: Story = { render: render([SCAN]) }

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
 * Bord à bord (ADR-0211) : `bleed` retire les coins. Sur l’accueil la bande prend toute la fenêtre — sous la colonne
 * de navigation à gauche, hors du bord à droite — et ce débordement dit qu’elle défile. Aucun fondu aux bords.
 */
export const Bleed: Story = {
  name: 'Bord à bord',
  parameters: { layout: 'fullscreen' },
  render: () => ({
    components: { ModuleBanner, ModuleCapsule },
    setup: () => ({ rows: ROW }),
    template: `
      <div style="display:flex; min-height: 200px; background: var(--ds-bg-default)">
        <div style="position:relative; z-index:1; width: 68px; flex:none; background: var(--ds-bg-neutral)"></div>
        <div style="flex:1; min-width:0; margin-left:-68px; padding-top: var(--ds-spacing-xl)">
          <ModuleBanner motion="marquee" bleed label="Vos modules">
            <ModuleCapsule v-for="(row, i) in rows" :key="i" v-bind="row" />
          </ModuleBanner>
        </div>
      </div>
    `,
  }),
}

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
