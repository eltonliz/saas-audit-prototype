<template>
  <div class="course-manage">
    <!-- 筛选区（卡片化） -->
    <div class="filter-card">
      <div class="filter-bar">
        <div class="filter-item">
          <span class="filter-label">创建时间</span>
          <t-date-range-picker v-model="dateRange" clearable :placeholder="['开始日期', '结束日期']" style="width:260px" />
        </div>
        <div class="filter-item">
          <span class="filter-label">课程名称</span>
          <t-input v-model="search" placeholder="请输入课程名称" clearable style="width:160px" />
        </div>
        <div class="filter-item">
          <span class="filter-label">课程编号</span>
          <t-input v-model="searchNo" placeholder="请输入课程编号" clearable style="width:160px" />
        </div>
        <div class="filter-item">
          <span class="filter-label">分类</span>
          <t-select v-model="catFilter" placeholder="请选择分类" clearable style="width:150px"><t-option v-for="c in categories" :key="c" :label="c" :value="c" /></t-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">授课方式</span>
          <t-select v-model="modeFilter" placeholder="授课方式" clearable style="width:110px"><t-option label="录播" value="recorded" /><t-option label="直播" value="live" /></t-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">课程范围</span>
          <t-select v-model="inCampFilter" placeholder="是否属于营期" clearable style="width:120px"><t-option label="独立课程" value="standalone" /><t-option label="营期课程" value="in_camp" /></t-select>
        </div>
        <div class="filter-actions">
          <t-button theme="primary" @click="doFilter"><template #icon><t-icon name="search" /></template>筛选</t-button>
          <t-button @click="reset"><template #icon><t-icon name="refresh" /></template>重置</t-button>
        </div>
      </div>
      <div class="filter-toolbar">
        <t-button theme="primary" variant="outline" @click="openCreate"><template #icon><t-icon name="add" /></template>新增课程</t-button>
        <t-button :theme="batchMode ? 'danger' : 'default'" variant="outline" @click="batchMode = !batchMode">
          <template #icon><t-icon :name="batchMode ? 'check-circle' : 'check-rectangle'" /></template>
          {{ batchMode ? '取消全选' : '批量全选' }}
        </t-button>
        <span class="toolbar-count" v-if="filtered.length">共 {{ filtered.length }} 门课程</span>
      </div>
    </div>

    <!-- 课程列表（表格卡片） -->
    <div class="table-card">
      <t-table :data="filtered" row-key="id" :columns="columns" bordered @select-change="onSelChange">
        <template #video="{ row }">
          <t-button variant="text" theme="primary" size="small" @click="showVideoDialog(row)"><template #icon><t-icon name="play-circle" /></template>查看视频</t-button>
        </template>
        <template #qb="{ row }"><t-button variant="text" theme="primary" size="small" @click="showQuestionDialog(row)"><template #icon><t-icon name="file" /></template>查看题库</t-button></template>
        <template #created="{ row }">{{ new Date(row.created_at * 1000).toLocaleString() }}</template>
        <template #status="{ row }">
          <t-tag :theme="statusTheme(row.status)" variant="light" size="small">
            <template #icon><t-icon :name="statusIcon(row.status)" /></template>
            {{ statusLabel(row.status) }}
          </t-tag>
        </template>
        <template #op="{ row }">
          <t-button variant="text" size="small" theme="primary" @click="openEditDrawer(row)">编辑</t-button>
          <t-button variant="text" size="small" theme="primary" @click="openStudentDrawer(row)">学员</t-button>
          <t-button v-if="row.status === 'draft' || row.status === 'rejected'" variant="text" size="small" theme="primary" @click="submitForReview(row)">提交审核</t-button>
          <t-button v-if="row.status === 'pending_review'" variant="text" size="small" theme="success" @click="approveCourse(row)">审核通过</t-button>
          <t-button v-if="row.status === 'pending_review'" variant="text" size="small" theme="danger" @click="rejectCourse(row)">驳回</t-button>
          <t-button v-if="row.status === 'draft'" variant="text" size="small" theme="danger" @click="delCourse(row)">删除</t-button>
        </template>
      </t-table>
      <div class="pagination-wrap">
        <t-pagination v-model="page" v-model:pageSize="pageSize" :total="filtered.length" :pageSizeOptions="[10, 20, 30]" show-jumper />
      </div>
    </div>

    <!-- 新增/编辑抽屉 -->
    <t-drawer v-model:visible="drawerVisible" :header="editing ? '编辑课程' : '新增课程'" size="60%" placement="right" :footer="false">
      <div class="drawer-body">
        <t-form :data="form" label-width="120px" label-align="right">
          <!-- 区块1：基本信息 -->
          <div class="section-card">
            <div class="section-header"><t-icon name="user" class="section-icon" /><span>基本信息</span></div>
            <t-form-item label="课程名称" required-mark><t-input v-model="form.title" placeholder="请输入课程名称" maxlength="45" /></t-form-item>
            <t-form-item label="所属分类" required-mark><t-select v-model="form.category_name" placeholder="请选择所属分类" style="width:100%"><t-option v-for="c in categories" :key="c" :label="c" :value="c" /></t-select></t-form-item>
            <t-form-item label="课程介绍"><t-textarea v-model="form.description" :autosize="{ minRows: 3 }" placeholder="请输入课程介绍" /></t-form-item>
            <div class="saas-new-box saas-new-wrap">
              <!-- V2·0901 用户裁决：课程固定为录播组课；直播在「直播列表」独立创建（直播间三联），直播回放可转课程 -->
              <div class="saas-new-badge">V2·0901：课程=录播组课；直播请在「直播列表」创建，直播回放可转课程</div>
            </div>
            <!-- V2·0902 用户裁决：「是否公开」配置下线，课程统一公开（APP 独立展示），数据字段固定 public -->
            <t-form-item label="课程封面">
              <div class="cover-grid">
                <div v-for="cover in coverPresets" :key="cover.url" class="cover-item" :class="{ active: form.cover_url === cover.url }" @click="form.cover_url = cover.url">
                  <img :src="cover.url" :alt="cover.label" />
                  <div v-if="form.cover_url === cover.url" class="cover-check"><t-icon name="check" /></div>
                </div>
                <div class="cover-upload" @click="MessagePlugin.info('上传封面')"><t-icon name="add" class="cover-upload-icon" /><span>上传封面</span></div>
              </div>
            </t-form-item>
          </div>

          <!-- 区块2：内容管理 -->
          <div class="section-card">
            <div class="section-header"><t-icon name="layers" class="section-icon" /><span>内容管理</span></div>
            <div class="content-actions">
                <t-button theme="primary" size="small" @click="openContentPicker('video')"><template #icon><t-icon name="add" /></template>选择视频</t-button>
                <span class="pool-tip">从内容池选择视频组课（V2·0901：课程仅视频素材；直播课时在排课表配置）</span>
              </div>
              <t-table :data="form.videos" row-key="video_no" :columns="videoColumns" bordered size="small" style="margin-top:12px">
                <template #ctype="{ row }"><t-tag :theme="row.ctype === 'audio' ? 'primary' : 'success'" variant="light" size="small">{{ row.ctype === 'audio' ? '音频' : '视频' }}</t-tag></template>
                <template #quiz_header><el-switch v-model="quizAllOn" size="small" @change="toggleQuizAll" /> 是否答题</template>
                <template #quiz="{ row }">
                  <div class="quiz-cell">
                    <t-switch v-model="row.has_quiz" size="small" />
                    <template v-if="row.has_quiz">
                      <t-button variant="text" size="small" theme="primary" @click="viewQuizDetail(row)">查看详情</t-button>
                      <t-button variant="text" size="small" theme="primary" @click="openQuizPicker(row)">更换题目</t-button>
                      <t-button variant="text" size="small" theme="danger" @click="unlinkQuiz(row)">取消关联</t-button>
                    </template>
                  </div>
                </template>
                <template #reward="{ row }">
                  <t-button v-if="!row.reward" variant="text" size="small" theme="primary" @click="openRewardPicker(row)">添加奖励</t-button>
                  <div v-else class="reward-cell" @click="openRewardPicker(row)">
                    <span class="reward-name">{{ row.reward.no }}</span>
                    <span class="reward-meta">¥{{ row.reward.amount }} / {{ row.reward.count }}个 · {{ row.reward.type }}</span>
                  </div>
                </template>
                <template #file="{ row }"><t-button variant="text" size="small" theme="primary" @click="MessagePlugin.info(`共 ${row.files_count ?? 1} 个文件：${row.file_name ?? row.name}`)">查看{{ row.files_count ?? 1 }}文件</t-button></template>
                <template #vop="{ row }"><t-button variant="text" size="small" theme="danger" @click="removeVideo(row)">移除</t-button></template>
              </t-table>
          </div>

          <!-- 区块3：展示设置（V2·0901 用户裁决：仅保留 C端展示，有效期删除） -->
          <div class="section-card saas-new-box" data-saas-no="3">
            <div class="section-header"><t-icon name="cart" class="section-icon" /><span>展示设置</span><ReplicaMarker :no="3" label="编号③ 展示开关" /></div>
            <!-- V2·0901 用户裁决：有效期删除，仅保留 C端展示 -->
            <t-form-item label="C端展示">
              <t-switch v-model="form.show_in_app" />
              <span class="form-tip" style="margin-left:8px">开启后课程在 APP 端课程列表/推荐位展示，关闭则仅通过链接访问</span>
            </t-form-item>
          </div>

          <!-- V2·0829 用户裁决：主讲人字段去除；分成设置区块已移除（本期不做交易） -->

          <!-- D35 红包奖励配置【红框=课程业务新增】V2·0829：仅保留完课奖励（答题奖励在内容管理课时行已有添加奖励入口）；奖励类型现金红包+积分可同选 -->
          <div class="section-card saas-new-box">
            <div class="section-header"><t-icon name="gift" class="section-icon" /><span>完课奖励配置</span><ReplicaMarker :no="7" label="编号⑦ 新增·D35完课奖励" /></div>
            <t-form-item label="完课奖励">
              <t-switch v-model="form.completion_reward_enabled" />
              <span class="form-tip" style="margin-left:8px">学员完成全部课时后自动发放（D35）</span>
            </t-form-item>
            <template v-if="form.completion_reward_enabled">
              <t-form-item label="现金红包">
                <t-switch v-model="form.reward_cash_enabled" />
                <template v-if="form.reward_cash_enabled">
                  <t-input-number v-model="form.reward_amount" :min="0.01" :step="0.5" style="width:120px;margin-left:12px" /><span class="form-tip" style="margin-left:8px">元</span>
                </template>
              </t-form-item>
              <t-form-item v-if="form.reward_cash_enabled" label="红包规则">
                <t-select v-model="form.red_packet_rule_id" placeholder="选择红包规则（营销中心）" clearable style="width:240px">
                  <t-option label="XJHB260806000009 · ¥1等分" value="XJHB260806000009" />
                  <t-option label="XJHB260805000005 · ¥500拼手气" value="XJHB260805000005" />
                </t-select>
              </t-form-item>
              <t-form-item label="积分">
                <t-switch v-model="form.reward_points_enabled" />
                <template v-if="form.reward_points_enabled">
                  <t-input-number v-model="form.reward_points" :min="1" :step="10" style="width:120px;margin-left:12px" /><span class="form-tip" style="margin-left:8px">分</span>
                </template>
              </t-form-item>
              <t-form-item v-if="!form.reward_cash_enabled && !form.reward_points_enabled"><span class="form-tip">现金红包与积分至少开启一项，否则完课无奖励</span></t-form-item>
            </template>
          </div>

          <!-- 区块6：课程设置 -->
          <div class="section-card">
            <div class="section-header"><t-icon name="setting" class="section-icon" /><span>课程设置</span><ReplicaMarker :no="5" label="编号⑤ 1:1线上六项" /></div>
            <!-- 以下六项 = SaaS 线上 1:1（2026-08-27 实测） -->
            <t-form-item label="是否显示课程介绍"><t-switch v-model="form.show_intro" /></t-form-item>
            <t-form-item label="虚拟观看人数">
              <t-switch v-model="form.virtual_viewers" />
              <template v-if="form.virtual_viewers">
                <t-input-number v-model="form.virtual_min" :min="0" :max="form.virtual_max" theme="column" size="small" style="width:90px;margin-left:12px" />
                <span style="margin:0 6px;color:#98A2B3">—</span>
                <t-input-number v-model="form.virtual_max" :min="form.virtual_min" :max="10000" theme="column" size="small" style="width:90px" />
              </template>
            </t-form-item>
            <t-form-item label="是否启用评论">
              <t-switch v-model="form.comment_enabled" />
              <template v-if="form.comment_enabled">
                <span style="margin-left:12px;font-size:13px;color:#475467">评论最多字数</span>
                <t-input-number v-model="form.comment_max_words" :min="10" :max="500" theme="column" size="small" style="width:90px;margin-left:8px" />
              </template>
            </t-form-item>
            <t-form-item label="是否显示进度条">
              <t-radio-group v-model="form.show_progress"><t-radio value="allow">允许</t-radio><t-radio value="disallow">不允许</t-radio></t-radio-group>
            </t-form-item>
            <t-form-item label="是否允许用户手动暂停">
              <t-radio-group v-model="form.allow_pause"><t-radio value="allow">允许</t-radio><t-radio value="disallow">不允许</t-radio></t-radio-group>
            </t-form-item>
            <t-form-item label="课程最终完播条件">
              <span style="font-size:13px;color:#475467">视频播放进度到达</span>
              <t-input-number v-model="form.completion_percent" :min="1" :max="100" theme="column" size="small" style="width:90px;margin:0 6px" />
              <span style="font-size:13px;color:#475467">%</span>
            </t-form-item>

            <!-- 以下五项 = 课程业务新增（SaaS 线上无） -->
            <div class="saas-new-group">
              <div class="saas-new-group-title">以下为课程业务新增（SaaS 线上无）<ReplicaMarker :no="6" title="点击查看：内容保护为业务新增项" /></div>
              <t-form-item label="防录屏跑马灯"><t-switch v-model="form.watermark_horse" /><span class="form-tip" style="margin-left:8px">播放页展示用户名/ID防录屏</span></t-form-item>
              <t-form-item label="开启水印"><t-switch v-model="form.watermark_text" /><span class="form-tip" style="margin-left:8px">视频区右上角显示水印</span></t-form-item>
            </div>
          </div>

          <!-- V2·0829 用户裁决：上架设置整体去除（无收费/免费区分操作）；允许试看去除 -->
        </t-form>

        <div class="drawer-footer">
          <t-button @click="drawerVisible = false">取消</t-button>
          <t-button theme="primary" @click="doSave">保存</t-button>
        </div>
      </div>
    </t-drawer>

    <!-- 查看视频弹窗 -->
    <t-dialog v-model:visible="videoDialogVisible" header="查看视频" width="640px">
      <div class="video-player" v-if="currentCourse">
        <div class="player-area">
          <div class="player-controls">
            <t-icon name="play" class="ctrl" />
            <t-icon name="sound-mute" class="ctrl" />
            <t-icon name="fullscreen" class="ctrl" />
            <div class="progress-bar"><div class="progress-fill"></div></div>
            <span class="time">00:00 / {{ formatDuration(currentCourse.video_duration || 600) }}</span>
          </div>
        </div>
        <div class="video-meta">
          <p><span>所属分类：</span>{{ currentCourse.category_name }}</p>
          <p><span>视频名称：</span>{{ currentCourse.title }}</p>
          <p><span>文件名称：</span>{{ currentCourse.course_no }}.mp4</p>
          <p><span>文件格式：</span>video/mp4</p>
          <p><span>文件大小：</span>500.00MB</p>
          <p><span>视频时长：</span>{{ formatDuration(currentCourse.video_duration || 600) }}</p>
        </div>
      </div>
      <template #footer><t-button @click="videoDialogVisible = false">取消</t-button><t-button theme="primary">确认</t-button></template>
    </t-dialog>

    <!-- V2·0901 查看音频弹窗已删除（音频课程管理入口下线） -->

    <!-- 查看题库弹窗 -->
    <t-dialog v-model:visible="questionDialogVisible" header="查看题库" width="640px">
      <div v-if="currentCourse">
        <p style="margin-bottom:12px;color:var(--color-text-secondary)">课程「{{ currentCourse.title }}」关联题库：</p>
        <t-table :data="relatedQuestions" row-key="question_no" :columns="qColumns" bordered size="small">
          <template #qtype="{ row }">{{ row.question_type === 'single' ? '单选' : '多选' }}</template>
          <template #qanswer="{ row }">{{ Array.isArray(row.correct_answer) ? row.correct_answer.join(',') : row.correct_answer }}</template>
        </t-table>
        <div v-if="relatedQuestions.length === 0" class="empty">暂无关联题目</div>
      </div>
      <template #footer><t-button @click="questionDialogVisible = false">取消</t-button><t-button theme="primary">确认</t-button></template>
    </t-dialog>

    <!-- 内容池选择弹窗（视频/音频） -->
    <t-dialog v-model:visible="contentPickerVisible" :header="contentPickerType === 'audio' ? '选择音频课节' : '选择视频课节'" width="720px">
      <div v-if="contentPoolList.length === 0" class="empty">内容池暂无已发布的{{ contentPickerType === 'audio' ? '音频' : '视频' }}课节，请先在「{{ contentPickerType === 'audio' ? '音频课程' : '视频课程' }}」模块创建</div>
      <t-table v-else :data="contentPoolList" row-key="id" :columns="contentPickerColumns" bordered size="small" v-model:selected-row-keys="contentPickerSelected" @select-change="onContentPickerChange">
        <template #ctype="{ row }"><t-tag :theme="row.content_type === 'audio' ? 'primary' : 'success'" variant="light" size="small">{{ row.content_type === 'audio' ? '音频' : '视频' }}</t-tag></template>
        <template #duration="{ row }">{{ formatDuration(row.video_duration || 0) }}</template>
      </t-table>
      <div class="pool-selected-tip" v-if="contentPoolList.length > 0"><t-icon name="check-circle" /> 已选 {{ contentPickerSelected.length }} 个课节（已添加的不会重复选择）</div>
      <template #footer>
        <t-button @click="contentPickerVisible = false">取消</t-button>
        <t-button theme="primary" @click="confirmContentPicker">添加到课程</t-button>
      </template>
    </t-dialog>

    <!-- 添加奖励弹窗（1:1线上：现金红包选择器，2026-08-27 实测） -->
    <t-dialog v-model:visible="rewardPickerVisible" header="现金红包" width="860px">
      <div class="reward-toolbar">
        <t-input v-model="rewardSearchNo" placeholder="请输入红包编号" clearable style="width:180px" />
        <t-button theme="primary" size="small">筛选</t-button>
        <t-button size="small">重置</t-button>
        <t-button theme="primary" variant="outline" size="small">新建红包</t-button>
        <t-button size="small">刷新</t-button>
      </div>
      <t-table :data="rewardList" row-key="no" :columns="rewardColumns" bordered size="small" v-model:selected-row-keys="rewardSelectedKeys" @select-change="onRewardSelect">
        <template #amount="{ row }">¥{{ row.amount }}</template>
      </t-table>
      <template #footer>
        <t-button @click="rewardPickerVisible = false">取消</t-button>
        <t-button theme="primary" @click="confirmRewardPicker">确定</t-button>
      </template>
    </t-dialog>

    <!-- 更换题目弹窗（从题目库选题） -->
    <t-dialog v-model:visible="quizPickerVisible" header="更换题目（从题目库选择）" width="720px">
      <t-table :data="quizBankRows" row-key="no" :columns="quizPickerColumns" bordered size="small" v-model:selected-row-keys="quizSelectedKeys" @select-change="(_k: any, ctx: any) => (quizSelectedRows = ctx?.selectedRowData ?? [])">
        <template #qtype="{ row }">{{ row.type }}</template>
      </t-table>
      <div class="pool-selected-tip"><t-icon name="info-circle" /> 选择后原关联题目将被替换；确认后该视频时间轴将按新题目触发答题卡</div>
      <template #footer>
        <t-button @click="quizPickerVisible = false">取消</t-button>
        <t-button theme="primary" @click="confirmQuizPicker">确认更换</t-button>
      </template>
    </t-dialog>

    <!-- 题目详情弹窗 -->
    <t-dialog v-model:visible="quizDetailVisible" header="题目详情" width="560px">
      <template v-if="quizDetailRow">
        <t-form label-width="90px" :data="quizDetailRow">
          <t-form-item label="题目编号">{{ quizDetailRow.video_no }}</t-form-item>
          <t-form-item label="关联题目">{{ quizDetailRow.quiz_title || 'S01E03 综合测评题' }}</t-form-item>
          <t-form-item label="题型">单选题（4选1）</t-form-item>
          <t-form-item label="题目内容">课程完播后练习：本节课程的核心要点以下哪项描述正确？</t-form-item>
          <t-form-item label="选项">
            <div style="width:100%;line-height:1.9;font-size:13px;color:#475467">A. 分段学习不复习<br/>B. 学完即测+错题回顾（正确答案）<br/>C. 只看视频不做题<br/>D. 考前突击一夜</div>
          </t-form-item>
          <t-form-item label="触发方式">完播触发 · 阈值 ≥ 90%</t-form-item>
          <t-form-item label="历史正确率">86%</t-form-item>
        </t-form>
      </template>
      <template #footer><t-button theme="primary" @click="quizDetailVisible = false">关闭</t-button></template>
    </t-dialog>

    <!-- V2·0829 用户裁决：课时管理/题库管理抽屉入口已随操作列按钮删除（相关操作统一在编辑模块内完成） -->

    <!-- 课程学员查看抽屉（PC-002.5） -->
    <t-drawer v-model:visible="studentDrawerVisible" :header="`课程学员 · ${studentDrawerCourse?.title ?? ''}`" size="720px" placement="right">
      <div class="drawer-tip">已购/已开通该课程的学员名单（数据源：课程订单；免费课程=自动开通记录）。<ReplicaMarker :no="8" title="点击查看：课程学员查看为业务新增功能" /></div>
      <t-table :data="courseStudents" row-key="no" :columns="[
        { colKey: 'no', title: '学员编号', width: 150 },
        { colKey: 'name', title: '学员', width: 80 },
        { colKey: 'phone', title: '手机号', width: 110 },
        { colKey: 'time', title: '开通时间', width: 130 },
        { colKey: 'status', title: '学习状态', width: 85 },
        { colKey: 'progress', title: '进度', width: 65 },
      ]" bordered size="small">
        <!-- V2·0829 用户裁决：支付方式/实付列删除（全免费） -->
        <template #status="{ row }"><t-tag size="small" :theme="row.status === '已完成' ? 'success' : 'primary'" variant="light">{{ row.status }}</t-tag></template>
      </t-table>
    </t-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { useCourseStore } from '../../../stores/course-store';
