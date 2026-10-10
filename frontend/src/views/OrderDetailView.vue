<template>
  <div class="order-detail">
    <router-link to="/orders" class="back">← 返回我的订单</router-link>

    <div v-if="loading" class="state">加载中…</div>
    <div v-else-if="error" class="state state--error">{{ error }}</div>

    <template v-else-if="order">
      <section class="block">
        <div class="head">
          <h1>订单 {{ order.order_no }}</h1>
          <span class="status">{{ statusText(order.status) }}</span>
        </div>
        <p class="meta">下单时间：{{ order.created_at }}</p>
      </section>

      <section class="block">
        <h2>收货信息</h2>
        <p>{{ order.recipient }} · {{ order.phone }}</p>
        <p>{{ order.address }}</p>
      </section>

      <section class="block">
        <h2>商品明细</h2>
        <table>
          <thead>
            <tr><th>商品</th><th>单价</th><th>数量</th><th>小计</th></tr>
          </thead>
          <tbody>
            <tr v-for="it in items" :key="it.id">
              <td>
                <router-link :to="`/products/${it.product_id}`">{{ it.product_name }}</router-link>
              </td>
              <td>¥{{ it.unit_price.toFixed(2) }}</td>
              <td>{{ it.quantity }}</td>
              <td>¥{{ it.subtotal.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
        <div class="total">订单总额：<strong>¥{{ order.total_amount.toFixed(2) }}</strong></div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { orderApi } from '../api/orders.js'

const route = useRoute()
const order = ref(null)
const items = ref([])
const loading = ref(true)
const error = ref('')

const STATUS = { pending: '待付款', paid: '已付款', shipped: '已发货', completed: '已完成', cancelled: '已取消' }
function statusText(s) { return STATUS[s] || s }

onMounted(async () => {
  try {
    const body = await orderApi.getById(route.params.id)
    order.value = body.data.order
    items.value = body.data.items
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.order-detail { max-width: 900px; margin: 20px auto; padding: 0 20px; flex: 1; }
.back { color: var(--ph-primary); text-decoration: none; font-size: 14px; }
.state { padding: 50px; text-align: center; color: #6b7280; }
.state--error { color: #dc2626; }
.block { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 18px 20px; margin-top: 14px; }
.head { display: flex; justify-content: space-between; align-items: center; }
.head h1 { font-size: 20px; margin: 0; }
.status { font-size: 12px; padding: 3px 12px; border-radius: 999px; background: #fef3c7; color: #b45309; }
.meta { font-size: 13px; color: #6b7280; margin: 8px 0 0; }
h2 { font-size: 15px; margin: 0 0 10px; }
p { font-size: 14px; color: #4b5563; margin: 4px 0; }
table { width: 100%; border-collapse: collapse; }
th, td { text-align: left; padding: 10px 8px; font-size: 14px; border-bottom: 1px solid #f1f5f9; }
th { color: #6b7280; font-weight: 600; }
td a { color: var(--ph-text); text-decoration: none; }
td a:hover { color: var(--ph-primary); }
.total { text-align: right; margin-top: 12px; font-size: 15px; }
.total strong { color: var(--ph-primary); font-size: 20px; }
</style>
