import { createRouter, createWebHistory } from 'vue-router'

// S1: a single placeholder route. Real pages are added from S2 onward.
const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
