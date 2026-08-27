<!--
  门店域复刻 · 门店新增/编辑弹窗
  数据源：
    - 11-门店域-PRD-v7.0.0.md §7 FN-STM-001 新建门店字段
    - 11-门店域-PRD-v7.0.0.md §9 ENT-STM-001 门店实体
  新建门店字段（PRD §7）：门店名称* / 所在分组 / 店长* / 发货地址(联系人/电话/详细地址) / 售后地址(联系人/电话/详细地址) / 门店资质
  修改点（红色标记）：
    - 「店长」字段：保留原样正常显示（不划线不废弃）
    - 新增「主讲讲师」字段：红色标记 【新增·课程业务】
-->
<template>
  <el-dialog
    :model-value="visible"
    :title="mode === 'create' ? '新建门店' : '编辑门店'"
    width="640px"
    @update:model-value="$emit('update:visible', $event)"
  >
    <el-form :model="form" label-width="120px" class="store-form">
      <el-form-item label="门店名称" required>
        <el-input v-model="form.store_name" placeholder="请输入门店名称" />
      </el-form-item>

      <el-form-item label="所在分组">
        <el-select v-model="form.group_id" placeholder="请选择分组" clearable>
          <el-option v-for="g in groups" :key="g.group_id" :label="g.group_name" :value="g.group_id" />
        </el-select>
      </el-form-item>

      <el-form-item label="店长">
        <el-select v-model="form.manager_id" placeholder="请选择店长" clearable>
          <el-option v-for="s in storeManagers" :key="s.staff_id" :label="s.name" :value="s.staff_id" />
        </el-select>
      </el-form-item>

      <!-- 修改点2：新增「主讲讲师」字段红色标记 -->
      <!-- 【新增·课程业务】 -->
      <el-form-item label="主讲讲师">
        <div class="field-new">
          <span class="new-label" style="color: red; font-weight: 600;">主讲讲师 <span class="new-tag">【新增·课程业务】</span></span>
          <el-select v-model="form.main_lecturer_id" placeholder="请选择主讲讲师" clearable>
            <el-option v-for="l in lecturers" :key="l.id" :label="l.name" :value="l.id" />
          </el-select>
          <div class="new-hint" style="color: red;">课程业务新增：门店关联主讲讲师，替代原店长字段</div>
        </div>
      </el-form-item>

      <el-divider content-position="left">发货地址</el-divider>

      <el-form-item label="联系人">
        <el-input v-model="form.shipping_address.contact_person" placeholder="请输入发货联系人" />
      </el-form-item>
      <el-form-item label="联系电话">
        <el-input v-model="form.shipping_address.contact_phone" placeholder="请输入联系电话" />
      </el-form-item>
      <el-form-item label="详细地址">
        <el-input v-model="form.shipping_address.address" type="textarea" :rows="2" placeholder="请输入发货详细地址" />
      </el-form-item>

      <el-divider content-position="left">售后地址</el-divider>

      <el-form-item label="联系人">
        <el-input v-model="form.after_sale_address.contact_person" placeholder="请输入售后联系人" />
      </el-form-item>
      <el-form-item label="联系电话">
        <el-input v-model="form.after_sale_address.contact_phone" placeholder="请输入联系电话" />
      </el-form-item>
      <el-form-item label="详细地址">
        <el-input v-model="form.after_sale_address.address" type="textarea" :rows="2" placeholder="请输入售后详细地址" />
      </el-form-item>

      <el-divider content-position="left">门店资质</el-divider>

      <el-form-item label="门店资质">
        <el-input v-model="form.qualification_info" type="textarea" :rows="3" placeholder="请输入资质信息（如营业执照编号）" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="$emit('update:visible', false)">取消</el-button>
      <el-button type="primary" @click="onSave">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { ElMessage } from 'element-plus';

/** 门店实体（ENT-STM-001，扩展 main_lecturer_id 为课程业务新增字段） */
interface StoreForm {
  store_id: string;
  store_no: string;
  store_name: string;
  group_id: string;
  manager_id: string;
  main_lecturer_id: string; // 【新增·课程业务】主讲讲师
  status: '已启用' | '未启用' | '禁用';
  qualification_status: '待提交' | '待审核' | '已通过' | '已驳回';
  shipping_address: { contact_person: string; contact_phone: string; address: string };
  after_sale_address: { contact_person: string; contact_phone: string; address: string };
  qualification_info: string;
  create_time: string;
  update_time: string;
  disable_time: string;
  enable_time: string;
}

const props = defineProps<{
  visible: boolean;
  mode: 'create' | 'edit';
  store: StoreForm | null;
}>();

const emit = defineEmits<{
  'update:visible': [val: boolean];
  save: [store: StoreForm];
}>();

const groups = ref([
  { group_id: 'g-1', group_name: '华南区' },
  { group_id: 'g-2', group_name: '华东区' },
  { group_id: 'g-3', group_name: '华北区' },
]);

const storeManagers = ref([
  { staff_id: 's-1', name: '王店长' },
  { staff_id: 's-3', name: '张店长' },
  { staff_id: 's-5', name: '陈店长' },
]);

// 【新增·课程业务】讲师列表（课程域讲师库）
const lecturers = ref([
  { id: 'lec-1', name: '张三老师' },
  { id: 'lec-2', name: '李四老师' },
  { id: 'lec-3', name: '王五老师' },
]);

const form = ref<StoreForm>(getEmptyForm());

function getEmptyForm(): StoreForm {
  return {
    store_id: '', store_no: '', store_name: '', group_id: '', manager_id: '', main_lecturer_id: '',
    status: '未启用', qualification_status: '待提交',
    shipping_address: { contact_person: '', contact_phone: '', address: '' },
    after_sale_address: { contact_person: '', contact_phone: '', address: '' },
    qualification_info: '', create_time: '', update_time: '', disable_time: '', enable_time: '',
  };
}

watch(
  () => props.visible,
  (v) => {
    if (v) {
      if (props.mode === 'edit' && props.store) {
        form.value = { ...props.store, shipping_address: { ...props.store.shipping_address }, after_sale_address: { ...props.store.after_sale_address } };
      } else {
        form.value = getEmptyForm();
      }
    }
  },
);

function onSave() {
  if (!form.value.store_name.trim()) {
    ElMessage.warning('请输入门店名称');
    return;
  }
  emit('save', { ...form.value });
}
</script>

<style scoped>
.store-form .el-form-item {
  margin-bottom: 18px;
}

/* 新增字段样式 */
.field-new {
  width: 100%;
}
.new-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}
.new-tag {
  font-size: 11px;
  background: #fef0f0;
  border: 1px solid #fbc4c4;
  border-radius: 3px;
  padding: 1px 6px;
}
.new-hint {
  font-size: 12px;
  margin-top: 4px;
}
</style>
