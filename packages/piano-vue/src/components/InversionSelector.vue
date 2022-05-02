<script setup lang="ts">
import { Inversion } from '@stromland/piano-lib';

import ToggleButton from './ToggleButton.vue';

type Props = {
  select: (inversion: Inversion) => void;
  selected: Inversion;
};

const props = defineProps<Props>();
</script>

<template>
  <div class="inversion-container">
    <ToggleButton
      v-for="inversion in Inversion"
      :key="inversion"
      :pressed="props.selected === inversion"
      @click="props.select(inversion)"
    >
      {{ inversion }}
    </ToggleButton>
  </div>
</template>

<style scoped>
.inversion-container {
  display: flex;
}
</style>
