<template>
  <!-- PG-IM-021 发起售后（对齐 App：客户主动申请，非店员代申请） -->
  <div class="aftersale-apply-page">
    <div class="page-header">
      <span class="back" @click="goBack">返回</span>
      <span class="title">发起售后</span>
      <span />
    </div>

    <div class="page-body">
      <!-- 售后商品 -->
      <div class="section">
        <div class="sec-title">售后商品</div>
        <div class="goods-list">
          <div class="goods-item" @click="toggleGoodsSelected">
            <div class="goods-check" :class="{ active: form.goodsSelected }">
              <el-icon v-if="form.goodsSelected" :size="14" color="#fff"><Check /></el-icon>
            </div>
            <img v-if="order?.thumb" class="goods-thumb" :src="order.thumb" />
            <div v-else class="goods-thumb placeholder">图</div>
            <div class="goods-info">
              <div class="goods-title">{{ order?.title ?? '' }}</div>
              <div class="goods-meta">订单号：{{ orderId }}</div>
              <div class="goods-meta">{{ order?.time }}</div>
            </div>
            <div class="goods-amount">¥{{ (order?.amount ?? 0).toFixed(2) }}</div>
          </div>
        </div>
      </div>

      <!-- 售后类型 -->
      <div class="section">
        <div class="sec-title">售后类型</div>
        <div class="type-grid">
          <div
            v-for="t in serviceTypes"
            :key="t.value"
            :class="['type-cell', { active: form.serviceType === t.value }]"
            @click="form.serviceType = t.value"
          >
            {{ t.label }}
          </div>
        </div>
      </div>

      <!-- 退款原因 -->
      <div v-if="form.serviceType !== 'consult' && form.serviceType !== 'logistics'" class="section">
        <div class="sec-title">{{ form.serviceType === 'return' ? '退货原因' : '退款原因' }}</div>
        <div class="reason-row" @click="reasonPickerVisible = true">
          <span :class="['reason-text', { placeholder: !form.reason }]">{{ form.reason || '请选择' }}</span>
          <el-icon :size="14" color="#999"><ArrowRight /></el-icon>
        </div>
      </div>

      <!-- 联系电话 -->
      <div class="section">
        <div class="sec-title">联系电话</div>
        <input v-model="form.phone" class="phone-input" type="tel" placeholder="请输入联系电话" maxlength="11" />
      </div>

      <!-- 问题描述和凭证 -->
      <div class="section">
        <div class="sec-title">问题描述和凭证</div>
        <textarea v-model="form.description" class="desc-textarea" rows="4" placeholder="请描述你遇到的问题，并上传凭证" />
        <div class="upload-grid">
          <div v-for="(img, i) in form.images" :key="i" class="upload-item">
            <img :src="img" />
            <span class="upload-del" @click="removeImage(i)">×</span>
          </div>
          <div v-if="form.images.length < 9" class="upload-add" @click="addImage">
            <el-icon :size="24" color="#999"><Plus /></el-icon>
            <span>{{ form.images.length }}/9</span>
          </div>
        </div>
      </div>

      <button :class="['submit-btn', { disabled: !canSubmit }]" @click="submit">
        提交
      </button>
    </div>

    <!-- 原因选择器 -->
    <div v-if="reasonPickerVisible" class="modal-mask" @click.self="reasonPickerVisible = false">
      <div class="reason-modal">
        <div class="rm-title">{{ form.serviceType === 'return' ? '选择退货原因' : '选择退款原因' }}</div>
        <div
          v-for="r in reasonOptions"
          :key="r"
          :class="['rm-item', { active: form.reason === r }]"
          @click="selectReason(r)"
        >
          {{ r }}
        </div>
        <button class="rm-close" @click="reasonPickerVisible = false">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Check, ArrowRight, Plus } from '@element-plus/icons-vue';
import { useImAftersaleStore } from '../../../stores/im-aftersale-store';
import { useImGroupStore } from '../../../stores/im-group-store';
import { useImAccountStore } from '../../../stores/im-account-store';
import { submitAftersaleApplication } from '../../../services/im-aftersale-service';
import { getOrderById } from '../../../adapters/sim/im-sim-adapter';

const route = useRoute();
const router = useRouter();
const account = useImAccountStore();
const groupStore = useImGroupStore();
const aftersaleStore = useImAftersaleStore();

const props = defineProps<{ orderId?: string; convId?: string }>();

const orderId = computed(() => props.orderId ?? (route.query.orderId as string));
const convId = computed(() => props.convId ?? (route.query.convId as string));
const order = ref<Awaited<ReturnType<typeof getOrderById>>>();

const serviceTypes = [
  { value: 'refund' as const, label: '仅退款' },
  { value: 'return' as const, label: '退货退款' },
  { value: 'logistics' as const, label: '查物流' },
  { value: 'consult' as const, label: '仅咨询' },
];

const refundReasons = ['不想要了', '快递长时间未到达', '三无产品', '质量问题', '假冒伪劣产品', '发错货', '其他'];
const returnReasons = ['不想要了', '质量问题', '与描述不符', '发错货', '其他'];

const reasonOptions = computed(() => (form.value.serviceType === 'return' ? returnReasons : refundReasons));

const form = ref({
  goodsSelected: true,
  serviceType: 'refund' as 'refund' | 'return' | 'logistics' | 'consult',
  reason: '',
  phone: '',
  description: '',
  images: [] as string[],
});

const reasonPickerVisible = ref(false);

function toggleGoodsSelected() {
  form.value.goodsSelected = !form.value.goodsSelected;
}

function selectReason(r: string) {
  form.value.reason = r;
  reasonPickerVisible.value = false;
}

