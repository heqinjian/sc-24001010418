<template>
  <div>
    <h1>订单管理</h1>
    <div v-if="loading" class="state">加载中…</div>
    <div v-else-if="error" class="state state--error">{{ error }}</div>

    <table v-else class="table">
      <thead>
        <tr><th>订单号</th><th>用户</th><th>商品数</th><th>金额</th><th>收货人</th><th>状态</th><th>操作</th></tr>
      </thead>
      <tbody>
        <tr v-for="o in orders" :key="o.id">
          <td class="no">{{ o.order_no }}</td>
          <td>{{ o.username }}</td>
          <td>{{ o.item_count }}</td>
          <td>¥{{ o.total_amount.toFixed(2) }}</td>
          <td>{{ o.recipient }}</td>
          <td>
            <select :value="o.status" @change="onStatusChange(o, $event.target.value)">
              <option v-for="s in statuses" :key="s.value" :value="s.value">{{ s.label }}</option>
            </select>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { adminApi } from '../../api/admin.js'

const orders = ref([])
const loading = ref(true)
const error = ref('')

const statuses = [
  { value: 'pending', label: '待付款' },
  { value: 'paid', label: '已付款' },
  { value: 'shipped', label: '已发货' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' }
]

async function load() {
  loading.value = true
  try {
    const body = await adminApi.listOrders()
    orders.value = body.data.items
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function onStatusChange(o, status) {
  try {
    await adminApi.updateOrderStatus(o.id, status)
    o.status = status
    ElMessage.success('状态已更新')
  } catch (e) {
    ElMessage.error(e.message)
  }
}

onMounted(load)
</script>

<style scoped>
h1 { font-size: 22px; }
.state { padding: 40px; text-align: center; color: #6b7280; }
.state--error { color: #dc2626; }
.table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 12px; overflow: hidden; margin-top: 14px; }
.table th, .table td { padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #f1f5f9; text-align: left; }
.table th { background: #f8fafc; color: #475569; }
.no { font-weight: 600; }
select { padding: 5px 8px; border-radius: 6px; border: 1px solid #d1d5db; font-size: 13px; }
</style>
