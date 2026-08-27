<template>
  <!-- PG-IM-002 通讯录主页 -->
  <div class="contacts-page">
    <div class="search-box" @click="$router.push('/h5/im/search')">
      <span class="search-placeholder">🔍 请输入您要搜索的关键字</span>
    </div>

    <div class="entry-list">
      <div class="entry" @click="$router.push({ path: '/h5/im/friend-requests', query: route.query })">
        <span class="icon green"><el-icon :size="20" color="#fff"><UserFilled /></el-icon></span>
        <span class="label">新的朋友</span>
        <em v-if="friendStore.pendingCount > 0" class="badge">{{ friendStore.pendingCount }}</em>
      </div>
      <div class="entry" @click="$router.push({ path: '/h5/im/groups', query: route.query })">
        <span class="icon blue"><el-icon :size="20" color="#fff"><ChatLineRound /></el-icon></span>
        <span class="label">我的群聊</span>
      </div>
      <div class="entry" @click="blacklistVisible = true">
        <span class="icon red"><el-icon :size="20" color="#fff"><CircleCloseFilled /></el-icon></span>
        <span class="label">黑名单</span>
        <em v-if="friendStore.blacklist.length > 0" class="badge gray">{{ friendStore.blacklist.length }}</em>
      </div>
    </div>

    <div v-if="friendStore.friends.length === 0" class="empty">
      <div class="empty-text">暂无好友，添加好友开始沟通</div>
      <button class="primary-btn" @click="$router.push('/h5/im/friend/add')">添加好友</button>
    </div>

    <template v-for="[letter, rels] in friendStore.friendsGrouped" :key="letter">
      <div class="letter-title">{{ letter }}</div>
      <div
        v-for="rel in rels"
        :key="rel.relation_id"
        class="friend-item"
        @click="openFriend(rel)"
      >
        <div class="avatar">{{ displayName(rel).slice(0, 1) }}</div>
        <span class="name">{{ displayName(rel) }}</span>
      </div>
    </template>
  </div>

  <!-- 黑名单列表弹层（BR-IM-008a：展示当前账号已拉黑的好友） -->
  <div v-if="blacklistVisible" class="modal-mask" @click.self="blacklistVisible = false">
    <div class="modal">
      <div class="modal-title">黑名单（{{ friendStore.blacklist.length }}）</div>
      <div v-if="friendStore.blacklist.length === 0" class="empty-text">暂无已拉黑的好友</div>
      <div v-else class="blk-list">
        <div v-for="r in friendStore.blacklist" :key="r.relation_id" class="blk-item">
          <div class="blk-avatar">{{ blacklistNameOf(r).slice(0, 1) }}</div>
          <div class="blk-body">
            <div class="blk-name">{{ blacklistNameOf(r) }}</div>
            <div class="blk-scope" :class="{ admin: r.block_scope === 'to_admin' }">
              {{ r.block_scope === 'to_admin' ? '已同步后台黑名单' : '仅好友关系' }}
            </div>
          </div>
          <button class="blk-unblock" @click="unblock(r.relation_id)">移出黑名单</button>
        </div>
      </div>
      <div class="modal-actions">
        <button class="btn primary full" @click="blacklistVisible = false">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { UserFilled, ChatLineRound, CircleCloseFilled } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { useImFriendStore } from '../../../stores/im-friend-store';
import type { ImFriendRelation } from '../../../contracts/schemas/im-schemas';
import { getUser } from '../../../adapters/sim/im-sim-adapter';
import { useImAccountStore } from '../../../stores/im-account-store';

const route = useRoute();
const router = useRouter();
const friendStore = useImFriendStore();
const account = useImAccountStore();
const blacklistVisible = ref(false);

/** 静态展示：initialTab=blacklist 时直接打开黑名单弹层 */
const props = withDefaults(defineProps<{ initialTab?: 'list' | 'blacklist' }>(), { initialTab: 'list' });
if (props.initialTab === 'blacklist') blacklistVisible.value = true;

function displayName(rel: ImFriendRelation) {
  const uid = rel.from_user === account.activeUserId ? rel.to_user : rel.from_user;
  return rel.remark || getUser(uid)?.nickname || uid;
}

function openFriend(rel: ImFriendRelation) {
  const uid = rel.from_user === account.activeUserId ? rel.to_user : rel.from_user;
  router.push(`/h5/im/friend/${uid}`);
}

function blacklistNameOf(r: ImFriendRelation) {
  const uid = r.from_user === account.activeUserId ? r.to_user : r.from_user;
  return r.remark || getUser(uid)?.nickname || uid;
}

function unblock(relationId: string) {
  friendStore.toggleBlock(relationId);
  ElMessage.success('已移出黑名单');
}
</script>

<style scoped>
.search-box { margin: 8px 16px; background: #fff; border: 1px solid #12B76A; border-radius: 8px; padding: 8px 12px; cursor: pointer; }
.search-placeholder { font-size: 13px; color: #8C8C8C; }
.entry-list { background: #fff; margin-top: 8px; }
.entry { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-bottom: 1px solid #F0F0F0; cursor: pointer; }
.icon { width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; color: #fff; }
.icon.green { background: #12B76A; }
.icon.blue { background: #1890FF; }
.icon.red { background: #F5222D; }
.label { font-size: 15px; }
.badge { margin-left: auto; background: #F5222D; color: #fff; font-size: 10px; font-style: normal; border-radius: 8px; padding: 0 5px; line-height: 14px; }
.badge.gray { background: #8C8C8C; }
.letter-title { padding: 6px 16px; font-size: 12px; color: #8C8C8C; background: #F5F7FA; }
.friend-item { display: flex; align-items: center; gap: 12px; padding: 10px 16px; background: #fff; border-bottom: 1px solid #F7F7F7; cursor: pointer; }
.avatar { width: 40px; height: 40px; border-radius: 50%; background: #12B76A; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 15px; }
.name { font-size: 15px; }
.empty { padding: 60px 0; text-align: center; }
.empty-text { font-size: 13px; color: #8C8C8C; margin-bottom: 12px; }
.primary-btn { background: #12B76A; color: #fff; border: none; border-radius: 6px; padding: 8px 24px; font-size: 14px; cursor: pointer; }

/* 黑名单弹层 */
.modal-mask { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: #fff; border-radius: 12px; width: 320px; max-width: 92vw; padding: 20px; max-height: 80vh; overflow-y: auto; }
.modal-title { font-size: 16px; font-weight: 600; text-align: center; margin-bottom: 14px; }
.blk-list { max-height: 50vh; overflow-y: auto; }
.blk-item { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #F5F5F5; }
.blk-avatar { width: 36px; height: 36px; border-radius: 50%; background: #F5222D; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; }
.blk-body { flex: 1; min-width: 0; }
.blk-name { font-size: 14px; }
.blk-scope { font-size: 11px; color: #8C8C8C; margin-top: 2px; }
.blk-scope.admin { color: #F5222D; }
.blk-unblock { background: none; border: 1px solid #12B76A; color: #12B76A; border-radius: 14px; padding: 4px 10px; font-size: 12px; cursor: pointer; flex-shrink: 0; }
.modal-actions { margin-top: 16px; }
.btn { border: 1px solid #E4E7ED; background: #fff; border-radius: 8px; padding: 8px 0; font-size: 14px; cursor: pointer; }
.btn.primary { background: #12B76A; color: #fff; border-color: #12B76A; }
.btn.full { width: 100%; }
</style>
