<template>
  <!-- PG-IM-018：群发记录（FN-IM-021）批次列表+成功率/点击率 -->
  <div class="records-page">
    <div class="page-header">
      <button class="back-btn" @click="goBack">返回</button>
      <span class="page-title">群发记录</span>
      <span class="placeholder" />
    </div>

    <div v-if="batches.length === 0" class="empty">
      <el-empty description="暂无群发记录" :image-size="90">
        <el-button type="primary" size="small" @click="goPromo">去分享直播</el-button>
      </el-empty>
    </div>

    <div v-for="b in batches" :key="b.batch_id" class="batch-card">
      <div class="b-head">
        <span class="b-title">{{ b.room_title }}</span>
        <span class="b-time">{{ b.sent_at }}</span>
      </div>
      <div class="b-meta">{{ b.sender_name }} ｜ {{ targetTypeText(b.target_type) }}</div>
      <div class="b-stats">
        <div class="stat">
          <span class="num">{{ b.target_count }}</span>
          <span class="label">目标</span>
        </div>
        <div class="stat">
          <span class="num ok">{{ b.success_count }}</span>
          <span class="label">成功</span>
        </div>
        <div class="stat">
          <span class="num" :class="{ ng: b.fail_count > 0 }">{{ b.fail_count }}</span>
          <span class="label">失败</span>
        </div>
        <div class="stat">
          <span class="num">{{ successRate(b) }}</span>
          <span class="label">成功率</span>
        </div>
        <div class="stat">
          <span class="num ok">{{ b.click_count }}</span>
          <span class="label">点击观看</span>
        </div>
        <div class="stat">
          <span class="num ok">{{ msStore.clickRate(b) }}</span>
          <span class="label">点击率</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useImMassSendStore } from '../../../stores/im-mass-send-store';
import type { MassSendBatch } from '../../../contracts/schemas/im-schemas';

const route = useRoute();
const router = useRouter();
const msStore = useImMassSendStore();

const batches = computed(() => msStore.batches);

function targetTypeText(t: MassSendBatch['target_type']) {
  const m = { group: '按群聊', personal: '按个人', all_customers: '本店全部客户' } as const;
  return m[t];
}

function successRate(b: MassSendBatch) {
  if (!b.target_count) return '0%';
  return `${Math.round((b.success_count / b.target_count) * 100)}%`;
}

function goBack() {
  router.push({ path: '/h5/im/live-promo', query: route.query });
}
function goPromo() {
  router.push({ path: '/h5/im/live-promo', query: route.query });
}
</script>

<style scoped>
.deferred-banner { background: #FFF7E8; color: #D48806; font-size: 11px; text-align: center; padding: 5px 10px; }
.records-page { min-height: 100%; background: var(--proto-page-bg, #F5F7FA); }
.page-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: #fff; border-bottom: 1px solid var(--proto-divider, #F0F0F0); }
.back-btn { font-size: 13px; color: var(--proto-primary, #12B76A); border: 1px solid var(--proto-primary, #12B76A); border-radius: 14px; padding: 4px 12px; background: #fff; cursor: pointer; }
.page-title { font-size: 16px; font-weight: 600; }
.placeholder { width: 52px; }
.empty { padding: 60px 0; }
.batch-card { margin: 10px 16px; padding: 14px; background: #fff; border-radius: 12px; }
.b-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.b-title { font-size: 15px; font-weight: 600; color: var(--proto-text-primary, #303133); }
.b-time { font-size: 11px; color: var(--proto-text-weak, #BFBFBF); }
.b-meta { font-size: 12px; color: var(--proto-text-secondary, #8C8C8C); margin-bottom: 10px; }
.b-stats { display: flex; border-top: 1px solid var(--proto-divider, #F0F0F0); padding-top: 10px; }
.stat { flex: 1; text-align: center; }
.num { display: block; font-size: 15px; font-weight: 600; color: var(--proto-text-primary, #303133); }
.num.ok { color: var(--proto-primary, #12B76A); }
.num.ng { color: var(--proto-danger, #F5222D); }
.label { display: block; font-size: 11px; color: var(--proto-text-secondary, #8C8C8C); margin-top: 2px; }
</style>
