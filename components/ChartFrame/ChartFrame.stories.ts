import type { Meta, StoryObj } from '@storybook/vue3'
import ChartFrame from './ChartFrame.vue'
import { ChartLegend } from '../ChartLegend'
import { Card } from '../Card'
import { ChartTooltip } from '../ChartTooltip'
import { ref } from 'vue'

/* A flat SVG stand-in for whatever engine the product picks. */
const FAKE_PLOT = `
  <svg viewBox="0 0 300 100" preserveAspectRatio="none" style="width:100%; height:100%; display:block">
    <polyline
      points="0,80 40,62 80,68 120,40 160,46 200,24 240,30 300,12"
      fill="none"
      stroke="var(--ds-chart-categorical-1)"
      stroke-width="2"
      vector-effect="non-scaling-stroke"
    />
  </svg>
`

const meta: Meta<typeof ChartFrame> = {
  title: 'Données/ChartFrame',
  tags: ['stable'],
  component: ChartFrame,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Le cadre autour d\'un graphique : titre, légende, axes, grille, chargement et état vide. ' +
          '**Le design system ne fournit aucun moteur de rendu** — le tracé arrive par le slot par défaut, ' +
          'et le produit garde sa bibliothèque. Le SVG des exemples n\'est qu\'un bouchon.\n\n' +
          '**Pas `Sparkline`, et les deux ne s\'emboîtent pas.** `ChartFrame` sert quand on *lit des valeurs* sur le ' +
          'graphique — axes, légende, infobulle du moteur. `Sparkline` sert quand le chiffre est déjà dit à côté et que ' +
          'la ligne dit seulement *dans quel sens il est allé* : ni axe, ni titre, ni interaction. Une sparkline dans un ' +
          'cadre gagnerait des axes et cesserait d\'en être une ; un cadre qui dessinerait sa courbe serait un moteur. ' +
          'La famille : `ChartLegend` et `ChartTooltip` vont avec `ChartFrame` ; `Sparkline` se pose seule, à côté ' +
          'd\'un chiffre ; `MapLegend` et `MapTooltip` sont ceux d\'une carte.',
      },
    },
  },
  argTypes: {
    title:  { control: 'text', table: { category: 'Contenu', type: { summary: 'string' } } },
    height: { control: 'text', description: 'Hauteur de la zone de tracé. Le cadre ne la devine jamais du contenu.', table: { category: 'Apparence', type: { summary: 'number | string' }, defaultValue: { summary: '240' } } },
    yTicks: { control: 'object', description: 'Graduations de gauche, de haut en bas.', table: { category: 'Contenu', type: { summary: 'string[]' } } },
    xTicks: { control: 'object', description: 'Libellés du bas, de gauche à droite.', table: { category: 'Contenu', type: { summary: 'string[]' } } },
    grid:    { control: 'boolean', table: { category: 'Apparence', type: { summary: 'boolean' }, defaultValue: { summary: 'true' } } },
    loading: { control: 'boolean', table: { category: 'État', type: { summary: 'boolean' }, defaultValue: { summary: 'false' } } },
    empty:   { control: 'boolean', table: { category: 'État', type: { summary: 'boolean' }, defaultValue: { summary: 'false' } } },
    emptyTitle:       { control: 'text', table: { category: 'État', type: { summary: 'string' } } },
    emptyDescription: { control: 'text', table: { category: 'État', type: { summary: 'string' } } },
  },
  args: {
    title: 'Rendement observé',
    height: 240,
    yTicks: ['6', '5', '4', '3', '2'],
    xTicks: ['Mai', 'Juin', 'Juil.', 'Août'],
    grid: true,
    loading: false,
    empty: false,
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: args => ({
    components: { ChartFrame },
    setup: () => ({ args, FAKE_PLOT }),
    template: `<div style="max-width:40rem"><ChartFrame v-bind="args"><div v-html="FAKE_PLOT" style="height:100%" /></ChartFrame></div>`,
  }),
}

