<template>
  <div class="orders">
    <h1>我的订单</h1>
    <div v-if="loading" class="state">加载中…</div>
    <div v-else-if="error" class="state state--error">{{ error }}</div>
    <div v-else-if="items.length === 0" class="state">
      还没有订单。<router-link to="/products" class="go">去下单 →</router-link>
    </div>

    <div v-else class="list">
      <router-link v-for="o in items" :key="o.id" :to="`/orders/${o.id}`" class="order-card">
        <div class="order-card__top">
          <span class="no">{{ o.order_no }}</span>
          <span class="status" :data-status="o.status">{{ statusText(o.status) }}</span>
        </div>
        <div class="order-card__bottom">
          <span class="date">{{ o.created_at }}</span>
          <span class="amount">¥{{ o.total_amount.toFixed(2) }}</span>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { orderApi } from '../api/orders.js'

const items = ref([])
const loading = ref(true)
const error = ref('')

const STATUS = {
  pending: '待付款',
  paid: '已付款',
  shipped: '已发货',
  completed: '已完成',
  cancelled: '已取消'
}
function statusText(s) {
  return STATUS[s] || s
}

onMounted(async () => {
  try {
    const body = await orderApi.list()
    items.value = body.data.items
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.orders { max-width: 900px; margin: 20px auto; padding: 0 20px; flex: 1; }
h1 { font-size: 24px; }
.state { padding: 50px; text-align: center; color: #6b7280; }
.state--error { color: #dc2626; }
.go { color: var(--ph-primary); text-decoration: none; }
.order-card {
  display: block; background: #fff; border: 1px solid #e5e7eb;
  border-radius: 12px; padding: 16px 18px; margin-bottom: 12px;
  text-decoration: none; color: var(--ph-text);
}
.order-card__top, .order-card__bottom { display: flex; justify-content: space-between; align-items: center; }
.no { font-size: 14px; font-weight: 600; }
.status { font-size: 12px; padding: 2px 10px; border-radius: 999px; background: #fef3c7; color: #b45309; }
.status[data-status="paid"], .status[data-status="shipped"] { background: #dbeafe; color: #1d4ed8; }
.status[data-status="completed"] { background: #dcfce7; color: #15803d; }
.status[data-status="cancelled"] { background: #fee2e2; color: #b91c1c; }
.order-card__bottom { margin-top: 10px; font-size: 13px; color: #6b7280; }
.amount { color: var(--ph-primary); font-weight: 700; font-size: 16px; }
</style>
