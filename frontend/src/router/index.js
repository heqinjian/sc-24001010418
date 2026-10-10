import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: '', name: 'home', component: () => import('../views/HomeView.vue') },
      // Routes below are placeholders; real pages land in later stages.
      { path: 'products', name: 'products', component: () => import('../views/ProductsView.vue') },
      { path: 'products/:id', name: 'product-detail', component: () => import('../views/ProductDetailView.vue') },
      { path: 'cart', name: 'cart', component: () => import('../views/CartView.vue') },
      { path: 'checkout', name: 'checkout', component: () => import('../views/PlaceholderView.vue'), meta: { title: '结算' } },
      { path: 'orders', name: 'orders', component: () => import('../views/PlaceholderView.vue'), meta: { title: '我的订单' } },
      { path: 'orders/:id', name: 'order-detail', component: () => import('../views/PlaceholderView.vue'), meta: { title: '订单详情' } },
      { path: 'login', name: 'login', component: () => import('../views/PlaceholderView.vue'), meta: { title: '登录' } },
      { path: 'register', name: 'register', component: () => import('../views/PlaceholderView.vue'), meta: { title: '注册' } }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
