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

const BASEMAPS = [
  { value: 'tolbi', label: 'TOLBI', src: './stories/map-loading/base-thumb.webp' },
  { value: 'satellite', label: 'Satellite', src: './stories/map-loading/satellite.webp' },
]

/* « Rechercher » has moved up into the bar (ADR-0221). */
const TOOLS = [{ value: 'filters', icon: 'filter' as const, label: 'Filtres' }]

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
          'La barre d’un projet SIG (ADR-0216, redessinée en ADR-0221) : dans Carbone (Inset), la zone d’éligibilité et ' +
          'la Dynamic baseline, la barre globale cède la place à celle du projet, posée sur la carte. 56 px, toute la ' +
          'largeur, verre de lecture, un filet et une ombre en bas. À gauche le logo du module — un menu : ses crédits ' +
          '(`DropdownCredits`), puis les lignes du produit —, « Retour » et le nom du projet ; au centre la bascule ' +
          '« Carte | Analytics » ; à droite trois groupes séparés d’un filet : l’action du projet, la carte (Rechercher, ' +
          'le fond de carte), le fichier (Télécharger, Partager). Plus de profil ni de ⋯. Tout en `sm`.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

/**
 * Sur la carte : la barre, puis le panneau, la légende et les outils qui descendent sous elle. Le logo ouvre le menu du
 * module — ses crédits en tête, l’action lourde en dernier après un séparateur ; le fond de carte se choisit par son
 * image ; Télécharger tient ce que tenait ⋯. « Analytics » remplace la carte entière (`SwapTransition rise`) et la barre
 * devient opaque, sans ombre, ses contrôles hors du verre (ADR-0223) ; « Carte » rend le verre.
 */
