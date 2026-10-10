<template>
  <div class="home">
    <HeroBanner />

    <!-- P0 卖点条 -->
    <section class="trust-bar">
      <div v-for="item in trustItems" :key="item.title" class="trust-item">
        <div class="trust-item__icon">{{ item.icon }}</div>
        <div>
          <div class="trust-item__title">{{ item.title }}</div>
          <div class="trust-item__desc">{{ item.desc }}</div>
        </div>
      </div>
    </section>

    <CategoryGrid />

    <section class="featured">
      <div class="section-head">
        <h2 class="section-title">热门推荐</h2>
        <router-link to="/products" class="section-more">查看全部 →</router-link>
      </div>

      <div v-if="loading" class="state state--loading">正在加载商品…</div>
      <div v-else-if="error" class="state state--error">加载失败：{{ error }}</div>
      <div v-else-if="products.length === 0" class="state">暂无商品</div>
      <div v-else class="product-grid">
        <ProductCard v-for="p in products" :key="p.id" :product="p" />
      </div>
    </section>

    <!-- P0 入门教程 -->
    <section class="tutorials">
      <div class="section-head">
        <h2 class="section-title">新手指南</h2>
      </div>
      <div class="tutorial-grid">
        <router-link
          v-for="t in tutorials"
          :key="t.title"
          :to="`/guides/${t.id}`"
          class="tutorial-card"
        >
          <div class="tutorial-card__num">{{ t.no }}</div>
          <h3>{{ t.title }}</h3>
          <p>{{ t.desc }}</p>
          <span class="tutorial-card__more">阅读全文 →</span>
        </router-link>
      </div>
    </section>

    <!-- P0 FAQ -->
    <section class="faq">
      <div class="section-head">
        <h2 class="section-title">常见问题</h2>
      </div>
      <details v-for="(f, i) in faqs" :key="i" class="faq-item">
        <summary>{{ f.q }}</summary>
        <p>{{ f.a }}</p>
      </details>
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

const trustItems = [
  { icon: '🛡', title: '正品保障', desc: '品牌授权 · 假一赔十' },
  { icon: '🚚', title: '顺丰发货', desc: '48 小时内出库' },
  { icon: '↩️', title: '7 天无理由', desc: '未拆封免费退换' },
  { icon: '🎧', title: '技术支持', desc: '装机 / 调参一对一' }
]

const tutorials = [
  { id: 1, no: '01', title: '如何选第一台 3D 打印机', desc: 'FDM 与光固化的区别、成型体积与喷嘴温度怎么看。' },
  { id: 2, no: '02', title: 'PLA / ABS / PETG 怎么选', desc: '从打印难度、温度、后处理三个维度快速决策。' },
  { id: 3, no: '03', title: '常见故障排查', desc: '堵头、翘边、拉丝、层纹的现场处理办法。' }
]

const faqs = [
  { q: '下单后多久发货？', a: '现货商品 48 小时内顺丰发出，预售商品以详情页标注时间为准。' },
  { q: '支持七天无理由退换吗？', a: '未拆封、不影响二次销售的商品支持 7 天无理由退换。' },
  { q: '新手买打印机需要额外购买什么？', a: '建议备一卷测试耗材、备用喷嘴和一张 PEI 贴膜，详情页配件区已为你搭配好。' },
  { q: '可以开发票吗？', a: '下单后在订单页申请电子普通发票，3 个工作日内开出。' }
]

onMounted(async () => {
  try {
    const body = await productApi.list({ pageSize: 8, sort: 'asc' })
    products.value = body.data.items.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      stock: p.stock,
      image_url: p.image_url || '',
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
.trust-bar {
  max-width: 1200px;
  margin: 24px auto 0;
  padding: 0 20px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.trust-item {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  gap: 12px;
  align-items: center;
}
.trust-item__icon { font-size: 26px; }
.trust-item__title { font-size: 14px; font-weight: 600; }
.trust-item__desc { font-size: 12px; color: #6b7280; margin-top: 2px; }

.featured { max-width: 1200px; margin: 40px auto 0; padding: 0 20px; }
.section-head { display: flex; align-items: baseline; justify-content: space-between; }
.section-more { font-size: 13px; color: var(--ph-primary); text-decoration: none; }
.product-grid {
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.tutorials { max-width: 1200px; margin: 48px auto 0; padding: 0 20px; }
.tutorial-grid {
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.tutorial-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  text-decoration: none;
  color: var(--ph-text);
  transition: transform .15s, box-shadow .15s;
}
.tutorial-card:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,0,0,.08); }
.tutorial-card__num { font-size: 22px; font-weight: 800; color: var(--ph-primary); opacity: .4; }
.tutorial-card h3 { font-size: 15px; margin: 6px 0; }
.tutorial-card p { font-size: 13px; color: #6b7280; line-height: 1.6; margin: 0; }
.tutorial-card__more { display: inline-block; margin-top: 10px; font-size: 12px; color: var(--ph-primary); }

.faq { max-width: 1200px; margin: 48px auto 60px; padding: 0 20px; }
.faq-item {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  margin-top: 8px;
  padding: 12px 16px;
}
.faq-item summary { cursor: pointer; font-size: 14px; font-weight: 600; }
.faq-item p { font-size: 13px; color: #4b5563; line-height: 1.7; margin: 8px 0 0; }

.state { padding: 40px; text-align: center; color: #6b7280; }
.state--loading { color: var(--ph-primary); }
.state--error { color: #dc2626; }

@media (max-width: 1000px) {
  .product-grid { grid-template-columns: repeat(3, 1fr); }
  .tutorial-grid { grid-template-columns: repeat(2, 1fr); }
  .trust-bar { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .product-grid { grid-template-columns: repeat(2, 1fr); }
  .tutorial-grid { grid-template-columns: 1fr; }
  .trust-bar { grid-template-columns: repeat(2, 1fr); gap: 10px; }
}
</style>
