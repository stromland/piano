<script setup lang="ts">
import { type BoardNote, formatNoteName } from '@stromland/piano-lib';

defineProps<{
  overline: string;
  title: string;
  detail?: string;
  /** The notes that are pressed, lowest first. */
  notes: BoardNote[];
}>();
</script>

<template>
  <div class="summary">
    <div class="top">
      <div aria-live="polite">
        <p class="overline">{{ overline }}</p>
        <div class="heading">
          <h1 class="title">{{ title }}</h1>
          <span v-if="detail" class="detail">{{ detail }}</span>
        </div>
      </div>
      <slot />
    </div>
    <ul class="notes" aria-label="Notes">
      <li
        v-for="(note, index) in notes"
        :key="index"
        class="note"
        :class="{ root: note.root }"
      >
        <span class="name">{{ formatNoteName(note.name) }}</span>
        <span class="degree">{{ formatNoteName(note.degree) }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.summary {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-block: 4px 14px;
}

.top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.overline {
  margin: 0 0 2px;
  color: var(--label);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.heading {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 10px;
}

.title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 30px;
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.01em;
}

.detail {
  color: var(--text-muted);
  font-size: 15px;
}

.notes {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.note {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  min-width: 40px;
  padding: 4px 8px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--surface);
  font-weight: 600;
  line-height: 1.2;
}

.name {
  font-size: 14px;
}

.degree {
  font-size: 11px;
}

.note.root {
  border-color: var(--root);
  background: var(--root);
  color: var(--root-ink);
}
</style>
