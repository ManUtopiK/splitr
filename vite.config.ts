import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import vue from '@vitejs/plugin-vue'
import { defineConfig, type Plugin } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

const version = (JSON.parse(readFileSync('./package.json', 'utf8')) as { version: string }).version

// Commit hash: GIT_COMMIT env wins (Nix builds have no .git), then git, then dev.
function gitCommit(): string {
  if (process.env.GIT_COMMIT) return process.env.GIT_COMMIT
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim()
  } catch {
    return 'dev'
  }
}

function metaVersion(): Plugin {
  return {
    name: 'meta-version',
    transformIndexHtml() {
      return [
        { tag: 'meta', attrs: { name: 'version', content: version }, injectTo: 'head' },
        { tag: 'meta', attrs: { name: 'commit', content: gitCommit() }, injectTo: 'head' },
      ]
    },
  }
}

// Build target: a single self-contained dist/index.html (JS + CSS inlined)
// so the app can be served by any static file server (Caddy, nginx, file://).
export default defineConfig({
  plugins: [vue(), viteSingleFile(), metaVersion()],
})
