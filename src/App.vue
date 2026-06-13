<script setup lang="ts">
import EditorPage from './components/editor/EditorPage.vue'
import ViewerPage from './components/viewer/ViewerPage.vue'
import SessionViewerPage from './components/viewer/SessionViewerPage.vue'
import { layoutFromParams, titleFromParams } from './lib/urlCodec'
import { parseSession } from './lib/session'

// Mode is fixed at load time: the URL is the single source of truth, and
// editor/viewer transitions happen through full navigations (shareable URLs).
const params = new URLSearchParams(window.location.search)
const initialLayout = layoutFromParams(params)
const initialTitle = titleFromParams(params)

// A ?room= turns the viewer into a live session (?edit= still wins, so the
// presenter can re-open the editor on top of a session).
const session = parseSession(window.location.search, window.location.hash)
const isEditor = params.has('edit') || (initialLayout === null && !session)
</script>

<template>
  <EditorPage v-if="isEditor" :initial-layout="initialLayout" :initial-title="initialTitle" />
  <SessionViewerPage
    v-else-if="session"
    :session="session"
    :initial-layout="initialLayout"
    :initial-title="initialTitle"
  />
  <ViewerPage v-else-if="initialLayout" :layout="initialLayout" :title="initialTitle" />
</template>
