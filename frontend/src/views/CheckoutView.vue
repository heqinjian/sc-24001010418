<template>
  <div class="checkout">
    <h1>确认订单</h1>

    <div v-if="cart.items.length === 0" class="empty">
      <p>购物车是空的，无法结算。</p>
      <router-link to="/products" class="go">去选购 →</router-link>
    </div>

    <template v-else>
      <section class="block">
        <h2>商品清单</h2>
        <div v-for="it in cart.items" :key="it.id" class="line">
          <span>{{ it.name }} × {{ it.quantity }}</span>
          <span>¥{{ (it.price * it.quantity).toFixed(2) }}</span>
        </div>
        <div class="line total">
          <span>合计（以服务器计算为准）</span>
          <strong>¥{{ cart.totalAmount.toFixed(2) }}</strong>
        </div>
      </section>

      <section class="block">
        <h2>收货信息</h2>
        <form @submit.prevent="onSubmit">
          <label>收货人</label>
          <input v-model="form.recipient" required />
          <label>联系电话</label>
          <input v-model="form.phone" required />
          <label>详细地址</label>
          <textarea v-model="form.address" rows="2" required></textarea>

          <button type="submit" class="submit" :disabled="submitting">
            {{ submitting ? '提交中…' : '提交订单' }}
          </button>
          <p v-if="error" class="error">{{ error }}</p>
        </form>
      </section>
    </template>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useCartStore } from '../stores/cart.js'
import { orderApi } from '../api/orders.js'

const cart = useCartStore()
const router = useRouter()
const submitting = ref(false)
const error = ref('')
const form = reactive({ recipient: '', phone: '', address: '' })

async function onSubmit() {
  submitting.value = true
  error.value = ''
  try {
    const payload = {
      items: cart.items.map((i) => ({ productId: i.id, quantity: i.quantity })),
      recipient: form.recipient,
      phone: form.phone,
      address: form.address
    }
    const body = await orderApi.create(payload)
    // Clear purchased items, then show order detail.
    cart.clear()
    ElMessage.success('下单成功')
    router.push(`/orders/${body.data.orderId}`)
  } catch (e) {
    error.value = e.message
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.checkout { max-width: 760px; margin: 20px auto; padding: 0 20px; flex: 1; }
h1 { font-size: 24px; }
.empty { text-align: center; padding: 50px; color: #6b7280; }
.go { color: var(--ph-primary); text-decoration: none; }
.block { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 18px; }
.block h2 { font-size: 16px; margin: 0 0 14px; }
.line { display: flex; justify-content: space-between; font-size: 14px; padding: 6px 0; color: #4b5563; }
.line.total { border-top: 1px solid #f1f5f9; margin-top: 8px; padding-top: 12px; }
.line.total strong { color: var(--ph-primary); font-size: 18px; }
label { display: block; font-size: 13px; color: #4b5563; margin: 10px 0 5px; }
input, textarea {
  width: 100%; padding: 9px 12px; border: 1px solid #d1d5db;
  border-radius: 8px; font-size: 14px; font-family: inherit;
}
.submit {
  width: 100%; margin-top: 18px; padding: 11px; border: none;
  background: var(--ph-primary); color: #fff; border-radius: 8px;
  font-size: 15px; font-weight: 600; cursor: pointer;
}
.submit:disabled { opacity: .6; }
.error { color: #dc2626; font-size: 13px; }
</style>
