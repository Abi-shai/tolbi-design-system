import type { Meta, StoryObj } from '@storybook/vue3'
import { nextTick, ref } from 'vue'
import TolbiAiPanel from './TolbiAiPanel.vue'
import TolbiAiWelcome from './TolbiAiWelcome.vue'
import TolbiAiThread from './TolbiAiThread.vue'
import TolbiAiQuestion from './TolbiAiQuestion.vue'
import TolbiAiAnswer from './TolbiAiAnswer.vue'
import { TolbiAiComposer } from '../TolbiAiComposer'
import { TolbiAiThinkingLine } from '../TolbiAiThinkingLine'
import { TolbiAiVoiceNote } from '../TolbiAiVoiceNote'
import { TolbiAiNavButton } from '../TolbiAiNavButton'
import { HorizontalNavigation } from '../HorizontalNavigation'
import { SideNavigation, SideNavItem } from '../SideNavigation'
import { WorkspaceSelector } from '../WorkspaceSelector'
import { Button } from '../Button'
import type { TolbiAiVoiceRecording } from '../TolbiAiComposer'

const SUGGESTIONS = [
  'Expliquer les résultats de ce projet',
  'Donner une explication agronomique de ces résultats',
  'Quelles stratégies recommandez-vous pour améliorer les rendements ?',
  'Quelles actions concrètes faut-il mettre en place sur le terrain ?',
]

const ANSWER = `
  <p>Sur la campagne du 20 juin au 10 novembre 2025, le projet atteint un rendement estimé de <strong>1,9 t/ha</strong> sur 152 ha, soit <strong>284 t</strong> de production.</p>
  <ul>
    <li><strong>+15 %</strong> par rapport à la campagne précédente (1,6 t/ha)</li>
    <li>Des parcelles de <strong>1,5 t/ha</strong> (Modou Sène) à <strong>2,1 t/ha</strong> (Mariama Baldé)</li>
    <li>Au passage satellite du 5 novembre : <strong>sénescence</strong> à 79,6 %, maturation à 12,1 %</li>
  </ul>
  <p>La campagne est close : ces chiffres sont des estimations de fin de cycle.</p>
`

