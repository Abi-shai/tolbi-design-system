import type { Meta, StoryObj } from '@storybook/vue3'
import SideNavItem from './SideNavItem.vue'

const meta: Meta = {
  title: 'Navigation/SideNavigation/Item',
  component: SideNavItem,
  tags: ['wip'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          "Une ligne de `SideNavigation`. Rend un `<button>`, ou un `<a>` si `href` est fourni (ADR-0014). " +
          "Elle n'a pas de fond : l'état sélectionné est peint par la pastille du groupe, un item opaque " +
          "la masquerait. Hors d'un `SideNavigation` elle fonctionne, mais ne se signale jamais sélectionnée.",
      },
    },
  },
  argTypes: {
    icon: { control: 'text' },
    label: { control: 'text' },
    href: { control: 'text' },
    disabled: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof meta>

/** Posé sur le fond récessé que `SideNavigation` fournit normalement. */
const onGround = (inner: string) => ({
  components: { SideNavItem },
  template: `
    <div style="width: 228px; padding: 16px; background: var(--ds-bg-neutral); border-radius: 12px;">
      ${inner}
    </div>
  `,
})

export const Default: Story = {
  render: () => onGround('<SideNavItem icon="house" label="Accueil" />'),
}

export const Disabled: Story = {
  name: 'Désactivé',
  render: () => onGround('<SideNavItem icon="chart-column" label="Rapports" disabled />'),
}

export const AsLink: Story = {
  name: 'Lien',
  render: () => onGround('<SideNavItem icon="map" label="Parcelles" href="#parcelles" />'),
}
