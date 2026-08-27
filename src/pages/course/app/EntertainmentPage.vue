<template>
  <div class="placeholder-page">
    <div class="placeholder-emoji"><EmojiIcon emoji="🎮" :size="72" /></div>
    <div class="placeholder-title">敬请期待</div>
    <div class="placeholder-sub">娱乐功能建设中</div>
  </div>
</template>

<script setup lang="ts">
import EmojiIcon from './EmojiIcon.vue';
</script>

<style scoped>
.placeholder-page { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 70vh; padding-bottom: 80px; background: #F5F5F5; }
.placeholder-emoji { margin-bottom: 16px; display: flex; align-items: center; justify-content: center; }
.placeholder-title { font-size: 18px; font-weight: 700; color: #1F2C3E; }
.placeholder-sub { font-size: 13px; color: #98A2B3; margin-top: 8px; }
</style>
