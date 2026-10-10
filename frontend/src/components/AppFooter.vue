<template>
  <footer class="footer">
    <div class="footer__inner">
      <div>
        <div class="footer__brand">PrintHub</div>
        <p class="footer__desc">面向创客、学生与设计师的 3D 打印设备与耗材商城。</p>
      </div>
      <div class="footer__col">
        <h4>帮助</h4>
        <router-link to="/help/shipping">配送说明</router-link>
        <router-link to="/help/returns">退换政策</router-link>
        <router-link to="/help/contact">联系客服</router-link>
      </div>
      <div class="footer__col">
        <h4>分类</h4>
        <router-link to="/products?categoryId=1">3D 打印机</router-link>
        <router-link to="/products?categoryId=2">打印耗材</router-link>
        <router-link to="/products?categoryId=3">打印配件</router-link>
        <router-link to="/products?categoryId=4">3D 扫描设备</router-link>
      </div>
    </div>
    <div class="footer__bar">© 2026 PrintHub · 课程演示项目，非真实交易平台</div>
  </footer>
</template>

<style scoped>
.footer {
  background: #111827;
  color: #d1d5db;
  margin-top: 60px;
}
.footer__inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 30px;
}
.footer__brand { color: #fff; font-weight: 700; font-size: 18px; }
.footer__desc { font-size: 13px; color: #9ca3af; margin-top: 8px; }
.footer__col h4 { color: #fff; margin: 0 0 10px; font-size: 14px; }
.footer__col a {
  display: block;
  color: #9ca3af;
  text-decoration: none;
  font-size: 13px;
  padding: 3px 0;
}
.footer__col a:hover { color: #fff; }
.footer__bar {
  border-top: 1px solid #1f2937;
  text-align: center;
  padding: 14px;
  font-size: 12px;
  color: #6b7280;
}
@media (max-width: 768px) {
  .footer__inner { grid-template-columns: 1fr; }
}
</style>
