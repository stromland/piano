<script setup lang="ts">
import { useId } from 'vue';

defineProps<{ title: string }>();

const headingId = useId();
</script>

<template>
  <section class="section" role="group" :aria-labelledby="headingId">
    <h2 :id="headingId" class="heading">{{ title }}</h2>
    <slot />
  </section>
</template>

<style scoped>
.section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  /* Leaves some air below the section when it is scrolled into view. */
  scroll-margin-block: 24px;
}

.heading {
  margin: 0;
  color: var(--label);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
</style>