const meta: Meta<typeof TolbiAiPanel> = {
  title: 'Structure/TolbiAiPanel',
  component: TolbiAiPanel,
  tags: ['autodocs', 'wip'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Tolbi AI ancré dans la page : une colonne de 400 px, la hauteur de la surface, que la page ' +
          'laisse passer au lieu de la recouvrir. Elle ne flotte pas : s\'ouvrir est une largeur qui ' +
          'voyage (ADR-0037). En-tête (le nom, ALPHA, historique, nouvelle conversation, agrandir, ' +
          'fermer), le fil qui défile et suit son dernier message, la saisie en pied (ADR-0062).\n\n' +
          '« Agrandir » lui donne la surface de la page — barre et navigation intactes — et une colonne ' +
          'de lecture de 720 px. La page reste dessous, telle quelle : « Réduire » la rend comme on ' +
          'l\'a laissée (ADR-0064). Elle doit être son propre contexte d\'empilement ' +
          '(`isolation: isolate`), sinon ce qui y porte un `z-index` — les contrôles d\'une carte — ' +
          'passe devant le panneau.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

/* A ground the size of a screen's column, as the panel stands in the product. */
const STAGE = 'height:760px; display:flex; background:var(--ds-bg-neutral); padding-top:var(--ds-spacing-lg);'

export const Welcome: Story = {
  name: 'Accueil',
  render: () => ({
    components: { TolbiAiPanel, TolbiAiWelcome, TolbiAiComposer },
    setup: () => ({ open: ref(true), expanded: ref(false), question: ref(''), SUGGESTIONS, STAGE }),
    template: `
      <div :style="STAGE">
        <div style="flex:1; min-width:0;" />
        <TolbiAiPanel v-model:open="open" v-model:expanded="expanded">
          <TolbiAiWelcome :suggestions="SUGGESTIONS" @select="(s) => (question = s)" />
          <template #composer><TolbiAiComposer v-model="question" /></template>
        </TolbiAiPanel>
      </div>
    `,
  }),
}

export const Conversation: Story = {
  name: 'Conversation',
  render: () => ({
    components: { TolbiAiPanel, TolbiAiThread, TolbiAiQuestion, TolbiAiAnswer, TolbiAiComposer },
    setup: () => ({ open: ref(true), question: ref(''), feedback: ref(null), ANSWER, STAGE }),
    template: `
      <div :style="STAGE">
        <div style="flex:1; min-width:0;" />
        <TolbiAiPanel v-model:open="open">
          <TolbiAiThread>
            <TolbiAiQuestion key="q" text="Expliquer les résultats de ce projet" />
            <TolbiAiAnswer key="a" v-model:feedback="feedback">
              <div v-html="ANSWER" />
            </TolbiAiAnswer>
          </TolbiAiThread>
          <template #composer><TolbiAiComposer v-model="question" /></template>
        </TolbiAiPanel>
      </div>
    `,
  }),
}

/**
 * La réponse arrive (ADR-0068) : une ligne de lumière, aux deux encres de
 * l'étincelle, descend la réponse et la laisse voir — comme le passage d'un
 * satellite sur une parcelle. Une fois, à l'arrivée ; « Rejouer » relance la
 * question. Une conversation rouverte ne rejoue rien.
 */
export const Arrival: Story = {
  name: 'La réponse arrive',
  render: () => ({
    components: { TolbiAiPanel, TolbiAiThread, TolbiAiQuestion, TolbiAiAnswer, TolbiAiThinkingLine, TolbiAiComposer, Button },
    setup() {
      const run = ref(0)
      const answered = ref(false)
      const question = ref('')
      let timer: ReturnType<typeof setTimeout> | undefined
      const play = () => {
        clearTimeout(timer)
        answered.value = false
        run.value++
        timer = setTimeout(() => (answered.value = true), 1600)
      }
      play()
      return { run, answered, question, play, ANSWER, STAGE }
    },
    template: `
      <div :style="STAGE">
        <div style="flex:1; min-width:0; padding:var(--ds-spacing-2xl);">
          <Button label="Rejouer" variant="secondary-gray" size="sm" icon-leading="refresh-cw" @click="play" />
        </div>
        <TolbiAiPanel :open="true">
          <TolbiAiThread :key="run">
            <TolbiAiQuestion key="q" text="Expliquer les résultats de ce projet" />
            <TolbiAiThinkingLine v-if="!answered" key="waiting" />
            <TolbiAiAnswer v-else key="a"><div v-html="ANSWER" /></TolbiAiAnswer>
          </TolbiAiThread>
          <template #composer><TolbiAiComposer v-model="question" /></template>
        </TolbiAiPanel>
      </div>
    `,
  }),
}

const WORKSPACES = [{ id: 'kaolack', name: 'Coopérative de Kaolack' }]

/*
  The product's frame, as Figma draws it (2310:3618): the navigation, then a
  column holding the bar and the row — the page, then the panel. The page is
  its own stacking context, as the panel asks.
*/
const inThePage = ({ open: startOpen = false, expanded: startExpanded = false } = {}) => ({
  components: {
    SideNavigation, SideNavItem, WorkspaceSelector, HorizontalNavigation, TolbiAiNavButton, TolbiAiPanel,
    TolbiAiWelcome, TolbiAiThread, TolbiAiQuestion, TolbiAiAnswer, TolbiAiThinkingLine, TolbiAiVoiceNote,
    TolbiAiComposer,
  },
  setup() {
    const section = ref('projets')
    const navCollapsed = ref(false)
    const open = ref(startOpen)
    const expanded = ref(startExpanded)
    /* The first opening awakens the sign; after that, it is at rest. */
    const awoken = ref(startOpen)
    const question = ref('')
    const status = ref<'ready' | 'pending' | 'failed'>('ready')
    type Item =
      | { id: number; kind: 'question'; text: string }
      | { id: number; kind: 'voice'; recording: TolbiAiVoiceRecording; src: string; state: 'transcribing' | 'transcribed' }
      | { id: number; kind: 'answer' }
    const items = ref<Item[]>([])
    const panel = ref<InstanceType<typeof TolbiAiPanel>>()
    let next = 1
    let timer: ReturnType<typeof setTimeout> | undefined
    const answerLater = () => {
      status.value = 'pending'
      timer = setTimeout(() => {
        items.value.push({ id: next++, kind: 'answer' })
        status.value = 'ready'
      }, 2600)
    }
    const ask = (text: string) => {
      items.value.push({ id: next++, kind: 'question', text })
      question.value = ''
      void nextTick(() => panel.value?.scrollToEnd())
      answerLater()
    }
    const askVoice = (recording: TolbiAiVoiceRecording) => {
      const id = next++
      items.value.push({ id, kind: 'voice', recording, src: URL.createObjectURL(recording.blob), state: 'transcribing' })
      setTimeout(() => {
        const voice = items.value.find((i) => i.id === id)
        if (voice?.kind === 'voice') voice.state = 'transcribed'
      }, 1500)
      void nextTick(() => panel.value?.scrollToEnd())
      answerLater()
    }
    const stop = () => {
      clearTimeout(timer)
      status.value = 'ready'
    }
    const restart = () => {
      stop()
      items.value = []
    }
    return {
      section, navCollapsed, open, expanded, awoken, question, status, items, panel, ask, askVoice, stop, restart,
      WORKSPACES, SUGGESTIONS, ANSWER,
    }
  },
  template: `
    <div style="height:100vh; min-height:720px; display:flex; background:var(--ds-bg-neutral);">
      <SideNavigation
        v-model="section"
        v-model:collapsed="navCollapsed"
        aria-label="Navigation principale"
        :style="navCollapsed ? '' : 'width: 268px'"
      >
        <template #header>
          <WorkspaceSelector :workspaces="WORKSPACES" model-value="kaolack" :collapsed="navCollapsed" />
        </template>
        <SideNavItem value="accueil" icon="house" label="Accueil" />
        <SideNavItem value="projets" icon="folder" label="Projets" />
        <SideNavItem value="cartographie" icon="map" label="Cartographie" />
        <SideNavItem value="rapports" icon="chart-column" label="Rapports" />
        <SideNavItem value="parametres" icon="settings" label="Paramètres" />
      </SideNavigation>
      <div style="flex:1; min-width:0; display:flex; flex-direction:column; gap:var(--ds-spacing-lg); padding:var(--ds-spacing-lg) var(--ds-spacing-lg) 0 var(--ds-spacing-md);">
        <HorizontalNavigation module="Yield" :breadcrumbs="[{ label: 'Projets' }, { label: 'Rendement Arachide Nord' }]" user-initials="AY">
          <template #assistant>
            <TolbiAiNavButton v-model:open="open" controls="tolbi-ai-panel" />
          </template>
        </HorizontalNavigation>
        <div style="flex:1; min-height:0; display:flex;">
          <main style="flex:1; min-width:0; isolation:isolate; display:flex; flex-direction:column;">
            <div style="flex:1; display:flex; flex-direction:column; gap:var(--ds-spacing-xl); border-radius:var(--ds-radius-surface) var(--ds-radius-surface) 0 0; background:var(--ds-bg-default); padding:var(--ds-spacing-2xl);">
              <p style="margin:0; font:var(--ds-font-body-md); color:var(--ds-text-subtle);">
                La page du projet — elle se resserre quand le panneau s'ouvre. Agrandi, le panneau la
                recouvre sans la toucher ; « Réduire » la rend telle qu'on l'a laissée.
              </p>
              <div style="flex:1; display:grid; place-items:center; border-radius:var(--ds-radius-surface-sm); background:var(--ds-bg-neutral-subtle); font:var(--ds-font-label-md); color:var(--ds-text-subtlest);">
                Carte
              </div>
            </div>
          </main>
          <TolbiAiPanel id="tolbi-ai-panel" ref="panel" v-model:open="open" v-model:expanded="expanded" @new-conversation="restart">
            <TolbiAiWelcome
              v-if="!items.length && status === 'ready'"
              :suggestions="SUGGESTIONS"
              :awaken="!awoken"
              @awake="awoken = true"
              @select="ask"
            />
            <TolbiAiThread v-else>
              <template v-for="item in items" :key="item.id">
                <TolbiAiQuestion v-if="item.kind === 'question'" :text="item.text" />
                <TolbiAiVoiceNote
                  v-else-if="item.kind === 'voice'"
                  style="align-self:flex-end"
                  :src="item.src"
                  :duration="item.recording.duration"
                  :levels="item.recording.levels"
                  :state="item.state"
                  language="Français"
                  transcript="Explique-moi les résultats de ce projet."
                />
                <TolbiAiAnswer v-else>
                  <div v-html="ANSWER" />
                </TolbiAiAnswer>
              </template>
              <TolbiAiThinkingLine v-if="status === 'pending'" key="waiting" />
            </TolbiAiThread>
            <template #composer>
              <TolbiAiComposer v-model="question" :status="status" @send="ask" @send-voice="askVoice" @stop="stop" />
            </template>
          </TolbiAiPanel>
        </div>
      </div>
    </div>
  `,
})

/**
 * Le parcours, dans la page : l'entrée de la barre ouvre le panneau (⌘J aussi) —
 * la première fois, le signe s'éveille —
 * la page se resserre ; une suggestion ou une question part dans le fil, la ligne
 * d'attente la suit, la réponse prend sa place. « Agrandir » donne au panneau la
 * surface de la page, « Réduire » la lui rend. Le micro de cette histoire est le
 * vrai : le navigateur le demandera.
 */
export const InThePage: Story = {
  name: 'Dans la page',
  render: () => inThePage(),
}

/**
 * Agrandi (Figma 2310:4829) : le panneau prend la surface de la page — la barre
 * et la navigation n'en perdent rien —, une colonne de lecture de 720 px, la
 * saisie en bas. La page est dessous, inerte, à sa largeur : « Réduire » la rend
 * telle qu'on l'a laissée.
 */
export const Expanded: Story = {
  name: 'Agrandi',
  render: () => inThePage({ open: true, expanded: true }),
}