import { useCampStore } from '../../../stores/camp-store';
import ReplicaMarker from '../../../components/replica/ReplicaMarker.vue';
import { notifyModalOpen } from '../../../utils/modal-spec-bridge';
import { COURSE_CATEGORIES } from '../../../contracts/constants/course-constants';
import { LIVE_SESSIONS } from '../../../adapters/sim/sim-fixtures';

const store = useCourseStore();
const campStore = useCampStore();
// V2·D2-2 去掉讲师/助教角色：不再从组织档案选择，主讲人为课程内容属性（纯文本）
const liveRooms = LIVE_SESSIONS;
const dateRange = ref<any>([]);
const search = ref(''); const searchNo = ref(''); const catFilter = ref(''); const modeFilter = ref(''); const inCampFilter = ref('');
const batchMode = ref(false); const selected = ref<any[]>([]);
const page = ref(1); const pageSize = ref(10);
const drawerVisible = ref(false); const videoDialogVisible = ref(false); const questionDialogVisible = ref(false);
const currentCourse = ref<any>(null);
const categories = [...COURSE_CATEGORIES];
const editing = ref<any>(null);
const form = ref<any>(defaultForm());

const coverPresets = [
  { url: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=400&h=225&fit=crop', label: '封面1' },
  { url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=225&fit=crop', label: '封面2' },
  { url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=225&fit=crop', label: '封面3' },
  { url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=225&fit=crop', label: '封面4' },
];

function defaultForm() {
  return {
    title: '', category_name: '', description: '', mode: 'recorded' as 'recorded' | 'live', visibility: 'public' as 'public' | 'camp_only',
    cover_url: '', videos: [] as any[],
    live_session_id: '' as string,
    // V2·D2-1 本期不做交易：售卖配置固定免费，仅保留 C 端展示开关
    show_in_app: true,
    validity_type: 'long' as 'long' | 'custom' | 'fixed', validity_custom_date: null as Date | null, validity_fixed_days: 365,
    // V2·0829 用户裁决：主讲人/上架设置/允许试看/答题奖励红包字段已去除
    commission_enabled: false,
    // 课程设置（SaaS 线上 1:1 六项配置）
    show_intro: true, virtual_viewers: true, virtual_min: 1, virtual_max: 100,
    comment_enabled: true, comment_max_words: 50,
    show_progress: 'allow' as 'allow' | 'disallow', allow_pause: 'disallow' as 'allow' | 'disallow', completion_percent: 100,
    // D35 完课奖励配置（业务新增·现金红包与积分可同选）
    completion_reward_enabled: false,
    reward_cash_enabled: true, reward_amount: 1, red_packet_rule_id: '',
    reward_points_enabled: false, reward_points: 20,
    // 课程设置（课程业务新增·内容保护）
    forbid_seek: false, forbid_speed: false, watermark_horse: false, watermark_text: false,
  };
}


const columns = computed(() => {
  const cols: any[] = [
    { colKey: 'course_no', title: '课程编号', width: 180, ellipsis: true },
    { colKey: 'title', title: '课程名称', minWidth: 160, ellipsis: true },
    { colKey: 'category_name', title: '分类名称', width: 100 },
    { colKey: 'video', title: '查看视频', width: 100 },
    { colKey: 'qb', title: '查看题库', width: 100 },
    { colKey: 'created', title: '创建时间', width: 180 },
    { colKey: 'status', title: '状态', width: 80 },
    { colKey: 'op', title: '操作', width: 120, fixed: 'right' },
  ];
  if (batchMode.value) cols.unshift({ colKey: 'row-select', type: 'multiple', width: 50 });
  return cols;
});

const videoColumns = [
  { colKey: 'ctype', title: '类型', width: 70 },
  { colKey: 'video_no', title: '视频编号', width: 150 },
  { colKey: 'name', title: '视频名称', minWidth: 130 },
  { colKey: 'file', title: '视频文件', width: 100 },
  { colKey: 'duration', title: '视频时长', width: 95 },
  { colKey: 'category', title: '所属分类', width: 90 },
  { colKey: 'quiz', title: '是否答题', width: 200 },
  { colKey: 'reward', title: '奖励', width: 130 },
  { colKey: 'vop', title: '操作', width: 70, fixed: 'right' },
];

const qColumns = [
  { colKey: 'question_no', title: '编码', width: 100 },
  { colKey: 'content', title: '题目', minWidth: 240, ellipsis: true },
  { colKey: 'qtype', title: '类型', width: 80 },
  { colKey: 'qanswer', title: '答案', width: 80 },
];

const filtered = computed(() => {
  let list = store.courses;
  if (search.value) list = list.filter(c => c.title.includes(search.value));
  if (searchNo.value) list = list.filter(c => c.course_no.includes(searchNo.value));
  if (catFilter.value) list = list.filter(c => c.category_name === catFilter.value);
  if (modeFilter.value) list = list.filter(c => c.mode === modeFilter.value);
  if (inCampFilter.value === 'in_camp') list = list.filter(c => (c.camp_ref_count ?? 0) > 0);
  if (inCampFilter.value === 'standalone') list = list.filter(c => (c.camp_ref_count ?? 0) === 0);
  if (dateRange.value && dateRange.value.length === 2) {
    const [start, end] = dateRange.value as any;
    list = list.filter(c => { const t = new Date(c.created_at * 1000); return (!start || t >= new Date(start)) && (!end || t <= new Date(end)); });
  }
  return list;
});

const relatedQuestions = computed(() => currentCourse.value ? store.questions.filter((q: any) => q.bank_id === currentCourse.value.question_bank_id) : []);

function formatDuration(seconds: number) { const m = Math.floor(seconds / 60); const s = seconds % 60; return `${m}分钟${s}秒`; }
function onSelChange(_keys: any[], ctx: any) { selected.value = ctx?.selectedRowData ?? []; }
function doFilter() { page.value = 1; }
function reset() { dateRange.value = []; search.value = ''; searchNo.value = ''; catFilter.value = ''; modeFilter.value = ''; inCampFilter.value = ''; page.value = 1; }
function openCreate() { editing.value = null; form.value = defaultForm(); drawerVisible.value = true; notifyModalOpen('course-create'); }
function addVideo() { openContentPicker('video'); }
function addAudio() { openContentPicker('audio'); }

// 内容池选择（从视频课程/音频课程模块的已发布课节真实关联）
const contentPickerVisible = ref(false);
const contentPickerType = ref<'video' | 'audio'>('video');
const contentPickerSelected = ref<(string | number)[]>([]);
const contentPickerRows = ref<any[]>([]);
const contentPoolList = computed(() => store.loadContentPool(contentPickerType.value).filter((l: any) => l.status === 'published' || !l.status));
const contentPickerColumns = [
  { colKey: 'row-select', type: 'multiple', width: 50 },
  { colKey: 'ctype', title: '类型', width: 70 },
  { colKey: 'title', title: '课节标题', minWidth: 180, ellipsis: true },
  { colKey: 'duration', title: '时长', width: 100 },
];
function openContentPicker(type: 'video' | 'audio') {
  contentPickerType.value = type;
  contentPickerSelected.value = [];
  contentPickerRows.value = [];
  contentPickerVisible.value = true;
}
function onContentPickerChange(_keys: (string | number)[], ctx: any) {
  contentPickerSelected.value = _keys;
  contentPickerRows.value = ctx?.selectedRowData ?? [];
}
function confirmContentPicker() {
  if (contentPickerRows.value.length === 0) { MessagePlugin.warning('请至少选择一个课节'); return; }
  const existingNos = new Set(form.value.videos.map((v: any) => v.video_no));
  let added = 0;
  contentPickerRows.value.forEach((l: any) => {
    if (existingNos.has(l.lesson_no || l.id)) return;
    form.value.videos.push({
      video_no: l.lesson_no || l.id,
      name: l.title,
      format: l.content_type === 'audio' ? 'audio/mp3' : 'video/mp4',
      size: l.content_type === 'audio' ? '30.00MB' : '500.00MB',
      duration: formatDuration(l.video_duration || 0),
      category: '未分组',
      ctype: l.content_type === 'audio' ? 'audio' : 'video',
      has_quiz: !!l.question_bank_id,
      _lessonId: l.id,
    });
    added++;
  });
  if (added === 0) MessagePlugin.info('所选课节已在列表中，未重复添加');
  else MessagePlugin.success(`已添加 ${added} 个${contentPickerType.value === 'audio' ? '音频' : '视频'}课节`);
  contentPickerVisible.value = false;
}
function removeVideo(row: any) { form.value.videos = form.value.videos.filter((v: any) => v !== row); }

// ─── 是否答题：表头全局开关 + 行内三操作（查看详情/更换题目/取消关联） ───
const quizAllOn = ref(false);
function toggleQuizAll(v: any) {
  form.value.videos.forEach((v2: any) => (v2.has_quiz = !!v));
}
function viewQuizDetail(row: any) { quizDetailRow.value = row; quizDetailVisible.value = true; }
function unlinkQuiz(row: any) {
  row.has_quiz = false;
  MessagePlugin.success('已取消该视频的题目关联');
}

// ─── 更换题目弹窗（题目库数据） ───
const quizPickerVisible = ref(false);
const quizPickerRow = ref<any>(null);
const quizSelectedKeys = ref<(string | number)[]>([]);
const quizSelectedRows = ref<any[]>([]);
const quizBankRows = ref([
  { no: 'QN00000033', title: '课程完播综合测评（单选）', type: '单选题', answer: 'B' },
  { no: 'QN00000031', title: '本节课程核心要点（多选）', type: '多选题', answer: 'A,B' },
  { no: 'QN00000027', title: '学习效果自评（单选）', type: '单选题', answer: 'A' },
]);
const quizPickerColumns = [
  { colKey: 'row-select', type: 'multiple', width: 50 },
  { colKey: 'no', title: '题目编码', width: 120 },
  { colKey: 'title', title: '题目名称', minWidth: 200 },
  { colKey: 'qtype', title: '题目类型', width: 90 },
  { colKey: 'answer', title: '答案', width: 80 },
];
function openQuizPicker(row: any) {
  quizPickerRow.value = row;
  quizSelectedKeys.value = [];
  quizSelectedRows.value = [];
  quizPickerVisible.value = true;
}
function confirmQuizPicker() {
  if (quizSelectedRows.value.length === 0) { MessagePlugin.warning('请至少选择一道题目'); return; }
  if (quizPickerRow.value) quizPickerRow.value.quiz_title = quizSelectedRows.value[0].title;
  MessagePlugin.success(`已更换关联题目（${quizSelectedRows.value.length} 题）`);
  quizPickerVisible.value = false;
}

// ─── 查看详情弹窗 ───
const quizDetailVisible = ref(false);
const quizDetailRow = ref<any>(null);

// ─── 添加奖励弹窗（现金红包选择器·1:1线上） ───
const rewardPickerVisible = ref(false);
const rewardPickerRow = ref<any>(null);
const rewardSearchNo = ref('');
const rewardSelectedKeys = ref<(string | number)[]>([]);
const rewardList = ref([
  { no: 'XJHB260806000009', amount: 1, count: 1, type: '等分红包', claimed_count: 0, claimed_amount: 0, remain_amount: 1, remain_count: 1, created: '2026-08-06 15:35:20' },
  { no: 'XJHB260806000008', amount: 1, count: 1, type: '拼手气红包', claimed_count: 0, claimed_amount: 0, remain_amount: 1, remain_count: 1, created: '2026-08-06 15:32:24' },
  { no: 'XJHB260806000002', amount: 150, count: 10, type: '等分红包', claimed_count: 3, claimed_amount: 45, remain_amount: 105, remain_count: 7, created: '2026-08-06 11:46:33' },
  { no: 'XJHB260805000005', amount: 500, count: 10, type: '拼手气红包', claimed_count: 1, claimed_amount: 32.28, remain_amount: 467.72, remain_count: 9, created: '2026-08-05 14:35:23' },
  { no: 'XJHB260726000012', amount: 113, count: 1, type: '拼手气红包', claimed_count: 0, claimed_amount: 0, remain_amount: 113, remain_count: 1, created: '2026-07-26 17:01:52' },
]);
const rewardColumns = [
  { colKey: 'row-select', type: 'single', width: 50 },
  { colKey: 'no', title: '红包编号', width: 150 },
  { colKey: 'amount', title: '红包总金额', width: 100 },
  { colKey: 'count', title: '红包总数量', width: 95 },
  { colKey: 'type', title: '发放类型', width: 100 },
  { colKey: 'claimed_count', title: '已领取数量', width: 95 },
  { colKey: 'claimed_amount', title: '已领取金额', width: 95 },
  { colKey: 'remain_amount', title: '剩余金额', width: 90 },
  { colKey: 'remain_count', title: '剩余个数', width: 90 },
  { colKey: 'created', title: '创建时间', width: 150 },
];
function onRewardSelect(_keys: (string | number)[], ctx: any) { rewardSelectedKeys.value = _keys; }
function openRewardPicker(row: any) {
  rewardPickerRow.value = row;
  rewardSelectedKeys.value = row.reward ? [row.reward.no] : [];
  rewardPickerVisible.value = true;
}
function confirmRewardPicker() {
  const hit = rewardList.value.find(r => rewardSelectedKeys.value.includes(r.no));
  if (!hit) { MessagePlugin.warning('请选择一个现金红包'); return; }
  if (rewardPickerRow.value) rewardPickerRow.value.reward = { no: hit.no, amount: hit.amount, count: hit.count, type: hit.type };
  MessagePlugin.success(`已关联现金红包 ${hit.no}`);
  rewardPickerVisible.value = false;
}
function openEditDrawer(row: any) {
  editing.value = row;
  notifyModalOpen('course-edit');
  const lessons = store.loadLessonsByCourse(row.id);
  form.value = {
    title: row.title, category_name: row.category_name, description: row.description, mode: row.mode || 'recorded', visibility: 'public' as 'public' | 'camp_only',
    cover_url: row.cover_url || coverPresets[0].url,
    live_session_id: row.source_live_session_id || '',
    videos: row.mode === 'live' ? [] : lessons.map((l: any) => ({ video_no: l.lesson_no, name: l.title, format: l.content_type === 'audio' ? 'audio/mp3' : 'video/mp4', size: l.content_type === 'audio' ? '30.00MB' : '500.00MB', duration: formatDuration(l.video_duration), category: row.category_name || '未分组', ctype: l.content_type || 'video', has_quiz: !!l.question_bank_id, files_count: 1, file_name: l.title, reward: null })),
    sale_type: 'free' as 'free' | 'paid', price: 0, original_price: '',
    validity_type: 'long', validity_custom_date: null, validity_fixed_days: 365,
    commission_enabled: false,
    show_in_app: (row as any).show_in_app ?? true,
    show_intro: true, virtual_viewers: true, virtual_min: 1, virtual_max: 100, comment_enabled: true, comment_max_words: 50, show_progress: 'allow', allow_pause: 'disallow', completion_percent: 100,
    forbid_seek: false, forbid_speed: false, watermark_horse: false, watermark_text: false,
    completion_reward_enabled: false, reward_cash_enabled: true, reward_amount: 1, red_packet_rule_id: '', reward_points_enabled: false, reward_points: 20,
  };
  drawerVisible.value = true;
}
function doSave() {
  if (!form.value.title) { MessagePlugin.warning('请填写课程名称'); return; }
  if (!form.value.category_name) { MessagePlugin.warning('请选择所属分类'); return; }
  // V2·D2-1 本期不做交易：全部免费，价格固定 0；D2-2 主讲人为选填文本，不做讲师档案校验
  const price = 0;
  const isPaid = false;
  if (editing.value) {
    store.updateCourse(editing.value.id, { title: form.value.title, category_name: form.value.category_name, description: form.value.description, mode: form.value.mode, visibility: form.value.visibility, cover_url: form.value.cover_url, is_paid: isPaid, price, commission_enabled: false, show_in_app: form.value.show_in_app, lecturer_id: '', lecturer_name: '' } as any);
    if (form.value.mode === 'recorded') {
      form.value.videos.forEach((v: any) => {
        const existing = store.lessons.find((l: any) => l.lesson_no === v.video_no);
        if (!existing) {
          store.createLesson({ course_id: editing.value.id, content_type: v.ctype === 'audio' ? 'audio' : 'video', sort_order: store.loadLessonsByCourse(editing.value.id).length + 1, title: v.name, description: '', mode: 'recorded', video_url: '', video_duration: v.ctype === 'audio' ? 1200 : 3036, live_session_id: null, question_bank_id: v.has_quiz ? (store.courses.find(c => c.id === editing.value.id)?.question_bank_id ?? null) : null, is_free_preview: false, reward: v.reward ?? null } as any);
        } else if (v.reward) {
          // V2·0829：课时行「添加奖励」同步到 lesson（C 端答题激励数据源）
          store.updateLesson(existing.id, { reward: v.reward } as any);
        }
      });
    }
    MessagePlugin.success('课程已更新');
  } else {
    store.createCourse({ title: form.value.title, description: form.value.description, cover_url: form.value.cover_url, category_id: 'cat-' + Date.now(), category_name: form.value.category_name, tags: [], lecturer_id: '', lecturer_name: '', source: 'upload', mode: form.value.mode, source_live_session_id: null, visibility: form.value.visibility, price, is_paid: isPaid, commission_enabled: false, show_in_app: form.value.show_in_app } as any);
    MessagePlugin.success('课程已新增');
  }
  // D35 完课奖励同步营销域复刻观看奖励页（真实系统：课程表单保存→营销中心创建红包规则）；积分奖励走积分事件不建红包规则
  if (form.value.completion_reward_enabled && form.value.reward_cash_enabled) {
    import('../../../stores/saas-replica/marketing-replica-store').then(({ useMarketingReplicaStore }) => {
      const mk = useMarketingReplicaStore();
      const name = `完课红包·${form.value.title}`;
      const existed = mk.rules.find(r => r.rule_name === name);
      if (existed) { existed.amount_yuan = form.value.reward_amount; return; }
      mk.rules.unshift({ id: 'WR-' + Date.now(), rule_no: 'HB' + Date.now().toString().slice(-9), rule_name: name, reward_type: '完课红包', bind_scene: '营期', scene_name: form.value.title, amount_yuan: form.value.reward_amount, total_count: 500, issued_count: 0, received_count: 0, status: 'enabled', created_at: Math.floor(Date.now() / 1000) });
    });
  }
  drawerVisible.value = false; editing.value = null; form.value = defaultForm();
}
// V2·0829 用户裁决：停售/重新上架按钮已去除（相关操作统一在编辑模块内完成）
// V2·0831 课程状态 4 态：draft(草稿) → pending_review(待审核) → published(已发布) / rejected(已驳回)；无上下架（隐藏用 C端展示开关，删除有引用保护）；offline 仅为历史数据兜底显示
function statusLabel(s: string): string {
  const m: Record<string, string> = { draft: '草稿', pending_review: '待审核', published: '已发布', offline: '已下架', rejected: '已驳回' };
  return m[s] || s;
}
function statusTheme(s: string): any {
  const m: Record<string, any> = { draft: 'default', pending_review: 'warning', published: 'success', offline: 'default', rejected: 'danger' };
  return m[s] || 'default';
}
function statusIcon(s: string): string {
  const m: Record<string, string> = { draft: 'edit-2', pending_review: 'time', published: 'check-circle', offline: 'stop-circle', rejected: 'close-circle' };
  return m[s] || 'info-circle';
}
function submitForReview(row: any) {
  if (row.status !== 'draft' && row.status !== 'rejected') { MessagePlugin.warning('仅草稿/已驳回课程可提交审核'); return; }
  store.submitCourseForReview(row.id);
  MessagePlugin.success('已提交审核，等待管理员审核');
}

// ─── 删除课程（PC-002.6：仅草稿可删，级联清理课时/题库） ───
function delCourse(row: any) {
  const confirm = DialogPlugin.confirm({
    header: '删除课程',
    body: `确认删除草稿课程「${row.title}」？将级联删除其课时、题库与题目，不可恢复。`,
    theme: 'warning',
    onConfirm: () => {
      try { store.deleteCourse(row.id); MessagePlugin.success('课程已删除'); } catch (e: any) { MessagePlugin.error(e?.message || '删除失败'); }
      confirm.destroy();
    },
  });
}

// ─── 课程学员查看抽屉（PC-002.5：已购/已开通学员名单） ───
const studentDrawerVisible = ref(false);
const studentDrawerCourse = ref<any>(null);
const courseStudents = ref([
  { no: '2606220068994001719', name: '王五', phone: '136****6969', pay: '微信支付', amount: 199, time: '2026-08-12 10:32', status: '学习中', progress: '68%' },
  { no: '2606220069034003061', name: '赵六', phone: '181****0002', pay: '支付宝', amount: 199, time: '2026-08-15 14:20', status: '已完成', progress: '100%' },
  { no: '2606240069021206680', name: '钱七', phone: '178****0003', pay: '微信支付', amount: 0, time: '2026-08-19 09:15', status: '学习中', progress: '12%' },
]);
function openStudentDrawer(row: any) { studentDrawerCourse.value = row; studentDrawerVisible.value = true; notifyModalOpen('course-students'); }

// ─── 课时/题库抽屉（PC-003/PC-004 入口） ───
import LessonDrawerPage from './LessonDrawerPage.vue';
import QuestionDrawerPage from './QuestionDrawerPage.vue';
// V2·0829 用户裁决：课时/题库抽屉及其入口已删除
function approveCourse(row: any) {
  if (row.status !== 'pending_review') { MessagePlugin.warning('仅待审核课程可通过'); return; }
  store.approveCourse(row.id, 'admin-001');
  MessagePlugin.success('课程审核通过，已发布');
}
function rejectCourse(row: any) {
  if (row.status !== 'pending_review') { MessagePlugin.warning('仅待审核课程可驳回'); return; }
  const reason = window.prompt('请输入驳回原因（选填，不超过200字）') || '不符合课程规范';
  store.rejectCourse(row.id, 'admin-001', reason);
  MessagePlugin.warning('课程已驳回');
}
function showVideoDialog(row: any) { currentCourse.value = row; videoDialogVisible.value = true; notifyModalOpen('course-view-video'); }
function showQuestionDialog(row: any) { currentCourse.value = row; questionDialogVisible.value = true; notifyModalOpen('course-view-quiz'); }
</script>

<style scoped>
.course-manage {
  /* ── 设计令牌（PC 后台 · teal 主色 + green 强调） ── */
  --color-primary: #0D9488;
  --color-primary-light: #E6F9F1;
  --color-accent: #12B76A;
  --color-bg: #F5F7FA;
  --color-surface: #FFFFFF;
  --color-text: #1F2C3E;
  --color-text-secondary: #667085;
  --color-text-muted: #98A2B3;
  --color-border: #EAECF0;
  --color-danger: #F04438;
  /* 间距（8dp 系统） */
  --sp-1: 8px;
  --sp-2: 16px;
  --sp-3: 24px;
  --sp-4: 32px;
  /* 圆角 */
  --radius: 8px;
  --radius-lg: 12px;
  /* 阴影 */
  --shadow-card: 0 2px 8px rgba(0, 0, 0, 0.06);
  --shadow-hover: 0 4px 12px rgba(0, 0, 0, 0.1);

  background: var(--color-bg);
  min-height: 100%;
  padding: var(--sp-3);
  font-family: "PingFang SC", "Helvetica Neue", "Microsoft YaHei", sans-serif;
  color: var(--color-text);
}

/* ── 筛选区卡片 ── */
.filter-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  padding: var(--sp-2);
  margin-bottom: var(--sp-2);
  transition: box-shadow 200ms ease;
}
.filter-card:hover { box-shadow: var(--shadow-hover); }

.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-2);
  align-items: center;
}
.filter-item {
  display: flex;
  align-items: center;
  gap: var(--sp-1);
}
.filter-label {
  font-size: 13px;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.filter-actions {
  display: flex;
  gap: var(--sp-1);
}
.filter-toolbar {
  display: flex;
  align-items: center;
  gap: var(--sp-1);
  margin-top: var(--sp-2);
  padding-top: var(--sp-2);
  border-top: 1px solid var(--color-border);
}
.toolbar-count {
  font-size: 13px;
  color: var(--color-text-muted);
  margin-left: var(--sp-1);
}

/* ── 表格卡片 ── */
.table-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  padding: var(--sp-2);
  transition: box-shadow 200ms ease;
}
.table-card:hover { box-shadow: var(--shadow-hover); }
.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--sp-2);
}

