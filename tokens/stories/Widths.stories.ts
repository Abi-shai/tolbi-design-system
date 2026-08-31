import type { Meta, StoryObj } from '@storybook/vue3'
import widths from '../src/widths/semantic.json'
import WidthRow from './components/WidthRow.vue'

const entries = Object.entries(widths.width).map(([name, token]) => ({
  name,
  cssVar: `--ds-width-${name}`,
  px: token.description ?? '',
  value: parseInt(token.description ?? '0', 10),
}))

const max = Math.max(...entries.map(e => e.value))

const rows = entries.map(e => ({
  ...e,
  ratio: e.value / max,
  highlight: e.name === 'paragraph-max',
}))

const meta: Meta = {
  title: 'Foundations/Widths',
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Ramp: Story = {
  name: 'Échelle',
  render: () => ({
    components: { WidthRow },
    setup: () => ({ rows }),
    template: `
      <div style="padding: 1.5rem; font-family: var(--ds-typography-font-family-poppins);">
        <p style="font-size: 0.8rem; color: var(--ds-text-subtle); max-width: 44rem; margin: 0 0 1.5rem;">
          Largeurs de conteneurs et de surfaces — modales, panneaux, colonnes de contenu.
          Barres proportionnelles, ${max}px = pleine largeur.
          <strong>paragraph-max</strong> (en jaune) n'est pas une marche de l'échelle : c'est le plafond
          de mesure pour du texte long.
        </p>
        <WidthRow
          v-for="r in rows"
          :key="r.name"
          :label="r.cssVar.replace('--ds-', '')"
          :css-var="r.cssVar"
          :px="r.px"
          :ratio="r.ratio"
          :highlight="r.highlight"
        />
      </div>
    `,
  }),
}

export const Measure: Story = {
  name: 'paragraph-max en usage',
  render: () => ({
    template: `
      <div style="padding: 1.5rem; font-family: var(--ds-typography-font-family-poppins);">
        <p style="font-size: 0.8rem; color: var(--ds-text-subtle); margin: 0 0 1rem;">
          Le même paragraphe, sans plafond puis borné à <code>var(--ds-width-paragraph-max)</code> (720px).
        </p>

        <p style="font-size: var(--ds-font-size-body-md); line-height: var(--ds-line-height-body-md); color: var(--ds-text-default); margin: 0 0 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--ds-border-subtlest);">
          La traçabilité d'une filière ne se résume pas à un identifiant de parcelle. Elle suppose de
          relier chaque lot à son exploitation, chaque exploitation à son opérateur, et chaque opérateur
          aux obligations de diligence raisonnée qui lui incombent — sur toute la chaîne, du planteur
          jusqu'à la mise sur le marché européen.
        </p>

        <p style="max-width: var(--ds-width-paragraph-max); font-size: var(--ds-font-size-body-md); line-height: var(--ds-line-height-body-md); color: var(--ds-text-default); margin: 0;">
          La traçabilité d'une filière ne se résume pas à un identifiant de parcelle. Elle suppose de
          relier chaque lot à son exploitation, chaque exploitation à son opérateur, et chaque opérateur
          aux obligations de diligence raisonnée qui lui incombent — sur toute la chaîne, du planteur
          jusqu'à la mise sur le marché européen.
        </p>
      </div>
    `,
  }),
}
