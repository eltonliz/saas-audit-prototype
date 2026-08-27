<template>
  <!-- 售后单详情面板（对齐 App 售后详情+售后记录+退款/退货/物流操作） -->
  <teleport to="body" :disabled="staticMode">
    <div v-if="detail" class="panel-mask" @click.self="$emit('close')">
      <div class="panel">
        <div class="panel-header">
          <span class="panel-title">售后详情</span>
          <span class="close" @click="$emit('close')">✕</span>
        </div>

        <div class="panel-body">
          <!-- 状态头（对齐 App：图标+状态+副标题） -->
          <div class="status-head">
            <span :class="['status-icon', detail.status]">
              <el-icon :size="15" color="#fff"><CircleCheck v-if="detail.status === 'done'" /><Timer v-else /></el-icon>
            </span>
            <div>
              <div class="status-label">{{ statusHead.label }}</div>
              <div class="status-sub">{{ statusHead.sub }}</div>
            </div>
          </div>

          <!-- 商品信息卡（对齐 App） -->
          <div class="section-title">商品信息</div>
          <div class="goods-card">
            <div class="goods-thumb">{{ detail.order_snapshot.title.slice(0, 1) }}</div>
            <div class="goods-meta">
              <div class="g-title">{{ detail.order_snapshot.title }}</div>
              <div class="g-price">¥{{ detail.order_snapshot.amount.toFixed(2) }}</div>
            </div>
          </div>
          <div class="info-lines">
            <div class="info-line">订单编号<span>{{ detail.order_id }}</span></div>
            <div class="info-line">下单时间<span>{{ detail.order_snapshot.time }}</span></div>
            <div class="info-line">售后类型<span>{{ serviceTypeLabel }}</span></div>
            <div class="info-line">申请原因<span>{{ detail.reason }}</span></div>
            <div class="info-line">联系电话<span>{{ detail.contact_phone || '—' }}</span></div>
            <div class="info-line">来源<span>{{ detail.source_channel === 'im' ? 'IM 服务群' : 'APP' }}</span></div>
          </div>

          <!-- 用户提交的问题描述与凭证 -->
          <template v-if="detail.description || (detail.evidence_images && detail.evidence_images.length)">
            <div class="section-title">问题描述</div>
            <div class="desc-card">
              <div v-if="detail.description" class="desc-text">{{ detail.description }}</div>
              <div v-if="detail.evidence_images?.length" class="evidence-list">
                <img v-for="(img, i) in detail.evidence_images" :key="i" :src="img" class="evidence-img" />
              </div>
            </div>
          </template>

          <!-- 物流轨迹（查物流展开，对齐 App 物流页） -->
          <template v-if="showLogistics">
            <div class="section-title">物流轨迹</div>
            <div class="timeline">
              <div v-for="(t, i) in logisticsTrace" :key="i" class="tl-item">
                <div :class="['tl-dot', { first: i === 0 }]" />
                <div class="tl-body">
                  <div class="tl-text">{{ t.text }}</div>
                  <div class="tl-time">{{ t.time }}</div>
                </div>
              </div>
            </div>
          </template>

          <!-- 售后记录（通讯录业务范畴内的时间线） -->
          <div class="section-title">售后记录</div>
          <div class="timeline">
            <div v-for="log in [...detail.logs].reverse()" :key="log.log_id" class="tl-item">
              <div :class="['tl-dot', { first: log.action === 'refund' || log.action === 'return_receive' }]" />
              <div class="tl-body">
                <div class="tl-text">{{ log.note }}</div>
                <div class="tl-time">{{ fmtTime(log.created_at) }}</div>
                <div v-if="log.extra" class="extra-card">
                  <div v-for="(v, k) in log.extra" :key="k" class="extra-line">{{ k }}<span>{{ v }}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 店员视角：本期不做处理操作（走 APP 售后流程），仅可查看 -->
        <div v-if="isStaff" class="panel-footer readonly">
          售后处理请前往 APP 端操作（仅退款/退货退款/查物流/关闭），此处仅展示进度
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ImAftersaleDetail } from '../../contracts/schemas/im-schemas';
import { aftersaleStatusLabel } from '../../contracts/state-machine/im-aftersale-machine';
import { useImConversationStore } from '../../stores/im-conversation-store';
import { CircleCheck, Timer } from '@element-plus/icons-vue';
import { useStaticMode } from '../../handoff/static-mode';

const staticMode = useStaticMode();

const props = defineProps<{
  detail: ImAftersaleDetail | null;
  isStaff: boolean;
  currentUserId: string;
  logisticsTrace: { time: string; text: string }[];
}>();

const emit = defineEmits<{
  close: [];
  handle: [event: never, note: never]; // 保留兼容：本期不做处理操作
  action: [action: never, payload: never]; // 保留兼容：本期不做处理操作
}>();

