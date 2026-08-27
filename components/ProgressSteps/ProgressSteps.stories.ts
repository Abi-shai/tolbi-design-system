import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import ProgressSteps from './ProgressSteps.vue'
import type { ProgressStep } from './ProgressSteps.vue'

const meta: Meta<typeof ProgressSteps> = {
  title: 'Components/ProgressSteps',
  component: ProgressSteps,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Indicateur de progression vertical. Deux types : `icon` (cercles de statut) et `featured-icon` (boîte avec icône). Trois tailles : `sm`, `md`, `lg`.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof ProgressSteps>

const STEPS_WITH_ICONS: ProgressStep[] = [
  { title: 'Vos informations',      description: 'Renseignez votre nom et votre adresse e-mail',   icon: 'user' },
  { title: 'Détails de l\'entreprise', description: 'Quelques informations sur votre entreprise',  icon: 'building-2' },
  { title: 'Inviter votre équipe',  description: 'Commencez à collaborer avec votre équipe',       icon: 'users' },
]

const STEPS_PLAIN: ProgressStep[] = [
  { title: 'Vos informations',         description: 'Renseignez votre nom et votre adresse e-mail' },
  { title: 'Détails de l\'entreprise', description: 'Quelques informations sur votre entreprise' },
  { title: 'Inviter votre équipe',     description: 'Commencez à collaborer avec votre équipe' },
]

/* ── Icon type ─────────────────────────────────────────────────────── */

export const IconLg: Story = {
  name: 'Icon — lg',
  render: () => ({
    components: { ProgressSteps },
    setup() {
      const current = ref(2)
      return { current, steps: STEPS_PLAIN }
    },
    template: `<ProgressSteps :steps="steps" :current-step="current" type="icon" size="lg" />`,
  }),
}

export const IconMd: Story = {
  name: 'Icon — md',
  render: () => ({
    components: { ProgressSteps },
    setup() {
      const current = ref(2)
      return { current, steps: STEPS_PLAIN }
    },
    template: `<ProgressSteps :steps="steps" :current-step="current" type="icon" size="md" />`,
  }),
}

export const IconSm: Story = {
  name: 'Icon — sm',
  render: () => ({
    components: { ProgressSteps },
    setup() {
      const current = ref(2)
      return { current, steps: STEPS_PLAIN }
    },
    template: `<ProgressSteps :steps="steps" :current-step="current" type="icon" size="sm" />`,
  }),
}

/* ── Featured icon type ────────────────────────────────────────────── */

export const FeaturedIconLg: Story = {
  name: 'Featured icon — lg',
  render: () => ({
    components: { ProgressSteps },
    setup() {
      const current = ref(2)
      return { current, steps: STEPS_WITH_ICONS }
    },
    template: `<ProgressSteps :steps="steps" :current-step="current" type="featured-icon" size="lg" />`,
  }),
}

export const FeaturedIconMd: Story = {
  name: 'Featured icon — md',
  render: () => ({
    components: { ProgressSteps },
    setup() {
      const current = ref(2)
      return { current, steps: STEPS_WITH_ICONS }
    },
    template: `<ProgressSteps :steps="steps" :current-step="current" type="featured-icon" size="md" />`,
  }),
}

export const FeaturedIconSm: Story = {
  name: 'Featured icon — sm',
  render: () => ({
    components: { ProgressSteps },
    setup() {
      const current = ref(2)
      return { current, steps: STEPS_WITH_ICONS }
    },
    template: `<ProgressSteps :steps="steps" :current-step="current" type="featured-icon" size="sm" />`,
  }),
}

/* ── Interactive ───────────────────────────────────────────────────── */

export const Interactive: Story = {
  name: 'Interactif',
  render: () => ({
    components: { ProgressSteps },
    setup() {
      const current = ref(1)
      const steps = STEPS_PLAIN
      const next = () => { if (current.value < steps.length) current.value++ }
      const prev = () => { if (current.value > 1) current.value-- }
      return { current, steps, next, prev }
    },
    template: `
      <div style="display:flex;flex-direction:column;gap:24px;max-width:360px">
        <ProgressSteps :steps="steps" :current-step="current" type="icon" size="md" />
        <div style="display:flex;gap:8px">
          <button @click="prev" :disabled="current <= 1" style="padding:8px 16px;border:1px solid #d0d5dd;border-radius:8px;background:white;cursor:pointer;font-size:14px">← Précédent</button>
          <button @click="next" :disabled="current >= steps.length" style="padding:8px 16px;border:1px solid #d0d5dd;border-radius:8px;background:white;cursor:pointer;font-size:14px">Suivant →</button>
        </div>
      </div>
    `,
  }),
}
