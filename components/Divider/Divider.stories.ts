import type { Meta, StoryObj } from '@storybook/vue3'
import Divider from './Divider.vue'

const meta: Meta<typeof Divider> = {
  title: 'Structure/Divider',
  component: Divider,
  tags: ['stable', 'primitive'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Un filet (ADR-0088, piste A) : `border-subtle`, **sans marge** — l’espace autour est celui de la mise en page. Seul, ' +
          'c’est un séparateur (`<hr>`, ou `role="separator"` debout dans une barre). Avec un `label`, il n’en est plus un : les ' +
          'traits sont décoratifs et le libellé est du texte lu à sa place. `align="start"` garde 8 px de trait avant lui, ' +
          '`center` pour « ou ».',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

const P = 'margin:0; font:var(--ds-font-body-md); color:var(--ds-text-subtle)'

export const Forms: Story = {
  name: 'Formes',
  render: () => ({
    components: { Divider },
    setup: () => ({ P }),
    template: `
      <div style="display:flex; flex-direction:column; gap:var(--ds-spacing-3xl); max-width:420px">
        <div style="display:flex; flex-direction:column; gap:var(--ds-spacing-lg)"><p :style="P">Informations du commerçant</p><Divider /><p :style="P">Produits liés</p></div>
        <div style="display:flex; flex-direction:column; gap:var(--ds-spacing-lg)"><p :style="P">Informations du commerçant</p><Divider label="Identifiants" /><p :style="P">TVA, EORI</p></div>
        <div style="display:flex; flex-direction:column; gap:var(--ds-spacing-lg)"><p :style="P">Se connecter avec un e-mail</p><Divider label="ou" align="center" /><p :style="P">Se connecter avec Google</p></div>
        <div style="display:flex; align-items:center; gap:var(--ds-spacing-lg)"><span :style="P">Filtrer</span><Divider orientation="vertical" /><span :style="P">Trier</span></div>
      </div>
    `,
  }),
}
