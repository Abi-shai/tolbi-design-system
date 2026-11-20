import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import ViewGlyph from './ViewGlyph.vue'

const VIEWS = [
  { view: 'map', label: 'Explorer' },
  { view: 'analytics', label: 'Analyser' },
  { view: 'report', label: 'Rapporter' },
] as const

const meta: Meta<typeof ViewGlyph> = {
  title: 'Identité & média/ViewGlyph',
  component: ViewGlyph,
  /* wip: first release — MapTopBar's switch is its one consumer, the product has not moved yet. */
  tags: ['wip'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Le glyphe d’un mode du SIG (ADR-0236) — Explorer, Analyser, Rapporter. Fluent UI System Icons, jeu « Color » ' +
          '(Microsoft, MIT), tracés repris tels quels et recolorés d’une seule règle : le même dégradé dans le même ' +
          'repère pour toutes les formes, les détails en aplat pâle. Allumé : brand 100 / 300 / 600 ; au repos : gris ' +
          '300 / 400 / 500. Le dégradé est une exception à la charte, actée. `arrived` joue la pièce qui bouge.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

/** Les trois modes, au repos puis allumés. */
export const States: Story = {
  name: 'États',
  render: () => ({
    components: { ViewGlyph },
    setup: () => ({ VIEWS }),
    template: `
      <div style="display:flex;flex-direction:column;gap:var(--ds-spacing-xl);font:var(--ds-font-label-md);color:var(--ds-text-subtle)">
        <div v-for="active in [false, true]" :key="String(active)" style="display:flex;gap:var(--ds-spacing-4xl)">
          <div v-for="v in VIEWS" :key="v.view" style="display:flex;flex-direction:column;align-items:center;gap:var(--ds-spacing-sm)">
            <div style="display:flex;align-items:flex-end;gap:var(--ds-spacing-md)">
              <ViewGlyph :view="v.view" :active="active" :size="24" />
              <ViewGlyph :view="v.view" :active="active" :size="32" />
            </div>
            {{ v.label }}
          </div>
        </div>
      </div>`,
  }),
}

/** L’arrivée : un clic rejoue la pièce — les méridiens tournent, les barres montent, les lignes s’écrivent. */
export const Arrival: Story = {
  name: 'Arrivée',
  render: () => ({
    components: { ViewGlyph },
    setup: () => {
      const playing = ref<string | null>(null)
      function play(view: string) {
        playing.value = null
        requestAnimationFrame(() => requestAnimationFrame(() => (playing.value = view)))
      }
      return { VIEWS, playing, play }
    },
    template: `
      <div style="display:flex;gap:var(--ds-spacing-4xl)">
        <button v-for="v in VIEWS" :key="v.view" type="button" style="display:flex;flex-direction:column;align-items:center;gap:var(--ds-spacing-sm);border:0;background:none;cursor:pointer;font:var(--ds-font-label-md);color:var(--ds-text-default)" @click="play(v.view)">
          <ViewGlyph :view="v.view" active :arrived="playing === v.view" :size="32" />
          {{ v.label }}
        </button>
      </div>`,
  }),
}
