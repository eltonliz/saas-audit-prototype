<template>
  <!-- V2·0902 现金红包选择弹窗（排课/课程共用） -->
  <t-dialog
    v-model:visible="visible"
    header="现金红包"
    width="860px"
    :confirm-btn="{ content: '确定', theme: 'primary' }"
    :cancel-btn="{ content: '取消' }"
    :on-confirm="doConfirm"
  >
    <div class="rp-filter">
      <t-input v-model="kw" clearable placeholder="请输入红包编号" style="width: 200px" />
      <t-button theme="primary" size="small">筛选</t-button>
      <t-button size="small">重置</t-button>
      <t-button theme="primary" variant="outline" size="small">新建红包</t-button>
      <t-button size="small">刷新</t-button>
    </div>
    <t-table :data="filteredList" row-key="no" :columns="columns" bordered size="small" max-height="340" v-model:selected-row-keys="selectedKeys">
      <template #amount="{ row }">¥{{ row.amount }}</template>
    </t-table>
  </t-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

export interface RedPacket {
  no: string;
  amount: number;
  count: number;
  type: string;
}

const emit = defineEmits<{ (e: 'confirm', packet: RedPacket): void }>();
const visible = defineModel<boolean>('visible', { default: false });

const list = ref<RedPacket[]>([
  { no: 'XJHB260806000009', amount: 1, count: 1, type: '等分红包' },
  { no: 'XJHB260806000008', amount: 1, count: 1, type: '拼手气红包' },
  { no: 'XJHB260806000002', amount: 150, count: 10, type: '等分红包' },
  { no: 'XJHB260805000005', amount: 500, count: 10, type: '拼手气红包' },
  { no: 'XJHB260726000012', amount: 113, count: 1, type: '拼手气红包' },
]);
const columns = [
  { colKey: 'row-select', type: 'single', width: 50 },
  { colKey: 'no', title: '红包编号', width: 150 },
  { colKey: 'amount', title: '红包总金额', width: 100 },
  { colKey: 'count', title: '红包总数量', width: 95 },
  { colKey: 'type', title: '发放类型', width: 100 },
];

const kw = ref('');
const selectedKeys = ref<string[]>([]);
const filteredList = computed(() => list.value.filter(r => !kw.value || r.no.includes(kw.value)));

function openWith(no: string) {
  selectedKeys.value = no ? [no] : [];
  kw.value = '';
  visible.value = true;
}
function doConfirm() {
  const hit = list.value.find(r => selectedKeys.value.includes(r.no));
  if (!hit) { return; }
  emit('confirm', hit);
  visible.value = false;
}

defineExpose({ openWith });
</script>

<style scoped>
.rp-filter { display: flex; gap: 8px; margin-bottom: 12px; }
</style>
