# Button — règles d'usage

## Intention

Le bouton déclenche une action immédiate. C'est le composant d'action primaire du Design System.

---

## Quand utiliser chaque variante

| Variante    | Usage                                                                 |
|-------------|-----------------------------------------------------------------------|
| `primary`   | Action principale de la page (1 seul par vue au maximum)             |
| `secondary` | Action secondaire ou alternative à la principale                      |
| `ghost`     | Action tertiaire, liens-actions dans des zones denses                |
| `danger`    | Actions destructives : suppression, révocation, désactivation        |

---

## Taille

- `sm` : dans des composants compacts (tableaux, cards, toolbars)
- `md` : usage par défaut dans les formulaires et les dialogues
- `lg` : call-to-action visuellement saillant (hero, onboarding)

---

## États

- **Disabled** : utiliser `disabled` uniquement quand l'action est structurellement impossible, pas pour la validation de formulaire. Toujours accompagner d'une explication visuelle ou textuelle.
- **Loading** : afficher l'état `loading` pendant les opérations asynchrones ; le bouton devient non-cliquable automatiquement.

---

## Règles de contenu

- Le label est un **verbe d'action** court : *Enregistrer*, *Supprimer*, *Continuer*
- Pas de majuscules entières (ALL CAPS)
- Pas de ponctuation finale sauf les points de suspension (`…`) pour les actions longues
- Maximum ~3 mots. Au-delà, revoir le libellé ou le flux.

---

## Accessibilité

- Toujours fournir un `label` explicite. Éviter *Cliquez ici* ou *OK*.
- Pour les boutons icône-seule, utiliser `aria-label` (non encore exposé dans la v1 — prévu v2).
- Le composant expose `aria-busy` en mode `loading`.

---

## Ce qu'il ne fait pas

- Pas de navigation : utiliser un `<a>` ou le composant `Link` du DS.
- Pas de toggle / état actif persistant : utiliser `ToggleButton` (v2).
- Pas d'icônes embedded dans cette version (v1) — voir roadmap.

---

## Consommation dans Nuxt

```vue
<script setup lang="ts">
import { Button } from 'tolbi-design-system'
</script>

<template>
  <Button label="Enregistrer" variant="primary" @click="save" />
</template>
```

> Le composant est Vue pur — aucune dépendance Nuxt. Il fonctionne dans n'importe quelle app Vue 3.
