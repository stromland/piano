<script setup lang="ts">
defineProps<{ selected: boolean }>();
</script>

<template>
  <button
    type="button"
    class="chip"
    :class="{ selected }"
    :aria-pressed="selected"
  >
    <slot />
  </button>
</template>

<style scoped>
.chip {
  min-width: 0;
  min-height: var(--tap-size);
  padding: 0 6px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--surface);
  font-size: 15px;
  font-weight: 600;
}

.chip.selected {
  border-color: var(--accent);
  background: var(--accent);
  color: var(--accent-ink);
}

@media (hover: hover) {
  .chip:hover {
    background: var(--surface-hover);
  }

  .chip.selected:hover {
    border-color: var(--accent-hover);
    background: var(--accent-hover);
  }
}
</style>
