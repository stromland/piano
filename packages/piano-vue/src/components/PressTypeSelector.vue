<script setup lang="ts">
import { PressType } from '@stromland/piano-lib';
import { computed } from 'vue';

import ToggleButton from './ToggleButton.vue';

type Props = {
  select: (type: PressType) => void;
  selected: PressType;
};

const props = defineProps<Props>();

const current = computed<PressType>(() => {
  return props.selected === PressType.SCALE ? PressType.CHORD : PressType.SCALE;
});
</script>

<template>
  <div class="press-container">
    <ToggleButton :pressed="false" @click="props.select(current)">
      {{ current }}
    </ToggleButton>
  </div>
</template>

<style scoped>
.press-container {
  display: flex;
}
</style>
