<template>
  <div class="admin-layout">
    <aside class="side">
      <div class="side__title">管理后台</div>
      <router-link to="/admin" exact-active-class="active">概览</router-link>
      <router-link to="/admin/products" active-class="active">商品管理</router-link>
      <router-link to="/admin/orders" active-class="active">订单管理</router-link>
    </aside>
    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.admin-layout {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 20px;
  flex: 1;
  width: 100%;
}
.side {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 14px;
  height: fit-content;
}
.side__title { font-weight: 700; margin-bottom: 10px; font-size: 15px; }
.side a {
  display: block;
  padding: 8px 12px;
  border-radius: 8px;
  text-decoration: none;
  color: #4b5563;
  font-size: 14px;
}
.side a.active { background: #fff2e8; color: var(--ph-primary); font-weight: 600; }
.content { min-width: 0; }
@media (max-width: 768px) {
  .admin-layout { grid-template-columns: 1fr; }
}
</style>
