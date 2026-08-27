<template>
  <!-- PG-IM-022 注销账号页（APP 上架合规要求）
       FN-IM-029：账号注销（独立页：注销说明+二次确认）
       入口：底部导航「我的」
  -->
  <div class="account-close-page">
    <div class="page-header">
      <span class="back" @click="goBack">返回</span>
      <span class="title">注销账号</span>
    </div>

    <div class="body">
      <!-- 警示区 -->
      <div class="warning-box">
        <el-icon :size="28" color="#F5222D"><WarningFilled /></el-icon>
        <div class="wb-title">注销后无法恢复</div>
        <div class="wb-sub">请仔细阅读以下说明后再做决定</div>
      </div>

      <!-- 注销须知 -->
      <div class="section">
        <div class="sec-title">注销须知</div>
        <ul class="notice-list">
          <li>注销账号后，您在本平台的所有数据将被永久删除，包括但不限于：好友关系、聊天记录、群成员身份、订单卡片、售后记录。</li>
          <li>注销后无法再使用该账号登录，也无法恢复任何数据。</li>
          <li>若您名下有进行中的售后单，需先完成或关闭后再注销。</li>
          <li>若您为门店店长/店员，注销后名下客户归属关系将由分销域重新分配，群主自动转给继任者。</li>
          <li>注销操作不可逆，请确认后再继续。</li>
        </ul>
      </div>

      <!-- 已知悉勾选 -->
      <div class="confirm-row" @click="acknowledged = !acknowledged">
        <span :class="['checkbox', { on: acknowledged }]">
          <el-icon v-if="acknowledged" :size="12"><Check /></el-icon>
        </span>
        <span>我已阅读并理解上述注销须知</span>
      </div>

      <!-- 注销按钮 -->
      <button class="close-btn" :disabled="!acknowledged" @click="confirmVisible = true">申请注销账号</button>
    </div>

    <!-- 二次确认弹窗 -->
    <div v-if="confirmVisible" class="modal-mask" @click.self="confirmVisible = false">
      <div class="modal">
        <div class="modal-title">最后确认</div>
        <div class="modal-text">注销后账号数据将永久删除且无法恢复，是否确认注销？</div>
        <div class="modal-text-sub">如需继续，请在下方输入「确认注销」</div>
        <input
          v-model="confirmText"
          class="modal-input"
          placeholder="请输入「确认注销」"
        />
        <div class="modal-actions">
          <button class="btn" @click="confirmVisible = false">取消</button>
          <button class="btn danger" :disabled="confirmText !== '确认注销'" @click="doClose">确认注销</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { WarningFilled, Check } from '@element-plus/icons-vue';

const router = useRouter();
const route = useRoute();

const acknowledged = ref(false);
const confirmVisible = ref(false);
const confirmText = ref('');

function goBack() {
  router.push({ path: '/h5/im/message', query: route.query });
}

function doClose() {
  // Sim 模拟：原型仅展示流程，不真实删除数据
  ElMessage.success('注销申请已提交，账号将在 7 个工作日内完成注销');
  confirmVisible.value = false;
  // 模拟注销后回到登录页（原型中跳回消息首页）
  setTimeout(() => {
    router.push({ path: '/h5/im/message' });
  }, 1500);
}
</script>

<style scoped>
.account-close-page { display: flex; flex-direction: column; height: 100%; background: #F5F7FA; }
.page-header { display: flex; align-items: center; padding: 14px 16px; background: #fff; border-bottom: 1px solid #E4E7ED; }
.page-header .back { font-size: 14px; color: #12B76A; cursor: pointer; margin-right: 12px; }
.page-header .title { font-size: 16px; font-weight: 600; color: #303133; }

.body { flex: 1; overflow-y: auto; padding: 16px; }

.warning-box { background: #FFF1F0; border: 1px solid #FFA39E; border-radius: 10px; padding: 20px 16px; text-align: center; margin-bottom: 16px; }
.wb-title { font-size: 16px; font-weight: 600; color: #F5222D; margin-top: 8px; }
.wb-sub { font-size: 12px; color: #8C8C8C; margin-top: 4px; }

.section { background: #fff; border-radius: 10px; padding: 14px 16px; margin-bottom: 16px; }
.sec-title { font-size: 14px; font-weight: 600; color: #303133; margin-bottom: 10px; }
.notice-list { margin: 0; padding-left: 18px; }
.notice-list li { font-size: 12px; color: #606266; line-height: 1.8; margin-bottom: 6px; }

.confirm-row { display: flex; align-items: center; gap: 8px; padding: 12px 4px; margin-bottom: 16px; cursor: pointer; }
.checkbox { width: 18px; height: 18px; border: 1.5px solid #DCDFE6; border-radius: 4px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.checkbox.on { background: #F5222D; border-color: #F5222D; color: #fff; }
.confirm-row span:last-child { font-size: 13px; color: #606266; }

.close-btn { width: 100%; padding: 12px 0; background: #F5222D; color: #fff; border: none; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; }
.close-btn:disabled { background: #FFCCC7; cursor: not-allowed; }

.modal-mask { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: #fff; border-radius: 12px; width: 300px; padding: 20px; }
.modal-title { font-size: 16px; font-weight: 600; color: #303133; text-align: center; margin-bottom: 12px; }
.modal-text { font-size: 13px; color: #606266; line-height: 1.6; text-align: center; margin-bottom: 6px; }
.modal-text-sub { font-size: 12px; color: #8C8C8C; text-align: center; margin-bottom: 12px; }
.modal-input { width: 100%; box-sizing: border-box; border: 1px solid #DCDFE6; border-radius: 6px; padding: 8px 10px; font-size: 13px; outline: none; margin-bottom: 14px; }
.modal-input:focus { border-color: #F5222D; }
.modal-actions { display: flex; gap: 10px; }
.modal-actions .btn { flex: 1; padding: 8px 0; border-radius: 6px; font-size: 14px; cursor: pointer; border: 1px solid #DCDFE6; background: #fff; color: #606266; }
.modal-actions .btn.danger { background: #F5222D; border-color: #F5222D; color: #fff; }
.modal-actions .btn.danger:disabled { background: #FFCCC7; border-color: #FFCCC7; cursor: not-allowed; }
</style>
