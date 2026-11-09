<script setup lang="ts">
import { type ProgressionStep, formatNoteName } from '@stromland/piano-lib';

import { POSITION_LABELS } from '../composables/usePiano';

const props = defineProps<{ steps: ProgressionStep[] }>();

const emit = defineEmits<{
  /** Asks to take the chord at this position out of the progression. */
  remove: [index: number];
}>();

/** Position of the step shown on the keyboard. */
const model = defineModel<number>({ required: true });

function go(offset: number) {
  model.value = Math.min(
    Math.max(0, model.value + offset),
    props.steps.length - 1,
  );
}
</script>

<template>
  <p v-if="steps.length === 0" class="empty">
    Add chords below. Each one is voiced so the left hand moves as little as
    possible from chord to chord.
  </p>
  <template v-else>
    <ol class="steps">
      <li v-for="(step, index) in steps" :key="index" class="step">
        <button
          type="button"
          class="pick"
          :class="{ selected: index === model }"
          :aria-pressed="index === model"
          @click="model = index"
        >
          <span class="number">{{ index + 1 }}</span>
          <span class="name">{{ formatNoteName(step.name) }}</span>
          <span class="position">{{ POSITION_LABELS[step.inversion] }}</span>
          <span class="movement">
            {{ index === 0 ? 'Start' : `+${step.movement}` }}
          </span>
        </button>
        <button
          type="button"
          class="remove"
          :aria-label="`Remove ${formatNoteName(step.name)}`"
          @click="emit('remove', index)"
        >
          <svg
            aria-hidden="true"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
            stroke-linecap="round"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </li>
    </ol>
    <div class="nav">
      <button type="button" class="move" :disabled="model <= 0" @click="go(-1)">
        <svg
          aria-hidden="true"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Previous
      </button>
      <button
        type="button"
        class="move"
        :disabled="model >= steps.length - 1"
        @click="go(1)"
      >
        Next
        <svg
          aria-hidden="true"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  </template>
</template>

<style scoped>
.empty {
  margin: 0;
  color: var(--text-muted);
  font-size: 15px;
  line-height: 1.45;
}

.steps {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.step {
  display: flex;
  gap: 6px;
}

.pick,
.remove,
.move {
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--surface);
}

.pick {
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  gap: 12px;
  min-width: 0;
  min-height: 52px;
  padding: 0 12px;
  text-align: left;
}

.pick.selected {
  border-color: var(--accent);
  background: var(--accent);
  color: var(--accent-ink);
}

.number {
  width: 18px;
  font-size: 13px;
  font-weight: 600;
  opacity: 0.75;
}

.name {
  min-width: 52px;
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
}

.position {
  flex: 1 1 auto;
  font-size: 14px;
  opacity: 0.85;
}

.movement {
  font-size: 14px;
  font-weight: 700;
}

.remove {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: var(--tap-size);
  color: var(--text-muted);
}

.nav {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
}

.move {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: var(--tap-size);
  font-size: 15px;
  font-weight: 600;
}

.move:disabled {
  cursor: default;
  opacity: 0.45;
}

@media (hover: hover) {
  .pick:hover,
  .remove:hover,
  .move:enabled:hover {
    background: var(--surface-hover);
  }

  .pick.selected:hover {
    border-color: var(--accent-hover);
    background: var(--accent-hover);
  }
}
</style>
