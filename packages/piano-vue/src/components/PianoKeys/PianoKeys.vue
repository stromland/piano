<script setup lang="ts">
import type { PianoKey } from '@stromland/piano-lib';

import PianoKeyGroup from './PianoKeyGroup.vue';

type Props = {
  keys: PianoKey[];
};

const props = defineProps<Props>();
</script>

<template>
  <div class="key-container">
    <PianoKeyGroup
      v-for="(key, index) in props.keys"
      :key="index"
      :keys="props.keys"
      :pianoKey="key"
      :keyIndex="index"
    />
  </div>
</template>

<style scoped>
.key-container {
  display: flex;
  height: 40%;
  max-height: 600px;
  position: relative;
  width: 100%;
}
</style>
