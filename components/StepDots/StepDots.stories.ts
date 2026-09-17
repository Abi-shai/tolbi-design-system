import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import StepDots from './StepDots.vue'
import { ProgressBar } from '../ProgressBar'
import { Button } from '../Button'

const meta: Meta<typeof StepDots> = {
  title: 'Navigation/StepDots',
  component: StepDots,
  tags: ['autodocs', 'stable'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Indicateur de progression compact : une pastille par étape, celle en cours ' +
          's\'allonge. À préférer à `ProgressBar` quand le nombre d\'étapes est petit et ' +
          'connu — la barre exprime un pourcentage continu, les pastilles comptent des ' +
          'étapes discrètes.\n\n' +
          'Purement indicatif : pas de `click`, pas de `v-model`. Un `<div>` qui émet ' +
          '`click` est inatteignable au clavier (ADR-0014) ; rendre les étapes ' +
          'atteignables demanderait de vrais `<button>`, ce qui est une autre décision.',
      },
    },
  },
  argTypes: {
    total: {
      control: { type: 'range', min: 2, max: 8, step: 1 },
      description: 'Nombre d\'étapes.',
      table: { category: 'Contenu', type: { summary: 'number' } },
    },
    current: {
      control: { type: 'range', min: 1, max: 8, step: 1 },
      description: 'Étape en cours, indexée à partir de 1 — même convention que `ProgressSteps.currentStep`.',
      table: { category: 'Contenu', type: { summary: 'number' }, defaultValue: { summary: '1' } },
    },
    ariaLabel: {
      control: 'text',
      description:
        'Nom accessible de l\'indicateur — il nomme le composant, pas sa valeur : ' +
        '`aria-valuetext` porte toujours la position. Passer `null` quand un libellé ' +
        'visible dit déjà où l\'on est.',
      table: {
        category: 'Accessibilité',
        type: { summary: 'string | null' },
        defaultValue: { summary: "'Progression'" },
      },
    },
  },
  args: {
    total: 4,
    current: 1,
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Bienvenue: Story = {
  name: 'Deux slides — la source Figma',
  parameters: {
    docs: {
      description: {
        story:
          'Le cas d\'origine : le carrousel d\'accueil `01 · Bienvenue` (frame Figma ' +
          '`168:39`). Deux slides, 6px de pastille, 22px pour la courante, 6px d\'écart.',
      },
    },
  },
  args: { total: 2, current: 1 },
}

export const Parcours: Story = {
  name: 'Étape 1 sur 4',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story:
          'Le cas qui remplace la barre. Le libellé est un nœud de texte à part : il reste, ' +
          'et comme il dit déjà la position, l\'indicateur passe `:aria-label="null"` pour ' +
          'ne pas être annoncé deux fois. Avancer d\'une étape montre la transition.',
      },
    },
  },
  render: () => ({
    components: { StepDots, Button },
    setup() {
      const total = 4
      const current = ref(1)
      const next = () => { current.value = (current.value % total) + 1 }
      return { total, current, next }
    },
    template: `
      <div style="display:flex; flex-direction:column; align-items:center; gap:1.25rem; padding:2rem; font-family:var(--ds-typography-font-family-poppins);">
        <StepDots :total="total" :current="current" :aria-label="null" />
        <span style="font: var(--ds-font-label-lg); color: var(--ds-text-subtle);">
          Étape {{ current }} sur {{ total }}
        </span>
        <Button variant="secondary-gray" size="sm" label="Étape suivante" @click="next" />
      </div>
    `,
  }),
}

export const Remplacement: Story = {
  name: 'À la place de ProgressBar',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story:
          'Les deux côte à côte, à la même étape. `ProgressBar` rend 25 % — une quantité ; ' +
          '`StepDots` rend 1 sur 4 — un rang. Quand les étapes se comptent sur une main, ' +
          'c\'est le rang qui porte l\'information.',
      },
    },
  },
  render: () => ({
    components: { StepDots, ProgressBar },
    setup: () => ({ steps: [1, 2, 3, 4] }),
    template: `
      <div style="display:flex; flex-direction:column; gap:2rem; padding:1.5rem; width:400px; font-family:var(--ds-typography-font-family-poppins);">
        <div v-for="s in steps" :key="s" style="display:flex; flex-direction:column; gap:0.75rem;">
          <span style="font-family:monospace; font-size:0.7rem; color:var(--ds-text-subtle);">étape {{ s }} / 4</span>
          <ProgressBar :value="s / 4 * 100" />
          <StepDots :total="4" :current="s" />
        </div>
      </div>
    `,
  }),
}

export const Longueurs: Story = {
  name: 'Longueurs',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story:
          'De 2 à 6 étapes, toujours sur la première. Au-delà de six, les pastilles cessent ' +
          'de se compter d\'un coup d\'œil — c\'est le moment de repasser à `ProgressBar` ou ' +
          'à `ProgressSteps`.',
      },
    },
  },
  render: () => ({
    components: { StepDots },
    setup: () => ({ totals: [2, 3, 4, 5, 6] }),
    template: `
      <div style="display:flex; flex-direction:column; gap:1.25rem; padding:1.5rem; font-family:var(--ds-typography-font-family-poppins);">
        <div v-for="t in totals" :key="t" style="display:flex; align-items:center; gap:1rem;">
          <span style="font-family:monospace; font-size:0.7rem; color:var(--ds-text-subtle); width:3rem;">{{ t }}</span>
          <StepDots :total="t" :current="1" />
        </div>
      </div>
    `,
  }),
}
