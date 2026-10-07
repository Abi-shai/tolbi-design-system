import type { Meta, StoryObj } from '@storybook/vue3'
import TolbiAiThinkingLine from './TolbiAiThinkingLine.vue'

const meta: Meta<typeof TolbiAiThinkingLine> = {
  title: 'Feedback & chargement/TolbiAiThinkingLine',
  component: TolbiAiThinkingLine,
  tags: ['autodocs', 'wip'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Tolbi AI travaille : une ligne, là où la réponse va s\'afficher. Les feuilles qui ' +
          'tournent (`TolbiAiSpark` en 16, `state="thinking"`) et quelques mots en body-sm, ' +
          'text-subtlest ; le texte ne bouge pas. Au-delà de 10 s, un second texte. Le statut ' +
          'est annoncé aux lecteurs d\'écran, une fois par texte. La réponse prend sa place ' +
          '(ADR-0058).',
      },
    },
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'Ce que fait Tolbi AI, en quelques mots.',
      table: { category: 'Contenu', defaultValue: { summary: '« Je lis les données du projet… »' } },
    },
    longWaitLabel: {
      control: 'text',
      description: 'Le texte quand l\'attente devient longue. `null` garde `label` jusqu\'au bout.',
      table: {
        category: 'Contenu',
        type: { summary: 'string | null' },
        defaultValue: { summary: '« Encore un instant… »' },
      },
    },
    longWaitAfter: {
      control: 'number',
      description: 'Quand l\'attente devient longue, en ms, depuis l\'apparition de la ligne.',
      table: { category: 'Comportement', defaultValue: { summary: '10000' } },
    },
  },
  args: {
    label: 'Je lis les données du projet…',
    longWaitLabel: 'Encore un instant…',
    longWaitAfter: 10000,
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Le second texte arrive à 3 s ici, pour qu'on le voie ; 10 s par défaut. */
export const LongWait: Story = {
  name: 'Attente longue',
  args: { longWaitAfter: 3000 },
}

/** Là où elle vit : sous la question, à la place de la réponse qui arrive. */
export const InThread: Story = {
  name: 'Dans le fil',
  render: (args) => ({
    components: { TolbiAiThinkingLine },
    setup: () => ({ args }),
    template: `
      <div style="width:400px; box-sizing:border-box; padding:var(--ds-spacing-xl); display:flex; flex-direction:column; gap:var(--ds-spacing-xl); background:var(--ds-bg-default); border:var(--ds-border-width-default) solid var(--ds-border-subtle); border-radius:var(--ds-radius-surface);">
        <p style="align-self:flex-end; margin:0; max-width:80%; padding:var(--ds-spacing-md) var(--ds-spacing-lg); border-radius:var(--ds-radius-control); background:var(--ds-bg-neutral); font:var(--ds-font-body-md); color:var(--ds-text-default);">
          Pourquoi la parcelle de Modou Sène a produit moins que les autres ?
        </p>
        <TolbiAiThinkingLine v-bind="args" />
      </div>
    `,
  }),
}
