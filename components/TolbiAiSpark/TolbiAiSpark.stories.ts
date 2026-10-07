import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import TolbiAiSpark from './TolbiAiSpark.vue'
import { ARTWORK_SIZES } from '../artwork-size'

const meta: Meta<typeof TolbiAiSpark> = {
  title: 'Identité & média/TolbiAiSpark',
  component: TolbiAiSpark,
  tags: ['autodocs', 'wip', 'primitive'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Le signe de Tolbi AI : l\'étincelle « Feuilles », quatre feuilles pointues aux deux ' +
          'bouts, sans cœur, et une petite étincelle jaune. Un seul dessin sur la grille 48, ' +
          'extrait de Figma (`TolbiAI/Étincelle`, 2341:12352) par `npm run tolbi-ai-art` — ' +
          'les 96 variantes du fichier sont ce dessin mis à l\'échelle (ADR-0056).',
      },
    },
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ARTWORK_SIZES,
      description:
        'Côté de la boîte, sur l\'échelle d\'artwork partagée avec `Logo` et `ModuleIcon`. ' +
        '96 et 128 sont les tailles de l\'accueil.',
      table: {
        category: 'Apparence',
        type: { summary: 'ArtworkSize' },
        defaultValue: { summary: '48' },
      },
    },
    accent: {
      control: 'boolean',
      description: 'La petite étincelle jaune. Sans elle, le pictogramme seul.',
      table: { category: 'Apparence', defaultValue: { summary: 'true' } },
    },
    state: {
      control: 'inline-radio',
      options: ['rest', 'off', 'thinking', 'awakening'],
      description:
        '`rest` — chargé. `off` — pas encore chargé : les feuilles à 20 %, la petite ' +
        'étincelle garde son jaune. `thinking` — Tolbi AI travaille : la lumière fait le ' +
        'tour des feuilles, sans jaune. Mouvement réduit : `off`. `awakening` — l\'éveil, une ' +
        'fois, à la première ouverture du panneau (ADR-0063).',
      table: {
        category: 'Apparence',
        type: { summary: "'rest' | 'off' | 'thinking' | 'awakening'" },
        defaultValue: { summary: "'rest'" },
      },
    },
    surface: {
      control: 'inline-radio',
      options: ['neutral', 'brand', 'inverse'],
      description:
        'Le fond sous le signe. Il décide de l\'encre des feuilles : brand/500 sur les fonds ' +
        'neutres, l\'encre partenaire du fond sur `brand` et `inverse`. Le jaune ne change pas.',
      table: {
        category: 'Apparence',
        type: { summary: "'neutral' | 'brand' | 'inverse'" },
        defaultValue: { summary: "'neutral'" },
      },
    },
    ariaLabel: {
      control: 'text',
      description:
        'Nom accessible. « Tolbi AI » par défaut ; `null` quand le signe est à côté d\'un ' +
        '« Tolbi AI » visible.',
      table: { category: 'Accessibilité', type: { summary: 'string | null' } },
    },
  },
  args: {
    size: 48,
    accent: true,
    state: 'rest',
    surface: 'neutral',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

const LABEL = 'font: var(--ds-font-label-xs); color: var(--ds-text-subtle);'

/**
 * La grille du composant Figma, moins les quatre états de chargement (Gauche,
 * Haut, Droite, Bas) : ce sont les images d'un mouvement, pas des états qu'on
 * choisit.
 */
export const Grid: Story = {
  name: 'Tailles et états',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { TolbiAiSpark },
    setup: () => ({
      sizes: ARTWORK_SIZES,
      rows: [
        { label: 'Repos', state: 'rest', accent: true },
        { label: 'Éteinte', state: 'off', accent: true },
        { label: 'Repos · sans', state: 'rest', accent: false },
        { label: 'Éteinte · sans', state: 'off', accent: false },
      ],
      LABEL,
    }),
    template: `
      <div style="display:grid; grid-template-columns:max-content repeat(8, max-content); gap:var(--ds-spacing-3xl) var(--ds-spacing-4xl); align-items:center;">
        <span />
        <span v-for="s in sizes" :key="s" :style="LABEL + 'text-align:center;'">{{ s }}</span>
        <template v-for="row in rows" :key="row.label">
          <span :style="LABEL">{{ row.label }}</span>
          <span v-for="s in sizes" :key="s" style="display:flex; justify-content:center;">
            <TolbiAiSpark :size="s" :state="row.state" :accent="row.accent" :aria-label="null" />
          </span>
        </template>
      </div>
    `,
  }),
}

/**
 * Fini quand : toutes les tailles, sur neutral, brand et inverse. Sur les deux
 * fonds colorés, les feuilles prennent l'encre partenaire du fond — blanches en
 * clair ; sur `inverse`, elles suivent le fond quand il s'inverse en sombre.
 */
