<template>
  <div class="contract-sign">
    <header class="app-header"><span @click="$router.back()">←</span><span>合同签署</span></header>
    <div v-if="contract" class="contract-box">
      <h3 class="contract-title">营期合同</h3>
      <div class="contract-row"><span>营期</span><span>{{ contract.camp_title }}</span></div>
      <div class="contract-row"><span>学员</span><span>{{ contract.student_name }}</span></div>
      <div class="contract-row"><span>金额</span><span class="amount">¥{{ (contract.amount/100).toFixed(2) }}</span></div>
      <div class="contract-row">
        <span>状态</span>
        <span :class="contract.status === 'signed' ? 'status-signed' : 'status-pending'"><t-icon :name="contract.status === 'signed' ? 'check-circle' : 'time'" :size="14" /> {{ contract.status === 'signed' ? '已签署' : '待签署' }}</span>
      </div>
      <div class="contract-content">
        <p><b>一、服务内容</b>：学员支付费用后获得营期全部课程学习权益，含视频播放、打卡、答疑、测验等功能。</p>
        <p><b>二、服务期限</b>：自合同签署起至营期结束日止。营期结束后可继续答疑。</p>
        <p><b>三、退款政策</b>：营期结束后7天内可申请退款，退款将取消本合同。</p>
        <p><b>四、知识产权</b>：课程内容版权归平台所有，禁止录屏传播。</p>
        <p><b>五、隐私保护</b>：学员信息仅用于本营期服务，不做他用。</p>
        <p><b>六、免责声明</b>：因不可抗力导致服务中断，平台不承担责任。</p>
        <p><b>七、争议解决</b>：双方协商解决，协商不成提交仲裁。</p>
      </div>
      <label v-if="contract.status === 'pending_sign'" class="agree-row"><input type="checkbox" v-model="agreed" /> 我已阅读并同意以上合同条款</label>
      <button v-if="contract.status === 'pending_sign'" class="sign-btn" :disabled="!agreed" @click="sign">签署合同</button>
      <div v-else class="signed-tip">合同已签署，请返回营期开始学习</div>
    </div>
    <div v-else class="empty">合同不存在</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';
import { useCampPaymentStore } from '../../../stores/camp-payment-store';

const route = useRoute(); const store = useCampPaymentStore();
const agreed = ref(false);
const orderId = route.params.orderId as string;
const contract = computed(() => store.contracts.find(c => c.order_id === orderId));
function sign() { store.signContract(orderId, 'STU-001'); MessagePlugin.success('合同签署成功'); }
</script>

<style scoped>
.contract-sign { padding: 16px; padding-bottom: 80px; max-width: 375px; margin: 0 auto; }
.app-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; font-weight: 600; font-size: 16px; }
.contract-box { background: #fff; border-radius: 12px; padding: 20px; }
.contract-title { font-size: 18px; font-weight: 700; text-align: center; margin-bottom: 16px; color: #1F2C3E; }
.contract-row { display: flex; justify-content: space-between; padding: 10px 0; font-size: 14px; color: #1F2C3E; border-bottom: 1px solid #F9FAFB; }
.amount { color: #12B76A; font-weight: 700; }
.status-signed { color: #12B76A; font-weight: 600; display: inline-flex; align-items: center; gap: 2px; }
.status-pending { color: #F79009; font-weight: 600; display: inline-flex; align-items: center; gap: 2px; }
.contract-content { margin: 16px 0; padding: 12px; background: #F9FAFB; border-radius: 8px; font-size: 13px; color: #667085; line-height: 1.6; }
.sign-btn { width: 100%; padding: 14px; background: #12B76A; color: #fff; border: none; border-radius: 10px; font-size: 16px; font-weight: 600; }
.sign-btn:disabled { background: #EAECF0; color: #98A2B3; }
.agree-row { display: flex; align-items: center; gap: 8px; margin: 12px 0; font-size: 14px; color: #667085; }
.signed-tip { text-align: center; color: #12B76A; font-size: 14px; padding: 12px; }
.empty { text-align: center; color: #98A2B3; padding: 40px; }
</style>
