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
          'Le **navigateur** d’une carte (ADR-0100, Figma « Carte/Navigateur ») en haut à droite, deux formes : ' +
          '**ouvert**, la mini-carte avec son pli dans le coin et dessous − **la jauge de zoom** + et « Recentrer » ; ' +
          '**replié**, une barre — le bouton de la mini-carte, un filet, − + « Recentrer ».\n\n' +
          'Le zoom est un modèle (`v-model:zoom`, entre `zoomMin` et `zoomMax`) : la jauge le montre et le déplace, ' +
          '− et + le font avancer d’un `zoomStep` et s’arrêtent aux bouts. Le pli est une surface qui part et une autre ' +
          'qui arrive au même coin (`SurfaceTransition`) ; le focus va au bouton qui a remplacé celui pressé. ' +
          'La mini-carte est celle du moteur (`#default`) : le système dessine son cadre.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof MapNavigator>

const minimap = `
  <svg viewBox="0 0 148 96" style="display:block;width:100%;height:100%;background:var(--ds-bg-neutral-subtle)">
    <circle cx="74" cy="48" r="40" fill="none" stroke="var(--ds-bg-brand-solid)" stroke-dasharray="3 3" />
    <rect x="29" y="3" width="91" height="91" rx="3" fill="none" stroke="var(--ds-text-strong)" stroke-width="1.2" />
    <rect x="71" y="45" width="6" height="6" rx="1.5" fill="var(--ds-bg-brand-solid)" />
  </svg>`

export const Default: Story = {
  name: 'Ouvert',
  render: () => ({
    components: { MapNavigator },
    setup: () => ({ collapsed: ref(false), zoom: ref(8) }),
    template: `
      <div style="background:var(--ds-bg-neutral);width:320px;box-sizing:border-box;padding:24px;border-radius:12px;min-height:220px;display:flex;justify-content:flex-end">
        <MapNavigator v-model:collapsed="collapsed" v-model:zoom="zoom">${minimap}</MapNavigator>
      </div>
    `,
  }),
}

export const Collapsed: Story = {
  name: 'Replié en barre',
  render: () => ({
    components: { MapNavigator },
    setup: () => ({ collapsed: ref(true), zoom: ref(8) }),
    template: `
      <div style="background:var(--ds-bg-neutral);width:320px;box-sizing:border-box;padding:24px;border-radius:12px;min-height:220px;display:flex;justify-content:flex-end">
        <MapNavigator v-model:collapsed="collapsed" v-model:zoom="zoom">${minimap}</MapNavigator>
      </div>
    `,
  }),
}

export const AtLimit: Story = {
  name: 'Zoom à sa limite',
  render: () => ({
    components: { MapNavigator },
    template: `
      <div style="background:var(--ds-bg-neutral);width:320px;box-sizing:border-box;padding:24px;border-radius:12px;min-height:220px;display:flex;justify-content:flex-end">
        <MapNavigator :zoom="20">${minimap}</MapNavigator>
      </div>
    `,
  }),
}
