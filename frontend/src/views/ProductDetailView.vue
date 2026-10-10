<template>
  <div class="detail-page">
    <router-link to="/products" class="back">← 返回商品列表</router-link>

    <div v-if="loading" class="state">加载中…</div>
    <div v-else-if="notFound" class="state state--warn">
      商品不存在或已下架。
      <router-link to="/products" class="back">去看看其他商品</router-link>
    </div>
    <div v-else-if="error" class="state state--error">加载失败：{{ error }}</div>

    <div v-else-if="product" class="detail">
      <div class="detail__media">
        <div class="img-wrap">
          <img
            v-if="product.image_url"
            :src="product.image_url"
            :alt="product.name"
          />
          <div v-else class="img-placeholder">
            <span>{{ product.name.slice(0, 1) }}</span>
          </div>
        </div>
      </div>

      <div class="detail__info">
        <div class="detail__category">{{ product.category_name }}</div>
        <h1 class="detail__name">{{ product.name }}</h1>
        <div class="detail__price">¥{{ product.price.toFixed(2) }}</div>

        <div class="detail__stock" :class="{ 'is-low': product.stock < 5, 'is-out': product.stock === 0 }">
          {{ product.stock > 0 ? `库存 ${product.stock} 件` : '暂时缺货' }}
        </div>

        <div class="qty-row">
          <label>数量</label>
          <div class="qty-stepper">
            <button @click="changeQty(quantity - 1)" :disabled="quantity <= 1">−</button>
            <input
              v-model.number="quantity"
              type="number"
              min="1"
              :max="product.stock"
              @change="clampQty"
            />
            <button @click="changeQty(quantity + 1)" :disabled="quantity >= product.stock">+</button>
          </div>
        </div>

        <button
          class="add-btn"
          :disabled="product.stock === 0"
          @click="onAdd"
        >
          {{ product.stock === 0 ? '已缺货' : '加入购物车' }}
        </button>

        <div class="promise-bar">
          <span>✓ 正品保障</span>
          <span>✓ 7 天无理由</span>
          <span>✓ 顺丰发货</span>
          <span>✓ 技术支持</span>
        </div>

        <section class="detail__section">
          <h3>商品描述</h3>
          <p>{{ product.description }}</p>
        </section>

        <section class="detail__section">
          <h3>规格参数</h3>
          <table v-if="specRows.length" class="spec-table">
            <tbody>
              <tr v-for="(row, i) in specRows" :key="i">
                <th>{{ row[0] }}</th>
                <td>{{ row[1] }}</td>
              </tr>
            </tbody>
          </table>
          <p v-else class="spec">{{ product.specifications }}</p>
        </section>
      </div>
    </div>

    <!-- 相似推荐 -->
    <section v-if="related.length" class="related">
      <h2 class="related__title">相似商品推荐</h2>
      <div class="related-grid">
        <ProductCard v-for="p in related" :key="p.id" :product="toCard(p)" />
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { productApi } from '../api/products.js'
import { useCartStore } from '../stores/cart.js'
import ProductCard from '../components/ProductCard.vue'

const cart = useCartStore()
const route = useRoute()

const product = ref(null)
const related = ref([])
const loading = ref(true)
const error = ref('')
const notFound = ref(false)
const quantity = ref(1)

// Parse "key：value；key：value" style spec text into table rows.
const specRows = computed(() => {
  const text = product.value?.specifications || ''
  return text.split(/[；;]/).map((part) => {
    const m = part.split(/[：:]/)
    if (m.length >= 2) return [m[0].trim(), m.slice(1).join('：').trim()]
    return [part.trim(), '']
  }).filter((r) => r[0])
})

function toCard(p) {
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    stock: p.stock,
    image_url: p.image_url || '',
    gradient: 'linear-gradient(135deg,#94a3b8,#e2e8f0)'
  }
}

