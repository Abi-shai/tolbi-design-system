import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import BarTransition from './BarTransition.vue'
import { Button } from '../Button'

const meta: Meta<typeof BarTransition> = {
  title: 'Mouvement/BarTransition',
  component: BarTransition,
  tags: ['wip'],
  parameters: {
    docs: {
      description: {
        component:
          'Une barre qui cède le haut de la page à une autre (ADR-0216) : en entrant dans un projet SIG, la barre de ' +
          'l’application remonte et s’efface (`enter`, accélération), la barre du projet descend à sa place (`process`, ' +
          'décélération) un `enter` plus tard ; à l’inverse en sortant. Les deux barres partagent une même case. Sous ' +
          'mouvement réduit, rien ne voyage ni n’attend.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: { BarTransition, Button },
    setup: () => ({ second: ref(false) }),
    template: `
      <div style="display:flex; flex-direction:column; gap:var(--ds-spacing-xl)">
        <Button :label="second ? 'Revenir à la première barre' : 'Passer à la seconde barre'" size="sm" variant="secondary-gray" @click="second = !second" />
        <div style="display:grid; overflow:hidden; border-radius:var(--ds-radius-surface); background:var(--ds-bg-neutral)">
          <BarTransition>
            <div v-if="!second" key="a" style="grid-area:1 / 1; height:3.5rem; display:flex; align-items:center; padding-inline:var(--ds-spacing-xl); font:var(--ds-font-label-lg-strong)">La barre de l’application</div>
            <div v-else key="b" style="grid-area:1 / 1; height:3.5rem; display:flex; align-items:center; padding-inline:var(--ds-spacing-xl); background:var(--ds-bg-default); font:var(--ds-font-label-lg-strong)">La barre du projet</div>
          </BarTransition>
        </div>
      </div>`,
  }),
}
