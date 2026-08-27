<script setup lang="ts">
// 钱包（1:1复刻SaaS线上系统+编号标记改动点）
import { ref } from 'vue'
import ReplicaMarker from '../../../components/replica/ReplicaMarker.vue'

const activeTab = ref('account')
const tableData = ref([
  { "账户类型": "总部", "账户编号": "XN260622000022", "用户信息": "总部", "有效充值金额(元)": "10300.00", "可用金额(元)": "9501.65", "已消耗金额(元)": "698.35", "提现金额（元）": "/", "状态": "启用" },
  { "账户类型": "门店代理人", "账户编号": "XN260818000066", "用户信息": "测试代理/13569636866", "有效充值金额(元)": "0.00", "可用金额(元)": "0.00", "已消耗金额(元)": "0.00", "提现金额（元）": "/", "状态": "启用" },
  { "账户类型": "门店代理人", "账户编号": "XN260622000023", "用户信息": "cc代理/13725369856", "有效充值金额(元)": "500.00", "可用金额(元)": "299.00", "已消耗金额(元)": "0.00", "提现金额（元）": "/", "状态": "启用" },
  { "账户类型": "店长", "账户编号": "XN260821000022", "用户信息": "新新店长/13513500010", "有效充值金额(元)": "0.00", "可用金额(元)": "0.00", "已消耗金额(元)": "0.00", "提现金额（元）": "/", "状态": "启用" },
  { "账户类型": "店长", "账户编号": "XN260819000062", "用户信息": "门店7店长/13513500000", "有效充值金额(元)": "0.00", "可用金额(元)": "0.00", "已消耗金额(元)": "0.00", "提现金额（元）": "/", "状态": "启用" },
  { "账户类型": "讲师", "账户编号": "XN260825000001", "用户信息": "李讲师/138****0005", "有效充值金额(元)": "5000.00", "可用金额(元)": "3000.00", "已消耗金额(元)": "2000.00", "提现金额（元）": "/", "状态": "启用" },
  { "账户类型": "助教", "账户编号": "XN260825000002", "用户信息": "王助教/138****0006", "有效充值金额(元)": "2000.00", "可用金额(元)": "1000.00", "已消耗金额(元)": "1000.00", "提现金额（元）": "/", "状态": "启用" }
])
</script>

