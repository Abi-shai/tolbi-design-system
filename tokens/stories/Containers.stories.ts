import type { Meta, StoryObj } from '@storybook/vue3'
import containers from '../src/containers/semantic.json'

const rows = Object.entries(containers.container).map(([name, token]) => ({
  cssVar: `--ds-container-${name}`,
  px: token.description ?? '',
}))

const meta: Meta = {
  title: 'Foundations/Containers',
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Tokens: Story = {
  render: () => ({
    setup: () => ({ rows }),
    template: `
      <div style="padding: 1.5rem; font-family: var(--ds-typography-font-family-poppins);">
        <p style="font-size: 0.8rem; color: var(--ds-semantic-text-tertiary); max-width: 44rem; margin: 0 0 1.5rem;">
          Trois tokens seulement : la gouttière mobile, la gouttière desktop, et le plafond de la
          colonne de contenu. Toute page produit se cadre avec ces trois valeurs.
        </p>
        <table style="width: 100%; border-collapse: collapse;">
          <tbody>
            <tr v-for="r in rows" :key="r.cssVar" style="border-bottom: 1px solid var(--ds-semantic-border-tertiary);">
              <td style="padding: 0.6rem 1rem 0.6rem 0; font-family: monospace; font-size: 0.72rem; color: var(--ds-semantic-text-secondary);">{{ r.cssVar }}</td>
              <td style="padding: 0.6rem 0; font-family: monospace; font-size: 0.7rem; color: var(--ds-semantic-text-quarterary); text-align: right;">{{ r.px }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    `,
  }),
}

export const Layout: Story = {
  name: 'Cadrage de page',
  render: () => ({
    template: `
      <div style="font-family: var(--ds-typography-font-family-poppins);">
        <div style="padding: 1.5rem 1.5rem 0;">
          <p style="font-size: 0.8rem; color: var(--ds-semantic-text-tertiary); max-width: 44rem; margin: 0 0 1.5rem;">
            Gouttière desktop (32px, en jaune) de part et d'autre, colonne de contenu bornée à 1280px.
            Redimensionner le canvas : la colonne cesse de grandir au plafond, les gouttières tiennent.
          </p>
        </div>

        <div style="background: var(--ds-color-accent-100, #fef7c3); padding: 0 var(--ds-container-padding-desktop); min-height: 320px;">
          <div style="max-width: var(--ds-container-max-width-desktop); margin: 0 auto; background: var(--ds-semantic-bg-primary); border: 1px dashed var(--ds-semantic-border-primary); min-height: 320px; padding: var(--ds-spacing-xl);">
            <p style="font-size: var(--ds-font-size-heading-lg); line-height: var(--ds-line-height-heading-lg); letter-spacing: var(--ds-letter-spacing-heading-lg); font-weight: var(--ds-font-weight-heading-lg); color: var(--ds-semantic-text-primary); margin: 0 0 0.5rem;">
              Colonne de contenu
            </p>
            <p style="font-family: monospace; font-size: 0.72rem; color: var(--ds-semantic-text-quarterary); margin: 0;">
              max-width: var(--ds-container-max-width-desktop)
            </p>
          </div>
        </div>
      </div>
    `,
  }),
}
