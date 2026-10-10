import api from './client.js'

export const orderApi = {
  create(payload) {
    return api.post('/orders', payload)
  },
  list() {
    return api.get('/orders')
  },
  getById(id) {
    return api.get(`/orders/${id}`)
  }
}