<template>
  <div class="wallet-page">
    <!-- 4统计卡（1:1复刻SaaS） -->
    <div class="stat-cards">
      <div class="stat-card">
        <div class="stat-label">有效充值总金额</div>
        <div class="stat-value">11798.00</div>
        <div class="stat-desc">现金账户历史充值总金额 - 扣除金额</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">可用金额</div>
        <div class="stat-value">12071.69</div>
        <div class="stat-desc">现金账户当前可用总金额</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">已消耗金额</div>
        <div class="stat-value">712.08</div>
        <div class="stat-desc">客户领取红包总额</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">已提现金额</div>
        <div class="stat-value">23.01</div>
        <div class="stat-desc">客户提现成功金额和</div>
      </div>
    </div>

    <!-- 4 Tab（1:1复刻SaaS） -->
    <div class="tab-bar">
      <div class="tab-item" :class="{active: activeTab==='account'}" @click="activeTab='account'">账户管理</div>
      <div class="tab-item" :class="{active: activeTab==='recharge'}" @click="activeTab='recharge'">充值/扣除记录</div>
      <div class="tab-item" :class="{active: activeTab==='consume'}" @click="activeTab='consume'">消耗记录</div>
      <div class="tab-item" :class="{active: activeTab==='withdraw'}" @click="activeTab='withdraw'">提现记录</div>
    </div>

    <!-- 筛选区（1:1复刻SaaS） -->
    <div class="filter-section">
      <el-select v-model="accountType" placeholder="账户类型" size="small" style="width:140px">
        <el-option label="全部" value="" />
        <el-option label="总部" value="hq" />
        <el-option label="门店代理人" value="agent" />
        <el-option label="店长" value="manager" />
        <el-option label="店员" value="clerk" />
        <el-option label="讲师" value="lecturer" />
        <el-option label="助教" value="assistant" />
      </el-select>
      <ReplicaMarker :no="1" title="账户类型新增讲师/助教" />
      <ReplicaMarker :no="2" title="讲师/助教钱包业务约束" />
      <el-input v-model="accountNo" placeholder="请输入账户编号" size="small" style="width:160px" />
      <el-input v-model="userInfo" placeholder="请输入用户名称或手机号" size="small" style="width:180px" />
      <el-select v-model="status" placeholder="状态" size="small" style="width:100px">
        <el-option label="全部" value="" />
        <el-option label="启用" value="active" />
        <el-option label="禁用" value="disabled" />
      </el-select>
      <el-button type="primary" size="small">查询</el-button>
      <el-button size="small">重置</el-button>
      <el-button size="small">批量充值</el-button>
      <el-button size="small">批量扣除</el-button>
      <el-button size="small">账户设置</el-button>
    </div>

    <!-- 表格（1:1复刻SaaS 9列） -->
    <div class="table-section">
      <el-table :data="tableData" border style="width:100%" size="small">
        <el-table-column label="账户类型" width="120">
          <template #header>
            账户类型<ReplicaMarker :no="1" title="账户类型新增讲师/助教" />
          </template>
          <template #default="{ row }">
            <span>{{ row['账户类型'] }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="账户编号" label="账户编号" width="150" />
        <el-table-column prop="用户信息" label="用户信息" width="180" />
        <el-table-column prop="有效充值金额(元)" label="有效充值金额(元)" width="140" />
        <el-table-column prop="可用金额(元)" label="可用金额(元)" width="120" />
        <el-table-column prop="已消耗金额(元)" label="已消耗金额(元)" width="130" />
        <el-table-column prop="提现金额（元）" label="提现金额（元）" width="120" />
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <span :style="{color: row['状态']==='启用'?'#0D9488':'#f56c6c'}">{{ row['状态'] }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default>
            <el-button link type="primary" size="small">禁用</el-button>
            <el-button link type="primary" size="small">充值</el-button>
            <el-button link type="primary" size="small">扣除</el-button>
            <el-button link type="primary" size="small">充值/扣除记录</el-button>
            <el-button link type="primary" size="small">消耗记录</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-section">
        <span class="total-text">共{{ tableData.length }}条记录</span>
        <el-pagination layout="prev, pager, next, jumper" :total="tableData.length" :page-size="30" :current-page="1" small />
      </div>
    </div>

    <!-- 下方空白处：改动模态框原型 -->
    <div class="modal-prototypes">
      <div class="modal-section-title">↓ 以下为涉及改动的模态框原型（放在主页面下方空白处）</div>

      <!-- 弹窗①：账户设置（编号⑤）1:1复刻SaaS全局虚拟账户配置 -->
      <div class="modal-box">
        <div class="modal-header">
          <span class="modal-title">弹窗：账户设置</span>
          <ReplicaMarker :no="5" label="编号⑤" />
        </div>
        <div class="modal-body">
          <!-- 开启虚拟账户 -->
          <div class="form-row">
            <span class="form-label">开启虚拟账户：</span>
            <el-switch model-value="true" />
            <span style="font-size:12px;color:#999;margin-left:8px">关闭后，租户下所有账户都不可使用。总部红包，代理红包无法使用。客户提现同步关闭</span>
          </div>
          <!-- 下级红包功能 -->
          <div class="form-row">
            <span class="form-label">下级红包功能：</span>
            <el-switch model-value="true" />
            <span style="font-size:12px;color:#999;margin-left:8px">开启后，观看奖励可以使用下级红包</span>
          </div>
          <!-- 观看奖励扣除配置 -->
          <div class="form-row">
            <span class="form-label">观看奖励扣除配置：</span>
            <div style="font-size:13px;color:#666;line-height:1.8">
              <div>店员的客户领取红包，扣除谁账户的余额 <el-select size="small" style="width:120px" model-value="manager"><el-option label="店长" value="manager" /><el-option label="店员" value="clerk" /></el-select></div>
              <div>店长的客户领取红包，扣除谁账户的余额 <el-select size="small" style="width:120px" model-value="agent"><el-option label="门店代理人" value="agent" /><el-option label="店长" value="manager" /></el-select></div>
            </div>
          </div>
          <!-- 客户提现 -->
          <div class="form-row">
            <span class="form-label">客户提现：</span>
            <el-switch model-value="true" />
            <span style="font-size:12px;color:#999;margin-left:8px">开启后，客户允许提现。未开启的情况下，不显示提现按钮</span>
          </div>
          <!-- 提现规则设置 -->
          <div class="form-row"><span class="form-label">提现规则设置：</span><span style="font-size:12px;color:#999">修改提现规则设置时，需先登录微信商户号后台，申请且修改转账额度</span></div>
          <div class="form-row"><span class="form-label">每日提现次数：</span><el-input-number size="small" :model-value="3" style="width:120px" /> <span style="font-size:13px;color:#666;margin-left:4px">次</span></div>
          <div class="form-row"><span class="form-label">用户单次提现金额范围：</span><el-input size="small" style="width:80px" placeholder="最小" /> <span style="color:#666">~</span> <el-input size="small" style="width:80px" placeholder="最大" /> <span style="font-size:13px;color:#666;margin-left:4px">元</span></div>
          <div class="form-row"><span class="form-label">单用户单日提现额度：</span><el-input size="small" style="width:120px" /> <span style="font-size:13px;color:#666;margin-left:4px">元</span></div>
          <!-- 微信商户配置 -->
          <div class="form-row"><span class="form-label" style="font-weight:600">配置提现微信商户信息：</span></div>
          <div class="form-row"><span class="form-label">商户号：</span><el-input size="small" style="width:240px" /></div>
          <div class="form-row"><span class="form-label">商户API证书：</span><el-button size="small">点击上传</el-button> <span style="font-size:12px;color:#999">apiclient_key.pem</span></div>
          <div class="form-row"><span class="form-label">商户API证书序列号：</span><el-input size="small" style="width:240px" /></div>
          <div class="form-row"><span class="form-label">微信支付公钥：</span><el-button size="small">点击上传</el-button> <span style="font-size:12px;color:#999">pub_key.pem</span></div>
          <div class="form-row"><span class="form-label">微信支付公钥ID：</span><el-input size="small" style="width:240px" /></div>
          <div class="form-row"><span class="form-label">微信支付APIv3密钥：</span><el-input size="small" style="width:240px" /></div>
        </div>
        <div class="modal-footer">
          <el-button size="small">取消</el-button>
          <el-button type="primary" size="small">保存</el-button>
        </div>
      </div>

      <!-- 弹窗②：账户充值（编号③）1:1复刻SaaS -->
      <div class="modal-box">
        <div class="modal-header">
          <span class="modal-title">弹窗：账户充值</span>
          <ReplicaMarker :no="3" label="编号③" />
        </div>
        <div class="modal-body">
          <div class="form-row"><span class="form-label">账户类型：</span><span style="color:#666;font-size:13px">总部</span></div>
          <div class="form-row"><span class="form-label">账户ID：</span><span style="color:#666;font-size:13px">XN260622000022</span></div>
          <div class="form-row"><span class="form-label">用户信息：</span><span style="color:#666;font-size:13px">总部</span></div>
          <div class="form-row"><span class="form-label">可用余额：</span><span style="color:#666;font-size:13px">9501.65元</span></div>
          <div class="form-row"><span class="form-label">充值金额：</span><el-input placeholder="请输入金额" size="small" style="width:200px" /> <span style="font-size:13px;color:#666">元</span></div>
          <div class="form-row"><span class="form-label">手机号：</span><span style="color:#666;font-size:13px">135****0001</span></div>
          <div class="form-row">
            <span class="form-label">验证码：</span>
            <el-input placeholder="请输入验证码" size="small" style="width:140px" />
            <el-button size="small">获取验证码</el-button>
          </div>
          <div class="form-row">
            <span class="form-label">充值账户类型：</span>
            <el-select placeholder="全部" size="small" style="width:200px">
              <el-option label="全部" value="" />
              <el-option label="代理" value="agent" />
              <el-option label="店长" value="manager" />
              <el-option label="讲师" value="lecturer" />
              <el-option label="助教" value="assistant" />
            </el-select>
            <ReplicaMarker :no="3" title="充值账户类型新增讲师/助教" />
          </div>
        </div>
        <div class="modal-footer">
          <el-button size="small">取消</el-button>
          <el-button type="primary" size="small">确认充值</el-button>
        </div>
      </div>

      <!-- 弹窗③：批量扣除（编号④） -->
      <div class="modal-box">
        <div class="modal-header">
          <span class="modal-title">弹窗：账户扣除</span>
          <ReplicaMarker :no="4" label="编号④" />
        </div>
        <div class="modal-body">
          <div class="form-row"><span class="form-label">账户类型：</span><span style="color:#666;font-size:13px">总部</span></div>
          <div class="form-row"><span class="form-label">账户ID：</span><span style="color:#666;font-size:13px">XN260622000022</span></div>
          <div class="form-row"><span class="form-label">用户信息：</span><span style="color:#666;font-size:13px">总部</span></div>
          <div class="form-row"><span class="form-label">可用余额：</span><span style="color:#666;font-size:13px">9501.65元</span></div>
          <div class="form-row"><span class="form-label">扣除金额：</span><el-input placeholder="请输入金额" size="small" style="width:200px" /> <span style="font-size:13px;color:#666">元</span></div>
          <div class="form-row"><span class="form-label">剩余可用余额：</span><span style="color:#666;font-size:13px">9501.65元</span></div>
          <div class="form-row"><span class="form-label">手机号：</span><span style="color:#666;font-size:13px">135****0001</span></div>
          <div class="form-row">
            <span class="form-label">验证码：</span>
            <el-input placeholder="请输入验证码" size="small" style="width:140px" />
            <el-button size="small">获取验证码</el-button>
          </div>
          <div class="form-row">
            <span class="form-label">扣除账户类型：</span>
            <el-select placeholder="全部" size="small" style="width:200px">
              <el-option label="全部" value="" />
              <el-option label="代理" value="agent" />
              <el-option label="店长" value="manager" />
              <el-option label="讲师" value="lecturer" />
              <el-option label="助教" value="assistant" />
            </el-select>
            <ReplicaMarker :no="4" title="扣除账户类型新增讲师/助教" />
          </div>
        </div>
        <div class="modal-footer">
          <el-button size="small">取消</el-button>
          <el-button type="primary" size="small">确认扣除</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  data() {
    return { accountType: '', accountNo: '', userInfo: '', status: '' }
  }
})
</script>