export const WithLegend: Story = {
  name: 'Avec légende',
  render: args => ({
    components: { ChartFrame, ChartLegend },
    setup: () => ({
      args,
      FAKE_PLOT,
      series: [
        { key: 'observed', label: 'Observé', color: 'var(--ds-chart-categorical-1)' },
        { key: 'modelled', label: 'Modélisé', color: 'var(--ds-chart-categorical-2)' },
      ],
    }),
    template: `
      <div style="max-width:40rem">
        <ChartFrame v-bind="args">
          <template #legend><ChartLegend :items="series" shape="line" /></template>
          <div v-html="FAKE_PLOT" style="height:100%" />
        </ChartFrame>
      </div>
    `,
  }),
}

/**
 * ADR-0096 — un titre et sa phrase (`description`), et une **ligne de seuil** : la série est au produit, la
 * couleur du trait est `--ds-chart-threshold`, et la légende la nomme d’un trait pointillé.
 */
export const DescriptionAndThreshold: Story = {
  name: 'Description et seuil',
  render: () => ({
    components: { ChartFrame, ChartLegend },
    setup: () => ({
      bars: [96, 97, 94, 99, 98, 99, 97, 98, 99, 98, 98],
      legend: [
        { key: 'ok', label: 'Au-dessus du seuil', color: 'var(--ds-chart-categorical-5)' },
        { key: 'low', label: 'En dessous · 2018, 94 %', color: 'var(--ds-chart-categorical-2)' },
        { key: 'threshold', label: 'Seuil 95 %', shape: 'dashed', color: 'var(--ds-chart-threshold)' },
      ],
    }),
    template: `
      <div style="max-width:40rem">
        <ChartFrame title="Images valides par année" description="Seuil : 95 % des points du projet" :height="180" :x-ticks="['2016', '2021', '2026']">
          <svg viewBox="0 0 330 100" preserveAspectRatio="none" style="width:100%;height:100%;display:block">
            <rect v-for="(b, i) in bars" :key="i" :x="i * 30 + 3" :y="100 - (b - 90) * 10" width="24" :height="(b - 90) * 10"
              :fill="b < 95 ? 'var(--ds-chart-categorical-2)' : 'var(--ds-chart-categorical-5)'" />
            <line x1="0" x2="330" y1="50" y2="50" stroke="var(--ds-chart-threshold)" stroke-width="1.5" stroke-dasharray="4 3" vector-effect="non-scaling-stroke" />
          </svg>
          <template #legend><ChartLegend :items="legend" /></template>
        </ChartFrame>
      </div>
    `,
  }),
}

export const Loading: Story = {
  name: 'Chargement',
  args: { loading: true },
  render: args => ({
    components: { ChartFrame },
    setup: () => ({ args }),
    template: `<div style="max-width:40rem"><ChartFrame v-bind="args" /></div>`,
  }),
}

export const Empty: Story = {
  name: 'État vide',
  args: {
    empty: true,
    emptyDescription: 'Élargissez la plage de dates ou vérifiez la synchronisation des relevés.',
  },
  render: args => ({
    components: { ChartFrame },
    setup: () => ({ args }),
    template: `<div style="max-width:40rem"><ChartFrame v-bind="args" /></div>`,
  }),
}

export const InCard: Story = {
  name: 'Dans une carte',
  render: args => ({
    components: { ChartFrame, Card },
    setup: () => ({ args, FAKE_PLOT }),
    template: `
      <Card style="max-width:40rem">
        <ChartFrame v-bind="args"><div v-html="FAKE_PLOT" style="height:100%" /></ChartFrame>
      </Card>
    `,
  }),
}

/* ── Hover (ADR-0180) ─────────────────────────────────────────────── */
const YEARS = ['2021', '2022', '2023', '2024', '2025', '2026']
const CARBON = [33.1, 34.0, 35.2, 36.8, 37.9, 38.5]
const GREEN = 'var(--ds-chart-sequential-4)'
const pct = (a: number, b: number) => `${b >= a ? '+' : ''}${(((b - a) / a) * 100).toFixed(1).replace('.', ',')} %`

