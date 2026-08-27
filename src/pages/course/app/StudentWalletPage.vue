<template>
  <div class="student-wallet">
    <header class="app-header"><span @click="$router.back()">←</span><span>我的钱包</span></header>
    <div class="wallet-card">
      <div class="balance">¥{{ ((wallet?.balance ?? 0) / 100).toFixed(2) }}</div>
      <div class="withdrawable">可提现 ¥{{ ((wallet?.withdrawable ?? 0) / 100).toFixed(2) }}</div>
      <button class="withdraw-btn" @click="showWithdraw = true">提现</button>
    </div>
    <div class="section-title">红包记录</div>
    <div v-for="r in redPacketRecords" :key="r.id" class="record-item">
      <span class="record-label"><EmojiIcon emoji="🎁" :size="16" /> {{ triggerLabel(r.trigger_type) }}</span>
      <span class="amount">+¥{{ (r.amount / 100).toFixed(2) }}</span>
    </div>
    <t-dialog v-model:visible="showWithdraw" header="提现" width="320px">
      <t-form label-width="80px">
        <t-form-item label="可提现">¥{{ ((wallet?.withdrawable ?? 0) / 100).toFixed(2) }}</t-form-item>
        <t-form-item label="金额(元)"><t-input-number v-model="amount" :min="0.01" :max="(wallet?.withdrawable ?? 0) / 100" :decimal-places="2" /></t-form-item>
      </t-form>
      <template #footer><t-button variant="text" @click="showWithdraw = false">取消</t-button><t-button theme="primary" @click="doWithdraw">申请提现</t-button></template>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import EmojiIcon from './EmojiIcon.vue';
import { useWalletStore } from '../../../stores/wallet-store';

const store = useWalletStore();
const showWithdraw = ref(false); const amount = ref(0);
const wallet = computed(() => store.loadWalletByOwner('STU-001', 'student'));
const redPacketRecords = computed(() => store.loadRedPacketRecords({ studentId: 'STU-001' }));
const triggerLabel = (s: string) => ({ completion: '完播红包', answer_correct: '答题红包', new_member: '新成员红包' }[s] ?? s);
function doWithdraw() {
  if (!wallet.value) { MessagePlugin.warning('钱包不存在'); return; }
  try { store.withdrawStudent({ wallet_id: wallet.value.id, amount: Math.round(amount.value * 100) }); MessagePlugin.success('提现申请已提交'); showWithdraw.value = false; }
  catch (e: any) { MessagePlugin.warning(e.message); }
}
</script>

<style scoped>
.student-wallet { padding: 16px; }
.app-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.wallet-card { background: linear-gradient(135deg, #12B76A, #0E9B58); border-radius: 16px; padding: 24px; color: #fff; margin-bottom: 16px; }
.balance { font-size: 32px; font-weight: 700; }
.withdrawable { font-size: 14px; opacity: 0.9; margin-top: 4px; }
.withdraw-btn { margin-top: 16px; background: rgba(255,255,255,0.2); color: #fff; border: 1px solid rgba(255,255,255,0.3); border-radius: 8px; padding: 8px 24px; font-size: 14px; }
.section-title { font-size: 16px; font-weight: 600; margin: 16px 0 8px; }
.record-item { display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #fff; border-radius: 8px; margin-bottom: 8px; font-size: 14px; }
.record-label { display: flex; align-items: center; gap: 4px; }
.amount { color: #12B76A; font-weight: 600; }
</style>
