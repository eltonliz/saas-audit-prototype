<template>
  <!-- PG-AUDIT-PC-003：回放详情审查页 /tenant/live/:streamId/replay
       v2.0.0 手动拼接模式：片段/文件均独立审核，全部审核通过后方可拼接 -->
  <div class="replay-detail-page">
    <div class="replay-layout">
      <!-- 左侧：回放播放器区域 -->
      <div class="replay-player-section">
        <div class="player-header">
          <span class="stream-label">回放 - {{ streamId }}</span>
          <span class="playing-file-tag" :class="playingFileClass">{{ playingFileLabel }}</span>
          <span class="merge-progress" v-if="mergeStatus === 'merging'">拼接中...</span>
        </div>

        <div class="player-placeholder" @click="clearSelection">
          <div class="player-icon">▶</div>
          <div class="player-hint">{{ playHint }}</div>
          <el-progress v-if="mergeStatus === 'merging'" :percentage="mergeProgress" class="mute-progressbar" :stroke-width="6" />
          <div class="player-timeline">
            <div
              v-for="v in violations"
              :key="v.violation_id"
              :class="['marker', levelClass(v.violation_level), { active: selectedId === v.violation_id }]"
              :style="{ left: `${getTimelinePercent(v.violation_time)}%` }"
              @click.stop="jumpToViolation(v)"
              :title="`${v.violation_time} - ${typeLabel(v.violation_type)}`"
            />
          </div>
          <div class="player-time">{{ currentTime }} / {{ totalDuration }}</div>
        </div>

        <div v-if="hasViolations" class="player-actions">
          <el-button type="primary" size="small" @click="showCompare = !showCompare">
            查看擦音前后对比
          </el-button>
        </div>

        <div v-if="hasViolations && showCompare" class="compare-panel">
          <div class="compare-title">擦音前后对比</div>
          <div class="compare-columns">
            <div class="compare-col before">
              <div class="compare-label">擦音前</div>
              <div class="compare-text">"欢迎大家进入直播间，今天我们带来一款xxx产品..."</div>
            </div>
            <div class="compare-col after">
              <div class="compare-label">擦音后</div>
              <div class="compare-text">"欢迎大家进入直播间，今天我们带来***产品..."</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：审查面板 -->
      <div class="replay-audit-section">
        <!-- 拼接完成后：顶部展示「返回静态原版」按钮，可切换查看片段/文件；已发布场景不显示 -->
        <div v-if="mergedFile && !isPublishedView" class="info-block static-toggle-bar">
          <div class="static-toggle-text">
            <span class="static-toggle-icon">✓</span>
            已完成拼接，仅展示拼接后文件；如需查看片段/文件请
            <el-button link type="primary" size="small" @click="showStatic = !showStatic">
              {{ showStatic ? '收起静态原版' : '展开静态原版' }}
            </el-button>
          </div>
        </div>

        <!-- 已发布查看模式顶部提示 -->
        <div v-if="isPublishedView" class="info-block published-banner">
          <div class="published-banner-text">
            <span class="published-banner-icon">✓</span>
            <span>
              回放已发布，仅展示完整回放文件{{ hasViolations ? '（擦音后 + 源码）' : '' }}；
              <span class="published-banner-meta">
                发布人 {{ mergedFileReviewer }} · 发布时间 {{ mergedFileReviewedAt }}
              </span>
            </span>
          </div>
        </div>

        <!-- 回放片段列表（手动拼接 v2.0.0；拼接完成后默认隐藏；已发布场景不显示） -->
        <div v-if="(!mergedFile || showStatic) && !isPublishedView" class="info-block">
          <div class="block-title">
            <span>回放片段（{{ segments.length }} 段）</span>
            <el-tag size="small" :type="segmentTagType">{{ segmentTagText }}</el-tag>
          </div>
          <div class="segment-list">
            <label
              v-for="seg in segments"
              :key="seg.segment_id"
              :class="['segment-row', { selectable: seg.review_status === 'approved' && segments.length > 1 }]"
            >
              <el-checkbox
                v-if="segments.length > 1"
                :model-value="selectedSegmentIds.has(seg.segment_id)"
                :disabled="seg.review_status !== 'approved'"
                @change="(v: string | number | boolean) => toggleSegment(seg.segment_id, v === true)"
              />
              <span v-else class="seg-index-fixed">#{{ seg.segment_index }}</span>
              <span class="seg-index">#{{ seg.segment_index }}</span>
              <span class="seg-time">{{ seg.start_time }} ~ {{ seg.end_time }}</span>
              <span class="seg-duration">({{ seg.duration }})</span>
              <span class="seg-reason">{{ seg.break_reason }}</span>
              <el-tag
                v-if="seg.review_status === 'pending_review'"
                size="small"
                type="warning"
                class="seg-review-tag"
              >待审核</el-tag>
              <el-tag
                v-else-if="seg.review_status === 'approved'"
                size="small"
                type="success"
                class="seg-review-tag"
              >已审核</el-tag>
            </label>
          </div>
          <div v-if="segments.length > 1" class="segment-tip">
            ⓘ 仅「已审核」片段可勾选参与拼接，序号需与回放文件一一对应
          </div>
        </div>

        <!-- 回放文件列表（多文件·手动拼接 v2.0.0；拼接完成后默认隐藏；已发布场景不显示） -->
        <div v-if="(!mergedFile || showStatic) && !isPublishedView" class="info-block">
          <div class="block-title">
            <span>回放文件（{{ files.length }} 个）</span>
            <el-tag size="small" :type="fileReviewSummary.type">
              已审核 {{ fileReviewSummary.approved }}/{{ files.length }}
            </el-tag>
          </div>
          <div class="file-list">
            <div
              v-for="f in files"
              :key="f.file_id"
              :class="['file-card', { active: playingFileId === f.file_id, selected: selectedFileIds.has(f.file_id) }]"
              @click.self="playFile(f.file_id)"
            >
              <div class="file-card-header">
                <el-checkbox
                  v-if="files.length > 1"
                  :model-value="selectedFileIds.has(f.file_id)"
                  :disabled="f.review_status !== 'approved'"
                  @change="(v: string | number | boolean) => toggleFile(f.file_id, v === true)"
                  @click.stop
                />
                <span class="file-index">#{{ f.file_index }}</span>
                <span class="file-name">{{ f.fileName }}</span>
                <el-tag
                  v-if="f.review_status === 'pending_review'"
                  size="small"
                  type="warning"
                >待审核</el-tag>
                <el-tag
                  v-else-if="f.review_status === 'approved'"
                  size="small"
                  type="success"
                >已审核</el-tag>
              </div>
              <div class="file-card-meta">
                <span>{{ f.duration }}</span>
                <span class="dot-sep">·</span>
                <span>{{ f.size }}（擦音后）/ {{ f.sourceSize }}（源码）</span>
                <span class="dot-sep">·</span>
                <span>对应片段 #{{ f.file_index }}</span>
              </div>
              <div class="file-card-actions">
                <el-button
                  v-if="f.review_status === 'pending_review'"
                  type="primary"
                  size="small"
                  @click.stop="approveFile(f.file_id)"
                >审核通过</el-button>
                <el-button
                  v-else
                  size="small"
                  disabled
                >{{ f.reviewer }} · {{ f.reviewed_at }}</el-button>
                <el-button size="small" @click.stop="playFile(f.file_id)">播放此文件</el-button>
              </div>
            </div>
          </div>
          <div v-if="files.length > 1" class="file-tip">
            ⓘ 单击文件卡片 = 播放该文件；勾选 checkbox = 多选查看/参与拼接；序号必须与片段一一对应
          </div>
        </div>

        <!-- 拼接区 / 已发布查看：手动拼接·v2.0.0 -->
        <div class="info-block merge-block">
          <div class="block-title">
            <span>{{ isPublishedView ? '完整回放文件' : '拼接操作' }}</span>
            <el-tag v-if="!isPublishedView" size="small" :type="mergeStatusTagType">{{ mergeStatusText }}</el-tag>
            <el-tag v-else size="small" type="success">已发布</el-tag>
          </div>
          <div v-if="!mergedFile && !isPublishedView" class="merge-content">
            <div class="merge-hint">
              <p>{{ mergeHint }}</p>
              <ul v-if="files.length > 1" class="merge-rules">
                <li :class="{ ok: allFilesApproved }">
                  所有回放文件审核通过 <strong>{{ fileReviewSummary.approved }}/{{ files.length }}</strong>
                </li>
                <li :class="{ ok: pairsValid }">
                  勾选的片段与文件按序号一一对应（已选 {{ selectedSegmentIds.size }} 片段 / {{ selectedFileIds.size }} 文件）
                </li>
              </ul>
              <p v-else class="merge-rules-single">
                仅 1 个回放文件，无需拼接即作为完整回放发布
              </p>
            </div>
            <el-button
              type="primary"
              :disabled="!canMerge"
              @click="doMerge"
            >
              {{ mergeStatus === 'merging' ? '拼接中...' : '拼接' }}
            </el-button>
          </div>
          <div v-else class="merge-result">
            <div class="merge-result-title">已生成完整回放文件</div>
            <div class="file-row">
              <div
                :class="['file-item source clickable', { active: playingFileId === 'merged_source' }]"
                @click="playMergedFile('merged_source')"
              >
                <div class="file-label">源码文件（完整 · 只读）</div>
                <div class="file-name">{{ mergedFile.sourceFileName }}</div>
                <div class="file-meta">{{ mergedFile.sourceSize }} · {{ mergedFile.duration }} · 点击播放</div>
                <el-tag size="small" type="warning">只读</el-tag>
              </div>
            </div>
            <!-- 有违规时展示擦音后回放文件；无违规时无擦音，源码文件即对外发布版 -->
            <div v-if="hasViolations" class="file-row">
              <div
                :class="['file-item clickable', { active: playingFileId === 'merged_replay' }]"
                @click="playMergedFile('merged_replay')"
              >
                <div class="file-label">回放文件（完整 · 已擦音 · 对外发布版）</div>
                <div class="file-name">{{ mergedFile.fileName }}</div>
                <div class="file-meta">{{ mergedFile.size }} · {{ mergedFile.duration }} · 点击播放</div>
                <el-tag size="small" :type="publishStatus === 'published' ? 'success' : 'info'">
                  {{ publishStatus === 'published' ? '已发布' : '待发布' }}
                </el-tag>
              </div>
            </div>
            <div v-else class="file-row">
              <div
                :class="['file-item clickable', { active: playingFileId === 'merged_source' }]"
                @click="playMergedFile('merged_source')"
              >
                <div class="file-label">回放文件（完整 · 对外发布版）</div>
                <div class="file-name">{{ mergedFile.sourceFileName }}</div>
                <div class="file-meta">{{ mergedFile.sourceSize }} · {{ mergedFile.duration }} · 点击播放</div>
                <el-tag size="small" :type="publishStatus === 'published' ? 'success' : 'info'">
                  {{ publishStatus === 'published' ? '已发布' : '待发布' }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>

        <!-- 本场次违规统计（无违规时隐藏） -->
        <div v-if="hasViolations" class="info-block">
          <div class="block-title">本场次违规统计</div>
          <div class="stats-row">
            <span class="stat l1">L1 高危 ×{{ levelCount('L1') }}</span>
            <span class="stat l2">L2 中危 ×{{ levelCount('L2') }}</span>
            <span class="stat l3">L3 低危 ×{{ levelCount('L3') }}</span>
          </div>
        </div>

        <!-- 场次信息 -->
        <div class="info-block">
          <div class="block-title">场次信息</div>
          <div class="field-row">推流ID：{{ streamId }}</div>
          <div class="field-row">开始时间：{{ info.startTime }}</div>
          <div class="field-row">结束时间：{{ info.endTime }}</div>
          <div class="field-row">峰值观看：{{ info.peakViewers }}</div>
        </div>

        <!-- 人工审核（v2.0.0：发布按钮，前置条件=所有回放文件已审核通过 + 拼接完成）
             已发布场景下隐藏（合并到上方「完整回放文件」块的已发布 tag） -->
        <div v-if="!isPublishedView" class="info-block">
          <div class="block-title">
            人工审核
            <el-tag size="small" :type="reviewTagType">{{ reviewLabel }}</el-tag>
          </div>
          <div class="field-row muted">{{ reviewHint }}</div>
          <div v-if="canPublish" class="review-actions">
            <el-button type="success" size="small" @click="publish">发布</el-button>
          </div>
        </div>

        <!-- 擦音模式（无违规时隐藏） -->
        <div v-if="hasViolations" class="mute-mode-section">
          <label class="section-label">擦音模式</label>
          <label
            v-for="opt in muteOptions"
            :key="opt.value"
            :class="['mode-radio', { active: muteMode === opt.value }]"
          >
            <input type="radio" :value="opt.value" v-model="muteMode" />
            <span>{{ opt.label }}</span>
          </label>
        </div>

        <!-- 违规记录（无违规时隐藏） -->
        <div v-if="hasViolations" class="replay-vio-list">
          <div class="section-label">违规记录（{{ violations.length }}）· 点击进度条标记可跳转复审</div>
          <div
            v-for="v in violations"
            :key="v.violation_id"
            :class="['replay-vio-row', { selected: selectedId === v.violation_id }]"
            @click="jumpToViolation(v)"
          >
            <div :class="['color-dot', levelClass(v.violation_level)]" />
            <div class="vio-content">
              <span class="vio-time">{{ formatTime(v.violation_time) }}</span>
              <span class="vio-type">{{ typeLabel(v.violation_type) }}</span>
              <span class="vio-snippet">{{ truncate(v.violation_content, 30) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ViolationDetailPanel
      :visible="detailVisible"
      :violation="selectedViolation || null"
      @close="detailVisible = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, reactive } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useAuditStore } from '../../stores/audit-store';
import ViolationDetailPanel from '../../components/audit/tenant/ViolationDetailPanel.vue';
import { REPLAY_FILES, REPLAY_INFO, REPLAY_MERGED_FILE, REPLAY_SEGMENTS } from '../../adapters/sim/sim-fixtures';
import { REPLAY_DEMO_VIOLATIONS } from '../../handoff/modals-audit/audit-demo-fixture';
import { typeLabel } from '../../contracts/audit-level-config';
import type { MuteMode } from '../../contracts';

const route = useRoute();
const store = useAuditStore();

const streamId = computed(() => (route.params.streamId as string) || 'PLS000140');
const muteMode = ref<MuteMode>('beep');
const showCompare = ref(false);

const segments = reactive([...REPLAY_SEGMENTS] as typeof REPLAY_SEGMENTS[number][] extends infer T ? any : never);
const files = reactive([...REPLAY_FILES] as any);

const info = REPLAY_INFO;

const muteOptions = [
  { label: '静音', value: 'silent' },
  { label: '擦音（滴滴声）', value: 'beep' },
];

const violations = computed(() => {
  // PLS000131「周末娱乐专场」为无违规演示场次：返回空数组，触发 hasViolations=false 分支
  // 其他场次（如 PLS000140）使用 REPLAY_DEMO_VIOLATIONS 演示有违规场景
  if (streamId.value === 'PLS000131') return [];
  return REPLAY_DEMO_VIOLATIONS;
});

/** 本场次是否有违规（无违规时隐藏擦音模式/擦音对比/违规统计/违规列表，拼接后直接发布） */
const hasViolations = computed(() => violations.value.length > 0);

function levelCount(level: string) {
  return violations.value.filter((v) => v.violation_level === level).length;
}

// ============================================
// 手动拼接状态（v2.0.0）
// ============================================

/** 选中的片段 ID 集合 */
const selectedSegmentIds = ref(new Set<string>());
/** 选中的回放文件 ID 集合 */
const selectedFileIds = ref(new Set<string>());
/** 当前播放的回放文件 ID（含 merged_source/merged_replay） */
const playingFileId = ref<string>('FILE-001');
/** 拼接状态：null=未拼接, merging=拼接中, completed=已完成 */
type MergeStatus = null | 'merging' | 'completed';
const mergeStatus = ref<MergeStatus>(null);
/** 拼接进度 0-100 */
const mergeProgress = ref(0);
/** 拼接生成的完整回放文件 */
const mergedFile = ref<typeof REPLAY_MERGED_FILE>(REPLAY_MERGED_FILE);
/** 拼接完成后，是否展开「静态原版」（片段+多文件列表） */
const showStatic = ref(false);
/** 发布状态 */
type PublishStatus = 'pending' | 'published';
const publishStatus = ref<PublishStatus>('pending');

/** 已发布查看模式：仅展示擦音+源码两块文件，不显示拼接/审核/checkbox */
const isPublishedView = computed(() => publishStatus.value === 'published');
/** 完整文件发布元信息（用于已发布顶部条） */
const mergedFileReviewer = ref('李运营');
const mergedFileReviewedAt = ref(new Date().toISOString().slice(0, 19).replace('T', ' '));

/** 每个片段/文件的审核操作人（演示用） */
const REVIEWER_NAME = '李运营';

function approveFile(fileId: string) {
  const f = files.find((x: any) => x.file_id === fileId);
  if (!f) return;
  f.review_status = 'approved';
  f.reviewer = REVIEWER_NAME;
  f.reviewed_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
  // 联动：按 file_index ↔ segment_index 对应，同步对应片段的审核状态
  const seg = segments.find((s: any) => s.segment_index === f.file_index);
  if (seg && seg.review_status !== 'approved') {
    seg.review_status = 'approved';
    seg.reviewer = REVIEWER_NAME;
    seg.reviewed_at = f.reviewed_at;
  }
  ElMessage.success(`已审核通过「#${f.file_index}」回放文件`);
}

function approveSegment(segId: string) {
  const s = segments.find((x: any) => x.segment_id === segId);
  if (!s) return;
  s.review_status = 'approved';
  s.reviewer = REVIEWER_NAME;
  s.reviewed_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
}

function toggleSegment(segId: string, checked: boolean) {
  const next = new Set(selectedSegmentIds.value);
  if (checked) next.add(segId); else next.delete(segId);
  selectedSegmentIds.value = next;
}

function toggleFile(fileId: string, checked: boolean) {
  const next = new Set(selectedFileIds.value);
  if (checked) next.add(fileId); else next.delete(fileId);
  selectedFileIds.value = next;
}

function playFile(fileId: string) {
  playingFileId.value = fileId;
  selectedId.value = undefined;
  currentTime.value = '00:00:00';
}

function playMergedFile(kind: 'merged_source' | 'merged_replay') {
  playingFileId.value = kind;
  selectedId.value = undefined;
  currentTime.value = '00:00:00';
}

// ============================================
// 拼接规则校验（v2.0.0）
// ============================================

const fileReviewSummary = computed(() => {
  const approved = files.filter((f: any) => f.review_status === 'approved').length;
  const type: 'warning' | 'success' | 'danger' = approved === files.length ? 'success' : approved === 0 ? 'danger' : 'warning';
  return { approved, type };
});

const allFilesApproved = computed(() => files.every((f: any) => f.review_status === 'approved'));

/** 一一对应校验：勾选的片段序号集合 == 勾选的文件序号集合 */
const pairsValid = computed(() => {
  if (selectedSegmentIds.value.size !== selectedFileIds.value.size) return false;
  if (selectedSegmentIds.value.size === 0) return false;
  const segIdx = new Set(
    [...selectedSegmentIds.value].map((id) => segments.find((s: any) => s.segment_id === id)?.segment_index).filter(Boolean),
  );
  const fileIdx = new Set(
    [...selectedFileIds.value].map((id) => files.find((f: any) => f.file_id === id)?.file_index).filter(Boolean),
  );
  if (segIdx.size !== fileIdx.size) return false;
  for (const i of segIdx) if (!fileIdx.has(i)) return false;
  return true;
});

const canMerge = computed(() => {
  if (mergeStatus.value === 'merging') return false;
  if (!allFilesApproved.value) return false;
  if (files.length === 1) return true; // 单文件无需拼接
  return pairsValid.value;
});

const mergeHint = computed(() => {
  if (mergeStatus.value === 'merging') return '正在拼接，请稍候...';
  if (!allFilesApproved.value) return '需先将所有回放文件「审核通过」后才能拼接';
  if (files.length === 1) return '当前仅 1 个回放文件，无需拼接即可作为完整回放使用';
  if (!pairsValid.value) return '请勾选序号一一对应的片段与文件（数量相同、序号相同）';
  return '勾选已就绪，可执行拼接';
});

function doMerge() {
  if (!canMerge.value) return;
  mergeStatus.value = 'merging';
  mergeProgress.value = 0;
  ElMessage.info('开始拼接...');
  const timer = setInterval(() => {
    mergeProgress.value += 12;
    if (mergeProgress.value >= 100) {
      clearInterval(timer);
      mergeStatus.value = 'completed';
      // 生成完整回放文件（演示态：拼接两个文件按序号合并 = 1:24:00）
      mergedFile.value = {
        fileName: `replay_${streamId.value}_merged_20260722.mp4`,
        sourceFileName: `source_${streamId.value}_merged_20260722.mp4`,
        duration: totalDuration.value,
        size: '1.08 GB',
        sourceSize: '3.24 GB',
        generatedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
      };
      ElMessage.success('拼接完成，已生成完整回放文件');
    }
  }, 250);
}

function publish() {
  if (!canPublish.value) return;
  publishStatus.value = 'published';
  mergedFileReviewer.value = REVIEWER_NAME;
  mergedFileReviewedAt.value = new Date().toISOString().slice(0, 19).replace('T', ' ');
  ElMessage.success('回放已发布');
}

// ============================================
// 拼接状态展示
// ============================================

const mergeStatusTagType = computed<'info' | 'warning' | 'success'>(() => {
  if (mergeStatus.value === 'merging') return 'warning';
  if (mergeStatus.value === 'completed') return 'success';
  return 'info';
});

const mergeStatusText = computed(() => {
  if (mergeStatus.value === 'merging') return '拼接中';
  if (mergeStatus.value === 'completed') return '已拼接';
  return '未拼接';
});

const segmentTagText = computed(() => {
  if (files.length === 1) return '单片段';
  const reviewed = segments.filter((s: any) => s.review_status === 'approved').length;
  if (reviewed === segments.length) return '全部已审核';
  return `已审核 ${reviewed}/${segments.length}`;
});

const segmentTagType = computed<'info' | 'warning' | 'success'>(() => {
  if (files.length === 1) return 'info';
  const reviewed = segments.filter((s: any) => s.review_status === 'approved').length;
  if (reviewed === segments.length) return 'success';
  return 'warning';
});

// ============================================
// 播放器 / 播放文件显示
// ============================================

const playingFileClass = computed(() => {
  if (playingFileId.value === 'merged_source') return 'source';
  if (playingFileId.value === 'merged_replay') return 'replay';
  const f = files.find((x: any) => x.file_id === playingFileId.value);
  return f ? 'replay' : 'replay';
});

const playingFileLabel = computed(() => {
  if (playingFileId.value === 'merged_source') return '▶ 播放完整源码';
  if (playingFileId.value === 'merged_replay') return '▶ 播放完整回放';
  const f = files.find((x: any) => x.file_id === playingFileId.value);
  return f ? `▶ 播放 #${f.file_index} 回放文件` : '';
});

const playHint = computed(() => {
  if (mergeStatus.value === 'merging') return '正在拼接完整回放...';
  if (playingFileId.value === 'merged_source') return '正在播放完整源码文件（未擦音）';
  if (playingFileId.value === 'merged_replay') return '正在播放完整回放文件（已擦音）';
  const f = files.find((x: any) => x.file_id === playingFileId.value);
  if (f) return `正在播放 #${f.file_index} 回放文件（${f.review_status === 'approved' ? '已审核' : '待审核'}）`;
  return '';
});

const totalDuration = computed(() => {
  // 演示用：按选中片段累加时长，或回放文件累加
  if (mergedFile.value) return mergedFile.value.duration;
  const f = files.find((x: any) => x.file_id === playingFileId.value);
  if (f) return f.duration;
  return '00:00:00';
});

// ============================================
// 人工审核（v2.0.0：发布按钮）
// ============================================

const canPublish = computed(() => {
  return allFilesApproved.value && mergeStatus.value === 'completed' && publishStatus.value === 'pending';
});

const reviewLabel = computed(() => {
  if (publishStatus.value === 'published') return '已发布';
  if (mergeStatus.value === 'completed' && allFilesApproved.value) return '待发布';
  if (!allFilesApproved.value) return '回放文件未全部审核';
  return '未拼接';
});

const reviewTagType = computed(() => {
  if (publishStatus.value === 'published') return 'success';
  if (canPublish.value) return 'warning';
  return 'info';
});

const reviewHint = computed(() => {
  if (publishStatus.value === 'published') return '回放已发布对用户可见';
  if (!allFilesApproved.value) return '需先将所有回放文件「审核通过」';
  if (mergeStatus.value !== 'completed') return '需先完成拼接生成完整回放文件';
  return '所有文件已审核、拼接已完成，可发布';
});

// ============================================
// 违规标记 / 播放器时间
// ============================================

const currentTime = ref('00:00:00');
const selectedId = ref<string>();
const detailVisible = ref(false);
const selectedViolation = computed(() => {
  if (!selectedId.value) return null;
  return violations.value.find((v) => v.violation_id === selectedId.value) || null;
});

function jumpToViolation(v: (typeof violations.value)[number]) {
  selectedId.value = v.violation_id;
  currentTime.value = formatTime(v.violation_time);
  detailVisible.value = true;
}
function clearSelection() {
  selectedId.value = undefined;
}

function levelClass(level: string) {
  const m: Record<string, string> = { L1: 'l1', L2: 'l2', L3: 'l3' };
  return m[level] || 'l3';
}

function formatTime(ts: string) {
  return new Date(ts).toLocaleTimeString('zh-CN', { hour12: false }).slice(0, 8);
}

function truncate(text: string, max: number) {
  if (!text) return '—';
  return text.length > max ? text.slice(0, max) + '...' : text;
}

function getTimelinePercent(ts: string) {
  const start = new Date('2026-07-22T14:00:00').getTime();
  const end = new Date('2026-07-22T15:30:00').getTime();
  const t = new Date(ts).getTime();
  return Math.max(0, Math.min(100, ((t - start) / (end - start)) * 100));
}

onMounted(() => {
  store.setFieldStatus('replaying');
  applyRouteStatus();
});

/** 根据 URL query 初始化回放状态（已发布/已驳回/默认） */
function applyRouteStatus() {
  const status = (route.query.status as string) || '';
  // 先重置
  publishStatus.value = 'pending';
  mergeStatus.value = null;
  mergedFile.value = REPLAY_MERGED_FILE;
  showStatic.value = false;
  // 单文件场景：自动选中全部（无 checkbox）
  selectedFileIds.value = files.length === 1 ? new Set([files[0].file_id]) : new Set();
  selectedSegmentIds.value = new Set();

  if (status === '已发布') {
    publishStatus.value = 'published';
    mergeStatus.value = 'completed';
    mergedFile.value = {
      fileName: `replay_${streamId.value}_merged_20260722.mp4`,
      sourceFileName: `source_${streamId.value}_merged_20260722.mp4`,
      duration: '01:24:00',
      size: '1.08 GB',
      sourceSize: '3.24 GB',
      generatedAt: '2026-07-22 16:05:12',
    };
    mergedFileReviewer.value = '王运营';
    mergedFileReviewedAt.value = '2026-07-22 16:08:45';
  } else if (status === '已驳回') {
    // 已驳回：拼接已完成但发布被驳回，运营可重新提交
    mergeStatus.value = 'completed';
    mergedFile.value = {
      fileName: `replay_${streamId.value}_merged_20260722.mp4`,
      sourceFileName: `source_${streamId.value}_merged_20260722.mp4`,
      duration: '01:24:00',
      size: '1.08 GB',
      sourceSize: '3.24 GB',
      generatedAt: '2026-07-22 16:05:12',
    };
    mergedFileReviewer.value = '王运营';
    mergedFileReviewedAt.value = '2026-07-22 16:08:45';
  }
  // status=待核对/默认 → 重置后由运营走完整流程
}

/** hash 路由切换 streamId/query 时重新初始化（onMounted 只跑一次） */
watch(
  () => `${route.params.streamId}?${route.query.status || ''}`,
  () => applyRouteStatus(),
);
</script>

<style scoped>
.replay-detail-page {
  height: 100vh;
  background: var(--color-bg, #F5F5F5);
  overflow: hidden;
}
.replay-layout {
  display: flex;
  height: 100%;
}
/* 左侧播放器区 */
.replay-player-section {
  flex: 1.5;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: #000;
  border-right: 2px solid var(--color-border, #D9D9D9);
}
.player-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background: #1A1A1A;
}
.stream-label { color: #fff; font-size: 14px; }
.merge-progress { color: var(--color-warning, #FA8C16); font-size: 12px; }
.playing-file-tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  margin-left: 8px;
}
.playing-file-tag.source { color: #FA8C16; background: rgba(250,140,22,0.15); border: 1px solid #FA8C16; }
.playing-file-tag.replay { color: #52C41A; background: rgba(82,196,26,0.15); border: 1px solid #52C41A; }
.player-placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 0 24px;
}
.player-icon { font-size: 64px; opacity: 0.4; }
.player-hint { color: rgba(255,255,255,0.5); margin: 8px 0 12px; font-size: 13px; }
.mute-progressbar { width: 320px; }
.mute-progressbar :deep(.el-progress__text) { color: #fff; }
.player-timeline {
  position: absolute;
  bottom: 40px;
  left: 24px;
  right: 24px;
  height: 12px;
  background: rgba(255,255,255,0.1);
  border-radius: 6px;
}
.marker {
  position: absolute;
  top: -4px;
  width: 10px;
  height: 20px;
  border-radius: 3px;
  cursor: pointer;
  transform: translateX(-5px);
  transition: transform 0.15s, box-shadow 0.15s;
}
.marker:hover, .marker.active { transform: translateX(-5px) scale(1.3); box-shadow: 0 0 8px rgba(255,255,255,0.4); }
.marker.l1 { background: var(--color-danger, #F5222D); }
.marker.l2 { background: var(--color-warning, #FA8C16); }
.marker.l3 { background: var(--color-info, #1890FF); }
.player-time {
  position: absolute;
  bottom: 12px;
  color: rgba(255,255,255,0.5);
  font-size: 12px;
}
.player-actions {
  display: flex;
  gap: 8px;
  padding: 10px 16px;
  background: #1A1A1A;
  border-top: 1px solid #333;
}
.compare-panel {
  background: #1A1A1A;
  padding: 12px 16px;
  border-top: 1px solid #333;
}
.compare-title { color: #fff; font-size: 13px; margin-bottom: 8px; }
.compare-columns { display: flex; gap: 12px; }
.compare-col { flex: 1; }
.compare-label { font-size: 11px; color: var(--color-text-secondary, #8C8C8C); margin-bottom: 4px; }
.compare-text { font-size: 12px; color: rgba(255,255,255,0.7); line-height: 1.5; }
.compare-col.before .compare-text { color: var(--color-danger, #F5222D); }
.compare-col.after .compare-text { color: var(--color-success, #52C41A); }
/* 右侧审查面板 */
.replay-audit-section {
  flex: 1;
  min-width: 360px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  background: #fff;
}
.info-block, .mute-mode-section {
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border, #D9D9D9);
}
.block-title { font-size: 14px; font-weight: 500; margin-bottom: 6px; display: flex; align-items: center; gap: 8px; }
.field-row { font-size: 12px; color: var(--color-text-secondary, #8C8C8C); margin-bottom: 2px; }
.field-row.muted { color: var(--color-warning, #FA8C16); }

/* 片段列表 */
.segment-list { display: flex; flex-direction: column; gap: 4px; }
.segment-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #606266;
  padding: 4px 0;
}
.segment-row.selectable { cursor: pointer; }
.seg-index { color: var(--color-primary, #1890FF); font-weight: 600; min-width: 36px; }
.seg-index-fixed { color: var(--color-primary, #1890FF); font-weight: 600; min-width: 36px; }
.seg-time { font-family: monospace; }
.seg-duration { color: #909399; }
.seg-reason { color: var(--color-warning, #FA8C16); margin-left: auto; }
.seg-review-tag { margin-left: 4px; }
/* 拼接完成后顶部提示条 */
.static-toggle-bar {
  background: #f6ffed;
  border-bottom: 1px solid #b7eb8f;
}
.static-toggle-text {
  font-size: 12px;
  color: var(--color-text-secondary, #8C8C8C);
  display: flex;
  align-items: center;
  gap: 6px;
}
.static-toggle-icon {
  color: var(--color-success, #52C41A);
  font-weight: 600;
}
/* 已发布查看模式顶部提示条 */
.published-banner {
  background: #e6f7ff;
  border-bottom: 1px solid #91d5ff;
}
.published-banner-text {
  font-size: 12px;
  color: var(--color-text-secondary, #8C8C8C);
  display: flex;
  align-items: center;
  gap: 6px;
}
.published-banner-icon {
  color: var(--color-success, #52C41A);
  font-weight: 600;
  font-size: 14px;
}
.published-banner-meta {
  margin-left: 6px;
  color: #909399;
}
.segment-tip {
  margin-top: 6px;
  font-size: 11px;
  color: var(--color-text-secondary, #8C8C8C);
}

/* 文件卡片 */
.file-list { display: flex; flex-direction: column; gap: 6px; }
.file-card {
  border: 1px solid var(--color-border, #f0f0f0);
  border-radius: 6px;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s;
}
.file-card:hover { border-color: var(--color-primary, #1890FF); background: #f0faf5; }
.file-card.active {
  border-color: var(--color-primary, #1890FF);
  background: var(--color-primary-bg, #e7f8f0);
  box-shadow: 0 0 0 2px rgba(18,183,106,0.15);
}
.file-card.selected {
  border-color: var(--color-warning, #FA8C16);
  background: #fff7e6;
}
.file-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}
.file-index {
  color: var(--color-primary, #1890FF);
  font-weight: 600;
  min-width: 28px;
}
.file-name {
  font-family: monospace;
  font-size: 12px;
  color: #303133;
  flex: 1;
  word-break: break-all;
}
.file-card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  font-size: 11px;
  color: var(--color-text-secondary, #8C8C8C);
  padding-left: 36px;
}
.file-card-meta .dot-sep { color: #d9d9d9; }
.file-card-actions {
  display: flex;
  gap: 8px;
  padding-left: 36px;
}
.file-tip {
  margin-top: 6px;
  font-size: 11px;
  color: var(--color-text-secondary, #8C8C8C);
}

/* 拼接区 */
.merge-block { background: #fafafa; }
.merge-content { display: flex; flex-direction: column; gap: 12px; }
.merge-hint p { margin: 4px 0; font-size: 12px; color: var(--color-text-secondary, #8C8C8C); }
.merge-rules { padding-left: 18px; margin: 4px 0; font-size: 12px; }
.merge-rules li { margin: 2px 0; color: var(--color-warning, #FA8C16); }
.merge-rules li.ok { color: var(--color-success, #52C41A); }
.merge-rules li.ok::before { content: '✓ '; }
.merge-rules-single { color: var(--color-success, #52C41A); }
.merge-result-title {
  font-size: 13px;
  color: var(--color-success, #52C41A);
  font-weight: 500;
  margin-bottom: 8px;
}
.file-row { margin-bottom: 6px; }
.file-item { padding: 8px 10px; border: 1px solid var(--color-border, #f0f0f0); border-radius: 6px; display: flex; flex-wrap: wrap; align-items: center; gap: 8px; transition: all 0.2s; }
.file-item.clickable { cursor: pointer; }
.file-item.clickable:hover { border-color: var(--color-primary, #1890FF); background: #f0faf5; }
.file-item.clickable.active { border-color: var(--color-primary, #1890FF); background: var(--color-primary-bg, #e7f8f0); box-shadow: 0 0 0 2px rgba(18,183,106,0.15); }
.file-item.source { background: var(--color-muted, #F5F5F5); }
.file-item.source.clickable.active { background: var(--color-primary-bg, #e7f8f0); }
.readonly-hint { font-weight: normal; }
.file-label { font-size: 12px; font-weight: 600; color: #303133; width: 100%; }
.file-name { font-family: monospace; font-size: 12px; color: #606266; }
.file-meta { font-size: 11px; color: #909399; }

.stats-row { display: flex; flex-wrap: wrap; gap: 8px; }
.stat { font-size: 12px; padding: 2px 10px; border-radius: 4px; }
.stat.l1 { color: #F5222D; background: #FFF1F0; border: 1px solid #FFA39E; }
.stat.l2 { color: #FA8C16; background: #FFF7E6; border: 1px solid #FFD591; }
.stat.l3 { color: #1890FF; background: #E6F7FF; border: 1px solid #91D5FF; }
.review-actions { display: flex; gap: 8px; margin-top: 10px; }
.section-label { font-size: 12px; color: var(--color-text-secondary, #8C8C8C); display: block; margin-bottom: 6px; }
.mode-radio { display: inline-flex; align-items: center; gap: 3px; margin-right: 16px; font-size: 13px; cursor: pointer; }
.mode-radio.active { color: var(--color-primary, #1890FF); }
.replay-vio-list { padding: 8px 0; }
.replay-vio-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  cursor: pointer;
  border-bottom: 1px solid var(--color-border, #D9D9D9);
}
.replay-vio-row:hover { background: var(--color-muted, #F5F5F5); }
.replay-vio-row.selected { background: var(--color-info-bg, #E6F7FF); }
.color-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.color-dot.l1 { background: var(--color-danger, #F5222D); }
.color-dot.l2 { background: var(--color-warning, #FA8C16); }
.color-dot.l3 { background: var(--color-info, #1890FF); }
.vio-content { min-width: 0; }
.vio-time { font-size: 11px; color: var(--color-text-secondary, #8C8C8C); margin-right: 6px; }
.vio-type { font-size: 12px; font-weight: 500; margin-right: 6px; }
.vio-snippet { font-size: 11px; color: var(--color-text-secondary, #8C8C8C); }
</style>