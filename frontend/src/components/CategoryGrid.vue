<template>
  <section class="categories">
    <h2 class="section-title">商品分类</h2>
    <div class="categories__grid">
      <router-link
        v-for="c in categories"
        :key="c.id"
        :to="`/products?categoryId=${c.id}`"
        class="category-card"
      >
        <div class="category-card__icon" :style="{ background: c.color }">{{ c.short }}</div>
        <div class="category-card__name">{{ c.name }}</div>
      </router-link>
    </div>
  </section>
</template>

<script setup>
// S2: categories are dev placeholders. Real categories come from /api/categories in S3.
const categories = [
  { id: 1, name: '3D 打印机', short: 'P', color: '#ff6a00' },
  { id: 2, name: '打印耗材', short: 'F', color: '#2563eb' },
  { id: 3, name: '打印配件', short: 'A', color: '#16a34a' },
  { id: 4, name: '3D 扫描设备', short: 'S', color: '#9333ea' }
]
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
