import type { Meta, StoryObj } from '@storybook/vue3'
import BrandPattern from './BrandPattern.vue'
import BrandPatternDocs from './BrandPattern.mdx'
import Button from '../Button/Button.vue'
import Card from '../Card/Card.vue'
import { tile } from './tile'

const meta: Meta<typeof BrandPattern> = {
  title: 'Identité & média/BrandPattern',
  component: BrandPattern,
  tags: ['autodocs', 'stable'],
  parameters: {
    layout: 'padded',
    docs: { page: BrandPatternDocs },
  },
  argTypes: {
    surface: {
      control: 'inline-radio',
      options: ['inverse', 'brand', 'neutral'],
      description:
        'Le fond imprimé et l\'encre qui s\'y lit — les deux voyagent ensemble. ' +
        '`inverse` est la planche de marque (encre blanche sur fond sombre) et ' +
        's\'inverse avec le mode. `brand` pose le motif sur le vert. `neutral` ' +
        'est la version claire.',
      table: {
        category: 'Apparence',
        type: { summary: "'inverse' | 'brand' | 'neutral'" },
        defaultValue: { summary: "'inverse'" },
      },
    },
    scale: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      description:
        'Taille du motif. Chaque cran double la marque ; `lg` est la taille de ' +
        'la planche Figma, `md` celle qui se lit comme un fond de page.',
      table: {
        category: 'Apparence',
        type: { summary: "'sm' | 'md' | 'lg'" },
        defaultValue: { summary: "'md'" },
      },
    },
    padding: {
      control: 'inline-radio',
      options: ['none', 'sm', 'md', 'lg'],
      description: 'Même vocabulaire que `Card`, pour que les deux se calent pareil.',
      table: {
        category: 'Apparence',
        type: { summary: "'none' | 'sm' | 'md' | 'lg'" },
        defaultValue: { summary: "'none'" },
      },
    },
    default: {
      description: 'Ce qui se pose sur le motif. Le composant lui donne sa couleur de texte.',
      table: { category: 'Contenu' },
    },
  },
  args: {
    surface: 'inverse',
    scale: 'md',
    padding: 'lg',
  },
}

export default meta
type Story = StoryObj<typeof meta>

const HERO = `
  <div style="display:flex; flex-direction:column; gap:var(--ds-spacing-lg); min-height:200px; justify-content:center;">
    <span style="font: var(--ds-font-heading-lg);">Une campagne, toutes vos parcelles</span>
    <span style="font: var(--ds-font-body-md); opacity:0.85; max-width:44ch;">
      Le motif de marque tient le fond ; ce qui se pose dessus reste lisible parce que
      le composant possède la paire.
    </span>
  </div>
`

export const Default: Story = {
  name: 'Default',
  render: (args) => ({
    components: { BrandPattern },
    setup: () => ({ args }),
    template: `<BrandPattern v-bind="args">${HERO}</BrandPattern>`,
  }),
}

export const Surfaces: Story = {
  name: 'Surfaces',
  parameters: {
    docs: {
      description: {
        story:
          'Trois fonds, pas un de plus — et chacun nomme son encre. Un motif est ' +
          'toujours le fond de quelque chose, donc le composant qui peint la surface ' +
          'possède aussi ce qui s\'y lit (ADR-0006). L\'encre est à 20 % partout : ' +
          'le contraste texture/fond mesure entre 1,41:1 et 1,84:1 selon le fond, ' +
          'et le double là où la planche empile deux tampons.',
      },
    },
  },
  render: () => ({
    components: { BrandPattern },
    setup: () => ({
      surfaces: [
        { name: 'inverse' as const, label: 'inverse — la planche de marque' },
        { name: 'brand' as const, label: 'brand — sur le vert' },
        { name: 'neutral' as const, label: 'neutral — la version claire' },
      ],
    }),
    template: `
      <div style="display:flex; flex-direction:column; gap:var(--ds-spacing-3xl);">
        <div v-for="s in surfaces" :key="s.name" style="display:flex; flex-direction:column; gap:var(--ds-spacing-md);">
          <span style="font: var(--ds-font-label-xs); color:var(--ds-text-subtle);">{{ s.label }}</span>
          <BrandPattern :surface="s.name" padding="lg">
            <div style="min-height:140px; display:flex; align-items:center; font: var(--ds-font-heading-sm);">Tolbi</div>
          </BrandPattern>
        </div>
      </div>
    `,
  }),
}

