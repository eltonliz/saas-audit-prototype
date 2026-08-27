<template>
  <!-- 静态展示封装：表情面板 -->
  <div class="mod-stage">
    <div class="mod-chat-bg">
      <div class="mod-input-bar" />
    </div>
    <EmojiPicker @select="noop" />
  </div>
</template>

<script setup lang="ts">
import EmojiPicker from '../../components/im/EmojiPicker.vue';
const noop = () => {};
</script>

<style scoped>
.mod-stage { position: relative; width: 100%; height: 100%; background: #f5f7fa; display: flex; flex-direction: column; justify-content: flex-end; }
.mod-chat-bg { flex: 1; }
.mod-input-bar { height: 44px; background: #fff; border-top: 1px solid #f0f0f0; }
</style>