const convStore = useImConversationStore();
const statusHead = computed(() => {
  const s = props.detail?.status ?? 'pending';
  const map = {
    pending: { label: '待处理', sub: '等待商家处理售后申请' },
    processing: { label: '进行中', sub: '商家正在处理中' },
    done: { label: '售后完成', sub: props.detail?.service_type === 'refund' ? '商家确认退款，退款完成' : '售后处理已完成' },
    closed: { label: '已关闭', sub: '售后单已关闭' },
  } as const;
  return map[s];
});

const serviceTypeLabel = computed(() => {
  const m = { refund: '仅退款', return: '退货退款', logistics: '查物流', consult: '仅咨询' } as const;
  return m[props.detail?.service_type ?? 'consult'];
});

function fmtTime(iso: string) {
  return new Date(iso).toLocaleString('zh-CN', { hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
</script>

<style scoped>
.panel-mask { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 200; display: flex; justify-content: flex-end; }
.panel { width: 380px; max-width: 94vw; height: 100vh; background: #F5F7FA; display: flex; flex-direction: column; animation: slide-in 0.2s ease-out; }
@keyframes slide-in { from { transform: translateX(100%); } to { transform: translateX(0); } }
.panel-header { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; background: #fff; border-bottom: 1px solid #F0F0F0; }
.panel-title { font-size: 16px; font-weight: 600; }
.close { cursor: pointer; color: #8C8C8C; }
.panel-body { flex: 1; overflow-y: auto; padding: 12px 14px; }
.status-head { display: flex; gap: 10px; align-items: center; padding: 6px 2px 12px; }
.status-icon { width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 14px; background: #FA8C16; }
.status-icon.done { background: #12B76A; }
.status-label { font-size: 17px; font-weight: 600; color: #12B76A; }
.status-sub { font-size: 12px; color: #8C8C8C; margin-top: 2px; }
.section-title { font-size: 13px; color: #8C8C8C; margin: 12px 2px 8px; }
.goods-card { display: flex; gap: 10px; background: #fff; border-radius: 10px; padding: 12px; }
.goods-thumb { width: 56px; height: 56px; border-radius: 8px; background: #E7F8F0; color: #12B76A; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; }
.g-title { font-size: 14px; font-weight: 600; }
.g-price { font-size: 14px; color: #F5222D; margin-top: 4px; }
.info-lines { background: #fff; border-radius: 10px; padding: 4px 12px; margin-top: 8px; }
.info-line { display: flex; justify-content: space-between; font-size: 13px; color: #8C8C8C; padding: 8px 0; border-bottom: 1px solid #F7F7F7; }
.info-line:last-child { border-bottom: none; }
.info-line span { color: #1A1A1A; }
.desc-card { background: #fff; border-radius: 10px; padding: 12px; }
.desc-text { font-size: 13px; color: #1A1A1A; line-height: 1.6; }
.evidence-list { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
.evidence-img { width: 64px; height: 64px; object-fit: cover; border-radius: 6px; background: #F0F0F0; }
.timeline { background: #fff; border-radius: 10px; padding: 12px; }
.tl-item { display: flex; gap: 10px; position: relative; padding-bottom: 14px; }
.tl-item:not(:last-child)::before { content: ''; position: absolute; left: 4px; top: 12px; bottom: 0; width: 1px; background: #E4E7ED; }
.tl-dot { width: 9px; height: 9px; border-radius: 50%; background: #D9D9D9; margin-top: 4px; flex-shrink: 0; z-index: 1; }
.tl-dot.first { background: #12B76A; }
.tl-text { font-size: 14px; color: #1A1A1A; }
.tl-time { font-size: 11px; color: #BFBFBF; margin-top: 2px; }
.extra-card { background: #F5F7FA; border-radius: 8px; padding: 8px 10px; margin-top: 6px; }
.extra-line { display: flex; justify-content: space-between; font-size: 12px; color: #8C8C8C; line-height: 1.9; }
.extra-line span { color: #1A1A1A; }
.panel-footer { border-top: 1px solid #F0F0F0; padding: 12px 14px; background: #fff; }
.panel-footer.readonly { font-size: 12px; color: #8C8C8C; text-align: center; }
.action-grid { display: flex; gap: 8px; }
.action-grid .btn { flex: 1; }
.form { margin-top: 8px; }
.f-input { width: 100%; border: 1px solid #E4E7ED; border-radius: 8px; padding: 8px 10px; font-size: 13px; margin-bottom: 8px; outline: none; box-sizing: border-box; }
.btn { border: 1px solid #E4E7ED; background: #fff; border-radius: 8px; padding: 8px 0; font-size: 14px; cursor: pointer; }
.btn.primary { background: #12B76A; color: #fff; border-color: #12B76A; }
.btn.danger { color: #F5222D; border-color: #F5222D; }
.btn.full { width: 100%; margin-top: 8px; }
</style>
