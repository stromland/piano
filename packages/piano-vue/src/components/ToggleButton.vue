<script setup lang="ts">
type Props = {
  pressed: boolean;
};

const props = defineProps<Props>();
</script>

<template>
  <button class="btn" :class="{ 'btn-active': props.pressed }">
    <slot></slot>
  </button>
</template>

<style scoped>
.btn {
  flex: 1;
  color: #000000;
  font-size: 1.1em;
  font-weight: bold;
  border: none;
  border-right: 1px solid var(--secondary-dark);
  border-top: none;
  border-bottom: 3px solid var(--secondary-dark);
  background: var(--secondary);
  padding: 5px 10px;
}

.btn-active {
  background: var(--primary);
  border-right: 1px solid var(--primary);
  border-bottom: 3px solid var(--primary-dark);
}

.btn:hover {
  background: var(--secondary-hover);
}

.btn-active:hover {
  background: var(--primary-hover);
}

.btn:active {
  background: var(--secondary-dark);
}

.btn-active:active {
  background: var(--primary-dark);
}

.btn:focus {
  outline: 0 !important;
}

.btn::-moz-focus-inner {
  border: 0;
}
</style>
