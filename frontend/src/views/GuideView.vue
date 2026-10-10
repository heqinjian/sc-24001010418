<template>
  <div class="doc-page">
    <router-link to="/" class="back">← 返回首页</router-link>

    <div v-if="!guide" class="state">
      文章不存在。<router-link to="/" class="back">返回首页</router-link>
    </div>

    <article v-else class="article">
      <h1 class="article__title">{{ guide.title }}</h1>
      <p class="article__summary">{{ guide.summary }}</p>

      <section v-for="(s, i) in guide.sections" :key="i" class="article__section">
        <h2>{{ s.heading }}</h2>
        <p v-for="(p, j) in s.paragraphs" :key="j">{{ p }}</p>
        <ul v-if="s.list">
          <li v-for="(item, k) in s.list" :key="k">{{ item }}</li>
        </ul>
        <table v-if="s.table">
          <thead>
            <tr><th v-for="(h, k) in s.table.head" :key="k">{{ h }}</th></tr>
          </thead>
          <tbody>
            <tr v-for="(row, r) in s.table.rows" :key="r">
              <td v-for="(cell, c) in row" :key="c">{{ cell }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <div class="article__foot">
        <router-link to="/products" class="cta">去挑选设备与耗材 →</router-link>
      </div>
    </article>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { getGuide } from '../data/guides.js'

const route = useRoute()
const guide = computed(() => getGuide(route.params.id))
</script>

<style scoped>
.doc-page { max-width: 820px; margin: 20px auto 60px; padding: 0 20px; flex: 1; }
.back { color: var(--ph-primary); text-decoration: none; font-size: 14px; }
.state { padding: 60px 20px; text-align: center; color: #6b7280; }
.article { margin-top: 16px; background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; padding: 32px 36px; }
.article__title { font-size: 26px; margin: 0; }
.article__summary { font-size: 14px; color: #6b7280; margin: 10px 0 0; }
.article__section { margin-top: 28px; }
.article__section h2 { font-size: 17px; margin: 0 0 10px; padding-left: 10px; border-left: 3px solid var(--ph-primary); }
.article__section p { font-size: 14px; color: #4b5563; line-height: 1.8; margin: 8px 0; }
.article__section ul { margin: 8px 0; padding-left: 22px; }
.article__section li { font-size: 14px; color: #4b5563; line-height: 1.9; }
.article__section table { width: 100%; border-collapse: collapse; margin-top: 10px; }
.article__section th, .article__section td {
  border: 1px solid #e5e7eb; padding: 8px 10px; font-size: 13px; text-align: left;
}
.article__section th { background: #f8fafc; color: #475569; }
.article__foot { margin-top: 32px; text-align: center; }
.cta {
  display: inline-block; background: var(--ph-primary); color: #fff;
  padding: 10px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;
}
@media (max-width: 768px) { .article { padding: 22px; } }
</style>
