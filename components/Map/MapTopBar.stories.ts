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
  { value: 'map', label: 'Explorer', glyph: 'map' as const },
  { value: 'analytics', label: 'Analyser', glyph: 'analytics' as const },
  { value: 'report', label: 'Rapporter', glyph: 'report' as const },
]

const BASEMAPS = [
  { value: 'tolbi', label: 'TOLBI', src: './stories/map-loading/base-thumb.webp' },
  { value: 'satellite', label: 'Satellite', src: './stories/map-loading/satellite.webp' },
]

/* « Rechercher » has moved up into the bar (ADR-0221). */
const TOOLS = [{ value: 'filters', icon: 'filter' as const, label: 'Filtres' }]

/* The map under the bar: the whole surface, no column margins (ADR-0216). */
const MAP =
  'position:relative; height:720px; overflow:hidden; --ds-map-overlay-top: calc(var(--ds-map-top-bar-height) + var(--ds-spacing-lg)); ' +
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
          'La barre d’un projet SIG (ADR-0216, décomplexifiée en ADR-0241) : elle dit où l’on est et laisse en sortir ; ' +
          'la carte porte les outils de la carte. 60 px (`--ds-map-top-bar-height`), toute la largeur, le verre des ' +
          'contrôles de carte, un filet en bas. À gauche le logo du module, seul, « Quitter » et le nom du projet ; au ' +
          'centre la bascule Explorer · Analyser · Rapporter (ADR-0236) ; à droite l’action de la page, ' +
          'le fond de carte, puis l’avatar de l’app (ADR-0242). La recherche est dans la colonne d’outils ' +
          '(`MapNavigator`). Tout en `sm`.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

/**
 * Sur la carte : la barre, puis le panneau, la légende et les outils qui descendent sous elle. Le logo n’est plus un
 * menu. À droite, l’action, le fond de carte (vignette carrée) puis l’avatar — celui de l’app : son menu dit qui est
 * connecté et propose « Se déconnecter » (ADR-0242). La recherche est en tête de la colonne d’outils (ADR-0241). « Analyser » remplace la carte entière (`SwapTransition rise`) et la barre
 * devient opaque, sans ombre, ses contrôles hors du verre (ADR-0223) ; « Explorer » rend le verre. Le glyphe de la vue
 * choisie joue son arrivée (ADR-0236).
 */
