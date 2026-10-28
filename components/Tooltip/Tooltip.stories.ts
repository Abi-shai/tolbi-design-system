import type { Meta, StoryObj } from '@storybook/vue3'
import Tooltip from './Tooltip.vue'
import { Button } from '../Button'
import { IconButton } from '../IconButton'
import TooltipDocs from './Tooltip.mdx'

const meta: Meta<typeof Tooltip> = {
  title: 'Superposition/Tooltip',
  component: Tooltip,
  tags: ['stable'],
  parameters: {
    layout: 'centered',
    docs: { page: TooltipDocs },
  },
  argTypes: {
    title: {
      control: 'text',
      table: { category: 'Contenu' },
    },
    supportingText: {
      control: 'text',
      table: { category: 'Contenu' },
    },
    arrow: {
      control: 'select',
      options: ['none', 'bottom-center', 'bottom-left', 'bottom-right', 'top-center', 'top-left', 'top-right', 'left', 'right'],
      table: { category: 'Apparence', defaultValue: { summary: "'none'" } },
    },
  },
  args: {
    title: 'This is a tooltip',
    arrow: 'none',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithSupportingText: Story = {
  name: 'Avec texte secondaire',
  args: {
    supportingText: 'Tooltips are used to describe or identify an element. In most scenarios, tooltips help the user understand meaning, function or alt-text.',
  },
}

export const BottomCenter: Story = {
  name: 'Flèche — bottom center',
  args: { arrow: 'bottom-center' },
}

export const BottomLeft: Story = {
  name: 'Flèche — bottom left',
  args: { arrow: 'bottom-left' },
}

export const BottomRight: Story = {
  name: 'Flèche — bottom right',
  args: { arrow: 'bottom-right' },
}

export const TopCenter: Story = {
  name: 'Flèche — top center',
  args: { arrow: 'top-center' },
}

export const TopLeft: Story = {
  name: 'Flèche — top left',
  args: { arrow: 'top-left' },
}

export const TopRight: Story = {
  name: 'Flèche — top right',
  args: { arrow: 'top-right' },
}

export const Left: Story = {
  name: 'Flèche — left',
  args: { arrow: 'left' },
}

export const Right: Story = {
  name: 'Flèche — right',
  args: { arrow: 'right' },
}

export const AllArrows: Story = {
  name: 'Toutes les directions',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { Tooltip },
    template: `
      <div style="display:flex;flex-wrap:wrap;gap:32px;align-items:center;justify-content:center;padding:32px;">
        <Tooltip title="none"          arrow="none" />
        <Tooltip title="bottom-center" arrow="bottom-center" />
        <Tooltip title="bottom-left"   arrow="bottom-left" />
        <Tooltip title="bottom-right"  arrow="bottom-right" />
        <Tooltip title="top-center"    arrow="top-center" />
        <Tooltip title="top-left"      arrow="top-left" />
        <Tooltip title="top-right"     arrow="top-right" />
        <Tooltip title="left"          arrow="left" />
        <Tooltip title="right"         arrow="right" />
      </div>
    `,
  }),
}

export const AllArrowsRich: Story = {
  name: 'Toutes les directions — avec texte secondaire',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { Tooltip },
    setup: () => ({
      supporting: 'Tooltips are used to describe or identify an element. In most scenarios, tooltips help the user understand meaning, function or alt-text.',
    }),
    template: `
      <div style="display:flex;flex-direction:column;gap:32px;align-items:flex-start;padding:32px;">
        <Tooltip title="This is a tooltip" :supporting-text="supporting" arrow="none" />
        <Tooltip title="This is a tooltip" :supporting-text="supporting" arrow="bottom-center" />
        <Tooltip title="This is a tooltip" :supporting-text="supporting" arrow="bottom-left" />
        <Tooltip title="This is a tooltip" :supporting-text="supporting" arrow="bottom-right" />
        <Tooltip title="This is a tooltip" :supporting-text="supporting" arrow="top-center" />
        <Tooltip title="This is a tooltip" :supporting-text="supporting" arrow="top-left" />
        <Tooltip title="This is a tooltip" :supporting-text="supporting" arrow="top-right" />
        <div style="display:flex;gap:32px;">
          <Tooltip title="This is a tooltip" :supporting-text="supporting" arrow="left" />
          <Tooltip title="This is a tooltip" :supporting-text="supporting" arrow="right" />
        </div>
      </div>
    `,
  }),
}

/**
 * ADR-0082 — ancrée : elle enveloppe son déclencheur et s’ouvre seule, 400 ms après le survol ou sur un focus
 * clavier ; elle part quand le pointeur ou le focus partent, quand on appuie, ou sur Échap. Dans la couche
 * supérieure, à `placement`, elle se retourne quand la place manque. Son texte décrit le déclencheur, sauf
 * s’il ne fait que répéter son nom. Un déclencheur désactivé la montre encore.
 */
export const Anchored: Story = {
  name: 'Ancrée à son déclencheur',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { Tooltip, Button, IconButton },
    setup: () => ({
      PLACEMENTS: ['top', 'top-start', 'top-end', 'bottom', 'bottom-start', 'bottom-end', 'left', 'right'],
    }),
    template: `
      <div style="display:flex; flex-direction:column; gap:var(--ds-spacing-5xl); padding:var(--ds-spacing-7xl) var(--ds-spacing-7xl)">
        <div style="display:flex; flex-wrap:wrap; gap:var(--ds-spacing-3xl)">
          <Tooltip v-for="p in PLACEMENTS" :key="p" :title="'placement=' + p" :placement="p">
            <Button :label="p" variant="secondary-gray" size="sm" />
          </Tooltip>
        </div>
        <div style="display:flex; gap:var(--ds-spacing-3xl); align-items:center">
          <Tooltip title="Exporter le rapport">
            <IconButton icon="download" ariaLabel="Exporter le rapport" variant="neutral" />
          </Tooltip>
          <Tooltip title="Envoyer la déclaration" supporting-text="Disponible quand les trois étapes sont faites.">
            <Button label="Envoyer" disabled />
          </Tooltip>
        </div>
      </div>
    `,
  }),
}

/** Contre le bord de l’écran, elle se retourne et reste dedans. */
export const AtTheEdge: Story = {
  name: 'Au bord de l’écran',
  parameters: { layout: 'fullscreen' },
  render: () => ({
    components: { Tooltip, Button },
    template: `
      <div style="height:100vh; display:flex; justify-content:space-between; align-items:flex-start">
        <Tooltip title="Elle s’ouvre dessous : il n’y a pas de place au-dessus" placement="top">
          <Button label="En haut à gauche" variant="secondary-gray" size="sm" />
        </Tooltip>
        <Tooltip title="Elle passe à gauche : il n’y a pas de place à droite" placement="right">
          <Button label="En haut à droite" variant="secondary-gray" size="sm" />
        </Tooltip>
      </div>
    `,
  }),
}

