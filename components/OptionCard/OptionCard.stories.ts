import type { Meta, StoryObj } from '@storybook/vue3'
import OptionCard from './OptionCard.vue'

const meta: Meta<typeof OptionCard> = {
  title: 'Saisie/OptionList/Card',
  component: OptionCard,
  tags: ['stable'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Une option présentée comme une carte (ADR-0086) : le média au début, le titre et sa phrase, une ' +
          'méta, et **le contrôle à la fin** — là où un chevron doit être.\n\n' +
          'Dans une `OptionList`, c’est une **vraie case ou un vrai bouton radio caché**, dont la carte est ' +
          'le label : le clavier est celui du navigateur, pas le nôtre. **Seule**, avec `href` ou un clic, ' +
          'c’est le même dessin mais **une rangée qui mène** — un `<a>` ou un `<button>`, un chevron à la ' +
          'place du contrôle, et **aucun état choisi** : une rangée qui mène ne se choisit pas.\n\n' +
          'Le survol est le **contour seul**, parce qu’un fond avalerait la tuile de l’icône — `bg-hover` ' +
          'est justement son primitif.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof OptionCard>

/** Seule : une rangée qui mène. Chevron, pas de contrôle, pas d’état choisi. */
export const Leading: Story = {
  name: 'Une rangée qui mène',
  render: () => ({
    components: { OptionCard },
    template: `
      <div style="display:flex;flex-direction:column;gap:12px;max-width:420px">
        <OptionCard
          href="#cacao"
          icon="leaf"
          label="Cacao"
          description="Theobroma cacao — SH 1801"
          meta="128 ha"
        />
        <OptionCard
          href="#hevea"
          icon="trees"
          label="Hévéa"
          description="Hevea brasiliensis — SH 4001"
          meta="74 ha"
        />
      </div>
    `,
  }),
}

/** Les médias : une icône sur sa tuile, un avatar, un drapeau. */
export const Media: Story = {
  name: 'Les trois médias',
  render: () => ({
    components: { OptionCard },
    template: `
      <div style="display:flex;flex-direction:column;gap:12px;max-width:420px">
        <OptionCard href="#a" icon="land-plot" label="Parcelle 62590-014" description="Soubré · 3,42 ha" />
        <OptionCard href="#b" avatar-initials="AD" label="Awa Diop" description="Responsable conformité" />
        <OptionCard href="#c" flag="CI" label="Côte d’Ivoire" description="Pays de récolte" />
      </div>
    `,
  }),
}

/** Désactivée : le contour, le fond et toutes les encres reculent ensemble. */
export const Disabled: Story = {
  name: 'Désactivée',
  render: () => ({
    components: { OptionCard },
    template: `
      <div style="max-width:420px">
        <OptionCard icon="leaf" label="Café" description="Coffea canephora — SH 0901" meta="22 ha" disabled />
      </div>
    `,
  }),
}
