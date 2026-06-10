<script setup lang="ts">
import { shallowRef } from 'vue'
import { useEditorTree } from '../../composables/useEditorTree'
import { deleteConfig, loadConfigs, saveConfig } from '../../lib/storage'
import type { SavedConfig } from '../../types'

const tree = useEditorTree()

const configs = shallowRef<SavedConfig[]>(loadConfigs())
const name = shallowRef('')

function save(): void {
  const trimmed = name.value.trim()
  if (!trimmed) return
  configs.value = saveConfig(trimmed, tree.layout.value)
  name.value = ''
}

function load(config: SavedConfig): void {
  tree.setLayout(config.layout)
}

function remove(config: SavedConfig): void {
  configs.value = deleteConfig(config.name)
}
</script>

<template>
  <div class="saved">
    <form class="save-form" @submit.prevent="save">
      <input v-model="name" type="text" placeholder="Config name" />
      <button :disabled="!name.trim()">Save</button>
    </form>
    <ul v-if="configs.length">
      <li v-for="config in configs" :key="config.name">
        <button class="load" :title="`Load ${config.name}`" @click="load(config)">
          {{ config.name }}
        </button>
        <button class="remove" title="Delete" @click="remove(config)">✕</button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.saved {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  min-width: 0;
}

.save-form {
  display: flex;
  gap: 0.4rem;
}

.save-form input {
  width: 11rem;
}

ul {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  list-style: none;
}

li {
  display: inline-flex;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}

li button {
  border: none;
  border-radius: 0;
  padding: 0.35rem 0.6rem;
  background: var(--bg-raised);
}

li .load:hover {
  background: var(--accent-soft);
}

li .remove {
  color: var(--text-dim);
  border-left: 1px solid var(--border);
}

li .remove:hover {
  color: var(--danger);
}
</style>
