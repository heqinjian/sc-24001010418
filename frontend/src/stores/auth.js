import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../api/client.js'

const TOKEN_KEY = 'printhub-token'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem(TOKEN_KEY) || '')
  const user = ref(null)

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  function setSession(t, u) {
    token.value = t
    user.value = u
    localStorage.setItem(TOKEN_KEY, t)
  }

  async function register(username, password) {
    const body = await api.post('/auth/register', { username, password })
    setSession(body.data.token, body.data.user)
    return body.data.user
  }

  async function login(username, password) {
    const body = await api.post('/auth/login', { username, password })
    setSession(body.data.token, body.data.user)
    return body.data.user
  }

  async function fetchMe() {
    if (!token.value) return null
    try {
      const body = await api.get('/auth/me')
      user.value = body.data.user
      return body.data.user
    } catch {
      logout()
      return null
    }
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem(TOKEN_KEY)
  }

  return { token, user, isLoggedIn, isAdmin, register, login, logout, fetchMe }
})
