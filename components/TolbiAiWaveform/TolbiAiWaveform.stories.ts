import type { Meta, StoryObj } from '@storybook/vue3'
import { onBeforeUnmount, ref } from 'vue'
import TolbiAiWaveform from './TolbiAiWaveform.vue'
import { speechLevels } from '../TolbiAiVoiceNote/TolbiAiVoiceNote.demo'

const meta: Meta<typeof TolbiAiWaveform> = {
  title: 'Identité & média/TolbiAiWaveform',
  component: TolbiAiWaveform,
  tags: ['autodocs', 'wip', 'primitive'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'L\'onde d\'un vocal (Figma `TolbiAI/Onde`) : une barre par niveau, 3 px de large, de 4 px ' +
          '(silence) à 24 px. `tail` — en direct, la plus récente à droite. `whole` — tout ' +
          'l\'enregistrement replié dans les barres que la rangée contient, ce qui a joué en encre ' +
          'forte. Décorative : la durée, à côté, dit la même chose en mots.',
      },
    },
  },
  argTypes: {
    fit: { control: 'inline-radio', options: ['tail', 'whole'], table: { category: 'Apparence' } },
    // Left out of the args at rest: Storybook's range control cannot draw `null`
    // (it calls `toFixed` on it), and the component's own default is `null`.
    progress: { control: { type: 'range', min: 0, max: 1, step: 0.01 }, table: { category: 'État' } },
  },
  args: { levels: speechLevels(23), fit: 'whole' },
  decorators: [() => ({ template: '<div style="width:196px"><story /></div>' })],
}

export default meta
type Story = StoryObj<typeof meta>

export const Whole: Story = { name: 'Tout l’enregistrement' }

export const Playing: Story = { name: 'En lecture', args: { progress: 0.39 } }

/** Une barre toutes les 100 ms, la plus récente à droite. */
export const Live: Story = {
  name: 'En direct',
  render: () => ({
    components: { TolbiAiWaveform },
    setup() {
      const source = speechLevels(120, 5)
      const levels = ref<number[]>([])
      const timer = setInterval(() => {
        levels.value = [...levels.value, source[levels.value.length % source.length]]
      }, 100)
      onBeforeUnmount(() => clearInterval(timer))
      return { levels }
    },
    template: '<TolbiAiWaveform :levels="levels" fit="tail" />',
  }),
}
