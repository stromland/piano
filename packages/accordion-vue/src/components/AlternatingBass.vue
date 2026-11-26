<script setup lang="ts">
import { formatNoteName } from '@stromland/music-theory';

import type { Beat } from '../board';

defineProps<{ beats: Beat[] }>();
</script>

<template>
  <div class="alternating">
    <h3 class="title">Alternating bass</h3>
    <ol class="beats">
      <li v-for="{ beat, button, role } in beats" :key="beat" class="beat">
        <span class="number" :class="role">{{ beat }}</span>
        {{ formatNoteName(button.name) }}
      </li>
    </ol>
  </div>
</template>

<style scoped>
.alternating {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 16px;
  padding-top: 12px;
  border-top: 1px solid var(--line);
}

.title {
  margin: 0;
  color: var(--text-muted);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.beats {
  display: flex;
  gap: 14px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.beat {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
}

.number {
  width: 22px;
  height: 22px;
  border-radius: 11px;
  background: var(--root);
  color: var(--root-ink);
  font-size: 11px;
  font-weight: 700;
  line-height: 22px;
  text-align: center;
}

.number.chord {
  background: var(--accent);
  color: var(--accent-ink);
}
</style>
