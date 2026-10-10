<template>
  <router-link :to="`/products/${product.id}`" class="product-card">
    <div
      class="product-card__img"
      :style="{ background: product.gradient || '#e5e7eb' }"
    >
      <img
        v-if="product.image_url"
        :src="product.image_url"
        :alt="product.name"
        loading="lazy"
        @error="onImgError"
      />
      <span v-if="!product.image_url">{{ product.name.slice(0, 1) }}</span>
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

function onImgError(e) {
  // Image failed: hide it and fall back to the letter placeholder.
  const img = e.target
  img.style.display = 'none'
  const span = img.parentElement.querySelector('span')
  if (!span) {
    const s = document.createElement('span')
    s.textContent = img.alt.slice(0, 1)
    img.parentElement.appendChild(s)
  }
}
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
  height: 180px;
  display: grid;
  place-items: center;
  overflow: hidden;
}
.product-card__img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.product-card__img span {
  color: rgba(255,255,255,.9);
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
