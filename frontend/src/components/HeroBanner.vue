<template>
  <section class="hero">
    <div class="hero__content">
      <h1>把创意打印出来</h1>
      <p>3D 打印机、耗材、配件与扫描设备——为创客与实验室精选。</p>
      <router-link to="/products" class="hero__cta">立即选购 →</router-link>
    </div>
  </section>
</template>

<style scoped>
.hero {
  background: linear-gradient(120deg, #1f2937 0%, #111827 60%, #ff6a00 140%);
  color: #fff;
  border-radius: 14px;
  padding: 60px 40px;
  margin: 20px auto 0;
  max-width: 1200px;
}
.hero h1 { margin: 0 0 12px; font-size: 36px; }
.hero p { margin: 0 0 24px; color: #e5e7eb; font-size: 16px; }
.hero__cta {
  display: inline-block;
  background: var(--ph-primary);
  color: #fff;
  padding: 10px 22px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
}
@media (max-width: 768px) {
  .hero { padding: 36px 20px; margin: 12px; }
  .hero h1 { font-size: 26px; }
}
</style>
