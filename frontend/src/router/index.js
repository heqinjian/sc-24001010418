import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: '', name: 'home', component: () => import('../views/HomeView.vue') },
      { path: 'products', name: 'products', component: () => import('../views/ProductsView.vue') },
      { path: 'products/:id', name: 'product-detail', component: () => import('../views/ProductDetailView.vue') },
      { path: 'guides/:id', name: 'guide', component: () => import('../views/GuideView.vue') },
      { path: 'help/:doc', name: 'help', component: () => import('../views/HelpView.vue') },
      { path: 'cart', name: 'cart', component: () => import('../views/CartView.vue') },
      {
        path: 'checkout',
        name: 'checkout',
        component: () => import('../views/CheckoutView.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'orders',
        name: 'orders',
        component: () => import('../views/OrdersView.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'orders/:id',
        name: 'order-detail',
        component: () => import('../views/OrderDetailView.vue'),
        meta: { requiresAuth: true }
      },
      { path: 'login', name: 'login', component: () => import('../views/LoginView.vue'), meta: { guestOnly: true } },
      { path: 'register', name: 'register', component: () => import('../views/RegisterView.vue'), meta: { guestOnly: true } },
      {
        path: 'admin',
        component: () => import('../layouts/AdminLayout.vue'),
        meta: { requiresAuth: true, requiresAdmin: true },
        children: [
          { path: '', name: 'admin', component: () => import('../views/admin/AdminHome.vue') },
          { path: 'products', name: 'admin-products', component: () => import('../views/admin/AdminProducts.vue') },
          { path: 'orders', name: 'admin-orders', component: () => import('../views/admin/AdminOrders.vue') }
        ]
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Frontend guards are UX only; the backend enforces auth/role independently.
router.beforeEach(async (to) => {
  const token = localStorage.getItem('printhub-token')
  if (to.meta.requiresAuth && !token) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.meta.requiresAdmin) {
    // Lazy import to avoid circular at module load.
    const { useAuthStore } = await import('../stores/auth.js')
    const auth = useAuthStore()
    if (!auth.user) await auth.fetchMe()
    if (!auth.isAdmin) return { name: 'home' }
  }
  if (to.meta.guestOnly && token) {
    return { name: 'home' }
  }
  return true
})

export default router
