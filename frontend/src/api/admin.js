import api from './client.js'

export const adminApi = {
  listOrders() {
    return api.get('/admin/orders')
  },
  updateOrderStatus(id, status) {
    return api.patch(`/admin/orders/${id}/status`, { status })
  }
}