/**
 * ADR-0180 — **le survol, avec le motion du paquet**. Une cible par colonne sur toute la hauteur (une petite barre se
 * survole aussi bien qu’une grande), ← → au clavier (le graphique atteint au clavier montre sa dernière colonne),
 * Échap. Les barres autres que la survolée passent à 0,35 sur `quick` — le produit les marque `data-chart-column`.
 * La bulle (le `ChartTooltip` du produit, slot `#tooltip`) arrive comme ce qui flotte, **glisse** d’une colonne à
 * l’autre (`moderate`), change de contenu par `SwapTransition`, passe de l’autre côté par le même glissement quand la
 * place manque, et ne sort jamais du graphique. La couleur est celle de la donnée : `--ds-chart-sequential-4`.
 */
export const HoverBars: Story = {
  name: 'Survol — barres par année',
  render: () => ({
    components: { ChartFrame, ChartLegend, ChartTooltip },
    setup: () => ({ hover: ref<number | null>(null), YEARS, CARBON, GREEN, pct }),
    template: `
      <div style="max-width:28rem">
        <ChartFrame v-model:hover="hover" title="Carbone par année" :y-ticks="['45 tCO2e/ha', '23 tCO2e/ha', '0 tCO2e/ha']" :x-ticks="['2021', '2023', '2026']" :height="180" :columns="6">
          <template #legend><ChartLegend :items="[{ key: 'c', label: 'Carbone', color: GREEN }]" /></template>
          <svg viewBox="0 0 600 100" preserveAspectRatio="none" style="width:100%; height:100%; display:block">
            <rect v-for="(v, i) in CARBON" :key="i" :data-chart-column="i" :x="i * 100 + 18" :width="64" :y="100 - v / 45 * 100" :height="v / 45 * 100" :fill="GREEN" :fill-opacity="i === CARBON.length - 1 ? 1 : 0.45" />
          </svg>
          <template #tooltip="{ index }">
            <ChartTooltip :title="YEARS[index]" :value="String(Math.round(CARBON[index]))" unit="tCO2e/ha"
              :series="index ? [{ label: 'Depuis 2021', value: pct(CARBON[0], CARBON[index]), color: GREEN }] : []" />
          </template>
        </ChartFrame>
        <p style="font:var(--ds-font-body-sm); color:var(--ds-text-subtle)">Survolé : {{ hover === null ? '—' : YEARS[hover] }}</p>
      </div>`,
  }),
}

/**
 * ADR-0184 — **dans une fiche étroite** (Carbone) : la bulle ne tient d’aucun côté du tracé seul. Elle prend la place
 * du cadre entier, axe des valeurs compris, et reste à côté de la colonne au lieu de la recouvrir.
 */
export const HoverNarrow: Story = {
  name: 'Survol — dans une fiche étroite',
  render: () => ({
    components: { ChartFrame, ChartTooltip },
    setup: () => ({ hover: ref<number | null>(null), YEARS, CARBON, GREEN, pct }),
    template: `
      <div style="width:22rem">
        <ChartFrame v-model:hover="hover" title="Carbone par année" :y-ticks="['45 tCO2e/ha', '23 tCO2e/ha', '0 tCO2e/ha']" :x-ticks="['2021', '2023', '2026']" :height="150" :columns="6">
          <svg viewBox="0 0 600 100" preserveAspectRatio="none" style="width:100%; height:100%; display:block">
            <rect v-for="(v, i) in CARBON" :key="i" :data-chart-column="i" :x="i * 100 + 18" :width="64" :y="100 - v / 45 * 100" :height="v / 45 * 100" :fill="GREEN" fill-opacity="0.45" />
          </svg>
          <template #tooltip="{ index }">
            <ChartTooltip :title="YEARS[index]" :value="String(Math.round(CARBON[index]))" unit="tCO2e/ha"
              :series="index ? [{ label: 'Depuis 2021', value: pct(CARBON[0], CARBON[index]), color: GREEN }] : []" />
          </template>
        </ChartFrame>
      </div>`,
  }),
}

const STOCK = [10610, 11050, 11480, 12087, 12844, 12320]
const BASE = 10938

