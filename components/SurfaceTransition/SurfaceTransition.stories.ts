import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import SurfaceTransition from './SurfaceTransition.vue'
import { Button } from '../Button'

const meta: Meta<typeof SurfaceTransition> = {
  title: 'Mouvement/SurfaceTransition',
  component: SurfaceTransition,
  tags: ['stable'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'L’entrée de maison de **tout ce qui flotte** : un panneau de `Dropdown`, une infobulle, un toast ' +
          '(ADR-0021). Échelle depuis `--ds-motion-scale-enter` (0,96) + fondu, `duration-enter` / `easing-out` ' +
          'à l’aller, `duration-exit` / `easing-in` au retour — **la sortie est plus rapide que l’entrée** : ' +
          'une surface doit s’écarter plus vite qu’elle n’arrive.\n\n' +
          'Deux choses à ne pas réapprendre. Son `<style>` n’est **pas scopé**, exprès : Vue pose les classes de ' +
          'transition sur l’élément **slotté**, qui porte l’identifiant de scope du parent — une règle scopée ne ' +
          'matcherait jamais, et échouerait en silence. Et la surface qui consomme pose **son propre** ' +
          '`transform-origin` : elle seule sait où est son ancre.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof SurfaceTransition>

const PANEL = `
  <div
    v-if="open"
    style="transform-origin:top left;width:240px;padding:12px;border:1px solid var(--ds-border-subtle);
           border-radius:var(--ds-radius-surface);background:var(--ds-bg-default);
           box-shadow:var(--ds-elevation-overlay);font:var(--ds-font-body-md);color:var(--ds-text-default)"
  >
    Une surface qui flotte — elle grandit depuis son ancre, en haut à gauche.
  </div>
`

/** Ouvre et ferme : l’entrée prend `enter`, la sortie `exit`, plus courte. */
export const Default: Story = {
  name: 'Ouvrir et fermer',
  render: () => ({
    components: { SurfaceTransition, Button },
    setup: () => ({ open: ref(false) }),
    template: `
      <div style="display:flex;flex-direction:column;gap:16px;align-items:flex-start;min-height:180px">
        <Button variant="secondary-gray" size="sm" :label="open ? 'Fermer' : 'Ouvrir'" @click="open = !open" />
        <SurfaceTransition>${PANEL}</SurfaceTransition>
      </div>
    `,
  }),
}

/** L’ancre est au consommateur : la même surface, vue de ses quatre coins. */
export const Origins: Story = {
  name: 'Quatre ancres',
  render: () => ({
    components: { SurfaceTransition, Button },
    setup: () => ({ open: ref(true) }),
    template: `
      <div style="display:flex;flex-direction:column;gap:16px;align-items:flex-start">
        <Button variant="secondary-gray" size="sm" :label="open ? 'Rejouer' : 'Jouer'" @click="open = !open" />
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;min-height:200px">
          <SurfaceTransition v-for="o in ['top left','top right','bottom left','bottom right']" :key="o">
            <div
              v-if="open"
              :style="{ transformOrigin: o }"
              style="width:180px;padding:12px;border:1px solid var(--ds-border-subtle);border-radius:var(--ds-radius-surface);
                     background:var(--ds-bg-default);box-shadow:var(--ds-elevation-overlay);
                     font:var(--ds-font-body-sm);color:var(--ds-text-subtle)"
            >{{ o }}</div>
          </SurfaceTransition>
        </div>
      </div>
    `,
  }),
}
