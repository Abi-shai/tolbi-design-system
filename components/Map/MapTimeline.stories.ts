import type { Meta, StoryObj } from '@storybook/vue3'
import { computed, ref } from 'vue'
import MapTimeline from './MapTimeline.vue'
import type { MapTimelinePeriod } from './MapTimeline.vue'

const meta: Meta<typeof MapTimeline> = {
  title: 'Données/Map/Timeline',
  component: MapTimeline,
  tags: ['wip'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'La **frise du temps** d’une carte (ADR-0100, Figma « Frise du temps ») : quelle période la carte montre — ' +
          'une année, un mois, un jour — ou deux comparées. Monitoring et Dynamic baseline.\n\n' +
          '**Son propre dessin** : elle flotte sur l’imagerie, c’est donc une pilule surélevée, ses commandes sont ' +
          'des glyphes et des mots nus, et la période choisie est **la pilule pleine de la marque**. Une liste ' +
          'déroulante encadrée et un rail segmenté (les contrôles de formulaire du catalogue) liraient comme un ' +
          'formulaire posé sur la carte.\n\n' +
          'De gauche à droite : la **puce d’échelle** (`scales` + `v-model:scale` — le produit répond par d’autres ' +
          '`periods`), ‹ **les périodes** ›, et au bout **« Comparer »** (`compare`) : pressé, la période choisie ' +
          'ensuite est celle comparée (`v-model:comparison`), les deux portent la pilule, et le bout de la barre ' +
          'dit « 2020 → 2026 » avec sa ✕.\n\n' +
          'Une période peut porter `data` (un point de marque dessous : une mesure existe), `disabled` (pas encore), ' +
          '`minor` (un jour entre les semaines, dessiné comme un point). Un seul arrêt de tabulation : ←/→, Début, Fin ' +
          'déplacent le choix ; la pilule glisse.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof MapTimeline>

const SCALES = [
  { value: 'year', label: 'Année' },
  { value: 'month', label: 'Mois' },
  { value: 'day', label: 'Jour' },
]
const YEARS: MapTimelinePeriod[] = Array.from({ length: 10 }, (_, i) => String(2017 + i)).map((y) => ({ value: y, label: y }))
const MONTHS: MapTimelinePeriod[] = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
  .map((m, i) => ({ value: `2026-${i + 1}`, label: m, data: i < 10, disabled: i >= 10 }))
const MEASURED = new Set([1, 3, 4, 7, 9, 10, 11, 13, 16, 17, 19, 20, 23, 24])
const DAYS: MapTimelinePeriod[] = Array.from({ length: 31 }, (_, i) => i + 1).map((d) => ({
  value: `2026-03-${d}`,
  label: String(d),
  data: MEASURED.has(d),
  minor: ![1, 7, 21, 28, 31].includes(d),
}))

const ground = (inner: string) =>
  `<div style="background:var(--ds-bg-neutral);padding:32px;border-radius:12px">${inner}</div>`

export const Years: Story = {
  name: 'Année',
  render: () => ({
    components: { MapTimeline },
    setup: () => ({ value: ref('2026'), scale: ref('year'), SCALES, YEARS }),
    template: ground(`<MapTimeline v-model="value" v-model:scale="scale" :scales="SCALES" :periods="YEARS" label="Année" compare />`),
  }),
}

/**
 * **Peu de périodes, une seule échelle** (ADR-0114) — la page projet dMRV : cinq à sept années, pas de mois mesurés.
 * Une échelle unique est **dite, pas offerte** : le mot « Année » à la place de la puce, sans chevron, ce qui remplit
 * le début de la barre. Les points « mesure disponible » pendent **sous** leur année, hors du flux : chaque année
 * garde la ligne de base de la pastille choisie.
 */
export const FewYears: Story = {
  name: 'Peu d’années, une échelle',
  render: () => ({
    components: { MapTimeline },
    setup: () => ({
      value: ref('2024'),
      SCALE: [{ value: 'year', label: 'Année' }],
      PERIODS: ['2020', '2021', '2022', '2023', '2024'].map((y, i) => ({ value: y, label: y, data: i !== 1 })),
    }),
    template: ground(`<MapTimeline v-model="value" :scales="SCALE" :periods="PERIODS" label="Année" />`),
  }),
}

/**
 * **Une taille, la grande** (ADR-0115) : la frise est l’instrument de l’écran. Périodes en 14 px, chacune une cible de
 * 32 px (la choisie aussi), ‹ › de 32 px, point de mesure de 6 px, « Comparer » sur 32 px, barre de 48 px et 35rem —
 * jusqu’à 40rem quand elle épouse son contenu : cinq puis sept années, entières.
 */
export const Lengths: Story = {
  name: 'Cinq et sept années',
  render: () => ({
    components: { MapTimeline },
    setup: () => ({
      five: ref('2024'), seven: ref('2024'),
      SCALE: [{ value: 'year', label: 'Année' }],
      FIVE: ['2020', '2021', '2022', '2023', '2024'].map((y, i) => ({ value: y, label: y, data: i !== 1 })),
      SEVEN: ['2018', '2019', '2020', '2021', '2022', '2023', '2024'].map((y) => ({ value: y, label: y, data: true })),
    }),
    template: ground(`<div style="display:flex; flex-direction:column; align-items:center; gap:24px;">
      <MapTimeline v-model="five" :scales="SCALE" :periods="FIVE" label="Année" compare />
      <MapTimeline v-model="seven" :scales="SCALE" :periods="SEVEN" label="Année" compare />
    </div>`),
  }),
}

/**
 * **Une à trois années** (ADR-0118) — un projet mesuré une seule année, la frise allant jusqu’à l’année en cours.
 * Les périodes restent **groupées et centrées** : jamais plus de 24px entre deux. Avec **une seule période
 * choisissable**, la frise n’est plus un instrument mais une mention — « 2024 » : ‹ › et « Comparer » quittent la
 * barre, qui épouse ce qui reste. Les années à venir sont `disabled` (à ne passer que si elles ont un sens).
 */
export const OneToThree: Story = {
  name: 'Une à trois années',
  render: () => ({
    components: { MapTimeline },
    setup: () => ({
      a: ref('2024'), b: ref('2024'), c: ref('2025'), d: ref('2024'),
      SCALE: [{ value: 'year', label: 'Année' }],
      ONE: [{ value: '2024', label: '2024', data: true }],
      ONE_AHEAD: [
        { value: '2024', label: '2024', data: true },
        { value: '2025', label: '2025', disabled: true },
        { value: '2026', label: '2026', disabled: true },
      ],
      TWO: [{ value: '2024', label: '2024', data: true }, { value: '2025', label: '2025', data: true }],
      THREE: ['2022', '2023', '2024'].map((y) => ({ value: y, label: y, data: true })),
    }),
    template: ground(`<div style="display:flex; flex-direction:column; align-items:center; gap:24px;">
      <MapTimeline v-model="a" :periods="ONE" label="Année" compare />
      <MapTimeline v-model="a" :scales="SCALE" :periods="ONE" label="Année" compare />
      <MapTimeline v-model="b" :scales="SCALE" :periods="ONE_AHEAD" label="Année" compare />
      <MapTimeline v-model="c" :scales="SCALE" :periods="TWO" label="Année" compare />
      <MapTimeline v-model="d" :scales="SCALE" :periods="THREE" label="Année" compare />
    </div>`),
  }),
}

/**
 * **Échelles indisponibles** (ADR-0119) — un projet mesuré à l’année seulement. La puce « Année ⌄ » garde son menu :
 * c’est ce qui dit qu’il existe d’autres échelles. « Mois » et « Jour » y sont **grisés, avec leur raison** sous le
 * nom ; au clavier ils restent atteignables, s’annoncent indisponibles avec leur raison, et ne font rien.
 * Le mot seul, sans menu (ADR-0114), reste le cas où le produit ne passe qu’une échelle.
 */
export const UnavailableScales: Story = {
  name: 'Échelles indisponibles',
  parameters: { docs: { story: { height: '360px' } } },
  render: () => ({
    components: { MapTimeline },
    setup: () => ({
      value: ref('2024'), scale: ref('year'),
      SCALES: [
        { value: 'year', label: 'Année' },
        { value: 'month', label: 'Mois', disabled: true, disabledReason: 'Pas de mesure mensuelle pour ce projet' },
        { value: 'day', label: 'Jour', disabled: true, disabledReason: 'Pas de mesure journalière pour ce projet' },
      ],
      YEARS: ['2022', '2023', '2024'].map((y) => ({ value: y, label: y, data: true })),
    }),
    template: `<div style="background:var(--ds-bg-neutral);padding:32px 32px 220px;border-radius:12px">
      <MapTimeline v-model="value" v-model:scale="scale" :scales="SCALES" :periods="YEARS" label="Année" compare />
    </div>`,
  }),
}

export const Months: Story = {
  name: 'Mois — mesures et mois à venir',
  render: () => ({
    components: { MapTimeline },
    setup: () => ({ value: ref('2026-3'), scale: ref('month'), SCALES, MONTHS }),
    template: ground(`<MapTimeline v-model="value" v-model:scale="scale" :scales="SCALES" :periods="MONTHS" label="Mois" compare />`),
  }),
}

export const Days: Story = {
  name: 'Jour — les jours entre les semaines en points',
  render: () => ({
    components: { MapTimeline },
    setup: () => ({ value: ref('2026-03-14'), scale: ref('day'), SCALES, DAYS }),
    template: ground(`<MapTimeline v-model="value" v-model:scale="scale" :scales="SCALES" :periods="DAYS" label="Jour" compare />`),
  }),
}

export const Compare: Story = {
  name: 'Comparer deux années',
  render: () => ({
    components: { MapTimeline },
    setup: () => ({ value: ref('2026'), comparison: ref<string | null>('2020'), scale: ref('year'), SCALES, YEARS }),
    template: ground(`<MapTimeline v-model="value" v-model:scale="scale" v-model:comparison="comparison" :scales="SCALES" :periods="YEARS" label="Année" compare />`),
  }),
}

/** Les trois échelles dans une seule frise : le produit change `periods` quand l’échelle change. */
export const Playground: Story = {
  name: 'Changer d’échelle',
  render: () => ({
    components: { MapTimeline },
    setup() {
      const scale = ref('year')
      const periods = computed(() => (scale.value === 'year' ? YEARS : scale.value === 'month' ? MONTHS : DAYS))
      const value = ref('2026')
      const comparison = ref<string | null>(null)
      const rescale = (s: string) => {
        scale.value = s
        comparison.value = null
        const enabled = periods.value.filter((p) => !p.disabled)
        value.value = enabled[enabled.length - 1].value
      }
      return { scale, periods, value, comparison, rescale, SCALES }
    },
    template: ground(`
      <MapTimeline v-model="value" v-model:comparison="comparison" :scale="scale" :scales="SCALES" :periods="periods" compare @update:scale="rescale" />
      <p style="font:var(--ds-font-body-sm);color:var(--ds-text-subtle);margin:12px 0 0">Choisi : {{ value }}{{ comparison ? ' · comparé à ' + comparison : '' }}</p>
    `),
  }),
}
