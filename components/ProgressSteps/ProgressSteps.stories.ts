import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import ProgressSteps from './ProgressSteps.vue'
import type { ProgressStep } from './ProgressSteps.vue'

const meta: Meta<typeof ProgressSteps> = {
  title: 'Navigation/ProgressSteps',
  component: ProgressSteps,
  tags: ['stable'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Indicateur de progression. Vertical : deux types, `icon` (cercles de statut) et `featured-icon` (boîte avec icône), trois tailles `sm`, `md`, `lg`. ' +
          '**Horizontal** (`orientation="horizontal"`, ADR-0081) : un segment par étape, le titre et sa phrase dessous — la tête d’une fenêtre en plusieurs étapes. ' +
          'Faites et courante partagent la couleur du segment ; le titre courant prend aussi la graisse forte. Sous 40rem de sa propre largeur, ' +
          'il garde les segments et n’écrit que l’étape courante, « Étape 2 sur 3 ». Une liste ordonnée, `aria-current="step"`, pas cliquable.',
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

/* ── Horizontal (ADR-0081) ─────────────────────────────────────────── */

const DDR_STEPS: ProgressStep[] = [
  { title: 'Le commerçant', description: 'Nom, pays et identifiants.' },
  { title: 'Les produits', description: 'Les marchandises à évaluer.' },
  { title: 'L’envoi', description: 'Relire et envoyer la déclaration.' },
]

/** Deux largeurs : la fenêtre (titres sous chaque segment), puis un panneau de 432px (forme compacte). */
export const Horizontal: Story = {
  name: 'Horizontal',
  render: () => ({
    components: { ProgressSteps },
    setup() {
      const current = ref(2)
      return { current, steps: DDR_STEPS }
    },
    template: `
      <div style="display:flex; flex-direction:column; gap:var(--ds-spacing-4xl)">
        <div style="display:flex; gap:var(--ds-spacing-md)">
          <button type="button" @click="current = Math.max(1, current - 1)">Précédente</button>
          <button type="button" @click="current = Math.min(steps.length, current + 1)">Suivante</button>
        </div>
        <div style="width:960px"><ProgressSteps :steps="steps" :current-step="current" orientation="horizontal" /></div>
        <div style="width:432px"><ProgressSteps :steps="steps" :current-step="current" orientation="horizontal" /></div>
      </div>
    `,
  }),
}

