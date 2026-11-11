<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ lowest: number; highest: number }>();

/** Octaves the notes are moved from where they start. */
const model = defineModel<number>({ required: true });

/** 0, +1 or −1, with a real minus sign. */
const label = computed(() =>
  model.value > 0
    ? `+${model.value}`
    : model.value < 0
      ? `−${-model.value}`
      : '0',
);

const move = (by: number) => {
  model.value = Math.min(
    Math.max(model.value + by, props.lowest),
    props.highest,
  );
};
</script>

<template>
  <div class="stepper" role="group" aria-label="Octave">
    <button
      type="button"
      class="step"
      aria-label="Octave down"
      :disabled="model <= lowest"
      @click="move(-1)"
    >
      <svg
        aria-hidden="true"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.4"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </button>
    <output class="value" :class="{ moved: model !== 0 }" aria-live="polite">
      {{ label }}
    </output>
    <button
      type="button"
      class="step"
      aria-label="Octave up"
      :disabled="model >= highest"
      @click="move(1)"
    >
      <svg
        aria-hidden="true"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.4"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M6 15l6-6 6 6" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.stepper {
  display: flex;
  gap: 2px;
  align-items: center;
  padding: 3px;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: var(--sunken);
}

.step {
  display: flex;
  flex: 1 1 0;
  align-items: center;
  justify-content: center;
  min-width: var(--tap-size);
  height: var(--tap-size);
  border: 0;
  border-radius: 11px;
  background: var(--surface);
}

.step:disabled {
  opacity: 0.35;
  cursor: default;
}

@media (hover: hover) {
  .step:enabled:hover {
    background: var(--surface-hover);
  }
}

.value {
  flex: 0 0 72px;
  color: var(--text-muted);
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  text-align: center;
}

.value.moved {
  color: var(--label);
}
</style>
