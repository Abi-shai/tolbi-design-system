import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import MapNavigator from './MapNavigator.vue'

const meta: Meta<typeof MapNavigator> = {
  title: 'Données/Map/Navigator',
  component: MapNavigator,
  tags: ['wip'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Le **navigateur** d’une carte (ADR-0100, le dessin — piste A) : la mini-carte, et dessous − + et ' +
          '« Recentrer », **ensemble**. Il se replie en une barre de quatre boutons ; le curseur de zoom est retiré.\n\n' +
          'Les trois boutons **ne bougent jamais** : ouvert, la boîte a la largeur de la mini-carte ; replié, le ' +
          'bouton de la mini-carte prend la quatrième place, vide. Le pli est **une hauteur qui voyage** ' +
          '(`0fr → 1fr`, `enter` à l’ouverture, `exit` à la fermeture) ; le focus va au bouton qui remplace celui ' +
          'qu’on a pressé. La mini-carte est celle du moteur (`#default`) : le système dessine son cadre.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof MapNavigator>

const minimap = `
  <svg viewBox="0 0 140 105" style="display:block;width:100%;height:100%;background:var(--ds-bg-neutral-subtle)">
    <circle cx="70" cy="52" r="34" fill="none" stroke="var(--ds-chart-sequential-4)" stroke-dasharray="3 3" />
    <rect x="52" y="36" width="36" height="30" fill="none" stroke="var(--ds-text-strong)" stroke-width="1.5" />
    <circle cx="70" cy="52" r="3" fill="var(--ds-text-strong)" />
  </svg>`

export const Default: Story = {
  name: 'Ouvert',
  render: () => ({
    components: { MapNavigator },
    setup: () => ({ collapsed: ref(false) }),
    template: `
      <div style="background:var(--ds-bg-neutral);padding:24px;border-radius:12px;min-height:220px">
        <MapNavigator v-model:collapsed="collapsed">${minimap}</MapNavigator>
      </div>
    `,
  }),
}

export const Collapsed: Story = {
  name: 'Replié en barre',
  render: () => ({
    components: { MapNavigator },
    setup: () => ({ collapsed: ref(true) }),
    template: `
      <div style="background:var(--ds-bg-neutral);padding:24px;border-radius:12px;min-height:220px">
        <MapNavigator v-model:collapsed="collapsed">${minimap}</MapNavigator>
      </div>
    `,
  }),
}

export const AtLimit: Story = {
  name: 'Zoom à sa limite',
  render: () => ({
    components: { MapNavigator },
    template: `
      <div style="background:var(--ds-bg-neutral);padding:24px;border-radius:12px;min-height:220px">
        <MapNavigator zoom-in-disabled>${minimap}</MapNavigator>
      </div>
    `,
  }),
}