export const Scales: Story = {
  name: 'Tailles du motif',
  parameters: {
    docs: {
      description: {
        story:
          'Chaque cran double la marque. `lg` est la taille que Figma dessine — mais ' +
          'une largeur dessinée est un plafond, pas une taille : la planche fait 3538px ' +
          'de large et rien dans le produit n\'en fait autant. `md` est le défaut parce ' +
          'que c\'est le cran qui se lit comme un fond de page.',
      },
    },
  },
  render: () => ({
    components: { BrandPattern },
    setup: () => ({ scales: ['sm', 'md', 'lg'] as const, tile }),
    template: `
      <div style="display:flex; flex-direction:column; gap:var(--ds-spacing-3xl);">
        <div v-for="s in scales" :key="s" style="display:flex; flex-direction:column; gap:var(--ds-spacing-md);">
          <span style="font: var(--ds-font-label-xs); color:var(--ds-text-subtle);">
            {{ s }}<span v-if="s === 'md'"> — défaut</span>
          </span>
          <BrandPattern :scale="s">
            <div style="min-height:160px;"></div>
          </BrandPattern>
        </div>
      </div>
    `,
  }),
}

export const InACard: Story = {
  name: 'Dans une Card',
  parameters: {
    docs: {
      description: {
        story:
          'Le rayon n\'est pas une prop : il est *hérité*. Le motif prend la forme de ' +
          'ce dans quoi on le dépose, donc `Card padding="none"` suffit et aucun ' +
          'sixième rayon n\'apparaît dans le catalogue (ADR-0006).',
      },
    },
  },
  render: () => ({
    components: { BrandPattern, Card, Button },
    template: `
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:var(--ds-spacing-3xl); max-width:760px;">
        <Card variant="outlined" padding="none">
          <BrandPattern surface="inverse" scale="sm" padding="lg">
            <div style="display:flex; flex-direction:column; gap:var(--ds-spacing-md); min-height:120px; justify-content:flex-end;">
              <span style="font: var(--ds-font-heading-sm);">Campagne 2026</span>
              <span style="font: var(--ds-font-body-sm); opacity:0.85;">12 parcelles suivies</span>
            </div>
          </BrandPattern>
          <div style="padding:var(--ds-spacing-xl);">
            <Button variant="secondary-gray" size="sm" label="Ouvrir" />
          </div>
        </Card>

        <Card variant="outlined" padding="none">
          <BrandPattern surface="brand" scale="sm" padding="lg">
            <div style="display:flex; flex-direction:column; gap:var(--ds-spacing-md); min-height:120px; justify-content:flex-end;">
              <span style="font: var(--ds-font-heading-sm);">Tolbi Yield</span>
              <span style="font: var(--ds-font-body-sm); opacity:0.85;">Rendement estimé</span>
            </div>
          </BrandPattern>
          <div style="padding:var(--ds-spacing-xl);">
            <Button variant="secondary-gray" size="sm" label="Ouvrir" />
          </div>
        </Card>
      </div>
    `,
  }),
}

export const Seamless: Story = {
  name: 'Le raccord',
  parameters: {
    docs: {
      description: {
        story:
          `La tuile fait ${tile.width} × ${Math.round(tile.height)} et se répète sans couture : ` +
          'chaque tampon est replié dans la tuile puis redessiné à chaque décalage voisin ' +
          'qu\'il atteint encore. Rien n\'a besoin de tomber juste pour que ça marche — ' +
          'c\'est ce qui permet d\'arrondir le pas relevé sur la planche. La bande ci-dessous ' +
          'fait plusieurs tuiles de large et de haut : la couture n\'est nulle part.',
      },
    },
  },
  render: () => ({
    components: { BrandPattern },
    template: `
      <BrandPattern surface="inverse" scale="sm">
        <div style="min-height:520px;"></div>
      </BrandPattern>
    `,
  }),
}
