import type { Meta, StoryObj } from '@storybook/vue3'
import TolbiAiVoiceNote from './TolbiAiVoiceNote.vue'
import { humUrl, speechLevels } from './TolbiAiVoiceNote.demo'

const levels = speechLevels(23)

const meta: Meta<typeof TolbiAiVoiceNote> = {
  title: 'Identité & média/TolbiAiVoiceNote',
  component: TolbiAiVoiceNote,
  tags: ['autodocs', 'wip'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Le vocal dans le fil, côté utilisateur. Replié par défaut : écouter, l\'onde, la langue ' +
          'reconnue, la durée, et « Voir la transcription ». Déplié : la transcription, qui ouvre sa ' +
          'place (200 ms à l\'entrée, 100 ms à la sortie). La langue est reconnue, jamais choisie ; ' +
          'ni la transcription ni la langue ne se corrigent (ADR-0060).',
      },
    },
  },
  argTypes: {
    state: {
      control: 'inline-radio',
      options: ['transcribing', 'transcribed', 'failed'],
      table: {
        category: 'État',
        type: { summary: "'transcribing' | 'transcribed' | 'failed'" },
        defaultValue: { summary: "'transcribed'" },
      },
    },
    expanded: { control: 'boolean', table: { category: 'État', defaultValue: { summary: 'false' } } },
    language: { control: 'text', table: { category: 'Contenu' } },
    transcript: { control: 'text', table: { category: 'Contenu', type: { summary: 'string | null' } } },
    duration: { control: 'number', table: { category: 'Contenu' } },
  },
  args: {
    state: 'transcribed',
    duration: 23,
    levels,
    language: 'Français',
    transcript: 'Explique-moi les résultats de ce projet.',
  },
  render: (args) => ({
    components: { TolbiAiVoiceNote },
    setup: () => ({ args, src: humUrl(levels) }),
    template: '<TolbiAiVoiceNote v-bind="args" :src="src" />',
  }),
}

export default meta
type Story = StoryObj<typeof meta>

export const Collapsed: Story = { name: 'Replié — par défaut' }

export const Expanded: Story = { name: 'Déplié', args: { expanded: true } }

export const Transcribing: Story = {
  name: 'Transcription en cours',
  args: { state: 'transcribing', language: undefined, transcript: null },
}

export const Failed: Story = {
  name: 'Transcription impossible',
  args: { state: 'failed', language: undefined, transcript: null },
}

export const English: Story = {
  name: 'Anglais reconnu',
  args: { language: 'Anglais', transcript: 'Explain this project’s results to me.', expanded: true },
}

/** Le wolof est reconnu, mais sa transcription n'existe pas encore : la bulle le dit. */
export const Wolof: Story = {
  name: 'Wolof · bêta',
  args: {
    language: 'Wolof · Bêta',
    transcript: null,
    unavailableMessage: 'La transcription en Wolof n’est pas encore disponible.',
    expanded: true,
  },
}

/** Sans enregistrement — un vocal relu plus tard : l'onde reste, la lecture est éteinte. */
export const WithoutAudio: Story = {
  name: 'Sans l’audio',
  render: (args) => ({
    components: { TolbiAiVoiceNote },
    setup: () => ({ args }),
    template: '<TolbiAiVoiceNote v-bind="args" />',
  }),
}

/** Plusieurs vocaux : en lancer un met en pause celui qui jouait. */
export const Thread: Story = {
  name: 'Dans le fil',
  render: () => ({
    components: { TolbiAiVoiceNote },
    setup() {
      const a = speechLevels(9, 3)
      const b = speechLevels(23, 11)
      return { a, b, srcA: humUrl(a), srcB: humUrl(b) }
    },
    template: `
      <div style="width:368px; display:flex; flex-direction:column; align-items:flex-end; gap:var(--ds-spacing-xl);">
        <TolbiAiVoiceNote :src="srcA" :duration="9" :levels="a" language="Français" transcript="Combien d’hectares sont en sénescence ?" />
        <TolbiAiVoiceNote :src="srcB" :duration="23" :levels="b" language="Anglais" transcript="Explain this project’s results to me." />
      </div>
    `,
  }),
}
