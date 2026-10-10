<template>
  <router-view />
</template>

<script setup>
// S1: minimal shell. Nav bar, banner and footer arrive in S2.
</script>

<style>
:root {
  --ph-primary: #ff6a00;
  --ph-bg: #f6f7f9;
  --ph-text: #1f2937;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
    'Microsoft YaHei', sans-serif;
  background: var(--ph-bg);
  color: var(--ph-text);
}
</style>
