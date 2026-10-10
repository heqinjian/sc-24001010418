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
        <div class="img-placeholder">
          <span>{{ product.name.slice(0, 1) }}</span>
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
          @click="$emit('add-to-cart', { product, quantity })"
        >
          {{ product.stock === 0 ? '已缺货' : '加入购物车' }}
        </button>

        <section class="detail__section">
          <h3>商品描述</h3>
          <p>{{ product.description }}</p>
        </section>

        <section class="detail__section">
          <h3>规格参数</h3>
          <p class="spec">{{ product.specifications }}</p>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { productApi } from '../api/products.js'

defineEmits(['add-to-cart'])
const route = useRoute()

const product = ref(null)
const loading = ref(true)
const error = ref('')
const notFound = ref(false)
const quantity = ref(1)

async function load(id) {
  loading.value = true
  error.value = ''
  notFound.value = false
  product.value = null
  quantity.value = 1
  try {
    const body = await productApi.getById(id)
    product.value = body.data
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

watch(
  () => route.params.id,
  (id) => load(id),
  { immediate: true }
)
</script>

<style scoped>
.detail-page { max-width: 1200px; margin: 20px auto; padding: 0 20px; flex: 1; }
.back { color: var(--ph-primary); text-decoration: none; font-size: 14px; }
.state { padding: 60px 20px; text-align: center; color: #6b7280; }
.state--error { color: #dc2626; }
.state--warn { color: #d97706; }
.detail { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 16px; }
.img-placeholder {
  height: 420px;
  border-radius: 14px;
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
.detail__section { margin-top: 24px; }
.detail__section h3 { font-size: 15px; margin: 0 0 8px; }
.detail__section p { font-size: 14px; color: #4b5563; line-height: 1.7; margin: 0; }
.spec { white-space: pre-wrap; }
@media (max-width: 768px) {
  .detail { grid-template-columns: 1fr; gap: 20px; }
  .img-placeholder { height: 260px; }
}
</style>
