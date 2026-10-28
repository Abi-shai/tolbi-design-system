import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import RevealTransition from './RevealTransition.vue'
import { Button } from '../Button'
import { Callout } from '../Callout'

const meta: Meta<typeof RevealTransition> = {
  title: 'Mouvement/RevealTransition',
  component: RevealTransition,
  tags: ['stable'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Une surface qui **ouvre sa propre hauteur sur place** quand elle a quelque chose à montrer ' +
          '(ADR-0032). **Ce n’est pas un fondu** : la hauteur s’ouvre, et le contenu qui arrive est un second ' +
          'mouvement, un `enter` plus tard — fondre une bande pleine largeur se lit « elle est apparue », ' +
          'l’ouvrir se lit « elle est arrivée », et la différence tient entièrement dans ce décalage.\n\n' +
          '`ambient` (600 ms) et `easing-in-out`, mesurés contre l’alternative : à 300 ms sur `easing-default` ' +
          'la bande était ouverte à 44 % en 50 ms et à 71 % en 100 ms, puis traînait.\n\n' +
          'La rangée est une grille qui va de `0fr` à `1fr` (ADR-0025) plutôt qu’une hauteur mesurée : ' +
          '`height: auto` ne s’anime pas, et la grille replie aussi les marges du contenu pour rien. Contrairement ' +
          'à `SurfaceTransition`, elle rend **son propre élément**, donc la grille ne peut pas atterrir sur le ' +
          'mauvais — et le double `requestAnimationFrame` que le produit avait oublié est déjà là.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof RevealTransition>

/** La hauteur s’ouvre ; le contenu suit. */
export const Default: Story = {
  name: 'Ouvrir en place',
  render: () => ({
    components: { RevealTransition, Button, Callout },
    setup: () => ({ show: ref(false) }),
    template: `
      <div style="display:flex;flex-direction:column;gap:16px;align-items:flex-start;width:520px">
        <Button variant="secondary-gray" size="sm" :label="show ? 'Masquer la bande' : 'Afficher la bande'" @click="show = !show" />
        <div style="width:100%">
          <RevealTransition :show="show">
            <Callout
              tone="warning"
              title="Trois parcelles demandent une vérification"
              text="Le chevauchement détecté porte sur 4,2 hectares. Ouvrez le lot pour les traiter."
            />
          </RevealTransition>
        </div>
        <p style="margin:0;font:var(--ds-font-body-sm);color:var(--ds-text-subtle)">
          Ce qui suit la bande ne saute pas : la hauteur voyage, elle n’apparaît pas.
        </p>
      </div>
    `,
  }),
}
