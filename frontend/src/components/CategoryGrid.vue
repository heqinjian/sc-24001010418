<template>
  <section class="categories">
    <h2 class="section-title">商品分类</h2>
    <div class="categories__grid">
      <router-link
        v-for="(c, i) in categories"
        :key="c.id"
        :to="`/products?categoryId=${c.id}`"
        class="category-card"
      >
        <div class="category-card__icon" :style="{ background: colors[i % colors.length] }">
          {{ c.name.slice(0, 1) }}
        </div>
        <div class="category-card__name">{{ c.name }}</div>
      </router-link>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { categoryApi } from '../api/products.js'

const categories = ref([])
const colors = ['#ff6a00', '#2563eb', '#16a34a', '#9333ea']

onMounted(async () => {
  try {
    const body = await categoryApi.list()
    categories.value = body.data.items
  } catch (e) {
    // leave empty; no crash
  }
})
</script>

<style scoped>
.categories { max-width: 1200px; margin: 40px auto 0; padding: 0 20px; }
.section-title { font-size: 22px; margin: 0 0 16px; }
.categories__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.category-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  text-decoration: none;
  color: var(--ph-text);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  transition: transform .15s, box-shadow .15s;
}
.category-card:hover { transform: translateY(-3px); box-shadow: 0 6px 18px rgba(0,0,0,.06); }
.category-card__icon {
  width: 48px; height: 48px; border-radius: 12px;
  display: grid; place-items: center; color: #fff; font-size: 22px; font-weight: 700;
}
.category-card__name { font-size: 14px; font-weight: 600; }
@media (max-width: 768px) {
  .categories__grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
