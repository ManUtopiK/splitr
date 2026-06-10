<script setup lang="ts">
import { shallowRef } from 'vue'

type Lang = 'en' | 'fr' | 'es'

function detectLang(): Lang {
  const code = (navigator.language || 'en').slice(0, 2).toLowerCase()
  return code === 'fr' || code === 'es' ? code : 'en'
}

const lang = shallowRef<Lang>(detectLang())
const langs: Lang[] = ['en', 'fr', 'es']
</script>

<template>
  <aside class="help">
    <nav class="langs" aria-label="Help language">
      <button
        v-for="code in langs"
        :key="code"
        :class="{ active: lang === code }"
        @click="lang = code"
      >
        {{ code.toUpperCase() }}
      </button>
    </nav>

    <template v-if="lang === 'en'">
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
    </template>

    <template v-else-if="lang === 'fr'">
      <p>
        <strong>splitr</strong> affiche plusieurs pages web sur un même écran et encode tout le
        layout dans l'URL : chaque combinaison se partage d'un simple lien.
      </p>
      <ul>
        <li>Saisissez une URL dans chaque panneau, puis <em>Open</em> ou <em>Copy URL</em>. Les icônes du header appliquent les dispositions courantes (colonnes, lignes, principal + latéraux, grille) en conservant les URLs déjà saisies.</li>
        <li>Glissez la barre entre les panneaux pour ajuster les tailles — les champs <em>size</em> suivent.</li>
        <li><em>split horizontal</em> divise un panneau en deux colonnes, <em>split vertical</em> en deux lignes. Les dispositions s'imbriquent librement.</li>
        <li><em>size</em> fixe la part du panneau dans son parent (%) ; <em>refresh</em> recharge le cadre toutes les N secondes.</li>
        <li>Deux panneaux côte à côte donnent une URL lisible (<code>?a=…&amp;b=…</code>) ; les dispositions complexes utilisent un paramètre compact <code>?l=…</code>.</li>
        <li>Dans le viewer, glissez les séparateurs pour redimensionner (mémorisé localement par URL) et utilisez le menu du coin haut gauche pour éditer, copier ou passer en plein écran.</li>
        <li>Certains sites refusent d'être intégrés en iframe (X-Frame-Options / CSP frame-ancestors) et resteront vides.</li>
      </ul>
    </template>

    <template v-else>
      <p>
        <strong>splitr</strong> muestra varias páginas web en una misma pantalla y codifica todo el
        layout en la URL: cualquier combinación se comparte con un solo enlace.
      </p>
      <ul>
        <li>Escriba una URL en cada panel y luego <em>Open</em> o <em>Copy URL</em>. Los iconos de la cabecera aplican las disposiciones habituales (columnas, filas, principal + laterales, cuadrícula) conservando las URLs ya escritas.</li>
        <li>Arrastre la barra entre paneles para ajustar los tamaños — los campos <em>size</em> se actualizan.</li>
        <li><em>split horizontal</em> divide un panel en dos columnas, <em>split vertical</em> en dos filas. Las disposiciones se anidan libremente.</li>
        <li><em>size</em> fija la parte del panel en su contenedor (%); <em>refresh</em> recarga el marco cada N segundos.</li>
        <li>Dos paneles lado a lado dan una URL legible (<code>?a=…&amp;b=…</code>); las disposiciones complejas usan un parámetro compacto <code>?l=…</code>.</li>
        <li>En el visor, arrastre los separadores para redimensionar (guardado localmente por URL) y use el menú de la esquina superior izquierda para editar, copiar o pasar a pantalla completa.</li>
        <li>Algunos sitios rechazan ser integrados en iframes (X-Frame-Options / CSP frame-ancestors) y quedarán en blanco.</li>
      </ul>
    </template>
  </aside>
</template>

<style scoped>
.help {
  position: relative;
  padding: 0.9rem 1.25rem;
  border-bottom: 1px solid var(--border);
  background: var(--bg-raised);
  color: var(--text-dim);
  font-size: 0.92rem;
  line-height: 1.55;
}

.langs {
  position: absolute;
  top: 0.7rem;
  right: 1rem;
  display: flex;
  gap: 0.25rem;
}

.langs button {
  padding: 0.15rem 0.45rem;
  font-size: 0.75rem;
  color: var(--text-dim);
  background: transparent;
}

.langs button.active {
  color: var(--accent);
  border-color: var(--accent);
}

.help p {
  margin-bottom: 0.4rem;
  padding-right: 8rem;
}

.help ul {
  padding-left: 1.2rem;
}

code {
  color: var(--accent);
}
</style>