export const OnTheMap: Story = {
  name: 'Sur la carte',
  args: { onBack: fn(), onShare: fn(), onCredits: fn() } as never,
  render: args => ({
    components: { MapTopBar, MapOverlay, MapPanel, MapNavigator, MapLegend, Button, DropdownItem, DropdownDivider, SwapTransition },
    setup() {
      const view = ref('map')
      const zoom = ref(9)
      const basemap = ref('tolbi')
      const searchOpen = ref(false)
      return { args, view, zoom, basemap, searchOpen, VIEWS, TOOLS, BASEMAPS, MAP, BAR }
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
          <MapTopBar
            module="Inset" project-name="Inset — Bassin arachidier, campagne 2026" :credits="1250"
            :views="VIEWS" v-model:view="view" :basemaps="BASEMAPS" v-model:basemap="basemap"
            search :search-open="searchOpen" :action-count="2"
            @back="args.onBack" @share="args.onShare" @credits="args.onCredits" @search="searchOpen = !searchOpen"
          >
            <template #action><Button label="Soumettre pour validation" size="sm" /></template>
            <template #module-menu="{ close }">
              <DropdownItem icon="house" label="Aller à l’accueil" @click="close" />
              <DropdownItem icon="folders" label="Retour aux projets Inset" @click="close" />
              <DropdownDivider />
              <DropdownItem icon="book-open" label="Apprendre" @click="close" />
              <DropdownItem icon="settings" label="Paramètres" @click="close" />
              <DropdownItem icon="bell" label="Notifications" @click="close" />
              <DropdownDivider />
              <DropdownItem icon="log-out" label="Se déconnecter" tone="danger" @click="close" />
            </template>
            <template #downloads="{ close }">
              <DropdownItem icon="file-text" label="Rapport de vérification" @click="close" />
              <DropdownItem icon="map" label="Zones (GeoJSON)" @click="close" />
              <DropdownItem icon="table" label="Parcelles (CSV)" @click="close" />
            </template>
          </MapTopBar>
        </div>
      </div>`,
  }),
  /* Guarded: the mark opens the module's menu on its credits (a menu item the arrows reach), the basemap is chosen
     by its picture, « Télécharger » opens its rows, « Retour » emits. */
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const page = within(document.body)
    const a = args as unknown as Record<'onBack' | 'onCredits', ReturnType<typeof fn>>
    const mark = canvas.getByRole('button', { name: 'Menu Inset' })
    await userEvent.click(mark)
    await expect(mark).toHaveAttribute('aria-expanded', 'true')
    const credits = await page.findByRole('menuitem', { name: /1\s250 crédits Inset disponibles/ })
    await expect(page.getByRole('menuitem', { name: 'Se déconnecter' })).toBeTruthy()
    await userEvent.click(credits)
    await expect(a.onCredits).toHaveBeenCalledTimes(1)
    await expect(mark).toHaveAttribute('aria-expanded', 'false')

    const basemap = canvas.getByRole('button', { name: 'Fond de carte : TOLBI' })
    await userEvent.click(basemap)
    await userEvent.click(await page.findByRole('radio', { name: 'Satellite' }))
    await expect(canvas.getByRole('button', { name: 'Fond de carte : Satellite' })).toBeTruthy()

    const download = canvas.getByRole('button', { name: 'Télécharger' })
    await userEvent.click(download)
    await expect(await page.findByRole('menuitem', { name: 'Zones (GeoJSON)' })).toBeTruthy()
    await userEvent.keyboard('{Escape}')

    await userEvent.click(canvas.getByRole('button', { name: 'Retour' }))
    await expect(a.onBack).toHaveBeenCalledTimes(1)

    /* Off the map the bar is opaque, with no shadow (ADR-0223), derived from the view. */
    const bar = canvasElement.querySelector('.ds-map-top-bar') as HTMLElement
    await userEvent.click(canvas.getByRole('button', { name: /Analytics/ }))
    await expect(bar).toHaveClass('ds-map-top-bar--solid')
    await userEvent.click(canvas.getByRole('button', { name: /^Carte/ }))
    await expect(bar).not.toHaveClass('ds-map-top-bar--solid')
  },
}

/**
 * Les actions selon l’état du projet : faire avancer (`primary`), ou télécharger (`secondary-gray` + glyphe). Un filet
 * ne sépare que deux groupes présents : sans Rechercher ni fond de carte, l’action et le fichier.
 */
export const Actions: Story = {
  name: 'L’action du projet',
  render: () => ({
    components: { MapTopBar, Button, DropdownItem },
    setup: () => ({ VIEWS, MAP, BASEMAPS }),
    template: `
      <div :style="MAP.replace('height:720px', 'height:320px')">
        <div style="display:flex; flex-direction:column; gap:var(--ds-spacing-xl)">
          <MapTopBar module="Redd+" project-name="Forêt classée de Mbao" :views="VIEWS" view="map" search :basemaps="BASEMAPS" basemap="tolbi">
            <template #action><Button label="Lancer une baseline" size="sm" /></template>
            <template #downloads><DropdownItem label="Rapport" /></template>
          </MapTopBar>
          <MapTopBar module="Inset" project-name="Bassin arachidier" :views="VIEWS" view="map" :action-count="3" search :basemaps="BASEMAPS" basemap="satellite">
            <template #action><Button label="Renvoyer le rapport" size="sm" /></template>
            <template #downloads><DropdownItem label="Rapport" /></template>
          </MapTopBar>
          <MapTopBar module="Carbone" project-name="Kaffrine Nord" :views="VIEWS" view="analytics" :share="false">
            <template #action><Button label="Télécharger le rapport" size="sm" variant="secondary-gray" icon-leading="download" /></template>
          </MapTopBar>
        </div>
      </div>`,
  }),
}

/**
 * L’entrée et la sortie (`BarTransition`) : depuis la liste, on découvre le système SIG d’un coup — la carte, ses
 * instruments et la barre du projet ensemble, sans animation (`variant="none"`, ADR-0219). En sortant, la barre du projet
 * remonte et celle de l’app monte de 8 px en apparaissant (`rise`, ADR-0218). Les deux barres partagent une même case.
 */
export const EnterAndLeave: Story = {
  name: 'Entrer dans un projet SIG',
  render: () => ({
    components: { MapTopBar, HorizontalNavigation, BarTransition, Button },
    setup() {
      const inProject = ref(false)
      return { inProject, VIEWS, BASEMAPS }
    },
    template: `
      <div :style="{
        display: 'grid', gridTemplateRows: 'auto 1fr', height: '560px', background: 'var(--ds-bg-neutral)',
        padding: inProject ? '0' : 'var(--ds-spacing-lg)',
      }">
        <div style="display:grid; position:relative; z-index:2">
          <BarTransition :variant="inProject ? 'none' : 'rise'">
            <div v-if="!inProject" key="app" style="grid-area:1 / 1">
              <HorizontalNavigation module="Inset" :breadcrumbs="[{ label: 'Projets' }]" user-initials="AD" />
            </div>
            <div v-else key="project" style="grid-area:1 / 1">
              <MapTopBar module="Inset" project-name="Bassin arachidier" :views="VIEWS" view="map" search :basemaps="BASEMAPS" basemap="tolbi" @back="inProject = false">
                <template #action><Button label="Soumettre pour validation" size="sm" /></template>
              </MapTopBar>
            </div>
          </BarTransition>
        </div>
        <div :style="{
          position: 'relative', marginTop: inProject ? '-3.5rem' : 'var(--ds-spacing-lg)',
          borderRadius: inProject ? '0' : 'var(--ds-radius-surface)', overflow: 'hidden',
          background: 'url(./stories/map-loading/parcels.webp) center / cover no-repeat, url(./stories/map-loading/base.webp) center / cover no-repeat',
        }">
          <div v-if="!inProject" style="position:absolute; left:var(--ds-spacing-xl); top:var(--ds-spacing-xl)">
            <Button label="Ouvrir le projet" size="sm" @click="inProject = true" />
          </div>
        </div>
      </div>`,
  }),
}
