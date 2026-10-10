<template>
  <div class="cart-page">
    <h1>购物车</h1>

    <div v-if="cart.items.length === 0" class="empty">
      <p>购物车还是空的。</p>
      <router-link to="/products" class="go">去逛逛 →</router-link>
    </div>

    <template v-else>
      <table class="cart-table">
        <thead>
          <tr>
            <th>商品</th>
            <th>单价</th>
            <th>数量</th>
            <th>小计</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in cart.items" :key="item.id">
            <td>
              <router-link :to="`/products/${item.id}`" class="name">{{ item.name }}</router-link>
            </td>
            <td class="price">¥{{ item.price.toFixed(2) }}</td>
            <td>
              <div class="stepper">
                <button @click="cart.updateQuantity(item.id, item.quantity - 1)" :disabled="item.quantity <= 1">−</button>
                <input
                  :value="item.quantity"
                  type="number"
                  min="1"
                  :max="item.stock"
                  @change="onQtyInput(item, $event)"
                />
                <button @click="cart.updateQuantity(item.id, item.quantity + 1)" :disabled="item.quantity >= item.stock">+</button>
              </div>
            </td>
            <td class="price subtotal">¥{{ (item.price * item.quantity).toFixed(2) }}</td>
            <td>
              <button class="remove" @click="cart.removeItem(item.id)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="summary">
        <div class="summary__total">合计：<strong>¥{{ cart.totalAmount.toFixed(2) }}</strong></div>
        <router-link to="/checkout" class="checkout-btn">去结算 →</router-link>
      </div>
    </template>
  </div>
</template>

<script setup>
import { useCartStore } from '../stores/cart.js'
const cart = useCartStore()

function onQtyInput(item, e) {
  const n = Number.parseInt(e.target.value, 10)
  cart.updateQuantity(item.id, Number.isFinite(n) ? n : 1)
}
</script>

<style scoped>
.cart-page { max-width: 1100px; margin: 20px auto; padding: 0 20px; flex: 1; }
h1 { font-size: 24px; }
.empty { text-align: center; padding: 60px; color: #6b7280; }
.go { color: var(--ph-primary); text-decoration: none; }
.cart-table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 12px; overflow: hidden; }
.cart-table th, .cart-table td { padding: 14px 16px; border-bottom: 1px solid #f1f5f9; text-align: left; font-size: 14px; }
.cart-table th { background: #f8fafc; font-weight: 600; color: #475569; }
.name { color: var(--ph-text); text-decoration: none; }
.name:hover { color: var(--ph-primary); }
.price { color: #4b5563; }
.subtotal { color: var(--ph-primary); font-weight: 600; }
.stepper { display: inline-flex; }
.stepper button { width: 30px; height: 30px; border: 1px solid #d1d5db; background: #fff; cursor: pointer; }
.stepper input { width: 52px; height: 30px; text-align: center; border: 1px solid #d1d5db; border-left: none; border-right: none; }
.remove { border: none; background: none; color: #dc2626; cursor: pointer; font-size: 13px; }
.summary { margin-top: 20px; display: flex; justify-content: flex-end; align-items: center; gap: 24px; }
.summary__total { font-size: 16px; }
.summary__total strong { color: var(--ph-primary); font-size: 22px; }
.checkout-btn { background: var(--ph-primary); color: #fff; text-decoration: none; padding: 10px 26px; border-radius: 10px; font-weight: 600; }
@media (max-width: 640px) {
  .cart-table th:nth-child(2), .cart-table td:nth-child(2) { display: none; }
}
</style>
