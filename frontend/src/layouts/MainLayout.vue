<template>
  <div class="layout">
    <AppNavBar />
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    <AppFooter />
  </div>
</template>

<script setup>
import AppNavBar from '../components/AppNavBar.vue'
import AppFooter from '../components/AppFooter.vue'
</script>

<style scoped>
.layout { min-height: 100vh; display: flex; flex-direction: column; }
.fade-enter-active, .fade-leave-active { transition: opacity .15s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