export const OnTheMap: Story = {
  name: 'Sur la carte',
  args: { onBack: fn() } as never,
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
              <MapNavigator
                v-model:zoom="zoom" :tools="TOOLS"
                search :search-open="searchOpen" @search="searchOpen = !searchOpen"
              />
            </MapOverlay>
          </div>
          <div v-else :key="view" style="height:720px; box-sizing:border-box; padding:calc(var(--ds-map-top-bar-height) + var(--ds-spacing-3xl)) var(--ds-spacing-xl) 0; background:var(--ds-bg-neutral); font:var(--ds-font-body-md); color:var(--ds-text-default)">
            {{ view === 'report' ? 'Le rapport du projet — la vue Rapporter remplace la carte.' : 'Toutes les données du projet — la vue Analyser remplace la carte entièrement.' }}
          </div>
        </SwapTransition>
        <div :style="BAR">
          <MapTopBar
            module="Inset" project-name="Inset — Bassin arachidier, campagne 2026"
            :views="VIEWS" v-model:view="view" back-label="Quitter" :action-count="2"
            :basemaps="BASEMAPS" v-model:basemap="basemap"
            user-initials="AD" user-name="Awa Diop" user-email="awa.diop@tolbi.ai"
            @back="args.onBack"
          >
            <template #action><Button label="Lancer une baseline sur cette zone" size="sm" /></template>
            <template #account-menu="{ close }">
              <DropdownItem icon="log-out" label="Se déconnecter" tone="danger" @click="close" />
            </template>
          </MapTopBar>
        </div>
      </div>`,
  }),
  /* Guarded (ADR-0241/0242): the mark is not a menu; the avatar is the app's — its menu opens on who is signed in and
     « Se déconnecter », no credits; the basemap is chosen in the bar by its square picture; « Rechercher » sits at the
     column's head; « Quitter » emits. */
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const page = within(document.body)
    const a = args as unknown as Record<'onBack', ReturnType<typeof fn>>
    await expect(canvas.queryByRole('button', { name: 'Menu Inset' })).toBeNull()
    const avatar = canvas.getByRole('button', { name: 'Profil Awa Diop' })
    await userEvent.click(avatar)
    await expect(avatar).toHaveAttribute('aria-expanded', 'true')
    await expect(await page.findByText('awa.diop@tolbi.ai')).toBeTruthy()
    await expect(page.getByRole('menuitem', { name: 'Se déconnecter' })).toBeTruthy()
    await expect(page.queryByRole('menuitem', { name: /crédits/ })).toBeNull()
    await userEvent.keyboard('{Escape}')
    await expect(avatar).toHaveAttribute('aria-expanded', 'false')

    await expect(canvas.getByRole('button', { name: 'Rechercher' })).toBeTruthy()
    const basemap = canvas.getByRole('button', { name: 'Fond de carte : TOLBI' })
    await userEvent.click(basemap)
    await userEvent.click(await page.findByRole('radio', { name: 'Satellite' }))
    await expect(canvas.getByRole('button', { name: 'Fond de carte : Satellite' })).toBeTruthy()

    await userEvent.click(canvas.getByRole('button', { name: 'Quitter' }))
    await expect(a.onBack).toHaveBeenCalledTimes(1)

    /* Off the map the bar is opaque, with no shadow (ADR-0223), derived from the view. */
    const bar = canvasElement.querySelector('.ds-map-top-bar') as HTMLElement
    await userEvent.click(canvas.getByRole('button', { name: /Analyser/ }))
    await expect(bar).toHaveClass('ds-map-top-bar--solid')
    await expect(canvas.getByRole('button', { name: /Analyser/ }).querySelector('.ds-view-glyph--arrived')).toBeTruthy()
    await userEvent.click(canvas.getByRole('button', { name: /^Explorer/ }))
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
          <MapTopBar module="Redd+" project-name="Forêt classée de Mbao" :views="VIEWS" view="map" back-label="Quitter" user-initials="AD" :basemaps="BASEMAPS" basemap="tolbi">
            <template #action><Button label="Lancer une baseline" size="sm" /></template>
            <template #downloads><DropdownItem label="Rapport" /></template>
          </MapTopBar>
          <MapTopBar module="Inset" project-name="Bassin arachidier" :views="VIEWS" view="map" :action-count="3" back-label="Quitter" user-initials="AD">
            <template #action><Button label="Renvoyer le rapport" size="sm" /></template>
            <template #downloads><DropdownItem label="Rapport" /></template>
          </MapTopBar>
          <MapTopBar module="Carbone" project-name="Kaffrine Nord" :views="VIEWS" view="analytics" back-label="Quitter" user-initials="AD">
            <template #action><Button label="Télécharger le rapport" size="sm" variant="secondary-gray" icon-leading="download" /></template>
          </MapTopBar>
          <!-- Sans action (ADR-0243) : le fond de carte et l’avatar, un groupe, sans aucun filet. -->
          <MapTopBar module="Redd+" project-name="Dynamic baseline — Mbao" :views="VIEWS" view="map" back-label="Quitter" user-initials="AD" :basemaps="BASEMAPS" basemap="tolbi" class="mtb-no-action" />
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
              <MapTopBar module="Inset" project-name="Bassin arachidier" :views="VIEWS" view="map" back-label="Quitter" user-initials="AD" @back="inProject = false">
                <template #action><Button label="Soumettre pour validation" size="sm" /></template>
              </MapTopBar>
            </div>
          </BarTransition>
        </div>
        <div :style="{
          position: 'relative', marginTop: inProject ? 'calc(-1 * var(--ds-map-top-bar-height))' : 'var(--ds-spacing-lg)',
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

/**
 * Les trois tailles de la bascule (ADR-0236) : `viewsSize` règle la bascule et la rangée ensemble — `sm` 44 dans
 * 3,5rem, `md` 48 dans 3,75rem (retenue), `lg` 52 dans 4rem (glyphe 28, `label-2xl`). La hauteur est publique,
 * `--ds-map-top-bar-height`.
 */
export const ViewsSizes: Story = {
  name: 'Tailles de la bascule',
  render: () => ({
    components: { MapTopBar },
    setup: () => ({ VIEWS, view: ref('map'), SIZES: ['sm', 'md', 'lg'] as const }),
    template: `
      <div style="display:flex;flex-direction:column;gap:var(--ds-spacing-xl);padding:var(--ds-spacing-xl) 0;background:url(./stories/map-loading/base.webp) center / cover">
        <MapTopBar v-for="s in SIZES" :key="s" :views-size="s" module="Inset" project-name="Bassin arachidier" :views="VIEWS" v-model:view="view" back-label="Quitter" user-initials="AD" />
      </div>`,
  }),
}
