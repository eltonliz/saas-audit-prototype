<template>
  <!-- 学员端单屏预览（V2·D2-2 已去掉讲师/助教角色，原三屏联动收敛为学员单屏） -->
  <div class="tri-screen">
    <div class="grid-header">
      <span class="back" @click="$router.back()">←</span>
      <div class="title-wrap">
        <div class="title">学员端 · 课程与营期域</div>
        <div class="sub">课程与营期学员视角预览，点击底部 Tab 可在端内切换页面</div>
      </div>
      <button class="back-portal" @click="$router.push('/')">返回门户</button>
    </div>

    <div class="grid-body">
      <div v-for="p in panels" :key="p.role" class="phone-frame">
        <div class="frame-title" :style="{ background: p.color }">{{ p.label }}</div>
        <iframe
          class="frame-body"
          :src="frameSrc(p.path, p.role)"
          :title="p.label"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
type Role = 'student';

// V2·D2-2：讲师/助教端已下线，仅保留学员端
const panels: { role: Role; label: string; path: string; color: string }[] = [
  { role: 'student', label: '学员端', path: '/app/student/home', color: '#12B76A' },
];

function frameSrc(path: string, role: string) {
  // hash 路由部署（GitHub Pages 子应用）时 iframe 必须走 #/ 路径，否则 404
  if (location.hash.startsWith('#/')) {
    const base = location.pathname.endsWith('/') ? location.pathname.slice(0, -1) : location.pathname;
    return `${base}#${path}?embed=1&role=${role}`;
  }
  return `${path}?embed=1&role=${role}`;
}
</script>

<style scoped>
.tri-screen { display: flex; flex-direction: column; height: 100vh; background: #D8DEE6; }
.grid-header { display: flex; align-items: center; gap: 12px; padding: 12px 20px; background: #fff; border-bottom: 1px solid #E4E7ED; }
.back { font-size: 18px; cursor: pointer; flex-shrink: 0; }
.back-portal { margin-left: auto; flex-shrink: 0; background: #fff; color: #12B76A; border: 1px solid #12B76A; border-radius: 16px; padding: 6px 14px; font-size: 12px; cursor: pointer; }
.title { font-size: 16px; font-weight: 600; }
.sub { font-size: 12px; color: #8C8C8C; margin-top: 2px; }
.grid-body { flex: 1; display: flex; gap: 24px; padding: 20px 24px; overflow-x: auto; }
.phone-frame { flex: 1 0 400px; min-width: 380px; display: flex; flex-direction: column; background: #fff; border-radius: 20px; overflow: hidden; box-shadow: 0 6px 20px rgba(0,0,0,0.14); }
.frame-title { padding: 10px 0; text-align: center; color: #fff; font-size: 14px; font-weight: 600; flex-shrink: 0; }
.frame-body { flex: 1; border: none; background: #F5F7FA; }
</style>
