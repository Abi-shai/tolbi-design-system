import type { Meta, StoryObj } from '@storybook/vue3'
import { computed, ref } from 'vue'
import ShareBar from './ShareBar.vue'

const meta: Meta<typeof ShareBar> = {
  title: 'Données/ShareBar',
  component: ShareBar,
  tags: ['wip'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Un tout et ses parts sur une ligne (ADR-0097) : des segments aussi larges que leurs parts, et la légende ' +
          'qui les nomme. Pas une `ProgressBar` : rien ne progresse. **La plus grande part d’abord** (la palette est ' +
          'ordonnée par ΔE, ADR-0016), cinq teintes au plus, le reste neutre et compté `+N` ; la légende ne passe ' +
          'jamais à la ligne. `rest` : le reste du tout (« Sans lui »), neutre et dernier. C’était la répartition de ' +
          '`ProjectCard` (ADR-0038), qui la rend désormais.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof ShareBar>

/** Deux parts, dont le reste — la part créditable (ARR). Le chiffre est dit plus haut, plus grand : `showShare` à `false`. */
export const PartAndRest: Story = {
  name: 'Une part et le reste',
  args: { items: [{ label: 'Grâce au projet', share: 86 }, { label: 'Sans lui', share: 14, rest: true }], showShare: false },
  render: (args) => ({ components: { ShareBar }, setup: () => ({ args }), template: `<div style="width:328px"><ShareBar v-bind="args" /></div>` }),
}

/** Une répartition plus longue que la palette : trois nommées, le reste en `+N`, neutre dans la barre. */
export const Spread: Story = {
  name: 'Répartition',
  args: {
    shown: 3,
    items: [
      { label: 'Cacao', share: 38 }, { label: 'Hévéa', share: 22 }, { label: 'Palmier', share: 17 },
      { label: 'Café', share: 11 }, { label: 'Vivrier', share: 8 }, { label: 'Jachère', share: 4 },
    ],
  },
  render: (args) => ({ components: { ShareBar }, setup: () => ({ args }), template: `<div style="width:280px;background:var(--ds-bg-neutral-subtle);padding:var(--ds-spacing-lg)"><ShareBar v-bind="args" /></div>` }),
}

/** Une part qui change — une autre année choisie — **voyage** jusqu’à sa largeur (`enter`, `in-out`) : le mouvement dit de combien. */
export const Changing: Story = {
  name: 'Une part qui change',
  render: () => ({
    components: { ShareBar },
    setup() {
      const years = { 2024: 71, 2025: 79, 2026: 86 } as Record<number, number>
      const year = ref(2026)
      const items = computed(() => [{ label: 'Grâce au projet', share: years[year.value] }, { label: 'Sans lui', share: 100 - years[year.value], rest: true }])
      return { year, items, years: Object.keys(years) }
    },
    template: `
      <div style="width:328px;display:flex;flex-direction:column;gap:var(--ds-spacing-lg)">
        <div style="display:flex;gap:var(--ds-spacing-md)">
          <button v-for="y in years" :key="y" type="button" :aria-pressed="String(+y === year)" @click="year = +y">{{ y }}</button>
        </div>
        <ShareBar :items="items" />
      </div>
    `,
  }),
}