async function load(id) {
  loading.value = true
  error.value = ''
  notFound.value = false
  product.value = null
  related.value = []
  quantity.value = 1
  try {
    const body = await productApi.getById(id)
    product.value = body.data

    // Fetch same-category products for related recommendations.
    try {
      const r = await productApi.list({
        categoryId: body.data.category_id,
        pageSize: 4
      })
      related.value = (r.data.items || []).filter((x) => x.id !== body.data.id).slice(0, 4)
    } catch {}
  } catch (e) {
    if (/不存在/.test(e.message)) notFound.value = true
    else error.value = e.message
  } finally {
    loading.value = false
  }
}

function changeQty(n) {
  if (!product.value) return
  quantity.value = Math.min(product.value.stock, Math.max(1, n))
}
function clampQty() {
  if (!product.value) return
  if (!Number.isFinite(quantity.value)) quantity.value = 1
  changeQty(quantity.value)
}

function onAdd() {
  if (!product.value || product.value.stock === 0) return
  cart.addItem(product.value, quantity.value)
  ElMessage.success(`已加入购物车：${product.value.name} × ${quantity.value}`)
}

watch(
  () => route.params.id,
  (id) => load(id),
  { immediate: true }
)
</script>

<style scoped>
.detail-page { max-width: 1200px; margin: 20px auto; padding: 0 20px 40px; flex: 1; }
.back { color: var(--ph-primary); text-decoration: none; font-size: 14px; }
.state { padding: 60px 20px; text-align: center; color: #6b7280; }
.state--error { color: #dc2626; }
.state--warn { color: #d97706; }
.detail { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 16px; }
.img-wrap {
  height: 420px;
  border-radius: 14px;
  overflow: hidden;
  background: #f1f5f9;
  display: grid;
  place-items: center;
}
.img-wrap img { width: 100%; height: 100%; object-fit: cover; display: block; }
.img-placeholder {
  width: 100%; height: 100%;
  background: linear-gradient(135deg,#94a3b8,#e2e8f0);
  display: grid; place-items: center;
  color: rgba(255,255,255,.9); font-size: 90px; font-weight: 800;
}
.detail__category { font-size: 13px; color: #6b7280; }
.detail__name { font-size: 26px; margin: 6px 0 12px; }
.detail__price { font-size: 30px; color: var(--ph-primary); font-weight: 700; }
.detail__stock { margin-top: 8px; font-size: 13px; color: #16a34a; }
.detail__stock.is-low { color: #d97706; }
.detail__stock.is-out { color: #dc2626; }
.qty-row { display: flex; align-items: center; gap: 14px; margin: 20px 0; }
.qty-stepper { display: flex; align-items: center; }
.qty-stepper button {
  width: 34px; height: 34px; border: 1px solid #d1d5db; background: #fff;
  cursor: pointer; font-size: 16px;
}
.qty-stepper input {
  width: 60px; height: 34px; text-align: center;
  border: 1px solid #d1d5db; border-left: none; border-right: none;
}
.add-btn {
  width: 100%; padding: 12px; border: none; border-radius: 10px;
  background: var(--ph-primary); color: #fff; font-size: 16px; font-weight: 600; cursor: pointer;
}
.add-btn:disabled { background: #d1d5db; cursor: not-allowed; }
.promise-bar {
  margin-top: 12px;
  display: flex; flex-wrap: wrap; gap: 14px;
  font-size: 12px; color: #4b5563;
}
.detail__section { margin-top: 24px; }
.detail__section h3 { font-size: 15px; margin: 0 0 8px; }
.detail__section p { font-size: 14px; color: #4b5563; line-height: 1.7; margin: 0; }
.spec-table { width: 100%; border-collapse: collapse; background: #fff; }
.spec-table th, .spec-table td {
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  font-size: 13px;
  text-align: left;
}
.spec-table th { width: 130px; background: #f8fafc; color: #475569; font-weight: 600; }

.related { margin-top: 48px; }
.related__title { font-size: 18px; margin: 0 0 16px; }
.related-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
@media (max-width: 1000px) {
  .related-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 768px) {
  .detail { grid-template-columns: 1fr; gap: 20px; }
  .img-wrap { height: 280px; }
  .related-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
