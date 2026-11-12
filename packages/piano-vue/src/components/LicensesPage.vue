<script setup lang="ts">
import { useLicenses } from '../composables/useLicenses';

const { licenses, complete } = useLicenses();
</script>

<template>
  <div class="container page">
    <p class="intro">
      Piano and the work it is built on, each with its license.
    </p>
    <ul class="licenses">
      <li v-for="item in licenses" :key="item.name" class="license">
        <div class="top">
          <h2 class="name">{{ item.name }}</h2>
          <span class="id">{{ item.license }}</span>
        </div>
        <p class="about">{{ item.about }}</p>
        <details>
          <summary>
            <svg
              class="chevron"
              aria-hidden="true"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.4"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
            Show license
          </summary>
          <pre class="text">{{ item.text }}</pre>
        </details>
      </li>
    </ul>
    <p v-if="complete === false" class="intro">
      The packages the app is built with are listed here in a build of the app.
    </p>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-block: 12px 32px;
}

.intro {
  max-width: 62ch;
  margin: 0;
  padding-inline: 4px;
  color: var(--text-muted);
  font-size: 15px;
  line-height: 1.5;
}

.licenses {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.license {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 16px 4px;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: var(--surface);
}

.top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.name {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.id {
  flex: 0 0 auto;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--sunken);
  color: var(--label);
  font-size: 12px;
  font-weight: 700;
  line-height: 1.5;
}

.about {
  margin: 0;
  color: var(--text-muted);
  font-size: 14px;
  line-height: 1.45;
}

summary {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: var(--tap-size);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  list-style: none;
}

summary::-webkit-details-marker {
  display: none;
}

.chevron {
  transition: transform 0.15s;
}

details[open] .chevron {
  transform: rotate(180deg);
}

@media (prefers-reduced-motion: reduce) {
  .chevron {
    transition: none;
  }
}

.text {
  max-height: 280px;
  margin: 0 0 12px;
  padding: 12px;
  overflow: auto;
  border-radius: 10px;
  background: var(--sunken);
  color: var(--text-muted);
  font-family: ui-monospace, Menlo, Consolas, monospace;
  font-size: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
</style>
