<template>
  <main class="placeholder">
    <h2>{{ title }}</h2>
    <p>该页面将在后续阶段实现。</p>
    <router-link to="/" class="back">← 返回首页</router-link>
  </main>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
const title = computed(() => route.meta.title || '页面')
</script>

<style scoped>
.placeholder { max-width: 1200px; margin: 60px auto; padding: 0 20px; text-align: center; color: #6b7280; }
.back { display: inline-block; margin-top: 12px; color: var(--ph-primary); text-decoration: none; }
</style>
