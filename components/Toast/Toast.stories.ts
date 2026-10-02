import type { Meta, StoryObj } from '@storybook/vue3'
import { fn } from '@storybook/test'
import Toast from './Toast.vue'
import { Button } from '../Button'

// Toasts float over the page, and the page is `bg-neutral` in the product.
const GROUND =
  'display: flex; flex-direction: column; align-items: flex-start; gap: var(--ds-spacing-lg); ' +
  'padding: var(--ds-spacing-3xl); background: var(--ds-bg-neutral); border-radius: var(--ds-radius-surface);'

const meta: Meta<typeof Toast> = {
  title: 'Superposition/Toast',
  tags: ['wip'],
  component: Toast,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Un message bref sur ce qui vient de se passer, sur la surface flottante du catalogue — ' +
          '`bg-default`, filet `border-subtle`, `radius-surface`, `elevation-overlay`. **Le ton est porté par le ' +
          'glyphe** et son encre, la surface reste neutre (piste A, ADR-0052). Une phrase, une précision ' +
          'facultative, les actions sur la ligne du message. Le temps est le sien — 5 s, 8 s avec une action, ' +
          'illimité pour une erreur ou une tâche en cours, en pause au survol et au focus — mais **l’entrée, la ' +
          'sortie et la pile appartiennent à `ToastRegion`** : un toast ne peut pas animer son propre retrait.',
      },
    },
  },
  argTypes: {
    tone: {
      control: 'inline-radio',
      options: ['success', 'error', 'warning', 'neutral'],
      table: { category: 'Apparence', type: { summary: "'success' | 'error' | 'warning' | 'neutral'" }, defaultValue: { summary: "'neutral'" } },
    },
    message: { control: 'text', table: { category: 'Contenu', type: { summary: 'string' } } },
    detail:  { control: 'text', table: { category: 'Contenu', type: { summary: 'string' } } },
    pending: {
      control: 'boolean',
      description: 'Une tâche encore en cours : le spinner tient la place du glyphe, le toast attend.',
      table: { category: 'État', type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    dismissible: { control: 'boolean', table: { category: 'Comportement', type: { summary: 'boolean' }, defaultValue: { summary: 'true' } } },
    duration: {
      control: 'number',
      description: 'En ms ; `null` reste jusqu’à la fermeture. Absent : le ton décide.',
      table: { category: 'Comportement', type: { summary: 'number | null' } },
    },
  },
  args: {
    tone: 'success',
    message: '48 cartes générées pour l’agence de Kaolack',
    dismissible: true,
    duration: null,
    onDismiss: fn(),
  },
  decorators: [() => ({ template: `<div style="${GROUND}"><story /></div>` })],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Le ton choisit le glyphe et son encre ; la surface ne bouge pas (ADR-0006). */
export const Tones: Story = {
  name: 'Les quatre tons',
  render: () => ({
    components: { Toast },
    template: `
      <Toast tone="success" message="48 cartes générées pour l’agence de Kaolack" :duration="null" />
      <Toast tone="error" message="La synchronisation a échoué" :duration="null" />
      <Toast tone="warning" message="Connexion instable" :duration="null" />
      <Toast tone="neutral" message="Export envoyé à awa.diop@exemple.sn" :duration="null" />
      <Toast pending message="Génération du lot…" :dismissible="false" />
    `,
  }),
}

/** Une précision sous la phrase : le glyphe et la croix restent sur la première ligne. */
export const WithDetail: Story = {
  name: 'Avec une précision',
  args: {
    tone: 'warning',
    message: 'Connexion instable',
    detail: 'Vos saisies seront synchronisées au retour du réseau.',
  },
}

/** Les actions sont sur la ligne du message, en texte — `Button variant="link" size="sm"`. */
export const WithActions: Story = {
  name: 'Avec une action',
  render: () => ({
    components: { Toast, Button },
    template: `
      <Toast tone="error" message="Import interrompu" detail="3 lignes n’ont pas pu être appariées.">
        <template #actions><Button label="Réessayer" variant="link" size="sm" /></template>
      </Toast>
      <Toast tone="success" message="3 producteurs archivés" :duration="null">
        <template #actions><Button label="Annuler" variant="link" size="sm" /></template>
      </Toast>
    `,
  }),
}

export const Pending: Story = {
  name: 'En cours',
  args: { tone: 'neutral', message: 'Génération du lot…', pending: true, dismissible: false },
}