export const Surfaces: Story = {
  name: 'Sur les trois fonds',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { TolbiAiSpark },
    setup: () => ({
      sizes: ARTWORK_SIZES,
      grounds: [
        { surface: 'neutral', label: 'neutral · bg-default', bg: 'var(--ds-bg-default)', ink: 'var(--ds-text-subtle)' },
        { surface: 'neutral', label: 'neutral · bg-neutral', bg: 'var(--ds-bg-neutral)', ink: 'var(--ds-text-subtle)' },
        { surface: 'brand', label: 'brand · bg-brand-solid', bg: 'var(--ds-bg-brand-solid)', ink: 'var(--ds-text-on-brand-solid)' },
        { surface: 'inverse', label: 'inverse · bg-inverse', bg: 'var(--ds-bg-inverse)', ink: 'var(--ds-text-on-inverse)' },
      ],
    }),
    template: `
      <div style="display:flex; flex-direction:column; gap:var(--ds-spacing-lg);">
        <div
          v-for="g in grounds"
          :key="g.label"
          :style="{ background: g.bg, borderRadius: 'var(--ds-radius-surface)', padding: 'var(--ds-spacing-3xl)', display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-xl)' }"
        >
          <span :style="{ font: 'var(--ds-font-label-xs)', color: g.ink }">{{ g.label }}</span>
          <div style="display:flex; align-items:center; gap:var(--ds-spacing-4xl);">
            <TolbiAiSpark v-for="s in sizes" :key="s" :size="s" :surface="g.surface" :aria-label="null" />
            <TolbiAiSpark :size="48" :surface="g.surface" state="off" :aria-label="null" />
          </div>
        </div>
      </div>
    `,
  }),
}

/**
 * La lumière fait le tour des feuilles, de l'ouest dans le sens des aiguilles
 * d'une montre : chaque feuille monte en 200 ms pendant que la précédente
 * redescend, un tour en 800 ms, sans jaune. La première image est la vue fixe
 * de Figma — la feuille de gauche allumée. Mouvement réduit : les feuilles
 * restent à 20 %.
 */
export const Thinking: Story = {
  name: 'Réflexion — la boucle',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { TolbiAiSpark },
    setup: () => ({
      sizes: ARTWORK_SIZES,
      grounds: [
        { surface: 'neutral', bg: 'var(--ds-bg-default)' },
        { surface: 'brand', bg: 'var(--ds-bg-brand-solid)' },
        { surface: 'inverse', bg: 'var(--ds-bg-inverse)' },
      ],
    }),
    template: `
      <div style="display:flex; flex-direction:column; gap:var(--ds-spacing-lg);">
        <div
          v-for="g in grounds"
          :key="g.surface"
          :style="{ background: g.bg, borderRadius: 'var(--ds-radius-surface)', padding: 'var(--ds-spacing-3xl)', display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-4xl)' }"
        >
          <TolbiAiSpark v-for="s in sizes" :key="s" :size="s" :surface="g.surface" state="thinking" :aria-label="null" />
        </div>
      </div>
    `,
  }),
}

/**
 * L'éveil — l'exception (ADR-0063) : une fois, à la première ouverture du
 * panneau. Le pictogramme fait un tour et passe de 94 à 100 %, les feuilles
 * s'allument en deux rondes depuis le nord, puis l'étincelle entre et sa lueur
 * monte, tient et s'éteint. 3,2 s ; l'état final est le repos. « Rejouer » le
 * relance. Mouvement réduit : le repos, tout de suite.
 */
export const Awakening: Story = {
  name: 'Éveil — l’exception',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { TolbiAiSpark },
    setup() {
      const take = ref(0)
      const awoken = ref(0)
      return { take, awoken, sizes: [24, 48, 64, 96, 128] }
    },
    template: `
      <div style="display:flex; flex-direction:column; gap:var(--ds-spacing-3xl);">
        <div style="display:flex; align-items:center; gap:var(--ds-spacing-4xl);">
          <TolbiAiSpark v-for="s in sizes" :key="s + '-' + take" :size="s" state="awakening" :aria-label="null" @awake="awoken++" />
        </div>
        <div style="display:flex; align-items:center; gap:var(--ds-spacing-lg); font:var(--ds-font-body-sm); color:var(--ds-text-subtle);">
          <button type="button" style="font:var(--ds-font-label-md-strong); padding:var(--ds-spacing-xs) var(--ds-spacing-md); border-radius:var(--ds-radius-control); border:var(--ds-border-width-default) solid var(--ds-border-default); background:var(--ds-bg-default); color:var(--ds-text-default); cursor:pointer;" @click="take++; awoken = 0">Rejouer</button>
          <span>awake : {{ awoken }} / {{ sizes.length }}</span>
        </div>
      </div>
    `,
  }),
}
