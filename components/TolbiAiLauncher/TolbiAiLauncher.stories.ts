import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import TolbiAiLauncher from './TolbiAiLauncher.vue'
import { Button } from '../Button'

const meta: Meta<typeof TolbiAiLauncher> = {
  title: 'Actions/TolbiAiLauncher',
  component: TolbiAiLauncher,
  tags: ['autodocs', 'wip'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'L’entrée de Tolbi AI : un disque blanc portant le signe, qui flotte en bas à droite de l’écran, ' +
          'au-dessus de la page (Figma `2308:2429`, ADR-0070) — plus dans la barre, qui parle de l’application. ' +
          'Il ouvre le panneau ancré et s’efface tant que celui-ci est ouvert ; la fermeture du panneau le ' +
          'ramène, le focus avec. ⌘J (Ctrl+J ailleurs) fait comme le clic. Une infobulle dit ce qu’il fait ' +
          'après 400 ms, et le signe fait un tour quand le pointeur arrive — le tour de l’éveil, seul ' +
          '(ADR-0071).',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

/** Au repos, sur une page : survolez-le pour le tour et l’infobulle, tabulez dessus pour l’anneau. */
export const Default: Story = {
  name: 'Sur la page',
  render: () => ({
    components: { TolbiAiLauncher, Button },
    setup: () => ({ open: ref(false) }),
    template: `
      <div style="min-height: 100vh; box-sizing: border-box; padding: var(--ds-spacing-2xl); background: var(--ds-bg-neutral);">
        <div style="display: flex; align-items: center; gap: var(--ds-spacing-lg); font: var(--ds-font-body-md); color: var(--ds-text-subtle);">
          <span>Panneau : {{ open ? 'ouvert' : 'fermé' }}</span>
          <Button v-if="open" label="Fermer le panneau" variant="secondary-gray" size="sm" @click="open = false" />
        </div>
        <TolbiAiLauncher v-model:open="open" :shortcut="false" />
      </div>
    `,
  }),
}