function addImage() {
  if (form.value.images.length >= 9) return;
  // 模拟上传凭证图
  form.value.images.push('https://placehold.co/80x80/12B76A/FFFFFF?text=凭证');
}

function removeImage(i: number) {
  form.value.images.splice(i, 1);
}

const canSubmit = computed(() => {
  if (!form.value.goodsSelected) return false;
  if (!form.value.phone) return false;
  if (form.value.serviceType === 'refund' || form.value.serviceType === 'return') {
    if (!form.value.reason) return false;
  }
  return true;
});

async function submit() {
  if (!canSubmit.value) return;
  if (!orderId.value || !convId.value || !order.value) return;

  const group = groupStore.groups.find((g) => g.group_id === convId.value);
  if (!group?.store_id) {
    ElMessage.error('群信息异常');
    return;
  }

  const detail = await submitAftersaleApplication({
    orderId: orderId.value,
    orderSnapshot: { title: order.value.title, amount: order.value.amount, time: order.value.time },
    customerId: account.activeUserId,
    storeId: group.store_id,
    groupId: convId.value,
    serviceType: form.value.serviceType,
    reason: form.value.reason || '客户仅咨询',
    phone: form.value.phone,
    description: form.value.description,
    images: form.value.images,
  });

  ElMessage.success(`售后申请已提交，售后单 ${detail.aftersale_id}`);
  // 返回聊天页
  router.push({ path: `/h5/im/chat/${convId.value}`, query: { as: account.activeUserId } });
}

function goBack() {
  router.push({ path: `/h5/im/chat/${convId.value}`, query: { as: account.activeUserId } });
}

onMounted(async () => {
  if (!orderId.value) {
    ElMessage.error('缺少订单信息');
    goBack();
    return;
  }
  order.value = await getOrderById(orderId.value);
  if (!order.value) {
    ElMessage.error('订单不存在');
    goBack();
  }
  // 默认电话从当前用户取（演示）
  form.value.phone = account.activeUser?.phone || '13653098861';
});
</script>

<style scoped>
.aftersale-apply-page { display: flex; flex-direction: column; height: 100%; background: #F7F8FA; }
.page-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: #fff; border-bottom: 1px solid #F0F0F0; flex-shrink: 0; }
.back { font-size: 14px; color: #12B76A; cursor: pointer; padding: 2px 8px; border: 1px solid #12B76A; border-radius: 6px; }
.title { font-size: 16px; font-weight: 600; }
.page-body { flex: 1; overflow-y: auto; padding: 12px; }
.section { background: #fff; border-radius: 10px; padding: 14px; margin-bottom: 10px; }
.sec-title { font-size: 14px; font-weight: 600; color: #262626; margin-bottom: 12px; }
.goods-item { display: flex; align-items: center; gap: 10px; }
.goods-check { width: 18px; height: 18px; border-radius: 50%; border: 1px solid #D9D9D9; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.goods-check.active { background: #12B76A; border-color: #12B76A; }
.goods-thumb { width: 70px; height: 70px; border-radius: 6px; object-fit: cover; background: #F0F0F0; flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: #999; font-size: 12px; }
.goods-info { flex: 1; min-width: 0; }
.goods-title { font-size: 14px; color: #262626; line-height: 1.4; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.goods-meta { font-size: 11px; color: #999; margin-top: 4px; }
.goods-amount { font-size: 14px; font-weight: 600; color: #262626; }
.type-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.type-cell { text-align: center; padding: 12px; border: 1px solid #E8E8E8; border-radius: 8px; font-size: 14px; color: #595959; }
.type-cell.active { border-color: #12B76A; color: #12B76A; background: #E7F8F0; }
.reason-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #F0F0F0; }
.reason-text { font-size: 14px; color: #262626; }
.reason-text.placeholder { color: #999; }
.phone-input { width: 100%; border: none; border-bottom: 1px solid #F0F0F0; padding: 10px 0; font-size: 14px; outline: none; }
.desc-textarea { width: 100%; border: 1px solid #E8E8E8; border-radius: 8px; padding: 10px; font-size: 14px; resize: none; outline: none; }
.upload-grid { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 12px; }
.upload-item { position: relative; width: 80px; height: 80px; border-radius: 8px; overflow: hidden; }
.upload-item img { width: 100%; height: 100%; object-fit: cover; }
.upload-del { position: absolute; top: 2px; right: 2px; width: 18px; height: 18px; background: rgba(0,0,0,0.5); color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; }
.upload-add { width: 80px; height: 80px; border: 1px dashed #D9D9D9; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #999; font-size: 11px; }
.submit-btn { display: block; width: calc(100% - 24px); margin: 16px 12px 24px; padding: 12px; background: #12B76A; color: #fff; border: none; border-radius: 8px; font-size: 16px; }
.submit-btn.disabled { background: #B7EBD3; }
.modal-mask { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: flex-end; z-index: 100; }
.reason-modal { width: 100%; background: #fff; border-radius: 12px 12px 0 0; padding: 16px; max-height: 60vh; overflow-y: auto; }
.rm-title { font-size: 16px; font-weight: 600; text-align: center; margin-bottom: 12px; }
.rm-item { padding: 14px 0; font-size: 14px; color: #262626; border-bottom: 1px solid #F0F0F0; display: flex; align-items: center; justify-content: space-between; }
.rm-item.active { color: #12B76A; }
.rm-item.active::after { content: '✓'; font-weight: 600; }
.rm-close { display: block; width: 100%; margin-top: 16px; padding: 12px; background: #F5F5F5; border: none; border-radius: 8px; font-size: 14px; }
</style>
