<script setup lang="ts" generic="T extends string">
defineProps<{
  /** Names the group for screen readers. */
  label: string;
  options: readonly { value: T; label: string }[];
}>();

const model = defineModel<T>({ required: true });
</script>

<template>
  <div class="segmented" role="group" :aria-label="label">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="segment"
      :class="{ selected: option.value === model }"
      :aria-pressed="option.value === model"
      @click="model = option.value"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<style scoped>
.segmented {
  display: flex;
  gap: 3px;
  padding: 3px;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: var(--sunken);
}

.segment {
  flex: 1 1 0;
  min-width: 78px;
  min-height: var(--tap-size);
  padding: 0 8px;
  border: 0;
  border-radius: 11px;
  background: transparent;
  font-size: 14px;
  font-weight: 600;
}

.segment.selected {
  background: var(--accent);
  color: var(--accent-ink);
}

@media (hover: hover) {
  .segment:hover {
    background: var(--surface);
  }

  .segment.selected:hover {
    background: var(--accent-hover);
  }
}
</style>
