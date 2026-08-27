<template>
  <div class="page">
    <header class="app-header"><span @click="$router.back()" class="back">←</span><span>我的邀请码</span></header>
    <div class="summary">
      <div class="sum-box"><div class="num">{{ myCodes.length }}</div><div class="lbl">邀请码</div></div>
      <div class="sum-box"><div class="num">{{ totalUsed }}</div><div class="lbl">累计使用</div></div>
      <div class="sum-box"><div class="num">{{ totalEnrolled }}</div><div class="lbl">已报名</div></div>
    </div>

    <div class="section-head">
      <span>全部邀请码</span>
      <button class="gen-btn" @click="showGen = true">+ 生成</button>
    </div>

    <div v-for="c in myCodes" :key="c.id" class="code-card">
      <div class="code-main">
        <div class="code-no">{{ c.code }}</div>
        <div class="code-meta">
          <span class="chip" :class="c.code_type">{{ c.code_type === 'qr' ? '扫码' : '口令' }}</span>
          <span>{{ campTitle(c.camp_id) }}</span>
        </div>
        <div class="code-stats">使用 {{ c.used_count }}/{{ c.max_usage === 0 ? '不限' : c.max_usage }} · 报名 {{ c.enrolled_count }} · 至 {{ formatDate(c.expire_at) }}</div>
      </div>
      <button class="share-btn" @click="copyCode(c.code)">分享</button>
    </div>
    <div v-if="myCodes.length === 0" class="empty">暂无邀请码，点上方「+ 生成」创建</div>

    <transition name="sheet">
      <div v-if="showGen" class="sheet-overlay" @click.self="showGen = false">
        <div class="sheet">
          <div class="sheet-title">生成邀请码</div>
          <div class="form-row"><span>营期</span><select v-model="genCampId" class="form-input"><option v-for="c in myCamps" :key="c.id" :value="c.id">{{ c.title }}</option></select></div>
          <div class="form-row"><span>类型</span><t-radio-group v-model="genType"><t-radio value="qr">扫码</t-radio><t-radio value="password">口令</t-radio></t-radio-group></div>
          <div class="form-row"><span>最大次数</span><t-input-number v-model="genMax" :min="1" :max="200" /><span class="unit">次（0 为不限）</span></div>
          <div class="form-row"><span>有效期</span><span class="unit">30 天</span></div>
          <div class="sheet-actions"><button class="sheet-cancel" @click="showGen = false">取消</button><button class="sheet-ok" @click="doGen">生成</button></div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';
import { useCampStore } from '../../../stores/camp-store';

const route = useRoute();
const campStore = useCampStore();
// 角色自适应：讲师/助教共用本页，按路由前缀确定归属人
const isLecturer = route.path.startsWith('/app/lecturer');
const ownerId = isLecturer ? 'LECT-202608-00001' : 'LECT-202608-00003';
const ownerName = isLecturer ? '张三' : '王助教';

const myCamps = computed(() => campStore.campLecturers.filter(l => l.lecturer_id === ownerId && l.is_active).map(l => campStore.loadCamp(l.camp_id)).filter((c: any) => !!c) as any[]);
const myCodes = computed(() => campStore.inviteCodes.filter(c => c.assistant_id === ownerId));
const totalUsed = computed(() => myCodes.value.reduce((s, c) => s + c.used_count, 0));
const totalEnrolled = computed(() => myCodes.value.reduce((s, c) => s + c.enrolled_count, 0));

const showGen = ref(false);
const genCampId = ref(myCamps.value[0]?.id ?? '');
const genType = ref<'qr' | 'password'>('qr');
const genMax = ref(50);

function campTitle(id: string) { return campStore.camps.find(c => c.id === id)?.title || '—'; }
function formatDate(ts: number) { const d = new Date(ts * 1000); return `${d.getMonth() + 1}/${d.getDate()}`; }
function copyCode(code: string) { MessagePlugin.success(`已复制：${code}`); }
function doGen() {
  const campId = genCampId.value || myCamps.value[0]?.id || 'CAMP-202608-00001';
  campStore.createInviteCode({ camp_id: campId, assistant_id: ownerId, assistant_name: ownerName, code_type: genType.value, max_usage: genMax.value } as any);
  MessagePlugin.success('邀请码已生成'); showGen.value = false;
}
</script>

<style scoped>
.page { padding: 16px; padding-bottom: 80px; max-width: 375px; margin: 0 auto; background: #F5F5F5; min-height: 100vh; }
.app-header { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; font-weight: 700; font-size: 17px; }
.back { cursor: pointer; color: #667085; }
.summary { display: flex; gap: 10px; margin-bottom: 14px; }
.sum-box { flex: 1; border-radius: 12px; padding: 14px 0; text-align: center; color: #fff; }
.sum-box:nth-child(1) { background: linear-gradient(135deg, #722ED1, #9254DE); }
.sum-box:nth-child(2) { background: linear-gradient(135deg, #12B76A, #20C997); }
.sum-box:nth-child(3) { background: linear-gradient(135deg, #1890FF, #40A9FF); }
.num { font-size: 22px; font-weight: 700; }
.lbl { font-size: 11px; opacity: 0.9; margin-top: 2px; }
.section-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; font-size: 14px; font-weight: 600; color: #1F2C3E; }
.gen-btn { padding: 5px 14px; background: #12B76A; color: #fff; border: none; border-radius: 14px; font-size: 12px; cursor: pointer; }
.code-card { display: flex; align-items: center; gap: 10px; background: #fff; border-radius: 12px; padding: 13px 14px; margin-bottom: 8px; }
.code-main { flex: 1; min-width: 0; }
.code-no { font-size: 15px; font-weight: 700; color: #1F2C3E; letter-spacing: 0.5px; }
.code-meta { display: flex; align-items: center; gap: 6px; font-size: 11px; color: #98A2B3; margin-top: 3px; }
.chip { padding: 1px 6px; border-radius: 6px; background: #F9FAFB; }
.chip.qr { color: #12B76A; background: #E6F9F1; }
.chip.password { color: #F79009; background: #FEF0E6; }
.code-stats { font-size: 11px; color: #98A2B3; margin-top: 3px; }
.share-btn { padding: 6px 14px; background: #12B76A; color: #fff; border: none; border-radius: 14px; font-size: 12px; cursor: pointer; flex-shrink: 0; }
.empty { text-align: center; color: #98A2B3; padding: 40px 0; font-size: 13px; }
.sheet-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: flex-end; z-index: 200; }
.sheet { background: #fff; border-radius: 16px 16px 0 0; padding: 20px; width: 100%; max-width: 375px; margin: 0 auto; }
.sheet-title { font-size: 16px; font-weight: 600; margin-bottom: 16px; }
.form-row { display: flex; align-items: center; padding: 8px 0; gap: 8px; }
.form-row > span:first-child { width: 70px; font-size: 13px; color: #667085; flex-shrink: 0; }
.form-input { flex: 1; border: 1px solid #EAECF0; border-radius: 8px; padding: 8px; font-size: 14px; }
.unit { font-size: 12px; color: #98A2B3; }
.sheet-actions { display: flex; gap: 12px; margin-top: 16px; }
.sheet-cancel { flex: 1; padding: 12px; background: #F9FAFB; color: #667085; border: none; border-radius: 10px; font-size: 15px; cursor: pointer; }
.sheet-ok { flex: 1; padding: 12px; background: #12B76A; color: #fff; border: none; border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer; }
.sheet-enter-active, .sheet-leave-active { transition: transform 0.3s; }
.sheet-enter-from, .sheet-leave-to { transform: translateY(100%); }
</style>
