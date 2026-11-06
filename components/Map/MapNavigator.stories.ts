import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import MapNavigator from './MapNavigator.vue'
import MapOverlay from './MapOverlay.vue'
import { easing } from '../../tokens/dist/index.js'

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
          'La mini-carte est celle du moteur (`#default`) : le système dessine son cadre.\n\n' +
          '**Sans mini-carte** (aucun `#default`, ADR-0120 — la présence décide) : la barre seule, − la jauge + et ' +
          '« Recentrer », dans l’habit de la forme repliée ; ni filet, ni bouton de mini-carte, `v-model:collapsed` ignoré.',
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

export const WithoutMinimap: Story = {
  name: 'Sans mini-carte',
  parameters: {
    docs: {
      description: {
        story:
          'Aucun `#default` : rien à replier. La barre garde la hauteur et le rayon de la forme repliée, ' +
          'à 16px du coin de la carte (`MapOverlay`, ADR-0117) ; les noms et les infobulles ne changent pas.',
      },
    },
  },
  render: () => ({
    components: { MapNavigator, MapOverlay },
    setup: () => ({ zoom: ref(8) }),
    template: `
      <div style="position:relative;width:480px;height:240px;background:var(--ds-bg-neutral);border-radius:12px;overflow:hidden">
        <MapOverlay position="top-end">
          <MapNavigator v-model:zoom="zoom" @recenter="zoom = 8" />
        </MapOverlay>
      </div>
    `,
  }),
}

/* A map that moves as an engine does: a requested zoom is travelled over
   300ms, and the zoom it passes through is written back every frame —
   fractional, as `v-model:zoom` receives it from the product. */
export const FollowsTheMap: Story = {
  name: 'Suit une carte qui bouge',
  parameters: {
    docs: {
      description: {
        story:
          'Le produit passe le zoom de la carte **en continu** (13,62…) : la jauge montre toute valeur, sans arrondi. ' +
          'Molette, « Recentrer » : le curseur suit la carte image par image, sans transition. − / + et les flèches : ' +
          'le curseur glisse vers le niveau visé sur `duration-process` + `easing-in-out`, au rythme de la carte, ' +
          'sans être tiré en arrière par les valeurs qu’elle traverse. Glisser : le curseur reste sous le doigt. ' +
          'Rien ne glisse sous `prefers-reduced-motion`.',
      },
    },
  },
  render: () => ({
    components: { MapNavigator, MapOverlay },
    setup() {
      const zoom = ref(10)
      let raf = 0
      const fly = (to: number) => {
        cancelAnimationFrame(raf)
        const from = zoom.value
        const t0 = performance.now()
        const tick = (now: number) => {
          const t = Math.min(1, (now - t0) / 300)
          zoom.value = from + (to - from) * easing.inOut(t)
          if (t < 1) raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
      }
      const wheel = (e: WheelEvent) => {
        e.preventDefault()
        cancelAnimationFrame(raf)
        zoom.value = Math.min(20, Math.max(0, zoom.value - e.deltaY / 120))
      }
      const scale = () => 2 ** ((zoom.value - 10) / 2)
      return { zoom, fly, wheel, scale }
    },
    template: `
      <div @wheel="wheel" style="position:relative;width:560px;height:320px;background:var(--ds-bg-neutral);border-radius:12px;overflow:hidden">
        <svg viewBox="-100 -100 200 200" style="position:absolute;inset:0;width:100%;height:100%">
          <g :transform="'scale(' + scale() + ')'">
            <rect x="-60" y="-40" width="120" height="80" rx="6" fill="none" stroke="var(--ds-border-default)" stroke-dasharray="3 3" />
            <circle r="18" fill="none" stroke="var(--ds-bg-brand-solid)" />
            <rect x="-3" y="-3" width="6" height="6" rx="1.5" fill="var(--ds-bg-brand-solid)" />
          </g>
        </svg>
        <MapOverlay position="top-end">
          <MapNavigator :zoom="zoom" @update:zoom="fly" @recenter="fly(10)" />
        </MapOverlay>
        <span style="position:absolute;left:16px;bottom:12px;font:var(--ds-font-body-sm);color:var(--ds-text-subtle)">Zoom {{ zoom.toFixed(2) }}</span>
      </div>
    `,
  }),
}

/**
 * **Avant la carte** (ADR-0122) : tant que la carte n’existe pas, chaque commande est là et éteinte — le coin garde
 * sa forme, rien ne bouge quand la carte arrive. Jamais après : une carte se zoome toujours.
 */
export const Disabled: Story = {
  name: 'Avant la carte',
  render: () => ({
    components: { MapNavigator },
    template: `
      <div style="background:var(--ds-bg-neutral);width:360px;box-sizing:border-box;padding:24px;border-radius:12px;display:flex;flex-direction:column;align-items:flex-end;gap:16px">
        <MapNavigator disabled>${minimap}</MapNavigator>
        <MapNavigator disabled />
      </div>
    `,
  }),
}
