<script setup lang="ts">
import { Icon } from '../Icon'

export interface BreadcrumbsItem {
  label: string
  href?: string
}

interface Props {
  items: BreadcrumbsItem[]
}

defineProps<Props>()
</script>

<template>
  <nav class="ds-breadcrumbs" aria-label="Breadcrumb">
    <ol class="ds-breadcrumbs__list">
      <!-- Home icon -->
      <li class="ds-breadcrumbs__item">
        <button type="button" class="ds-breadcrumbs__home" aria-label="Accueil">
          <Icon name="house" :size="20" />
        </button>
      </li>

      <!-- Text items -->
      <template v-for="(item, index) in items" :key="index">
        <li class="ds-breadcrumbs__separator" aria-hidden="true">
          <Icon name="chevron-right" :size="16" />
        </li>
        <li class="ds-breadcrumbs__item">
          <component
            :is="item.href ? 'a' : 'span'"
            :href="item.href"
            :class="[
              'ds-breadcrumbs__crumb',
              index === items.length - 1 && 'ds-breadcrumbs__crumb--current',
            ]"
            :aria-current="index === items.length - 1 ? 'page' : undefined"
          >
            {{ item.label }}
          </component>
        </li>
      </template>
    </ol>
  </nav>
</template>

<style scoped>
.ds-breadcrumbs__list {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-md, 8px);
  list-style: none;
  margin: 0;
  padding: 0;
}

.ds-breadcrumbs__home {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--ds-spacing-xs, 4px);
  background: transparent;
  border: none;
  border-radius: var(--ds-radius-inner);
  color: var(--ds-text-subtle);
  cursor: pointer;
  outline: none;
  transition: background-color 150ms ease, color 150ms ease;
}

.ds-breadcrumbs__home:hover {
  background-color: var(--ds-bg-neutral-subtle);
  color: var(--ds-text-default);
}

.ds-breadcrumbs__home:focus-visible {
  box-shadow: var(--ds-focus-ring-gray-shadow-sm);
}

.ds-breadcrumbs__separator {
  display: flex;
  align-items: center;
  color: var(--ds-text-subtle);
}

.ds-breadcrumbs__crumb {
  display: flex;
  align-items: center;
  padding: var(--ds-spacing-xs, 4px) var(--ds-spacing-md, 8px);
  border-radius: var(--ds-radius-inner);
  font-family: var(--ds-typography-font-family-poppins);
  font-size: var(--ds-font-size-label-lg);
  line-height: var(--ds-line-height-label-lg);
  font-weight: 500;
  color: var(--ds-text-subtle);
  text-decoration: none;
  white-space: nowrap;
  transition: background-color 150ms ease, color 150ms ease;
}

a.ds-breadcrumbs__crumb:hover:not(.ds-breadcrumbs__crumb--current) {
  background-color: var(--ds-bg-neutral-subtle);
  color: var(--ds-text-default);
}

a.ds-breadcrumbs__crumb:focus-visible {
  outline: none;
  box-shadow: var(--ds-focus-ring-gray-shadow-sm);
}

.ds-breadcrumbs__crumb--current {
  background-color: var(--ds-bg-selected);
  color: var(--ds-text-on-brand-subtle);
  font-family: var(--ds-typography-font-family-poppins);
  font-weight: 600;
}
</style>
