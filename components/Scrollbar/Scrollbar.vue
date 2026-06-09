<script setup lang="ts">
interface Props {
  maxHeight?: string
  horizontal?: boolean
}

withDefaults(defineProps<Props>(), {
  horizontal: false,
})
</script>

<template>
  <div
    class="ds-scrollbar"
    :class="{ 'ds-scrollbar--horizontal': horizontal }"
    :style="maxHeight ? { maxHeight } : undefined"
  >
    <slot />
  </div>
</template>

<style scoped>
.ds-scrollbar {
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-gutter: stable;
  scrollbar-width: thin;
  scrollbar-color: var(--ds-semantic-bg-quaternary) transparent;
}

.ds-scrollbar--horizontal {
  overflow-x: auto;
  overflow-y: hidden;
}

.ds-scrollbar::-webkit-scrollbar {
  width: 16px;
  height: 16px;
}

.ds-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.ds-scrollbar::-webkit-scrollbar-thumb {
  background-color: var(--ds-semantic-bg-quaternary);
  border-radius: var(--ds-radius-full);
  border: 4px solid transparent;
  background-clip: padding-box;
}

.ds-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: var(--ds-semantic-fg-senary);
}
</style>
