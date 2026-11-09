<script setup lang="ts">
import { computed, onMounted, useTemplateRef, watch } from 'vue';

import { type PianoKey, formatNoteName } from '@stromland/piano-lib';

const props = defineProps<{
  keys: PianoKey[];
  /** Says what the keyboard shows, for screen readers. */
  label: string;
}>();

/** Every white key, with the black key that overlaps its right edge. */
const whiteKeys = computed(() =>
  props.keys.flatMap((key, position) => {
    if (key.black) return [];
    const next = props.keys[position + 1];
    return [{ white: key, black: next?.black ? next : undefined }];
  }),
);

const pressedIndexes = computed(() =>
  props.keys
    .filter((key) => key.pressed)
    .map((key) => key.index)
    .join(),
);

const strip = useTemplateRef('strip');

/**
 * On a phone only part of the keyboard fits on screen, so bring the pressed
 * keys to the middle of it.
 */
function centerPressedKeys(behavior: ScrollBehavior) {
  const element = strip.value;
  if (!element) return;

  const pressed = [...element.querySelectorAll('.pressed')];
  if (pressed.length === 0) return;

  const edges = pressed.map((key) => key.getBoundingClientRect());
  const left = Math.min(...edges.map((edge) => edge.left));
  const right = Math.max(...edges.map((edge) => edge.right));
  const visible = element.getBoundingClientRect();
  const middle = (left + right) / 2 - visible.left + element.scrollLeft;

  element.scrollTo({ left: middle - element.clientWidth / 2, behavior });
}

onMounted(() => centerPressedKeys('instant'));
// 'auto' leaves the choice to CSS, which respects prefers-reduced-motion.
watch(pressedIndexes, () => centerPressedKeys('auto'), { flush: 'post' });
</script>

<template>
  <div ref="strip" class="keyboard" role="img" :aria-label="label" tabindex="0">
    <div class="keys" :style="{ '--white-keys': whiteKeys.length }">
      <div
        v-for="{ white, black } in whiteKeys"
        :key="white.index"
        class="key white"
        :class="{ pressed: white.pressed, root: white.root }"
      >
        <span>{{ formatNoteName(white.label) }}</span>
        <div
          v-if="black"
          class="key black"
          :class="{ pressed: black.pressed, root: black.root }"
        >
          <span>{{ formatNoteName(black.label) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.keyboard {
  overflow-x: auto;
  border-top: 6px solid var(--sunken);
  background: var(--sunken);
  scroll-behavior: smooth;
  scrollbar-color: var(--line) var(--sunken);
  scrollbar-width: thin;
}

.keyboard:focus-visible {
  outline-offset: -2px;
}

@media (prefers-reduced-motion: reduce) {
  .keyboard {
    scroll-behavior: auto;
  }
}

/* Keys never get narrower than 40px; the strip scrolls sideways instead. */
.keys {
  display: flex;
  min-width: calc(var(--white-keys) * 40px);
  height: clamp(160px, 20vw, 260px);
}

.key {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  border: 1px solid var(--key-line);
  border-top: 0;
  font-weight: 700;
  user-select: none;
}

.white {
  position: relative;
  flex: 1 0 0;
  min-width: 0;
  padding-bottom: 10px;
  border-radius: 0 0 6px 6px;
  background: var(--key-white);
  color: var(--key-white-ink);
  font-size: 13px;
}

.black {
  position: absolute;
  z-index: 1;
  top: 0;
  right: -31%;
  width: 62%;
  height: 62%;
  padding-bottom: 8px;
  border-radius: 0 0 5px 5px;
  background: var(--key-black);
  color: #fff;
  font-size: 11px;
}

.white.pressed {
  background: var(--accent);
  color: var(--accent-ink);
}

.black.pressed {
  background: var(--accent-strong);
}

.white.root {
  background: var(--root);
  color: var(--root-ink);
}

.black.root {
  background: var(--root-strong);
  color: var(--root-ink);
}
</style>
