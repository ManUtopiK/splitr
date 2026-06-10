<template>
  <aside class="help">
    <p>
      <strong>splitr</strong> displays several web pages in one screen and encodes the whole
      layout in the URL, so any combination is shareable as a single link.
    </p>
    <ul>
      <li>Fill a URL in each panel, then <em>Open</em> or <em>Copy URL</em>. The header icons apply common layouts (columns, rows, main + side panels, grid) while keeping the URLs already typed.</li>
      <li>Drag the bar between panels to adjust sizes — the <em>size</em> fields follow.</li>
      <li><em>split horizontal</em> divides a panel into two columns, <em>split vertical</em> into two rows. Layouts can be nested freely.</li>
      <li><em>size</em> sets the panel share of its parent split (%); <em>refresh</em> reloads the frame every N seconds.</li>
      <li>Two panels side by side give a readable URL (<code>?a=…&amp;b=…</code>); complex layouts use a compact <code>?l=…</code> parameter.</li>
      <li>In the viewer, drag the dividers to resize (saved locally per URL) and use the top-left corner menu to edit, copy or go fullscreen.</li>
      <li>Some sites refuse to be embedded in iframes (X-Frame-Options / CSP frame-ancestors) and will stay blank.</li>
    </ul>
  </aside>
</template>

<style scoped>
.help {
  padding: 0.9rem 1.25rem;
  border-bottom: 1px solid var(--border);
  background: var(--bg-raised);
  color: var(--text-dim);
  font-size: 0.92rem;
  line-height: 1.55;
}

.help p {
  margin-bottom: 0.4rem;
}

.help ul {
  padding-left: 1.2rem;
}

code {
  color: var(--accent);
}
</style>
