import type { Meta, StoryObj } from '@storybook/vue3'
import { within, expect, userEvent, fn } from '@storybook/test'
import { ref } from 'vue'
import MapTopBar from './MapTopBar.vue'
import MapOverlay from './MapOverlay.vue'
import MapPanel from './MapPanel.vue'
import MapNavigator from './MapNavigator.vue'
import MapLegend from './MapLegend.vue'
import { Button } from '../Button'
import { DropdownItem, DropdownDivider } from '../Dropdown'
import { HorizontalNavigation } from '../HorizontalNavigation'
import { BarTransition } from '../BarTransition'
import { SwapTransition } from '../SwapTransition'

const VIEWS = [
  { value: 'map', label: 'Carte', icon: 'map' as const },
  { value: 'analytics', label: 'Analytics', icon: 'chart-column' as const },
]

const TOOLS = [
  { value: 'search', icon: 'search' as const, label: 'Rechercher' },
  { value: 'filters', icon: 'filter' as const, label: 'Filtres' },
]

/* The map under the bar: the whole surface, no column margins (ADR-0216). */
const MAP =
  'position:relative; height:720px; overflow:hidden; --ds-map-overlay-top: calc(3.5rem + var(--ds-spacing-lg)); ' +
  "background:url('./stories/map-loading/parcels.webp') center / cover no-repeat, url('./stories/map-loading/base.webp') center / cover no-repeat;"

const BAR = 'position:absolute; inset:0 0 auto 0; z-index:2'

const meta: Meta<typeof MapTopBar> = {
  title: 'Données/Map/TopBar',
  component: MapTopBar,
  /* wip: first release — three GIS screens are its consumers, none has it yet. */
  tags: ['wip'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'La barre d’un projet SIG (ADR-0216) : dans Carbone (Inset), la zone d’éligibilité et la Dynamic baseline, la ' +
          'barre globale cède la place à celle du projet, posée sur la carte (Felt ; 9 produits cartographiques sur 17). ' +
          '56 px, toute la largeur, sans coins, verre de lecture (`bg-map-read`), un filet de lumière en bas. À gauche ' +
          'le logo du module et « Retour » ; au centre la bascule « Carte | Analytics » en pilule de verre ' +
          '(`ButtonGroup shape="pill"`) ; à droite l’action du projet (avec un compte facultatif), ⋯, Partager, un filet ' +
          'et le profil — le déclencheur de la barre globale. Tout en `sm`. Les outils de la carte descendent sous elle ' +
          '(`--ds-map-overlay-top`). `BarTransition` passe d’une barre à l’autre.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

/**
 * Sur la carte : la barre, puis le panneau, la légende et les outils qui descendent sous elle. « Analytics » remplace la
 * carte entière (`SwapTransition rise`) ; « Carte » la rend telle qu’on l’avait laissée. ⋯ ouvert prend le voile du
 * verre.
 */
export const OnTheMap: Story = {
  name: 'Sur la carte',
  args: { onBack: fn(), onShare: fn() } as never,
  render: args => ({
    components: { MapTopBar, MapOverlay, MapPanel, MapNavigator, MapLegend, Button, DropdownItem, DropdownDivider, SwapTransition },
    setup() {
      const view = ref('map')
      const zoom = ref(9)
      return { args, view, zoom, VIEWS, TOOLS, MAP, BAR }
    },
    template: `
      <div style="position:relative">
        <SwapTransition rise>
          <div v-if="view === 'map'" key="map" :style="MAP">
            <MapOverlay position="start">
              <MapPanel size="lg" title="Zone d’éligibilité" collapsible expand-label="Afficher le panneau">
                <p style="margin:0; font:var(--ds-font-body-md); color:var(--ds-text-default)">Le panneau commence sous la barre, à 12 px d’elle.</p>
              </MapPanel>
            </MapOverlay>
            <MapOverlay position="top">
              <MapLegend title="Éligibilité" :legend="[{ label: 'Éligibles', color: 'var(--ds-chart-sequential-4)' }, { label: 'Non éligibles', color: 'var(--ds-chart-sequential-1)' }]" />
            </MapOverlay>
            <MapOverlay position="end">
              <MapNavigator v-model:zoom="zoom" :tools="TOOLS" />
            </MapOverlay>
          </div>
          <div v-else key="analytics" style="height:720px; box-sizing:border-box; padding:calc(3.5rem + var(--ds-spacing-3xl)) var(--ds-spacing-xl) 0; background:var(--ds-bg-neutral); font:var(--ds-font-body-md); color:var(--ds-text-default)">
            Toutes les données du projet — la vue Analytics remplace la carte entièrement.
          </div>
        </SwapTransition>
        <div :style="BAR">
          <MapTopBar module="Inset" :views="VIEWS" v-model:view="view" :action-count="2" user-name="Awa Diop" user-email="awa.diop@tolbi.ai" user-initials="AD" @back="args.onBack" @share="args.onShare">
            <template #action><Button label="Soumettre pour validation" size="sm" /></template>
            <template #menu="{ close }">
              <DropdownItem icon="download" label="Télécharger le rapport" @click="close" />
              <DropdownItem icon="refresh-cw" label="Synchroniser avec Verra" @click="close" />
              <DropdownItem icon="pencil" label="Modifier le projet" @click="close" />
              <DropdownDivider />
              <DropdownItem icon="trash-2" label="Supprimer le projet" tone="danger" @click="close" />
            </template>
            <template #user-menu="{ close }">
              <DropdownItem icon="settings" label="Paramètres du compte" @click="close" />
              <DropdownItem icon="log-out" label="Se déconnecter" @click="close" />
            </template>
          </MapTopBar>
        </div>
      </div>`,
  }),
  /* Guarded: the views switch, ⋯ opens its menu and wears the open state by itself (aria-expanded), « Retour » emits. */
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('img', { name: 'Inset' })).toBeTruthy()
    const more = canvas.getByRole('button', { name: 'Plus d’actions' })
    await userEvent.click(more)
    await expect(more).toHaveAttribute('aria-expanded', 'true')
    await expect(within(document.body).getByRole('menuitem', { name: 'Synchroniser avec Verra' })).toBeTruthy()
    await userEvent.keyboard('{Escape}')
    await userEvent.click(canvas.getByRole('button', { name: 'Retour' }))
    await expect((args as unknown as { onBack: ReturnType<typeof fn> }).onBack).toHaveBeenCalledTimes(1)
  },
}