<style scoped>
.wallet-page { background: #fff; border-radius: 4px; padding: 16px; }
.stat-cards { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; margin-bottom: 16px; }
.stat-card { background: #fff; border: 1px solid #eee; border-radius: 4px; padding: 16px; text-align: center; }
.stat-label { font-size: 13px; color: #666; margin-bottom: 8px; }
.stat-value { font-size: 24px; font-weight: 600; color: #25C7A5; margin-bottom: 4px; }
.stat-desc { font-size: 11px; color: #999; }
.tab-bar { display: flex; gap: 24px; border-bottom: 2px solid #eee; margin-bottom: 16px; }
.tab-item { padding: 8px 0; font-size: 14px; color: #666; cursor: pointer; border-bottom: 2px solid transparent; }
.tab-item.active { color: #25C7A5; border-bottom-color: #25C7A5; font-weight: 600; }
.filter-section { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-bottom: 16px; padding: 16px; background: #fafafa; border-radius: 4px; }
.table-section { background: #fff; }
.pagination-section { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; }
.total-text { font-size: 13px; color: #666; }
.modal-prototypes { margin-top: 24px; padding-top: 16px; border-top: 2px dashed #ddd; }
.modal-section-title { font-size: 13px; color: #909399; margin-bottom: 12px; font-style: italic; }
.modal-box { background: #fff; border: 1px solid #d9d9d9; border-radius: 6px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); margin-bottom: 16px; max-width: 500px; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid #f0f0f0; background: #fafafa; border-radius: 6px 6px 0 0; }
.modal-title { font-size: 14px; font-weight: 600; color: #333; }
.modal-no { font-size: 12px; color: #f56c6c; background: #fff5f5; padding: 2px 8px; border-radius: 2px; }
.modal-body { padding: 16px; }
.form-row { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.form-label { font-size: 13px; color: #666; min-width: 110px; text-align: right; }
.modal-footer { padding: 12px 16px; border-top: 1px solid #f0f0f0; display: flex; justify-content: flex-end; gap: 8px; }
</style>
