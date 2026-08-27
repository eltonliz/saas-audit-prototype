<template>
  <div class="page">
    <div class="profile-header"><div class="avatar"><EmojiIcon emoji="👨‍🏫" :size="36" /></div><div class="name">张三</div><div class="role">讲师 · 已认证</div></div>
    <div class="stats-row"><div class="stat"><div class="num">128</div><div class="label">累计直播</div></div><div class="stat"><div class="num">98.5%</div><div class="label">好评率</div></div><div class="stat"><div class="num">3</div><div class="label">课程数</div></div></div>
    <div class="menu">
      <div class="menu-item" @click="$router.push('/app/lecturer/workbench')"><EmojiIcon emoji="🛠️" :size="18" /> 工作台</div>
      <div class="menu-item" @click="$router.push('/app/lecturer/courses')"><EmojiIcon emoji="📖" :size="18" /> 我的课程</div>
      <div class="menu-item" @click="$router.push('/app/lecturer/live')"><EmojiIcon emoji="📺" :size="18" /> 直播管理</div>
      <div class="menu-item" @click="$router.push('/app/lecturer/income')"><EmojiIcon emoji="💰" :size="18" /> 分成收入</div>
      <div class="menu-item" @click="noop"><EmojiIcon emoji="✍️" :size="18" /> 编辑资料</div>
      <div class="menu-item" @click="noop"><EmojiIcon emoji="⚙️" :size="18" /> 设置</div>
      <div class="menu-item logout" @click="noop"><EmojiIcon emoji="🚪" :size="18" /> 退出登录</div>
    </div>
  </div>
</template>
<script setup lang="ts">
import EmojiIcon from './EmojiIcon.vue';
function noop() {}
</script>
<style scoped>
.page { padding: 16px; padding-bottom: 80px; max-width: 375px; margin: 0 auto; }
.profile-header { text-align: center; padding: 30px; background: linear-gradient(135deg, #722ED1, #1890FF); border-radius: 16px; color: #fff; margin-bottom: 16px; }
.avatar { width: 72px; height: 72px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px; }
.name { font-size: 20px; font-weight: 700; }
.role { font-size: 13px; opacity: 0.8; margin-top: 4px; }
.stats-row { display: flex; gap: 10px; margin-bottom: 16px; }
.stat { flex: 1; text-align: center; padding: 14px; background: #fff; border-radius: 12px; }
.num { font-size: 20px; font-weight: 700; color: #722ED1; }
.label { font-size: 11px; color: #667085; }
.menu { background: #fff; border-radius: 12px; overflow: hidden; }
.menu-item { padding: 16px; border-bottom: 1px solid #F9FAFB; font-size: 15px; cursor: pointer; display: flex; align-items: center; gap: 8px; }
.menu-item:last-child { border: none; }
.menu-item.logout { color: #F04438; }
</style>