/** Les actions selon l’état du projet : faire avancer (`primary`), ou télécharger (`secondary-gray` + glyphe). */
export const Actions: Story = {
  name: 'L’action du projet',
  render: () => ({
    components: { MapTopBar, Button, DropdownItem },
    setup: () => ({ VIEWS, MAP }),
    template: `
      <div :style="MAP.replace('height:720px', 'height:320px')">
        <div style="display:flex; flex-direction:column; gap:var(--ds-spacing-xl)">
          <MapTopBar module="Redd+" :views="VIEWS" view="map" user-initials="AD">
            <template #action><Button label="Lancer une baseline" size="sm" /></template>
            <template #menu><DropdownItem label="Modifier" /></template>
          </MapTopBar>
          <MapTopBar module="Inset" :views="VIEWS" view="map" :action-count="3" user-initials="AD">
            <template #action><Button label="Renvoyer le rapport" size="sm" /></template>
            <template #menu><DropdownItem label="Modifier" /></template>
          </MapTopBar>
          <MapTopBar module="Carbone" :views="VIEWS" view="analytics" user-initials="AD">
            <template #action><Button label="Télécharger le rapport" size="sm" variant="secondary-gray" icon-leading="download" /></template>
            <template #menu><DropdownItem label="Modifier" /></template>
          </MapTopBar>
        </div>
      </div>`,
  }),
}

/**
 * L’entrée et la sortie (`BarTransition`) : la barre globale remonte et s’efface, la surface s’étend aux bords ; la
 * carte reste seule 800 ms, puis la barre du projet s’ouvre en hauteur et son contenu arrive après (`variant="reveal"`,
 * ADR-0217). En sortant, la barre du projet remonte et celle de l’app redescend (`slide`). Les deux barres partagent
 * une même case.
 */
export const EnterAndLeave: Story = {
  name: 'Entrer dans un projet SIG',
  render: () => ({
    components: { MapTopBar, HorizontalNavigation, BarTransition, Button },
    setup() {
      const inProject = ref(false)
      return { inProject, VIEWS }
    },
    template: `
      <div :style="{
        display: 'grid', gridTemplateRows: 'auto 1fr', height: '560px', background: 'var(--ds-bg-neutral)',
        padding: inProject ? '0' : 'var(--ds-spacing-lg)',
        transition: 'padding var(--ds-motion-duration-considered) var(--ds-motion-easing-in-out)',
      }">
        <div style="display:grid; position:relative; z-index:2">
          <BarTransition :variant="inProject ? 'reveal' : 'slide'">
            <div v-if="!inProject" key="app" style="grid-area:1 / 1">
              <HorizontalNavigation module="Inset" :breadcrumbs="[{ label: 'Projets' }]" user-initials="AD" />
            </div>
            <div v-else key="project" style="grid-area:1 / 1">
              <MapTopBar module="Inset" :views="VIEWS" view="map" user-initials="AD" @back="inProject = false">
                <template #action><Button label="Soumettre pour validation" size="sm" /></template>
              </MapTopBar>
            </div>
          </BarTransition>
        </div>
        <div :style="{
          position: 'relative', marginTop: inProject ? '-3.5rem' : 'var(--ds-spacing-lg)',
          borderRadius: inProject ? '0' : 'var(--ds-radius-surface)', overflow: 'hidden',
          transition: 'margin var(--ds-motion-duration-considered) var(--ds-motion-easing-in-out), border-radius var(--ds-motion-duration-considered) var(--ds-motion-easing-in-out)',
          background: 'url(./stories/map-loading/parcels.webp) center / cover no-repeat, url(./stories/map-loading/base.webp) center / cover no-repeat',
        }">
          <div v-if="!inProject" style="position:absolute; left:var(--ds-spacing-xl); top:var(--ds-spacing-xl)">
            <Button label="Ouvrir le projet" size="sm" @click="inProject = true" />
          </div>
        </div>
      </div>`,
  }),
}
