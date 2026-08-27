<!--
  动态原型「返回静态原型」按钮（仅当入口来自 /proto/audit 时显示）
  - 入口来源：ProtoViewerShell.openLive() 在 URL 上加 ?from=proto&node=<taskId>
  - 子应用启动时若检测到 from=proto，写入 sessionStorage（saas-from-proto / saas-from-proto-node），
    以应对内部路由跳转丢失 query 后仍能保持显示
  - 点击：router.push 回 /proto/audit?node=<原节点>，回到对应静态页
-->
<template>
  <div v-if="show" class="proto-return-btn" @click="goBack">
    <span class="prb-icon">←</span>
    <span class="prb-label">返回静态原型</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

/** 静态原型来源：sessionStorage 持久化 + URL 兜底（覆盖内页跳转后 query 丢失场景） */
const show = computed(() => {
  if (route.path.startsWith('/proto/')) return false; // 已在静态查看工具自身
  if (route.query.from === 'proto') return true;
  try { return sessionStorage.getItem('saas-from-proto') === '1'; } catch { return false; }
});

function goBack() {
  let node = '';
  try { node = sessionStorage.getItem('saas-from-proto-node') || ''; } catch { /* ignore */ }
  if (!node && typeof route.query.node === 'string') node = route.query.node;
  router.push({ path: '/proto/audit', query: node ? { node } : {} });
}
</script>

<style scoped>
.proto-return-btn {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 950;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  background: #fff;
  border: 1px solid var(--proto-primary, #12b76a);
  border-radius: 20px;
  color: var(--proto-primary, #12b76a);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(18, 183, 106, 0.15);
  transition: all 0.2s;
}
.proto-return-btn:hover {
  background: var(--proto-primary, #12b76a);
  color: #fff;
}
.prb-icon {
  font-size: 14px;
  font-weight: 700;
}
</style>