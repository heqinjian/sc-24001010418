<template>
  <div>
    <div class="head">
      <h1>商品管理</h1>
      <button class="primary" @click="openCreate">+ 新增商品</button>
    </div>

    <div v-if="loading" class="state">加载中…</div>
    <div v-else-if="error" class="state state--error">{{ error }}</div>

    <table v-else class="table">
      <thead>
        <tr><th>ID</th><th>名称</th><th>分类</th><th>价格</th><th>库存</th><th>状态</th><th>操作</th></tr>
      </thead>
      <tbody>
        <tr v-for="p in products" :key="p.id">
          <td>{{ p.id }}</td>
          <td class="name">{{ p.name }}</td>
          <td>{{ p.category_name }}</td>
          <td>¥{{ p.price.toFixed(2) }}</td>
          <td :class="{ low: p.stock < 5 }">{{ p.stock }}</td>
          <td>
            <span :class="p.status === 'on_sale' ? 'tag tag--on' : 'tag tag--off'">
              {{ p.status === 'on_sale' ? '在售' : '已下架' }}
            </span>
          </td>
          <td class="ops">
            <button @click="openEdit(p)">编辑</button>
            <button v-if="p.status === 'on_sale'" class="danger" @click="onOffShelf(p)">下架</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- create / edit dialog -->
    <el-dialog v-model="dialog" :title="editing ? '编辑商品' : '新增商品'" width="520px">
      <form class="form" @submit.prevent="onSave">
        <label>名称</label>
        <input v-model="form.name" />
        <label>分类</label>
        <select v-model="form.category_id">
          <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
        <label>价格</label>
        <input v-model.number="form.price" type="number" min="0" step="0.01" />
        <label>库存</label>
        <input v-model.number="form.stock" type="number" min="0" />
        <label>描述</label>
        <textarea v-model="form.description" rows="2"></textarea>
        <label>规格参数</label>
        <textarea v-model="form.specifications" rows="2"></textarea>
      </form>
      <template #footer>
        <button @click="dialog = false">取消</button>
        <button class="primary" @click="onSave">保存</button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '../../api/client.js'
import { productApi, categoryApi } from '../../api/products.js'

const products = ref([])
const categories = ref([])
const loading = ref(true)
const error = ref('')
const dialog = ref(false)
const editing = ref(null)
const form = reactive({ name: '', category_id: 1, price: 0, stock: 0, description: '', specifications: '' })

async function load() {
  loading.value = true
  try {
    // admin needs all products incl off-shelf: request large page
    const body = await productApi.list({ pageSize: 50 })
    products.value = body.data.items
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

function resetForm() {
  Object.assign(form, { name: '', category_id: categories.value[0]?.id || 1, price: 0, stock: 0, description: '', specifications: '' })
}

function openCreate() {
  editing.value = null
  resetForm()
  dialog.value = true
}

function openEdit(p) {
  editing.value = p.id
  Object.assign(form, {
    name: p.name, category_id: p.category_id, price: p.price, stock: p.stock,
    description: p.description, specifications: p.specifications
  })
  dialog.value = true
}

async function onSave() {
  try {
    if (editing.value) {
      await api.put(`/products/${editing.value}`, { ...form })
      ElMessage.success('商品已更新')
    } else {
      await api.post('/products', { ...form })
      ElMessage.success('商品已创建')
    }
    dialog.value = false
    await load()
  } catch (e) {
    ElMessage.error(e.message)
  }
}

async function onOffShelf(p) {
  try {
    await ElMessageBox.confirm(`确定下架「${p.name}」？`, '确认', { type: 'warning' })
    await api.delete(`/products/${p.id}`)
    ElMessage.success('已下架')
    await load()
  } catch (e) {
    if (e !== 'cancel') ElMessage.error(e.message || '操作失败')
  }
}

onMounted(async () => {
  try {
    const cats = await categoryApi.list()
    categories.value = cats.data.items
  } catch {}
  await load()
})
</script>

<style scoped>
.head { display: flex; justify-content: space-between; align-items: center; }
h1 { font-size: 22px; }
.primary { background: var(--ph-primary); color: #fff; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; }
.state { padding: 40px; text-align: center; color: #6b7280; }
.state--error { color: #dc2626; }
.table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 12px; overflow: hidden; margin-top: 14px; }
.table th, .table td { padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #f1f5f9; text-align: left; }
.table th { background: #f8fafc; color: #475569; }
.name { max-width: 220px; }
.low { color: #dc2626; font-weight: 600; }
.tag { padding: 2px 10px; border-radius: 999px; font-size: 12px; }
.tag--on { background: #dcfce7; color: #15803d; }
.tag--off { background: #fee2e2; color: #b91c1c; }
.ops button { border: 1px solid #d1d5db; background: #fff; padding: 4px 10px; border-radius: 6px; margin-right: 6px; cursor: pointer; font-size: 12px; }
.ops .danger { color: #dc2626; border-color: #fecaca; }
.form label { display: block; font-size: 12px; color: #4b5563; margin: 8px 0 4px; }
.form input, .form select, .form textarea {
  width: 100%; padding: 7px 10px; border: 1px solid #d1d5db; border-radius: 6px;
  font-size: 13px; font-family: inherit;
}
</style>
