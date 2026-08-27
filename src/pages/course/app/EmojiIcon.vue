<template>
  <!-- 将 emoji 字符串映射为 tdesign-icons 图标；未知 emoji 回退为通用 image 图标 -->
  <t-icon :name="iconName" :size="size" :style="styleObj" />
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  emoji?: string;
  size?: string | number;
  color?: string;
}>();

// emoji → tdesign-icons 图标名 映射表
const emojiIconMap: Record<string, string> = {
  '📚': 'book',
  '📖': 'book',
  '📺': 'play-circle',
  '💰': 'money-circle',
  '🎁': 'gift',
  '👤': 'user',
  '🏠': 'home',
  '🛒': 'cart',
  '🛍️': 'cart',
  '🎮': 'entertainment',
  '💬': 'chat',
  '🛠️': 'tools',
  '🎯': 'aim',
  '📊': 'chart-bar',
  '✅': 'check-circle',
  '❌': 'close-circle',
  '⏳': 'time',
  '⚠️': 'info-circle',
  '🔍': 'search',
  '📷': 'camera',
  '✍️': 'edit',
  '⭐': 'star-filled',
  '📅': 'calendar',
  '📋': 'list',
  '⚙️': 'setting',
  '🚪': 'logout',
  '🔥': 'fire',
  '✨': 'sparkles',
  '👨‍🏫': 'user-circle',
  '🏆': 'trophy',
  '📌': 'pin',
  '📢': 'sound',
  '💸': 'money',
  '📂': 'folder',
  '💡': 'bulb',
  '📈': 'chart-line',
  '🤝': 'handshake',
  '🔄': 'refresh',
  '📱': 'mobile',
  // 补充：店铺/商品/状态类
  '🏪': 'shop',
  '🏬': 'shop',
  '💼': 'folder',
  '👀': 'browse',
  '👑': 'usergroup',
  '📦': 'parcel',
  '🔧': 'tools',
  '📤': 'upload',
  '👣': 'location',
  '🎤': 'microphone',
  '📍': 'location',
  '🏃': 'user',
  '🔔': 'notification',
  '🎉': 'celebration',
  '💳': 'wallet',
  '🧾': 'wallet',
  '🔒': 'lock',
  '🔑': 'lock-on',
  '🔗': 'link',
  '👥': 'usergroup',
  '▶️': 'play-circle',
  '⏸️': 'pause-circle',
  '📹': 'video-camera',
  '🔴': 'record-stop',
  '🟢': 'record',
  '⬜': 'minus-circle',
};

const iconName = computed(() => {
  const e = props.emoji ?? '';
  return emojiIconMap[e] ?? 'image';
});

const styleObj = computed(() => props.color ? { color: props.color } : undefined);
</script>
