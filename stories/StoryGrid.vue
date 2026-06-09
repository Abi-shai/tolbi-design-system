<script setup lang="ts">
import type { Component } from 'vue'

interface GridItem {
  component: Component
  props?: Record<string, unknown>
}

withDefaults(defineProps<{
  items: GridItem[]
  gap?: string
  align?: string
  wrap?: 'wrap' | 'nowrap'
}>(), {
  gap: 'var(--ds-space-3)',
  align: 'center',
  wrap: 'wrap',
})
</script>

<template>
  <div :style="{ display: 'flex', flexWrap: wrap, gap, alignItems: align }">
    <component
      v-for="(item, i) in items"
      :key="i"
      :is="item.component"
      v-bind="item.props"
    />
  </div>
</template>
