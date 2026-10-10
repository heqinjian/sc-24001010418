<template>
  <header class="navbar">
    <div class="navbar__inner">
      <router-link to="/" class="brand">
        <span class="brand__mark">P</span>
        <span class="brand__name">PrintHub</span>
      </router-link>

      <nav class="navbar__links">
        <router-link to="/" exact-active-class="is-active">首页</router-link>
        <router-link to="/products" active-class="is-active">商品</router-link>
        <router-link to="/products?categoryId=1" active-class="is-active">3D 打印机</router-link>
        <router-link to="/products?categoryId=2" active-class="is-active">耗材</router-link>
      </nav>

      <div class="navbar__search" @keydown.enter="onSearch">
        <input
          v-model="keyword"
          type="search"
          placeholder="搜索打印机、耗材、配件…"
          aria-label="搜索商品"
        />
      </div>

      <div class="navbar__actions">
        <router-link to="/cart" class="cart-link">
          <span>购物车</span>
          <span v-if="cartCount > 0" class="cart-badge">{{ cartCount }}</span>
        </router-link>
        <router-link to="/login" class="action-btn">登录</router-link>
        <router-link to="/register" class="action-btn action-btn--primary">注册</router-link>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

// S2: cart count is a placeholder; real Pinia store arrives in S5.
const props = defineProps({
  cartCount: { type: Number, default: 0 }
})
const keyword = ref('')
const router = useRouter()

const cartCount = computed(() => props.cartCount)

function onSearch() {
  router.push({ path: '/products', query: keyword.value ? { keyword: keyword.value } : {} })
}
</script>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 50;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
}
.navbar__inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 60px;
  display: flex;
  align-items: center;
  gap: 20px;
}
.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: var(--ph-text);
  font-weight: 700;
  font-size: 18px;
}
.brand__mark {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: var(--ph-primary);
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 800;
}
.navbar__links {
  display: flex;
  gap: 16px;
}
.navbar__links a {
  text-decoration: none;
  color: #4b5563;
  font-size: 14px;
}
.navbar__links a.is-active { color: var(--ph-primary); font-weight: 600; }
.navbar__search { flex: 1; max-width: 380px; }
.navbar__search input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 999px;
  font-size: 14px;
  outline: none;
}
.navbar__search input:focus { border-color: var(--ph-primary); }
.navbar__actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}
.cart-link {
  position: relative;
  text-decoration: none;
  color: var(--ph-text);
  font-size: 14px;
}
.cart-badge {
  position: absolute;
  top: -8px;
  right: -12px;
  background: var(--ph-primary);
  color: #fff;
  border-radius: 999px;
  font-size: 11px;
  min-width: 18px;
  height: 18px;
  display: grid;
  place-items: center;
  padding: 0 5px;
}
.action-btn {
  text-decoration: none;
  font-size: 14px;
  color: var(--ph-text);
  padding: 6px 12px;
  border-radius: 6px;
}
.action-btn--primary {
  background: var(--ph-primary);
  color: #fff;
}
.action-btn--primary:hover { filter: brightness(1.05); }

@media (max-width: 768px) {
  .navbar__links, .navbar__search { display: none; }
}
</style>
