<script setup lang="ts">
import { formatNoteName } from '@stromland/music-theory';

import type { BassRow } from '../board';
import type { Row } from '../stradella';

defineProps<{
  rows: BassRow[];
  /** Says what the bass shows, for screen readers. */
  label: string;
}>();

/** The counterbass row's name is too long to stand over a button. */
const SHORT_NAMES: Partial<Record<Row, string>> = { counterbass: 'Counter' };
</script>

<template>
  <div class="bass" role="img" :aria-label="label">
    <div
      v-for="({ row, name, buttons }, position) in rows"
      :key="row"
      class="row"
      :style="{ '--row': position }"
    >
      <span class="name">{{ SHORT_NAMES[row] ?? name }}</span>
      <div class="buttons">
        <span
          v-for="button in buttons"
          :key="button.column"
          class="button"
          :class="[button.role, { marked: button.marked }]"
        >
          {{ formatNoteName(button.name) }}
          <span v-if="button.beats" class="beats">{{ button.beats }}</span>
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/*
 * Each row of the Stradella bass is drawn as a line from top to bottom, the
 * way the bass faces the player, and each sits a little lower than the one
 * before it, as the buttons do on the instrument.
 */
.bass {
  display: flex;
  justify-content: space-between;
  gap: 4px;
}

.row {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.name {
  color: var(--text-muted);
  font-size: 11px;
  font-weight: 600;
}

.buttons {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: calc(var(--row) * 9px);
}

.button {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--tap-size);
  height: var(--tap-size);
  border: 1px solid var(--line);
  border-radius: 50%;
  background: var(--surface);
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 600;
  user-select: none;
}

.button.marked {
  box-shadow:
    inset 0 0 0 3px var(--surface),
    inset 0 0 0 5px var(--text-muted);
}

.button.bass {
  border-color: var(--root-strong);
  background: var(--root);
  color: var(--root-ink);
}

.button.chord {
  border-color: var(--accent-strong);
  background: var(--accent);
  color: var(--accent-ink);
}

.button.alternate {
  border: 2px dashed var(--root);
  color: var(--root);
}

.beats {
  position: absolute;
  top: -6px;
  right: -8px;
  min-width: 20px;
  height: 20px;
  padding: 0 4px;
  border-radius: 10px;
  background: var(--text);
  color: var(--background);
  font-size: 10px;
  font-weight: 700;
  line-height: 20px;
  text-align: center;
}
</style>