/** Une courbe face à une référence : un point plein sur la série, un anneau sur la référence (`dashed`), le repère vertical. */
export const HoverLine: Story = {
  name: 'Survol — courbe et point de départ',
  render: () => ({
    components: { ChartFrame, ChartLegend, ChartTooltip },
    setup() {
      const pts = STOCK.map((v, i) => `${(i / 5) * 600},${100 - ((v - 10400) / 2600) * 100}`).join(' ')
      const by = 100 - ((BASE - 10400) / 2600) * 100
      return { hover: ref<number | null>(null), YEARS, STOCK, BASE, GREEN, pts, by, pct,
        markers: [{ values: STOCK, color: GREEN }, { values: STOCK.map(() => BASE), color: 'var(--ds-chart-threshold)', dashed: true }] }
    },
    template: `
      <div style="max-width:28rem">
        <ChartFrame v-model:hover="hover" title="Stock de carbone" :y-ticks="['12 844', '11 727', '10 610']" :x-ticks="['2021', '2023', '2026']" :height="180"
          :columns="6" x-scale="point" :y-domain="[10400, 13000]" :markers="markers">
          <template #legend><ChartLegend :items="[{ key: 's', label: 'Stock de carbone', color: GREEN }, { key: 'b', label: 'Point de départ', color: 'var(--ds-chart-threshold)', shape: 'dashed' }]" /></template>
          <svg viewBox="0 0 600 100" preserveAspectRatio="none" style="width:100%; height:100%; display:block">
            <line x1="0" x2="600" :y1="by" :y2="by" stroke="var(--ds-chart-threshold)" stroke-width="1.5" stroke-dasharray="4 4" vector-effect="non-scaling-stroke" />
            <polyline :points="pts" fill="none" :stroke="GREEN" stroke-width="2" vector-effect="non-scaling-stroke" />
          </svg>
          <template #tooltip="{ index }">
            <ChartTooltip :title="YEARS[index]" :value="STOCK[index].toLocaleString('fr-FR')"
              :series="[{ label: 'Point de départ', value: BASE.toLocaleString('fr-FR'), color: 'var(--ds-chart-threshold)' }, { label: 'Écart', value: pct(BASE, STOCK[index]), color: GREEN }]" />
          </template>
        </ChartFrame>
      </div>`,
  }),
}

const PROJECT = [0.32, 0.33, 0.35, 0.38, 0.41, 0.44, 0.47]
const CONTROL = [0.31, 0.31, 0.32, 0.32, 0.33, 0.33, 0.34]
const YEARS7 = ['2020', '2021', '2022', '2023', '2024', '2025', '2026']

/** Deux courbes, projet et contrôles : deux points pleins, chacun à la couleur de sa série. */
export const HoverTwoLines: Story = {
  name: 'Survol — projet et contrôles',
  render: () => ({
    components: { ChartFrame, ChartLegend, ChartTooltip },
    setup() {
      const line = (vs: number[]) => vs.map((v, i) => `${(i / 6) * 600},${100 - ((v - 0.25) / 0.25) * 100}`).join(' ')
      const P = GREEN, C = 'var(--ds-chart-categorical-2)'
      return { hover: ref<number | null>(null), YEARS7, PROJECT, CONTROL, P, C, lp: line(PROJECT), lc: line(CONTROL),
        markers: [{ values: PROJECT, color: P }, { values: CONTROL, color: C }] }
    },
    template: `
      <div style="max-width:28rem">
        <ChartFrame v-model:hover="hover" title="Indice de stock" :y-ticks="['0,50', '0,25']" :x-ticks="['2020', '2023', '2026']" :height="180"
          :columns="7" x-scale="point" :y-domain="[0.25, 0.5]" :markers="markers">
          <template #legend><ChartLegend :items="[{ key: 'p', label: 'Projet', color: P }, { key: 'c', label: 'Contrôles', color: C }]" /></template>
          <svg viewBox="0 0 600 100" preserveAspectRatio="none" style="width:100%; height:100%; display:block">
            <polyline :points="lc" fill="none" :stroke="C" stroke-width="2" vector-effect="non-scaling-stroke" />
            <polyline :points="lp" fill="none" :stroke="P" stroke-width="2" vector-effect="non-scaling-stroke" />
          </svg>
          <template #tooltip="{ index }">
            <ChartTooltip :title="YEARS7[index]" :series="[{ label: 'Projet', value: PROJECT[index].toFixed(2).replace('.', ','), color: P }, { label: 'Contrôles', value: CONTROL[index].toFixed(2).replace('.', ','), color: C }]" />
          </template>
        </ChartFrame>
      </div>`,
  }),
}
