<template>
  <!-- 三类群功能和操作权限（表格总览，PM 口径，与 BR-IM-009/023/033/034 同源） -->
  <div class="perm-doc">
    <div class="doc-title">三类群功能和操作权限</div>
    <div class="doc-sub">门店通用群 / 客户群 / 客服群 · 功能边界与操作权限矩阵（口径见业务规则 BR-IM-009/023/033/034）</div>

    <!-- 表一：三类群功能对比 -->
    <div class="sec-title">一、三类群功能对比</div>
    <table class="perm-table">
      <thead>
        <tr>
          <th class="col-feature">功能</th>
          <th>门店通用群</th>
          <th>客户群</th>
          <th>客服群</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in featureRows" :key="row.name">
          <td class="col-feature">{{ row.name }}</td>
          <td v-for="(cell, i) in row.cells" :key="i" :class="cellClass(cell)">
            <span class="yes" v-if="cell === 'yes'">✓</span>
            <span class="no" v-else-if="cell === 'no'">✗</span>
            <span v-else>{{ cell }}</span>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- 表二：操作权限矩阵 -->
    <div class="sec-title">二、操作权限矩阵（谁可以做什么）</div>
    <table class="perm-table">
      <thead>
        <tr>
          <th class="col-feature">操作</th>
          <th>群主</th>
          <th>管理员</th>
          <th>普通成员 / 客户</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in permissionRows" :key="row.name">
          <td class="col-feature">{{ row.name }}</td>
          <td v-for="(cell, i) in row.cells" :key="i" :class="cellClass(cell)">
            <span class="yes" v-if="cell === 'yes'">✓</span>
            <span class="no" v-else-if="cell === 'no'">✗</span>
            <span v-else>{{ cell }}</span>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- 备注 -->
    <div class="notes">
      <div class="note-item">· 管理员仅存在于门店通用群（店长设店员为管理员，≤3 人），客户群/客服群无管理员。</div>
      <div class="note-item">· 移除客户群的客户成员须「双端校验」二次确认（仅通讯录移除 / 按业务绑定解除，BR-IM-006）。</div>
      <div class="note-item">· 通用群、客服群成员变动由系统驱动（入职/离职同步、咨询才建），无手动添加成员入口。</div>
      <div class="note-item">· 通用群、客服群群名固定不可手动改；客户群群名由群主修改。</div>
    </div>
  </div>
</template>

<script setup lang="ts">
type Cell = 'yes' | 'no' | string;

/** 表一：三类群功能对比 */
const featureRows: { name: string; cells: Cell[] }[] = [
  { name: '群公告', cells: ['no', 'yes', 'no（V1）'] },
  { name: '全员禁言', cells: ['no', 'yes', 'no'] },
  { name: '邀请客户（添加成员）', cells: ['no', 'yes', 'no'] },
  { name: '移除成员', cells: ['系统驱动', '群主', 'no'] },
  { name: '管理员设置', cells: ['yes（店长设店员）', 'no', 'no'] },
  { name: '修改群名称', cells: ['no（固定）', '群主', 'no（固定）'] },
  { name: '解散群', cells: ['群主', '群主', '群主'] },
  { name: '举报', cells: ['yes', 'yes', 'yes'] },
  { name: '消息免打扰 / 置顶', cells: ['yes', 'yes', 'yes'] },
  { name: '订单卡片 / 售后', cells: ['no', 'no', 'yes'] },
];

/** 表二：操作权限矩阵（仅通用群有管理员；客户群/客服群无管理员） */
const permissionRows: { name: string; cells: Cell[] }[] = [
  { name: '发公告', cells: ['yes（客户群/客服群）', 'no', 'no'] },
  { name: '移除成员', cells: ['yes', 'yes（仅通用群）', 'no'] },
  { name: '设置管理员', cells: ['yes（仅通用群）', 'no', 'no'] },
  { name: '修改群名称', cells: ['yes（客户群）', 'no', 'no'] },
  { name: '全员禁言', cells: ['yes（客户群）', 'no', 'no'] },
  { name: '解散群', cells: ['yes', 'no', 'no'] },
  { name: '发言 / 聊天', cells: ['yes', 'yes', 'yes'] },
  { name: '消息免打扰 / 置顶', cells: ['yes', 'yes', 'yes'] },
  { name: '举报', cells: ['yes', 'yes', 'yes'] },
];

function cellClass(cell: Cell): string {
  if (cell === 'yes') return 'cell-yes';
  if (cell === 'no' || String(cell).startsWith('no')) return 'cell-no';
  return 'cell-text';
}
</script>

<style scoped>
.perm-doc { padding: 24px 28px; }
.doc-title { font-size: 18px; font-weight: 700; color: #303133; }
.doc-sub { font-size: 12px; color: #909399; margin: 6px 0 18px; }
.sec-title { font-size: 14px; font-weight: 700; color: #12b76a; margin: 18px 0 8px; padding-left: 2px; }

.perm-table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden; font-size: 13px; }
.perm-table thead th { background: #f0faf5; color: #1f7a53; font-weight: 700; padding: 10px 12px; text-align: center; border: 1px solid #e4e7ed; }
.perm-table .col-feature { text-align: left; font-weight: 600; color: #303133; }
.perm-table tbody td { padding: 9px 12px; text-align: center; border: 1px solid #e4e7ed; color: #606266; }
.perm-table tbody td.col-feature { background: #fafafa; }

.cell-yes { color: #12b76a; font-weight: 700; }
.cell-no { color: #c0c4cc; }
.cell-text { color: #606266; }

.notes { margin-top: 16px; background: #fff; border: 1px solid #e4e7ed; border-radius: 8px; padding: 12px 16px; }
.note-item { font-size: 12px; color: #909399; line-height: 1.9; }
</style>
