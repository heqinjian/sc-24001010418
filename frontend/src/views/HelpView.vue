<template>
  <div class="doc-page">
    <router-link to="/" class="back">← 返回首页</router-link>

    <div v-if="!doc" class="state">
      页面不存在。<router-link to="/" class="back">返回首页</router-link>
    </div>

    <article v-else class="article">
      <h1 class="article__title">{{ doc.title }}</h1>

      <section v-for="(s, i) in doc.sections" :key="i" class="article__section">
        <h2 v-if="s.heading">{{ s.heading }}</h2>
        <p v-for="(p, j) in s.paragraphs" :key="j">{{ p }}</p>
        <ul v-if="s.list">
          <li v-for="(item, k) in s.list" :key="k">{{ item }}</li>
        </ul>
      </section>
    </article>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { getHelpDoc } from '../data/help.js'

const route = useRoute()
const doc = computed(() => getHelpDoc(route.params.doc))
</script>

<style scoped>
.doc-page { max-width: 820px; margin: 20px auto 60px; padding: 0 20px; flex: 1; }
.back { color: var(--ph-primary); text-decoration: none; font-size: 14px; }
.state { padding: 60px 20px; text-align: center; color: #6b280; }
.article { margin-top: 16px; background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; padding: 32px 36px; }
.article__title { font-size: 26px; margin: 0; }
.article__section { margin-top: 24px; }
.article__section h2 { font-size: 17px; margin: 0 0 10px; padding-left: 10px; border-left: 3px solid var(--ph-primary); }
.article__section p { font-size: 14px; color: #4b5563; line-height: 1.8; margin: 8px 0; }
.article__section ul { margin: 8px 0; padding-left: 22px; }
.article__section li { font-size: 14px; color: #4b5563; line-height: 1.9; }
@media (max-width: 768px) { .article { padding: 22px; } }
</style>
