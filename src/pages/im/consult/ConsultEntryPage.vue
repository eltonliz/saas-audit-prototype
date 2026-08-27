<template>
  <!-- PG-IM-019 商品详情（联系客服入口演示；v3.0：主动咨询才建一对一客服群，D11） -->
  <div class="consult-entry">
    <div class="body">
      <!-- 商品图集 -->
      <div class="gallery">
        <span class="back-circle" @click="goBack"><el-icon :size="16"><ArrowLeft /></el-icon></span>
        <div class="main-img">商品主图</div>
        <span class="gallery-badge">图集 1/2</span>
      </div>
      <div class="promo-banner">百岁山矿泉水348ml*12瓶</div>
      <div class="thumbs">
        <div class="thumb active" />
        <div class="thumb" />
      </div>

      <!-- 价格与标题 -->
      <div class="price-row">
        <span class="price"><span class="yen">¥</span>19<span class="fen">.90</span></span>
        <span class="sold">已售0</span>
      </div>
      <div class="goods-title">百岁山天然矿泉水办公会议饮用水348ml*24瓶整箱旗舰店同款小瓶L</div>

      <!-- 规格与物流 -->
      <div class="spec-row">
        <span class="spec-label">选择</span>
        <span class="spec-value">1箱</span>
        <el-icon class="spec-arrow" :size="14"><ArrowRight /></el-icon>
      </div>
      <div class="spec-row">
        <span class="spec-label">物流</span>
        <span class="spec-value">快递</span>
      </div>

      <!-- 订单详情入口（演示） -->
      <div class="demo-card">
        <div class="dc-tag">订单详情页</div>
        <div class="dc-title">订单 OD20260815003</div>
        <div class="dc-meta">南山门店 · 已完成</div>
        <button class="cs-btn" @click="consult('order')">
          <el-icon :size="14"><Service /></el-icon> 联系客服
        </button>
      </div>

      <div class="rule">
        商品详情页底部「客服」或订单详情页「联系客服」→ 若已有与该门店归属服务者的一对一客服群则直接进入，否则创建（群主=归属服务者，成员=客户+归属服务者）。仅在咨询时建群，不会因绑定或导入产生群。
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="bottom-bar">
      <div class="bar-item" @click="placeholder('店铺')">
        <el-icon :size="20"><Shop /></el-icon>
        <span>店铺</span>
      </div>
      <div class="bar-item cs" @click="consult('goods')">
        <el-icon :size="20"><Service /></el-icon>
        <span>客服</span>
      </div>
      <button class="buy-btn" @click="placeholder('立即购买')">立即购买</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { ArrowLeft, ArrowRight, Service, Shop } from '@element-plus/icons-vue';
import { startConsult } from '../../../services/im-group-orchestrator';
import { useImAccountStore } from '../../../stores/im-account-store';

const route = useRoute();
const router = useRouter();
const account = useImAccountStore();

function goBack() {
  router.push({ path: '/h5/im/message', query: route.query });
}

/** 商城域功能占位（本页仅演示客服触发链路） */
function placeholder(name: string) {
  ElMessage.info(`「${name}」属商城域功能，请前往商城操作`);
}

/** 主动咨询 → 一对一客服群（幂等直达/新建，群主=归属服务者）
 *  商品咨询：商品详情页进入客服群时带入商品横幅（按截图风格顶栏展示+发送商品）
 *  订单咨询：进入客服群后可查看订单/售后记录 */
async function consult(from: 'goods' | 'order') {
  const customerId = account.activeUserId;
  const r = await startConsult(customerId, 'store-1');
  if (!r.ok) {
    ElMessage.error(`建群失败：${r.reason}`);
    return;
  }
  ElMessage.success(r.reused ? '已有客服群，直达会话' : `已创建客服群（${from === 'goods' ? '商品' : '订单'}咨询）`);
  // 商品咨询带入商品ID（ChatPage 会从 getStoreProducts 查出商品展示为横幅）
  const query: Record<string, string> = { ...route.query };
  if (from === 'goods') query.productId = 'P001';
  router.push({ path: `/h5/im/chat/${r.group.group_id}`, query });
}
</script>

