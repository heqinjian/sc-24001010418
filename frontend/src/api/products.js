import api from './client.js'

export const productApi = {
  list(params = {}) {
    return api.get('/products', { params })
  },
  getById(id) {
    return api.get(`/products/${id}`)
  }
}

export const categoryApi = {
  list() {
    return api.get('/categories')
  }
}
