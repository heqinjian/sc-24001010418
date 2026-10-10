import axios from 'axios'

// Centralized axios instance. Vite dev server proxies /api -> localhost:3000.
const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

// Attach JWT from localStorage if present.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('printhub-token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Unwrap our unified envelope; throw on failure with the server message.
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message =
      err.response?.data?.message || err.message || '网络请求失败'
    return Promise.reject(new Error(message))
  }
)

export default api
