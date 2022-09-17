<script setup lang="ts">
import type { PianoKey } from '@stromland/piano-lib';
import { computed } from 'vue';

import Key from './PianoKey.vue';

type Props = {
  keys: PianoKey[];
  pianoKey: PianoKey;
  keyIndex: number;
};

const props = defineProps<Props>();

const nextKey = computed(() => props.keys[props.keyIndex + 1]);
</script>

<template>
  <div v-if="!props.pianoKey.black" class="key-group">
    <Key :pianoKey="props.pianoKey" />
    <Key v-if="nextKey?.black" :pianoKey="nextKey" />
  </div>
</template>

<style scoped>
.key-group {
  flex: 1;
  display: flex;
  position: relative;
}
</style>
