<template>
  <!-- 三屏联动视图：3 个角色平铺同页，跨实例实时联动 -->
  <div class="im-grid">
    <div class="grid-header">
      <span class="back" @click="$router.back()">←</span>
      <div class="title-wrap">
        <div class="title">三屏联动 · 3 角色实时视角</div>
        <div class="sub">在任一屏发消息/发卡片/处理售后，其他屏实时联动（底部 badge / 卡片状态 / 进度卡）</div>
      </div>
      <button class="back-static" @click="$router.push('/proto/im')">返回静态原型</button>
    </div>

    <div class="grid-body">
      <div v-for="p in account.PERSONAS" :key="p.userId" class="phone-frame">
        <div class="frame-title" :style="{ background: roleColor(p.identity) }">{{ p.label }}</div>
        <iframe
          class="frame-body"
          :src="frameSrc(p.userId)"
          :title="p.label"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useImAccountStore } from '../../stores/im-account-store';
import type { ImIdentity } from '../../contracts/schemas/im-schemas';

const account = useImAccountStore();

function frameSrc(userId: string) {
  // hash 路由部署（GitHub Pages 子应用）时 iframe 必须走 #/ 路径，否则 404
  if (location.hash.startsWith('#/')) {
    const base = location.pathname.endsWith('/') ? location.pathname.slice(0, -1) : location.pathname;
    return `${base}#/h5/im/message?as=${userId}&embed=1`;
  }
  return `/h5/im/message?as=${userId}&embed=1`;
}

function roleColor(identity: ImIdentity) {
  const m: Record<ImIdentity, string> = {
    customer: '#12B76A',
    clerk: '#1890FF',
    store_manager: '#FA8C16',
  };
  return m[identity];
}
</script>

<style scoped>
.im-grid { display: flex; flex-direction: column; height: 100vh; background: #D8DEE6; }
.grid-header { display: flex; align-items: center; gap: 12px; padding: 12px 20px; background: #fff; border-bottom: 1px solid #E4E7ED; }
.back { font-size: 18px; cursor: pointer; flex-shrink: 0; }
.back-static { margin-left: auto; flex-shrink: 0; background: #fff; color: #12B76A; border: 1px solid #12B76A; border-radius: 16px; padding: 6px 14px; font-size: 12px; cursor: pointer; }
.title { font-size: 16px; font-weight: 600; }
.sub { font-size: 12px; color: #8C8C8C; margin-top: 2px; }
.grid-body { flex: 1; display: flex; gap: 24px; padding: 20px 24px; overflow-x: auto; }
.phone-frame { flex: 1 0 400px; min-width: 380px; display: flex; flex-direction: column; background: #fff; border-radius: 20px; overflow: hidden; box-shadow: 0 6px 20px rgba(0,0,0,0.14); }
.frame-title { padding: 10px 0; text-align: center; color: #fff; font-size: 14px; font-weight: 600; flex-shrink: 0; }
.frame-body { flex: 1; border: none; background: #F5F7FA; }
</style>
