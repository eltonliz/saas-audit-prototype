<template>
  <!-- 静态展示封装：头像资料弹层（他人视角） -->
  <div class="mod-stage">
    <ProfilePopup :user="user" current-user-id="u-clerk-1" @close="noop" @chat="noop" />
  </div>
</template>

<script setup lang="ts">
import ProfilePopup from '../../components/im/ProfilePopup.vue';
import { getUser } from '../../adapters/sim/im-sim-adapter';

const user = getUser('u-f-01') ?? null;
const noop = () => {};
</script>

<style scoped>
.mod-stage { position: relative; width: 100%; height: 100%; background: #e9ebee; }
.mod-stage :deep(.popup-mask) { position: absolute; }
</style>
