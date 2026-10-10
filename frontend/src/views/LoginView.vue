<template>
  <div class="auth-page">
    <div class="auth-card">
      <h2>登录 PrintHub</h2>
      <form @submit.prevent="onSubmit">
        <label>用户名</label>
        <input v-model="username" type="text" autocomplete="username" required />

        <label>密码</label>
        <input v-model="password" type="password" autocomplete="current-password" required />

        <button type="submit" class="submit" :disabled="loading">
          {{ loading ? '登录中…' : '登录' }}
        </button>
        <p v-if="error" class="error">{{ error }}</p>
      </form>
      <p class="switch">还没有账号？<router-link to="/register">立即注册</router-link></p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../stores/auth.js'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function onSubmit() {
  loading.value = true
  error.value = ''
  try {
    await auth.login(username.value, password.value)
    ElMessage.success('登录成功')
    router.push(route.query.redirect || '/')
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page { display: grid; place-items: center; padding: 60px 20px; flex: 1; }
.auth-card {
  width: 100%; max-width: 380px; background: #fff;
  border: 1px solid #e5e7eb; border-radius: 14px; padding: 30px;
}
.auth-card h2 { margin: 0 0 20px; font-size: 22px; }
label { display: block; font-size: 13px; color: #4b5563; margin: 12px 0 6px; }
input {
  width: 100%; padding: 10px 12px; border: 1px solid #d1d5db;
  border-radius: 8px; font-size: 14px;
}
.submit {
  width: 100%; margin-top: 20px; padding: 11px; border: none;
  background: var(--ph-primary); color: #fff; border-radius: 8px;
  font-size: 15px; font-weight: 600; cursor: pointer;
}
.submit:disabled { opacity: .6; }
.error { color: #dc2626; font-size: 13px; margin-top: 10px; }
.switch { font-size: 13px; color: #6b7280; text-align: center; margin: 16px 0 0; }
.switch a { color: var(--ph-primary); text-decoration: none; }
</style>
