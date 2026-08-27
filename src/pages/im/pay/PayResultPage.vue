<template>
  <!-- 绑定结果 · 绑定自动入群（绑定生效→onCustomerBound→自动入群） -->
  <div class="pay-result">
    <div class="page-header">
      <span class="back" @click="goBack">返回</span>
      <span class="title">绑定结果</span>
      <span />
    </div>

    <!-- 绑定成功卡 -->
    <div class="result-card">
      <div class="check-circle">
        <el-icon :size="34" color="#fff"><Check /></el-icon>
      </div>
      <div class="pay-title">绑定成功</div>
      <div class="pay-amount">客户已绑定归属{{ ownerLabel }}</div>
      <div class="pay-actions">
        <button class="btn primary" @click="goBack">返回首页</button>
      </div>
    </div>

    <!-- 自动入群状态区已移除（按用户裁决） -->
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { Check } from '@element-plus/icons-vue';
import { getUser } from '../../../adapters/sim/im-sim-adapter';

const route = useRoute();
const router = useRouter();

/** 默认绑定关系：归属服务者=李店员（演示种子） */
const OWNER_ID = 'u-clerk-1';
const ownerLabel = getUser(OWNER_ID)?.nickname ?? '店员';

function goBack() {
  router.push({ path: '/h5/im/message', query: route.query });
}
</script>

<style scoped>
.pay-result { min-height: 100%; background: #F5F7FA; }
.page-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: #fff; border-bottom: 1px solid #F0F0F0; }
.back { font-size: 14px; color: #12B76A; cursor: pointer; padding: 2px 8px; border: 1px solid #12B76A; border-radius: 6px; }
.title { font-size: 16px; font-weight: 600; }
.result-card { background: #fff; margin: 0 16px; border-radius: 12px; padding: 28px 20px 22px; text-align: center; }
.check-circle { width: 68px; height: 68px; margin: 0 auto 14px; border-radius: 50%; background: #12B76A; display: flex; align-items: center; justify-content: center; }
.pay-title { font-size: 18px; font-weight: 600; color: #1A1A1A; }
.pay-amount { font-size: 14px; color: #8C8C8C; margin-top: 6px; }
.pay-actions { display: flex; gap: 14px; margin-top: 22px; }
.btn { flex: 1; border-radius: 20px; padding: 10px 0; font-size: 14px; cursor: pointer; border: none; }
.btn.primary { background: #12B76A; color: #fff; }
</style>
