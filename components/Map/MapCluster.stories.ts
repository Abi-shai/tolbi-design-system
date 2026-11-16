import type { Meta, StoryObj } from '@storybook/vue3'
import { defineComponent, h, nextTick, onMounted, ref } from 'vue'
import MapCluster from './MapCluster.vue'
import { mapGlyphSvg } from './mapGlyph'
import { clusterArrive, clusterLeave, flyGlyphs } from './mapMotion'

const meta: Meta<typeof MapCluster> = {
  title: 'Données/Map/Cluster',
  component: MapCluster,
  tags: ['wip'],
  parameters: {
    docs: {
      description: {
        component:
          'Un regroupement de points sur une carte (ADR-0190) : le glyphe de la famille (`Données/Map/Glyph`) à la ' +
          'couleur moyenne du cluster, et le nombre dans un badge — la même encre pour les deux familles. Trois paliers ' +
          'selon le nombre (< 10 / < 30 / au-delà) : projet 44 / 56 / 68 px, contrôle 36 / 44 / 52. **C’est un bouton** — ' +
          '« N points du projet » ou « N points de contrôle », un clic zoome jusqu’à ce que le cluster s’ouvre (le moteur ' +
          'connaît le zoom), un focus visible, 1,08 au survol.\n\n' +
          'Le moteur le place (un `Marker` Mapbox : `render(h(MapCluster, …), el)`). **Éclatement** : le parent s’efface ' +
          'sur place (`clusterLeave`), ses enfants partent de lui (`flyGlyphs`, `clusterArrive`) ; **regroupement** : ' +
          'l’inverse. 300 ms (`process`, `easing-out`), rien sous mouvement réduit, et seuls les vols visibles à l’écran ' +
          'partent.',
      },
    },
  },
  args: { family: 'project', color: 'var(--ds-chart-sequential-3)', count: 12 },
}

export default meta
type Story = StoryObj<typeof meta>

const GROUND = 'display:flex; gap:32px; align-items:center; padding:32px 40px; border-radius:var(--ds-radius-surface); background:var(--ds-map-land)'

export const Default: Story = {
  render: (args) => ({
    components: { MapCluster },
    setup: () => ({ args, GROUND }),
    template: `<div :style="GROUND"><MapCluster v-bind="args" /></div>`,
  }),
}

/** Les trois paliers de chaque famille : le projet domine, les contrôles sont la référence. Le nombre a la même encre. */
export const Steps: Story = {
  name: 'Paliers',
  render: () => ({
    components: { MapCluster },
    setup: () => ({ GROUND }),
    template: `
      <div style="display:flex; flex-direction:column; gap:16px">
        <div :style="GROUND">
          <MapCluster family="project" color="var(--ds-chart-sequential-1)" :count="5" />
          <MapCluster family="project" color="var(--ds-chart-sequential-3)" :count="18" />
          <MapCluster family="project" color="var(--ds-chart-sequential-5)" :count="64" />
        </div>
        <div :style="GROUND">
          <MapCluster family="control" color="var(--ds-chart-sequential-2)" :count="3" />
          <MapCluster family="control" color="var(--ds-chart-sequential-4)" :count="24" />
          <MapCluster family="control" color="var(--ds-chart-sequential-5)" :count="120" />
          <MapCluster family="project" color="var(--ds-chart-sequential-3)" :count="12" muted />
        </div>
      </div>`,
  }),
}

/**
 * **Alertes** (ADR-0194) — un cluster de parcelles suivies (`monitored`) dit combien sont en alerte : une seconde
 * pastille en bas à gauche, à la teinte de la plus grave (bloque > à surveiller > à revoir), absente sans alerte. Son
 * chiffre est à l’encre : le blanc mesure sous 4,5:1 sur les trois teintes. Le nom le dit : « 18 parcelles, dont 3 en
 * alerte ».
 */
