<template>
  <div class="home">
    <HeroBanner />
    <CategoryGrid />

    <section class="featured">
      <div class="section-head">
        <h2 class="section-title">热门推荐</h2>
      </div>

      <div v-if="loading" class="state state--loading">正在加载商品…</div>
      <div v-else-if="error" class="state state--error">加载失败：{{ error }}</div>
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
import { productApi } from '../api/products.js'

const products = ref([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const body = await productApi.list({ pageSize: 8, sort: 'asc' })
    products.value = body.data.items.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      stock: p.stock,
      gradient: 'linear-gradient(135deg,#94a3b8,#e2e8f0)'
    }))
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.home { flex: 1; }
.featured { max-width: 1200px; margin: 40px auto 0; padding: 0 20px; }
.section-head { display: flex; align-items: baseline; gap: 12px; }
.product-grid {
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.state { padding: 40px; text-align: center; color: #6b7280; }
.state--loading { color: var(--ph-primary); }
.state--error { color: #dc2626; }
@media (max-width: 1000px) { .product-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 768px) { .product-grid { grid-template-columns: repeat(2, 1fr); } }
</style>
