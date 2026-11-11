<script setup lang="ts">
import { computed } from 'vue';

import {
  CHORD_SIZES,
  CHORD_TYPES,
  CHORD_TYPE_IDS,
  type ChordSize,
  type ChordType,
  formatNoteName,
  getChord,
} from '@stromland/piano-lib';

import ChoiceChip from './ChoiceChip.vue';

const props = defineProps<{
  /** Pitch class of the root note, to name each chord. */
  root: number;
}>();

const model = defineModel<ChordType>({ required: true });

const groups = computed(() =>
  (Object.keys(CHORD_SIZES) as ChordSize[]).map((size) => ({
    size,
    title: CHORD_SIZES[size],
    types: CHORD_TYPE_IDS.filter((type) => CHORD_TYPES[type].size === size).map(
      (type) => ({
        type,
        name: formatNoteName(getChord(props.root, type).name),
        label: CHORD_TYPES[type].name,
      }),
    ),
  })),
);
</script>

<template>
  <div class="groups">
    <div
      v-for="{ size, title, types } in groups"
      :key="size"
      class="group"
      role="group"
      :aria-label="title"
    >
      <h3 class="title">{{ title }}</h3>
      <div class="types">
        <ChoiceChip
          v-for="{ type, name, label } in types"
          :key="type"
          class="type"
          :selected="type === model"
          :aria-label="`${name}, ${label}`"
          @click="model = type"
        >
          <span class="name">{{ name }}</span>
          <span class="label">{{ label }}</span>
        </ChoiceChip>
      </div>
    </div>
  </div>
</template>

<style scoped>
.groups {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.title {
  margin: 0;
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 600;
}

.types {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  gap: 6px;
}

.type {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-height: 58px;
  padding: 6px;
}

.name {
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 700;
  line-height: 1.1;
}

.label {
  font-size: 12px;
}
</style>
