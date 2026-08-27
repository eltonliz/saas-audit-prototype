<template>
  <!-- 表情选择面板（点击表情直接发送） -->
  <div class="emoji-panel">
    <span
      v-for="e in EMOJIS"
      :key="e"
      class="emoji-item"
      @click="$emit('select', e)"
    >{{ e }}</span>
  </div>
</template>

<script setup lang="ts">
defineEmits<{ select: [emoji: string] }>();

const EMOJIS = [
  '😀', '😄', '😁', '😆', '😅', '🤣', '😊', '😇',
  '🙂', '😉', '😍', '🥰', '😘', '😋', '😜', '🤪',
  '🤔', '🤗', '😴', '😌', '😎', '🥳', '😢', '😭',
  '😡', '👍', '👏', '🙏', '💪', '🎉', '❤️', '🔥',
];
</script>

<style scoped>
.emoji-panel { display: grid; grid-template-columns: repeat(8, 1fr); gap: 2px; background: #fff; border-top: 1px solid #F0F0F0; padding: 10px 8px; max-height: 168px; overflow-y: auto; }
.emoji-item { font-size: 22px; text-align: center; padding: 6px 0; cursor: pointer; border-radius: 6px; }
.emoji-item:hover { background: #F0FAF5; }
</style>