<style scoped>
.consult-entry { display: flex; flex-direction: column; height: 100%; background: #F5F7FA; }
.body { flex: 1; overflow-y: auto; }

/* 图集 */
.gallery { position: relative; background: #EAF2FB; height: 300px; display: flex; align-items: center; justify-content: center; }
.main-img { font-size: 13px; color: #8C8C8C; border: 1px dashed #C0C4CC; border-radius: 8px; padding: 24px 20px; background: rgba(255,255,255,0.6); }
.back-circle { position: absolute; top: 12px; left: 12px; width: 30px; height: 30px; border-radius: 50%; background: rgba(0,0,0,0.35); color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 2; }
.gallery-badge { position: absolute; right: 12px; bottom: 10px; font-size: 11px; color: #fff; background: rgba(0,0,0,0.55); border-radius: 10px; padding: 2px 8px; }
.promo-banner { background: #7B5AA6; color: #fff; font-size: 17px; font-weight: 700; padding: 12px 16px; letter-spacing: 1px; }
.thumbs { display: flex; gap: 8px; padding: 10px 16px; background: #fff; }
.thumb { width: 44px; height: 44px; border-radius: 6px; background: #EAF2FB; border: 1px solid #E4E7ED; }
.thumb.active { border-color: #12B76A; }

/* 价格与标题 */
.price-row { display: flex; align-items: baseline; justify-content: space-between; padding: 12px 16px 4px; background: #fff; }
.price { color: #F53F3F; font-size: 24px; font-weight: 700; }
.yen { font-size: 14px; margin-right: 1px; }
.fen { font-size: 15px; }
.sold { font-size: 12px; color: #8C8C8C; }
.goods-title { background: #fff; padding: 6px 16px 14px; font-size: 15px; font-weight: 600; line-height: 1.5; }

/* 规格与物流 */
.spec-row { display: flex; align-items: center; gap: 10px; background: #fff; padding: 12px 16px; border-top: 1px solid #F7F7F7; }
.spec-label { font-size: 13px; color: #8C8C8C; width: 30px; }
.spec-value { font-size: 14px; flex: 1; }
.spec-arrow { color: #C0C4CC; }

/* 订单入口演示卡 */
.demo-card { margin: 12px 16px 0; background: #fff; border-radius: 12px; padding: 14px 16px; }
.dc-tag { display: inline-block; font-size: 10px; color: #1890FF; background: #E8F3FF; border-radius: 3px; padding: 1px 6px; }
.dc-title { font-size: 15px; font-weight: 600; margin-top: 8px; }
.dc-meta { font-size: 12px; color: #8C8C8C; margin-top: 2px; }
.cs-btn { margin-top: 10px; display: inline-flex; align-items: center; gap: 4px; font-size: 13px; color: #12B76A; background: #E7F8F0; border: none; border-radius: 16px; padding: 6px 14px; cursor: pointer; }
.rule { margin: 16px; font-size: 11px; color: #BFBFBF; line-height: 1.8; }

/* 底部操作栏 */
.bottom-bar { flex-shrink: 0; display: flex; align-items: center; gap: 4px; background: #fff; border-top: 1px solid #F0F0F0; padding: 6px 12px calc(6px + env(safe-area-inset-bottom)); }
.bar-item { display: flex; flex-direction: column; align-items: center; gap: 1px; font-size: 11px; color: #606266; padding: 2px 10px; cursor: pointer; }
.bar-item.cs { color: #12B76A; }
.buy-btn { flex: 1; margin-left: 8px; background: #12B76A; color: #fff; border: none; border-radius: 22px; padding: 11px 0; font-size: 16px; font-weight: 600; cursor: pointer; }
</style>
