import type { Meta, StoryObj } from '@storybook/vue3'
import StatGroup from './StatGroup.vue'
import { StatTile } from '../StatTile'

const meta: Meta<typeof StatGroup> = {
  title: 'Données/StatGroup',
  component: StatGroup,
  tags: ['stable'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Un **groupe de `StatTile`** (ADR-0131) — la grille que chaque produit posait lui-même. Il choisit **son nombre ' +
          'de colonnes selon sa propre largeur** (requête de conteneur, de 1 à 4 : une tuile jamais sous 10 rem, jamais ' +
          'plus de quatre par rangée), avec l’écart du paquet. Les tuiles d’une rangée **partagent leurs trois lignes** ' +
          '(libellé · chiffre · légende) en subgrid : les chiffres sur une ligne, les légendes sur une ligne. Un libellé ' +
          'd’une ligne à côté d’un libellé de deux se pose **contre son chiffre** ; la ligne en trop passe au-dessus.\n\n' +
          'Dans une tuile étroite, le chiffre passe de 32 à **24 px** — la même taille pour tout le groupe, l’unité sur sa ' +
          'ligne ; un nombre ne se coupe jamais. Libellé et légende tiennent en deux lignes, le libellé coupé se lit entier ' +
          'en infobulle.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof StatGroup>

const TILES = `
  <StatTile label="Crédits estimés" value="28 940" unit="tCO2e" />
  <StatTile label="|Z|" value="7,1" caption="seuil 1,96" />
  <StatTile label="Écart des points de contrôle" value="0,118" caption="seuil 0,25" />
  <StatTile label="Points mesurés" value="39" caption="sur 40 · couverture 99 %" />`

/** Le panneau d’une Dynamic baseline ARR : un `MapPanel lg` de 25 rem, donc 2 × 2 et des chiffres à 24 px. */
export const Panel: Story = {
  name: 'Panneau ARR · 25 rem (2 × 2)',
  render: () => ({
    components: { StatGroup, StatTile },
    template: `<div style="width:25rem;box-sizing:border-box;padding:var(--ds-spacing-xl);border:1px solid var(--ds-border-subtle);border-radius:var(--ds-radius-surface)">
      <StatGroup>${TILES}</StatGroup></div>`,
  }),
}

/** Le même groupe dans la fenêtre de données (2xl) : quatre colonnes, des chiffres à 32 px. */
export const Window: Story = {
  name: 'Fenêtre de données · 4 colonnes',
  render: () => ({
    components: { StatGroup, StatTile },
    template: `<div style="width:60rem"><StatGroup>${TILES}</StatGroup></div>`,
  }),
}

/** Un libellé trop long tient en deux lignes ; coupé, il se lit entier en infobulle. Une légende tient en deux lignes. */
export const LongLabel: Story = {
  name: 'Libellé coupé',
  render: () => ({
    components: { StatGroup, StatTile },
    template: `<div style="width:25rem"><StatGroup>
      <StatTile label="Écart moyen des points de contrôle face aux parcelles du projet" value="0,118" caption="seuil 0,25 · méthode VM0047, critère d’équivalence des points de contrôle" />
      <StatTile label="Points mesurés" value="39" caption="sur 40" />
    </StatGroup></div>`,
  }),
}
