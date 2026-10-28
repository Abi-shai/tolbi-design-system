import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import MapControls from './MapControls.vue'
import type { MapControl } from './MapControls.vue'

const meta: Meta<typeof MapControls> = {
  title: 'Données/Map/Controls',
  component: MapControls,
  tags: ['wip'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'La pile de boutons d’une carte (ADR-0087) : des `Button` icône seule `secondary-gray` `sm` — ' +
          '36 px, le plancher du catalogue pour un contrôle rond — 8 px d’écart.\n\n' +
          'Chacun porte **une infobulle ancrée du côté opposé au bord** sur lequel la pile se tient : ' +
          '`tooltipPlacement`, parce qu’une infobulle qui sort de la carte ne se lit pas.\n\n' +
          'Un outil à deux états (`pressed`) dit `aria-pressed` : il reste enfoncé jusqu’à ce qu’on le ' +
          'represse, et ce n’est pas la même chose qu’un bouton qui agit une fois.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof MapControls>

/** Zoomer, dézoomer, recentrer, changer de fond. */
export const Default: Story = {
  name: 'La pile',
  render: () => ({
    components: { MapControls },
    setup() {
      const controls: MapControl[] = [
        { key: 'in', icon: 'plus', label: 'Zoomer' },
        { key: 'out', icon: 'minus', label: 'Dézoomer' },
        { key: 'center', icon: 'crosshair', label: 'Recentrer sur le lot' },
        { key: 'layers', icon: 'layers', label: 'Changer de fond' },
      ]
      return { controls }
    },
    template: `
      <div style="background:var(--ds-bg-neutral);padding:24px;border-radius:12px">
        <MapControls :controls="controls" aria-label="Contrôles de la carte" />
      </div>
    `,
  }),
}

/** Un outil reste enfoncé : `pressed` devient `aria-pressed`. */
export const Pressed: Story = {
  name: 'Un outil actif',
  render: () => ({
    components: { MapControls },
    setup() {
      const drawing = ref(true)
      const controls = ref<MapControl[]>([])
      const build = () => [
        { key: 'in', icon: 'plus' as const, label: 'Zoomer' },
        { key: 'out', icon: 'minus' as const, label: 'Dézoomer' },
        { key: 'draw', icon: 'ruler' as const, label: 'Tracer une parcelle', pressed: drawing.value },
        { key: 'locked', icon: 'lock' as const, label: 'Verrouiller la vue', disabled: true },
      ]
      controls.value = build()
      const toggle = (key: string) => {
        if (key === 'draw') { drawing.value = !drawing.value; controls.value = build() }
      }
      return { controls, toggle }
    },
    template: `
      <div style="background:var(--ds-bg-neutral);padding:24px;border-radius:12px">
        <MapControls :controls="controls" aria-label="Outils" @action="toggle" />
      </div>
    `,
  }),
}
