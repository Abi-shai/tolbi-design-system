import type { Meta, StoryObj } from '@storybook/vue3'
import { ModuleCapsule } from '.'

/**
 * One module on the home page's dark band — **the band of 14 September, compact** (ADR-0202, variant N2), about
 * 56px: which module (a 40px tile, the module over the name, 170px fixed), how much (the figure and its unit, one line
 * of context), made of what (a segmented bar and its legend), where it stands (the status over the date). Dark and
 * neutral on any page; the props of the first form still work.
 */
const meta: Meta<typeof ModuleCapsule> = {
  title: 'Données/ModuleCapsule',
  component: ModuleCapsule,
  tags: ['stable'],
  // In its band, as the home page sets it: `gray-light-800`, the capsule hollowed into it.
  decorators: [
    () => ({
      template:
        '<div style="display:flex; padding: var(--ds-spacing-sm) var(--ds-spacing-lg); border-radius: var(--ds-radius-surface); background: var(--ds-color-gray-light-800); width: fit-content">' +
        '<story /></div>',
    }),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

/** TOLBI ID: the figure, one line of context made from its two signals, the date alone (no status). */
export const Default: Story = {
  args: {
    module: 'ID',
    moduleLabel: 'TOLBI ID',
    title: 'Cacao Démo SA',
    value: '1 284',
    unit: 'producteurs',
    signals: [
      { icon: 'land-plot', label: '2 316 parcelles' },
      { icon: 'ruler', label: '4 120 ha' },
    ],
    freshness: 'Mis à jour hier',
  },
}

/** TOLBI Scan: signals that are shares become the spread — the bar and its legend; the status over the year. */
export const Spread: Story = {
  name: 'Répartition',
  args: {
    module: 'Scan',
    moduleLabel: 'TOLBI Scan',
    title: 'Kaolack — campagne 2026',
    status: { label: 'Terminé', tone: 'success', variant: 'pill-outline' },
    value: '3 812,40',
    unit: 'ha cartographiés',
    signals: [
      { icon: 'sprout', label: 'Arachide 58 %' },
      { icon: 'wheat', label: 'Mil 27 %' },
    ],
    freshness: '2026',
  },
}

/** TOLBI Source: its progress becomes a spread of one part, the rest grey; its signals the context line. */
export const Progress: Story = {
  name: 'Progression',
  args: {
    module: 'Source',
    moduleLabel: 'TOLBI Source',
    title: 'Collecte cacao — 1er kilomètre',
    status: { label: 'En cours', tone: 'warning', variant: 'pill-outline' },
    value: '12,4',
    unit: 'tonnes collectées',
    progress: { label: 'Traçabilité', value: 46 },
    signals: [
      { icon: 'users', label: '18 agents' },
      { icon: 'rows-3', label: '6 étapes' },
    ],
    freshness: 'Dernière saisie il y a 40 min',
  },
}

/** Said directly: `context` and `spread`, the props of the compact form. */
export const Direct: Story = {
  name: '`context` et `spread`',
  args: {
    module: 'Scan',
    moduleLabel: 'TOLBI Scan',
    title: 'Kaffrine — campagne 2026',
    status: { label: 'Terminé', tone: 'success', variant: 'pill-outline' },
    value: '2 140,15',
    unit: 'ha cartographiés',
    context: '3 cultures',
    spread: [
      { label: 'Mil', value: 64 },
      { label: 'Arachide', value: 21 },
      { label: 'Niébé', value: 9 },
    ],
    freshness: '2026',
  },
}

/** A long name is cut in its 170px; the capsule keeps its width. */
export const LongName: Story = {
  name: 'Nom long',
  args: { ...Default.args, title: 'Coopérative des producteurs de cacao de Soubré — section nord' },
}

/** Identity alone: no figure, no rule. */
export const IdentityOnly: Story = {
  name: 'Identité seule',
  args: { module: 'Data', moduleLabel: 'TOLBI Data', title: 'Recensement ménages — Kaolack', freshness: 'Mis à jour hier' },
}
