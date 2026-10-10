<template>
  <router-link :to="`/products/${product.id}`" class="product-card">
    <div class="product-card__img" :style="{ background: product.gradient }">
      <span>{{ product.name.slice(0, 1) }}</span>
    </div>
    <div class="product-card__body">
      <div class="product-card__name">{{ product.name }}</div>
      <div class="product-card__price">¥{{ product.price.toFixed(2) }}</div>
      <div class="product-card__stock" :class="{ 'is-low': product.stock < 5 }">
        {{ product.stock > 0 ? `库存 ${product.stock}` : '暂时缺货' }}
      </div>
    </div>
  </router-link>
</template>

<script setup>
defineProps({
  product: { type: Object, required: true }
})
</script>

<style scoped>
.product-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  text-decoration: none;
  color: var(--ph-text);
  display: flex;
  flex-direction: column;
  transition: transform .15s, box-shadow .15s;
}
.product-card:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,0,0,.08); }
.product-card__img {
  height: 160px;
  display: grid;
  place-items: center;
  color: rgba(255,255,255,.85);
  font-size: 44px;
  font-weight: 800;
}
.product-card__body { padding: 12px 14px 16px; }
.product-card__name {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  height: 40px;
  overflow: hidden;
}
.product-card__price { margin-top: 8px; color: var(--ph-primary); font-size: 18px; font-weight: 700; }
.product-card__stock { margin-top: 4px; font-size: 12px; color: #6b7280; }
.product-card__stock.is-low { color: #dc2626; }
</style>
