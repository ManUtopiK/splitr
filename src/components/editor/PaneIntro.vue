<script setup lang="ts">
import { ref } from 'vue'
import SplitLogo from '../SplitLogo.vue'

// Shown in empty editor panes. A Help toggle (top-right) slides the body between
// the marketing hero and a concise how-it-works guide. Both live side by side in
// a track, so the height stays at the taller of the two and the swap animates
// horizontally. The first pane defaults to the hero, the others to help.
const props = defineProps<{ defaultHelp?: boolean }>()
const showHelp = ref(props.defaultHelp ?? false)
</script>

<template>
  <div class="intro">
    <div class="head">
      <div class="brand">
        <SplitLogo :size="24" class="logo" />
        <span class="wordmark">
          <span class="word-track" :class="{ help: showHelp }">
            <strong>Splitr</strong>
            <strong>Help</strong>
          </span>
        </span>
      </div>
      <button class="help-toggle" :class="{ active: showHelp }" @click="showHelp = !showHelp">
        ? Help
      </button>
    </div>

    <div class="body">
      <div class="track" :class="{ help: showHelp }">
        <div class="slide">
          <h2 class="tagline">One link, all your pages, side by side.</h2>
          <p class="sub">
            Lay out any websites in one split screen, then share the exact view as a URL.<br />
            <strong>No account, nothing to install.</strong>
          </p>
          <ul class="features">
            <li><b>Shareable layouts</b> : the whole split is encoded in the URL. One link recreates it anywhere.</li>
            <li><b>Live sessions</b> : present to a room in real time, with a shared cursor.</li>
            <li><b>Live dashboards</b> : auto-refresh any panel on its own timer.</li>
          </ul>
        </div>

        <div class="slide">
          <div class="section">
            <h3 class="guide-title">Build</h3>
            <ol class="guide">
              <li><b>Add pages</b> : type a URL in each panel.</li>
              <li><b>Arrange</b> : split a panel into columns (↔) or rows (↕)<br> Nest as deep as you like.</li>
              <li><b>Tune</b> : drag the bar between panels to resize, or set a refresh interval.</li>
              <li><b>Preview</b> : hit <em>Go!</em> to load a panel inline.</li>
            </ol>
          </div>

          <div class="section">
            <h3 class="guide-title">Share</h3>
            <ul class="share">
              <li><b>Copy URL</b> : the exact layout as a single link.</li>
              <li><b>Open</b> : view the layout full-screen.</li>
              <li><b>Presenter mode</b> : drive the layout live for everyone, with a shared cursor.</li>
            </ul>
          </div>

          <p class="note">Some sites block embedding (X-Frame-Options / CSP) and stay blank.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.intro {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.8rem;
  width: min(30rem, 100%);
  text-align: left;
  margin-bottom: 3rem;
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  width: 100%;
  margin-bottom: 0.2rem;
}

.help-toggle {
  padding: 0.5rem 1rem;
  font-size: 0.95rem;
  font-weight: 600;
}

.help-toggle.active {
  color: var(--accent);
  border-color: var(--accent);
  background: var(--accent-soft);
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo {
  color: var(--accent);
  margin-bottom: 0.1rem;
}

/* Vertical slot: "Splitr" / "Help" stacked; toggling slides up/down. */
.wordmark {
  display: inline-block;
  height: 1.5em;
  overflow: hidden;
  font-size: 1.2rem;
  letter-spacing: 0.04em;
  line-height: 1.5;
}

.word-track {
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;
}

.word-track.help {
  transform: translateY(-50%);
}

.word-track strong {
  line-height: 1.5;
}

/* Sliding viewport: both slides sit side by side; height tracks the taller. */
.body {
  width: 100%;
  overflow: hidden;
}

.track {
  display: flex;
  width: 200%;
  align-items: flex-start;
  transition: transform 0.35s ease;
}

.track.help {
  transform: translateX(-50%);
}

.slide {
  width: 50%;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
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

.section {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.guide-title {
  margin: 0;
  font-size: 1.45rem;
  line-height: 1.2;
  color: var(--text);
}

.guide {
  margin-bottom: 0.8rem;
  padding-left: 1.3rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  color: var(--text-dim);
  line-height: 1.45;
}

.share {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  color: var(--text-dim);
  line-height: 1.45;
}

.share li {
  position: relative;
  padding-left: 1.1rem;
}

.share li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.55em;
  width: 6px;
  height: 6px;
  border-radius: 2px;
  background: var(--accent);
}

.share b {
  color: var(--text);
  font-weight: 600;
}

.guide li::marker {
  color: var(--accent);
  font-weight: 700;
}

.guide b {
  color: var(--text);
  font-weight: 600;
}

.guide em {
  color: var(--accent);
  font-style: normal;
}

.note {
  margin: 0.3rem 0 0;
  font-size: 0.88rem;
  color: var(--text-dim);
  opacity: 0.85;
}
</style>
