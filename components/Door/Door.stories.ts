import type { Meta, StoryObj } from '@storybook/vue3'
import { within, expect } from '@storybook/test'
import Door from './Door.vue'
import { Button } from '../Button'
import { CreditCoins } from '../CreditCoins'
import { MetricValue } from '../MetricValue'
import { ModuleIcon } from '../ModuleIcon'
import { Tray, TrayGrid, TrayCell } from '../Tray'

const MODULES = [
  { module: 'Yield', label: 'Yield', credits: '1 240', low: true },
  { module: 'Scan', label: 'Scan', credits: '312 900', low: false },
  { module: 'Inset', label: 'Inset', credits: '214 600', low: false },
  { module: 'Redd+', label: 'Redd+', credits: '160 000', low: false },
  { module: 'Data', label: 'Data', credits: '98 214', low: false },
  { module: 'Survey', label: 'Survey', credits: '52 300', low: false },
  { module: 'ID', label: 'ID', credits: '24 860', low: false },
  { module: 'Forest', label: 'Forest', credits: '10 200', low: false },
] as const

const meta: Meta<typeof Door> = {
  title: 'Structure/Door',
  component: Door,
  /* wip: first release — two home-page doors (producers, credits) are its consumers, none has moved yet. */
  tags: ['wip'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Une porte de l’accueil (ADR-0231) : le bloc qui mène quelque part. Deux zones — `#lead`, le propos (une ' +
          'illustration, un chiffre ou un titre, l’action), à sa largeur, 24rem au plus ; `#aside`, la surface d’à ' +
          'côté, qui prend le reste. Le sol est `BrandPattern surface="accent"`. Côte à côte quand la porte a la place ' +
          '(40rem, une requête de conteneur), 32 entre eux ; l’aside prend la hauteur du propos et défile dedans. ' +
          'Empilés en dessous.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

/**
 * La porte des crédits : à gauche les pièces (`CreditCoins trim` à 128), le total en `MetricValue size="xl"` — le
 * chiffre et son unité, la portée dessous — et « Recharger » ; à droite le plateau « Par module », une case blanche par
 * module (`TrayGrid`, `TrayCell`), les bas d’abord. La liste défile dans le plateau, son bout s’efface sur 64px.
 */
export const Credits: Story = {
  name: 'La porte des crédits',
  render: () => ({
    components: { Door, Button, CreditCoins, MetricValue, ModuleIcon, Tray, TrayGrid, TrayCell },
    setup: () => ({ MODULES }),
    template: `
      <Door>
        <template #lead>
          <CreditCoins :size="128" trim />
          <MetricValue size="xl" value="874 314" unit="crédits" caption="pour tous les modules" />
          <Button label="Recharger" size="lg" href="#recharger" />
        </template>
        <template #aside>
          <Tray title="Par module" :heading-level="3" :surface="false">
            <template #action><Button label="Voir les détails" variant="link" size="sm" icon-trailing="arrow-right" href="#details" /></template>
            <TrayGrid label="Crédits par module">
              <TrayCell v-for="m in MODULES" :key="m.module" :label="m.label" :value="m.credits" :badge="m.low ? 'Bas' : undefined" badge-tone="error">
                <template #media><ModuleIcon :module="m.module" variant="logo" :size="40" :aria-label="null" /></template>
              </TrayCell>
            </TrayGrid>
          </Tray>
        </template>
      </Door>`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('list', { name: 'Crédits par module' })).toBeTruthy()
    await expect(canvas.getByText('pour tous les modules')).toBeTruthy()
    await expect(canvas.getByRole('heading', { name: 'Par module' })).toBeTruthy()
  },
}

/** En attente : le chiffre laisse place à un repère, la forme ne bouge pas. */
export const Loading: Story = {
  name: 'Chargement',
  render: () => ({
    components: { Door, Button, CreditCoins, MetricValue },
    template: `
      <Door>
        <template #lead>
          <CreditCoins :size="128" trim />
          <MetricValue size="xl" value="" loading unit="crédits" caption="pour tous les modules" />
          <Button label="Recharger" size="lg" />
        </template>
      </Door>`,
  }),
}

/** Étroite (moins de 40rem) : le propos puis le plateau, empilés ; le plateau plafonné à 22rem. */
export const Narrow: Story = {
  name: 'Étroite',
  render: () => ({
    components: { Door, Button, CreditCoins, MetricValue, ModuleIcon, Tray, TrayGrid, TrayCell },
    setup: () => ({ MODULES }),
    template: `
      <div style="max-width:30rem">
        <Door>
          <template #lead>
            <CreditCoins :size="128" trim />
            <MetricValue size="xl" value="874 314" unit="crédits" caption="pour tous les modules" />
            <Button label="Recharger" size="lg" />
          </template>
          <template #aside>
            <Tray title="Par module" :heading-level="3" :surface="false">
              <TrayGrid label="Crédits par module">
                <TrayCell v-for="m in MODULES" :key="m.module" :label="m.label" :value="m.credits" :badge="m.low ? 'Bas' : undefined" badge-tone="error">
                  <template #media><ModuleIcon :module="m.module" variant="logo" :size="40" :aria-label="null" /></template>
                </TrayCell>
              </TrayGrid>
            </Tray>
          </template>
        </Door>
      </div>`,
  }),
}
