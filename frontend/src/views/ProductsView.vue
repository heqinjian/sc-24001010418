<template>
  <div class="products-page">
    <aside class="filters">
      <h3>分类</h3>
      <button
        class="filter-btn"
        :class="{ active: selectedCategory === null }"
        @click="setCategory(null)"
      >全部商品</button>
      <button
        v-for="c in categories"
        :key="c.id"
        class="filter-btn"
        :class="{ active: selectedCategory === c.id }"
        @click="setCategory(c.id)"
      >{{ c.name }} <small>({{ c.product_count }})</small></button>
    </aside>

    <section class="main">
      <div class="toolbar">
        <input v-model="keyword" placeholder="搜索商品…" @keyup.enter="reload" />
        <select v-model="sort" @change="reload">
          <option value="">默认排序</option>
          <option value="asc">价格从低到高</option>
          <option value="desc">价格从高到低</option>
        </select>
      </div>

      <div v-if="loading" class="state">加载中…</div>
      <div v-else-if="error" class="state state--error">加载失败：{{ error }}</div>
      <div v-else-if="items.length === 0" class="state">没有找到符合条件的商品</div>

      <div v-else class="grid">
        <ProductCard v-for="p in items" :key="p.id" :product="toCard(p)" />
      </div>

      <div v-if="total > pageSize" class="pager">
        <button :disabled="page <= 1" @click="changePage(page - 1)">上一页</button>
        <span>第 {{ page }} / {{ totalPages }} 页（共 {{ total }} 件）</span>
        <button :disabled="page >= totalPages" @click="changePage(page + 1)">下一页</button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ProductCard from '../components/ProductCard.vue'
import { productApi, categoryApi } from '../api/products.js'

const route = useRoute()
const router = useRouter()

const items = ref([])
const categories = ref([])
const total = ref(0)
const page = ref(Number(route.query.page) || 1)
const pageSize = ref(8)
const loading = ref(true)
const error = ref('')
const keyword = ref(route.query.keyword || '')
const sort = ref(route.query.sort || '')
const selectedCategory = ref(route.query.categoryId ? Number(route.query.categoryId) : null)

// Backend returns flat fields; ProductCard expects price/stock/name + gradient.
function toCard(p) {
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    stock: p.stock,
    gradient: 'linear-gradient(135deg,#94a3b8,#e2e8f0)'
  }
}

async function loadCategories() {
  try {
    const body = await categoryApi.list()
    categories.value = body.data.items
  } catch (e) {
    // non-fatal: list still works
  }
}

async function reload() {
  loading.value = true
  error.value = ''
  try {
    const body = await productApi.list({
      keyword: keyword.value || undefined,
      categoryId: selectedCategory.value || undefined,
      sort: sort.value || undefined,
      page: page.value,
      pageSize: pageSize.value
    })
    items.value = body.data.items
    total.value = body.data.total
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

function setCategory(id) {
  selectedCategory.value = id
  page.value = 1
  reload()
}
function changePage(p) {
  page.value = p
  reload()
}

onMounted(async () => {
  await loadCategories()
  await reload()
})
</script>

<style scoped>
.products-page {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 20px;
  flex: 1;
}
.filters h3 { margin: 0 0 10px; font-size: 15px; }
.filter-btn {
  display: block;
  width: 100%;
  text-align: left;
  background: #fff;
  border: 1px solid #e5e7eb;
  padding: 8px 12px;
  margin-bottom: 6px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
}
.filter-btn.active { border-color: var(--ph-primary); color: var(--ph-primary); font-weight: 600; }
.toolbar { display: flex; gap: 10px; margin-bottom: 16px; }
.toolbar input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
}
.toolbar select { padding: 8px 10px; border-radius: 8px; border: 1px solid #d1d5db; }
.grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.state { padding: 40px; text-align: center; color: #6b7280; }
.state--error { color: #dc2626; }
.pager { margin-top: 20px; display: flex; gap: 12px; align-items: center; justify-content: center; font-size: 13px; }
.pager button { padding: 6px 14px; border-radius: 6px; border: 1px solid #d1d5db; background: #fff; cursor: pointer; }
.pager button:disabled { opacity: .5; cursor: not-allowed; }
@media (max-width: 1000px) { .grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 768px) {
  .products-page { grid-template-columns: 1fr; }
  .grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
