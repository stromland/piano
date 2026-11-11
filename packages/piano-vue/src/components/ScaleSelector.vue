<script setup lang="ts">
import {
  SCALES,
  SCALE_GROUPS,
  SCALE_TYPES,
  type ScaleGroup,
  type ScaleType,
} from '@stromland/piano-lib';

import ChoiceChip from './ChoiceChip.vue';

const model = defineModel<ScaleType>({ required: true });

const groups = (Object.keys(SCALE_GROUPS) as ScaleGroup[]).map((group) => ({
  group,
  title: SCALE_GROUPS[group],
  types: SCALE_TYPES.filter((type) => SCALES[type].group === group),
}));
</script>

<template>
  <div class="groups">
    <div
      v-for="{ group, title, types } in groups"
      :key="group"
      class="group"
      role="group"
      :aria-label="title"
    >
      <h3 class="title">{{ title }}</h3>
      <div class="scales" :class="{ paired: group === 'majorAndMinor' }">
        <ChoiceChip
          v-for="type in types"
          :key="type"
          class="scale"
          :selected="type === model"
          @click="model = type"
        >
          {{ SCALES[type].name }}
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

.scales {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.scale {
  flex: 1 1 auto;
  padding-inline: 14px;
}

/* Major, minor and its two variants: four of a size, two by two. */
.paired {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
</style>
