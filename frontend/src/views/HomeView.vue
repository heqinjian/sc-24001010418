<template>
  <div class="home">
    <HeroBanner />
    <CategoryGrid />

    <section class="featured">
      <div class="section-head">
        <h2 class="section-title">热门推荐</h2>
        <span class="dev-tag">S2 开发占位数据 · S3 接入真实 API</span>
      </div>

      <div v-if="loading" class="state state--loading">正在加载商品…</div>
      <div v-else-if="products.length === 0" class="state">暂无商品</div>
      <div v-else class="product-grid">
        <ProductCard v-for="p in products" :key="p.id" :product="p" />
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import HeroBanner from '../components/HeroBanner.vue'
import CategoryGrid from '../components/CategoryGrid.vue'
import ProductCard from '../components/ProductCard.vue'
import { placeholderProducts } from '../data/placeholderProducts.js'

// S2: simulate async fetch so loading/empty states are real even with mock data.
const products = ref([])
const loading = ref(true)

onMounted(async () => {
  await new Promise((r) => setTimeout(r, 150))
  products.value = placeholderProducts
  loading.value = false
})
</script>

<style scoped>
.home { flex: 1; }
.featured { max-width: 1200px; margin: 40px auto 0; padding: 0 20px; }
.section-head { display: flex; align-items: baseline; gap: 12px; }
.dev-tag { font-size: 12px; color: #d97706; background: #fef3c7; padding: 2px 8px; border-radius: 999px; }
.product-grid {
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.state { padding: 40px; text-align: center; color: #6b7280; }
.state--loading { color: var(--ph-primary); }
@media (max-width: 1000px) { .product-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 768px) { .product-grid { grid-template-columns: repeat(2, 1fr); } }
</style>
