import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Build target: a single self-contained dist/index.html (JS + CSS inlined)
// so the app can be served by any static file server (Caddy, nginx, file://).
export default defineConfig({
  plugins: [vue(), viteSingleFile()],
})
