import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

const STORAGE_KEY = 'printhub-cart-v1'

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export const useCartStore = defineStore('cart', () => {
  const items = ref(loadInitial())

  const count = computed(() => items.value.reduce((s, i) => s + i.quantity, 0))
  const totalAmount = computed(() =>
    Math.round(items.value.reduce((s, i) => s + i.price * i.quantity, 0) * 100) / 100
  )

  // Add a product (from API/detail shape). Quantity clamped to stock.
  function addItem(product, quantity = 1) {
    const existing = items.value.find((i) => i.id === product.id)
    if (existing) {
      existing.quantity = Math.min(product.stock, existing.quantity + quantity)
    } else {
      items.value.push({
        id: product.id,
        name: product.name,
        price: product.price,
        stock: product.stock,
        quantity: Math.min(product.stock, quantity)
      })
    }
  }

  function updateQuantity(id, quantity) {
    const item = items.value.find((i) => i.id === id)
    if (!item) return
    item.quantity = Math.min(item.stock, Math.max(1, Math.floor(quantity)))
  }

  function removeItem(id) {
    items.value = items.value.filter((i) => i.id !== id)
  }

  function clear() {
    items.value = []
  }

  // Persist to localStorage on every change.
  watch(
    items,
    (val) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
    },
    { deep: true }
  )

  return { items, count, totalAmount, addItem, updateQuantity, removeItem, clear }
})