/* ── 抽屉 ── */
.drawer-body {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}
.section-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: var(--sp-2);
  transition: box-shadow 200ms ease;
}

/* ── 相对 SaaS 线上新增项的红框标注（课堂域业务改动） ── */
.saas-new-box {
  position: relative;
}
.section-card.saas-new-box {
  border: 1.5px dashed #f56c6c;
  background: #fffafa;
}
/* 包裹型红框（用于 t-form-item 外层） */
.saas-new-wrap {
  border: 1.5px dashed #f56c6c;
  border-radius: var(--radius);
  background: #fffafa;
  padding: 4px 12px 2px;
  margin-bottom: var(--sp-2);
}
.saas-new-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  background: #f56c6c;
  padding: 2px 10px;
  border-radius: 0 0 8px 8px;
  margin-left: 12px;
}

/* 课程内容表格：是否答题三链接 / 奖励单元格 */
.quiz-cell { display: flex; flex-direction: column; align-items: flex-start; gap: 2px; }
.quiz-cell .t-button { padding: 0 4px; }
.reward-cell { cursor: pointer; line-height: 1.4; }
.reward-cell:hover { color: #0D9488; }
.reward-name { display: block; font-size: 12px; font-weight: 600; color: #1F2C3E; }
.reward-meta { display: block; font-size: 11px; color: #98A2B3; }
.reward-toolbar { display: flex; gap: 8px; align-items: center; margin-bottom: 10px; flex-wrap: wrap; }

/* 课程设置：业务新增分组 */
.saas-new-group {
  margin-top: 12px;
  padding: 10px 12px;
  border: 1.5px dashed #f56c6c;
  border-radius: 6px;
  background: #fffafa;
}
.saas-new-group-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #f56c6c;
  margin-bottom: 8px;
}
.section-card:hover { box-shadow: var(--shadow-card); }
.section-header {
  display: flex;
  align-items: center;
  gap: var(--sp-1);
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--sp-2);
  padding-bottom: var(--sp-1);
  border-bottom: 1px solid var(--color-border);
}
.section-icon {
  font-size: 16px;
  color: var(--color-primary);
}
.drawer-footer {
  display: flex;
  gap: var(--sp-1);
  justify-content: flex-end;
  padding-top: var(--sp-2);
}

/* ── 视频播放器 ── */
.video-player { background: var(--color-bg); border-radius: var(--radius); padding: var(--sp-2); }
.player-area {
  background: var(--color-text);
  border-radius: var(--radius);
  height: 280px;
  display: flex;
  align-items: flex-end;
  padding: var(--sp-2);
  color: #fff;
}
.player-controls { display: flex; align-items: center; gap: var(--sp-2); width: 100%; }
.ctrl { font-size: 18px; cursor: pointer; transition: color 200ms ease; }
.ctrl:hover { color: var(--color-primary-light); }
.progress-bar { flex: 1; height: 4px; background: rgba(255,255,255,0.2); border-radius: 2px; }
.progress-fill { height: 100%; width: 0%; background: #fff; border-radius: 2px; }
.time { font-size: 12px; opacity: 0.8; }
.video-meta { margin-top: var(--sp-2); }
.video-meta p { display: flex; padding: 6px 0; font-size: 14px; color: var(--color-text); border-bottom: 1px dashed var(--color-border); }
.video-meta span { color: var(--color-text-muted); margin-right: var(--sp-1); min-width: 80px; }

/* ── 通用 ── */
.empty { text-align: center; color: var(--color-text-muted); padding: var(--sp-3); font-size: 14px; }
.live-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: var(--sp-1) var(--sp-2);
  background: var(--color-primary-light);
  border: 1px dashed var(--color-primary);
  border-radius: var(--radius);
  font-size: 13px;
  color: var(--color-primary);
  line-height: 1.6;
  margin-top: var(--sp-1);
}
.live-auto-tip {
  align-items: flex-start;
  padding: 12px 16px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #1F2C3E;
}
.content-actions { display: flex; gap: var(--sp-1); align-items: center; }

/* ── 封面 ── */
.cover-grid { display: flex; flex-wrap: wrap; gap: 10px; }
.cover-item {
  position: relative;
  width: 100px;
  height: 56px;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 200ms ease, transform 200ms ease;
}
.cover-item:hover { transform: translateY(-2px); }
.cover-item img { width: 100%; height: 100%; object-fit: cover; }
.cover-item.active { border-color: var(--color-primary); }
.cover-check { position: absolute; top: 2px; right: 2px; width: 16px; height: 16px; border-radius: 50%; background: var(--color-primary); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 10px; }
.cover-upload {
  width: 100px;
  height: 56px;
  border: 2px dashed #D0D5DD;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  color: var(--color-text-muted);
  cursor: pointer;
  font-size: 11px;
  transition: border-color 200ms ease, color 200ms ease;
}
.cover-upload:hover { border-color: var(--color-primary); color: var(--color-primary); }
.cover-upload-icon { font-size: 18px; }

/* ── 表单辅助 ── */
.validity-static { font-size: 13px; color: var(--color-text); }
.fixed-days-row { display: flex; align-items: center; gap: var(--sp-1); font-size: 13px; color: var(--color-text); }
.shelf-tip { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--color-text-secondary); line-height: 1.6; margin: var(--sp-1) 0 0 120px; }
.form-error { display: flex; align-items: center; gap: 4px; font-size: 12px; color: var(--color-danger); padding: 4px 0 8px 120px; }
.form-tip { font-size: 12px; color: var(--color-text-muted); margin-top: 4px; }
.pool-tip { font-size: 12px; color: var(--color-text-muted); margin-left: var(--sp-1); }
.pool-selected-tip { display: flex; align-items: center; gap: 4px; font-size: 12px; color: var(--color-primary); margin-top: var(--sp-1); }
</style>
