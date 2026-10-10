<template>
  <div>
    <h1>后台概览</h1>
    <div class="stats">
      <div class="stat"><div class="stat__n">{{ stats.products }}</div><div class="stat__l">在售商品</div></div>
      <div class="stat"><div class="stat__n">{{ stats.orders }}</div><div class="stat__l">订单总数</div></div>
      <div class="stat"><div class="stat__n">¥{{ stats.revenue.toFixed(0) }}</div><div class="stat__l">已确认金额</div></div>
    </div>
    <p class="hint">请使用左侧菜单管理商品与订单。</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { productApi } from '../../api/products.js'
import { adminApi } from '../../api/admin.js'

const stats = ref({ products: 0, orders: 0, revenue: 0 })

onMounted(async () => {
  try {
    const products = await productApi.list({ pageSize: 50 })
    stats.value.products = products.data.total
  } catch {}
  try {
    const orders = await adminApi.listOrders()
    const items = orders.data.items
    stats.value.orders = items.length
    stats.value.revenue = items
      .filter((o) => ['paid', 'shipped', 'completed'].includes(o.status))
      .reduce((s, o) => s + o.total_amount, 0)
  } catch {}
})
</script>

<style scoped>
h1 { font-size: 22px; }
.stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 16px; }
.stat {
  background: #fff; border: 1px solid #e5e7eb; border-radius: 12px;
  padding: 24px; text-align: center;
}
.stat__n { font-size: 28px; font-weight: 700; color: var(--ph-primary); }
.stat__l { font-size: 13px; color: #6b7280; margin-top: 6px; }
.hint { color: #6b7280; font-size: 13px; margin-top: 20px; }
</style>
