<script setup lang="ts">
import type { PianoKey } from '@stromland/piano-lib';

defineProps<{ pianoKey: PianoKey }>();
</script>

<template>
  <div
    class="key"
    :class="{
      pressed: pianoKey.pressed,
      'black-key': pianoKey.black,
    }"
  >
    <span>{{ pianoKey.note }}</span>
  </div>
</template>

<style scoped>
.key {
  flex: 1;
  position: relative;
  display: flex;
  font-weight: bold;
  align-items: flex-end;
  border: 1px solid black;
  border-bottom: 5px solid black;
  justify-content: center;
  user-select: none;
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
  background: #f5f5f5;
}

.black-key {
  position: absolute;
  border-width: 2px;
  border-top-width: 1px;
  border-bottom: 5px solid #111111;
  width: 46%;
  height: 65%;
  right: -23%;
  z-index: 1;
  color: white;
  background: black;
}

.key:hover {
  background: var(--primary);
  color: black;
}

.key:active {
  background: var(--primary-dark);
  color: black;
}

.pressed {
  background: var(--primary-dark);
  color: black;
}
</style>
