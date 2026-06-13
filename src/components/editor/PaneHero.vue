<script setup lang="ts">
import SplitLogo from '../SplitLogo.vue'

// Discovery hero shown in empty editor panes: a punchy pitch with the headline
// features, so a first-time visitor immediately gets what splitr is for.
</script>

<template>
  <div class="hero">
    <div class="brand">
      <SplitLogo :size="24" class="logo" />
      <strong>Splitr</strong>
    </div>

    <h2 class="tagline">One link, all your pages, side by side.</h2>
    <p class="sub">
      Lay out any websites in one split screen, then share the exact view as a URL.<br><strong>No account, nothing to install.</strong>
    </p>

    <ul class="features">
      <li><b>Shareable layouts</b> : the whole split is data encoded in the URL.<br>One link recreates it anywhere.</li>
      <li><b>Live sessions</b> : present to a room in real time, with a shared cursor.</li>
      <li><b>Live dashboards</b> : auto-refresh any panel on its own timer.</li>
    </ul>
  </div>
</template>

<style scoped>
.hero {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.8rem;
  max-width: 30rem;
  text-align: left;
  margin-bottom: 4rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo {
  color: var(--accent);
}

.brand strong {
  font-size: 1.2rem;
  letter-spacing: 0.04em;
}

.tagline {
  margin: 0;
  font-size: 1.45rem;
  line-height: 1.2;
  color: var(--text);
}

.sub {
  margin: 0;
  color: var(--text-dim);
  line-height: 1.5;
}

.features {
  margin: 0.2rem 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.features li {
  position: relative;
  padding-left: 1.1rem;
  color: var(--text-dim);
  line-height: 1.45;
}

.features li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.55em;
  width: 6px;
  height: 6px;
  border-radius: 2px;
  background: var(--accent);
}

.features b {
  color: var(--text);
  font-weight: 600;
}
</style>