export const Alerts: Story = {
  name: 'Alertes',
  render: () => ({
    components: { MapCluster },
    setup: () => ({ GROUND }),
    template: `
      <div :style="GROUND">
        <MapCluster family="monitored" color="var(--ds-chart-sequential-3)" :count="18" :alerts="3" alert-severity="blocking" />
        <MapCluster family="monitored" color="var(--ds-chart-sequential-4)" :count="7" :alerts="2" alert-severity="watch" />
        <MapCluster family="monitored" color="var(--ds-chart-sequential-2)" :count="42" :alerts="12" alert-severity="review" />
        <MapCluster family="monitored" color="var(--ds-chart-sequential-4)" :count="9" />
      </div>`,
  }),
}

/** A single point, drawn as the engine would: its glyph. */
const Single = defineComponent({
  props: { color: { type: String, required: true }, x: Number, y: Number },
  setup(props) {
    const el = ref<HTMLElement | null>(null)
    onMounted(() => {
      if (el.value) el.value.innerHTML = mapGlyphSvg({ family: 'project', color: props.color, size: 40 }, el.value)
    })
    return () => h('span', { ref: el, 'data-single': '', style: { position: 'absolute', left: `${props.x}px`, top: `${props.y}px`, transform: 'translate(-50%, -50%)', lineHeight: 0 } })
  },
})

/**
 * Cliquer le cluster l’éclate : il s’efface sur place, ses points partent de lui vers leur place. « Regrouper » fait
 * l’inverse : les points rentrent dans le cluster qui revient. Les points réels sont cachés le temps du vol.
 */
export const Burst: Story = {
  name: 'Éclatement et regroupement',
  render: () => ({
    components: { MapCluster, Single },
    setup() {
      const map = ref<HTMLElement | null>(null)
      const cluster = ref<HTMLElement | null>(null)
      const open = ref(false)
      const flying = ref(false)
      const centre = { x: 260, y: 150 }
      const points = [
        { x: 120, y: 70, color: 'var(--ds-chart-sequential-2)' },
        { x: 400, y: 90, color: 'var(--ds-chart-sequential-3)' },
        { x: 170, y: 240, color: 'var(--ds-chart-sequential-4)' },
        { x: 360, y: 230, color: 'var(--ds-chart-sequential-5)' },
        { x: 260, y: 40, color: 'var(--ds-chart-sequential-3)' },
      ]
      const flights = (fade: 'in' | 'out') =>
        points.map((p) => ({
          glyph: { family: 'project' as const, color: p.color, size: 40 },
          from: fade === 'in' ? centre : { x: p.x, y: p.y },
          to: fade === 'in' ? { x: p.x, y: p.y } : centre,
          fade,
        }))
      async function burst() {
        if (flying.value || !map.value || !cluster.value) return
        flying.value = true
        await Promise.all([clusterLeave(cluster.value), flyGlyphs(map.value, flights('in'))])
        open.value = true
        flying.value = false
      }
      async function gather() {
        if (flying.value || !map.value) return
        flying.value = true
        open.value = false
        await nextTick()
        if (cluster.value) cluster.value.style.pointerEvents = ''
        await Promise.all([clusterArrive(cluster.value!), flyGlyphs(map.value, flights('out'))])
        flying.value = false
      }
      return { map, cluster, open, flying, centre, points, burst, gather }
    },
    template: `
      <div>
        <button type="button" :disabled="!open || flying" @click="gather" style="margin-bottom:12px" data-gather>Regrouper</button>
        <div ref="map" data-map style="position:relative; width:520px; height:300px; border-radius:var(--ds-radius-surface); overflow:hidden; background:var(--ds-map-land)">
          <template v-if="open">
            <Single v-for="(p, i) in points" :key="i" :color="p.color" :x="p.x" :y="p.y" />
          </template>
          <div v-if="!open" ref="cluster" :style="{ position:'absolute', left: centre.x + 'px', top: centre.y + 'px', transform:'translate(-50%, -50%)', zIndex: 2 }">
            <MapCluster family="project" color="var(--ds-chart-sequential-3)" :count="points.length" @click="burst" />
          </div>
        </div>
      </div>`,
  }),
}
