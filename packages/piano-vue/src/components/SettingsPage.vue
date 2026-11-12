<script setup lang="ts">
import { useId } from 'vue';

defineEmits<{ licenses: [] }>();

const version = __APP_VERSION__;
const aboutId = useId();
</script>

<template>
  <div class="container page">
    <section class="section" :aria-labelledby="aboutId">
      <h2 :id="aboutId" class="heading">About</h2>
      <ul class="list">
        <li class="row">
          <span>Version</span>
          <span class="value">{{ version }}</span>
        </li>
        <li>
          <a
            class="row"
            href="https://github.com/stromland/piano"
            target="_blank"
            rel="noopener"
          >
            <span>Source code on GitHub</span>
            <svg
              aria-hidden="true"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M7 17L17 7M8 7h9v9" />
            </svg>
          </a>
        </li>
        <li>
          <button type="button" class="row" @click="$emit('licenses')">
            <span>Licenses</span>
            <svg
              aria-hidden="true"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.page {
  padding-block: 12px 32px;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.heading {
  margin: 0;
  padding-left: 4px;
  color: var(--label);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.list {
  margin: 0;
  padding: 0;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: var(--surface);
  list-style: none;
}

.list > li + li {
  border-top: 1px solid var(--line);
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  min-height: 52px;
  padding: 0 16px;
  border: 0;
  background: transparent;
  color: var(--text);
  font-size: 16px;
  text-align: left;
  text-decoration: none;
}

.row svg,
.value {
  color: var(--text-muted);
}

.value {
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
}

@media (hover: hover) {
  a.row:hover,
  button.row:hover {
    background: var(--surface-hover);
  }
}
</style>
