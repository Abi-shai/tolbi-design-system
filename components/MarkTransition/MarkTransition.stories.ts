import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import MarkTransition from './MarkTransition.vue'
import { Button } from '../Button'
import { Icon } from '../Icon'

const meta: Meta<typeof MarkTransition> = {
  title: 'Mouvement/MarkTransition',
  component: MarkTransition,
  tags: ['stable'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Le mouvement d’une **marque qui confirme** : la coche d’une case, le repère d’un élément choisi, ' +
          'une étape franchie (ADR-0023). `scale(0,6)` + fondu sur `duration-quick` — plus petit et plus rapide ' +
          'qu’une entrée de surface, parce qu’**une marque confirme là où une surface arrive**.\n\n' +
          '`mode="out-in"` parce qu’une marque vit dans une boîte centrée : deux enfants présents en même temps ' +
          'se poseraient côte à côte et sauteraient. Ça ne coûte rien dans le cas courant (rien → marque n’a pas ' +
          'd’élément sortant) et ne se voit que sur l’échange rare, indéterminé → coché.\n\n' +
          'Le mouvement doit **expliquer** : un repère statique — la pastille d’un `Badge`, la flèche d’une ' +
          'infobulle — n’est pas animé.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof MarkTransition>

const DISC = `
  display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;
  border-radius:var(--ds-radius-pill);background:var(--ds-bg-brand-solid);color:var(--ds-text-on-brand-solid)
`

/** Rien → la marque. Elle se pose, elle ne glisse pas. */
export const Default: Story = {
  name: 'Confirmer',
  render: () => ({
    components: { MarkTransition, Button, Icon },
    setup: () => ({ done: ref(false) }),
    template: `
      <div style="display:flex;align-items:center;gap:16px;min-height:48px">
        <Button variant="secondary-gray" size="sm" :label="done ? 'Annuler' : 'Confirmer'" @click="done = !done" />
        <span style="display:inline-flex;width:24px;height:24px;align-items:center;justify-content:center">
          <MarkTransition>
            <span v-if="done" style="${DISC}"><Icon name="check" :size="16" /></span>
          </MarkTransition>
        </span>
      </div>
    `,
  }),
}

/** L’échange rare : une marque remplace une autre dans la même case. */
export const Swap: Story = {
  name: 'Une marque pour une autre',
  render: () => ({
    components: { MarkTransition, Button, Icon },
    setup: () => ({ state: ref<'none' | 'some' | 'all'>('none') }),
    template: `
      <div style="display:flex;align-items:center;gap:16px;min-height:48px">
        <Button
          variant="secondary-gray"
          size="sm"
          label="Étape suivante"
          @click="state = state === 'none' ? 'some' : state === 'some' ? 'all' : 'none'"
        />
        <span style="display:inline-flex;width:24px;height:24px;align-items:center;justify-content:center">
          <MarkTransition>
            <span v-if="state === 'some'" key="some" style="${DISC}"><Icon name="minus" :size="16" /></span>
            <span v-else-if="state === 'all'" key="all" style="${DISC}"><Icon name="check" :size="16" /></span>
          </MarkTransition>
        </span>
      </div>
    `,
  }),
}
