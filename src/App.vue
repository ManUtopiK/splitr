<script setup lang="ts">
import EditorPage from './components/editor/EditorPage.vue'
import ViewerPage from './components/viewer/ViewerPage.vue'
import { layoutFromParams } from './lib/urlCodec'

// Mode is fixed at load time: the URL is the single source of truth, and
// editor/viewer transitions happen through full navigations (shareable URLs).
const params = new URLSearchParams(window.location.search)
const initialLayout = layoutFromParams(params)
const isEditor = params.has('edit') || initialLayout === null
</script>

<template>
  <EditorPage v-if="isEditor" :initial-layout="initialLayout" />
  <ViewerPage v-else-if="initialLayout" :layout="initialLayout" />
</template>
