<template>
  <!-- SaaS-Class 课程与营期域 · 四端入口门户（三端 APP + PC 后台） -->
  <div class="portal">
    <header class="hero">
      <h1>SaaS-Class 课程与营期原型</h1>
    </header>

    <!-- 业务逻辑总览入口（V2·0831：五类图汇总） -->
    <router-link to="/business-logic" class="logic-entry">
      <span class="le-icon">🧭</span>
      <span class="le-text"><b>业务逻辑总览 · 五类图</b><small>业务流程 / 状态机 / 激励触发 / 数据流转 / 系统上下文</small></span>
      <span class="le-go">查看 →</span>
    </router-link>

    <section class="role-entries">
      <div class="entries-grid">
        <button class="role-entry student" @click="enterRole('student')">
          <div class="entry-icon">🎓</div>
          <div class="entry-name">学员端</div>
        </button>
        <router-link to="/tenant/course/courses" class="role-entry pc">
          <div class="entry-icon">📊</div>
          <div class="entry-name">PC 后台</div>
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();
function enterRole(role: 'student' | 'lecturer' | 'assistant') {
  localStorage.setItem('app-role', role);
  const home = { student: '/app/student/home', lecturer: '/app/lecturer/workbench', assistant: '/app/assistant/workbench' }[role];
  router.push(home);
}
</script>

<style scoped>
.portal { max-width: 860px; margin: 0 auto; padding: 64px 24px; }
.hero { text-align: center; margin-bottom: 24px; }
.hero h1 { font-size: 28px; margin: 0; color: #303133; }
.logic-entry {
  display: flex; align-items: center; gap: 14px; margin-bottom: 28px;
  padding: 16px 20px; background: linear-gradient(90deg, #F0F7FF, #F6FEF9);
  border: 1px solid #B2DDFF; border-radius: 12px; text-decoration: none; transition: all 0.2s;
}
.logic-entry:hover { box-shadow: 0 4px 12px rgba(46, 144, 250, 0.15); transform: translateY(-1px); }
.logic-entry .le-icon { font-size: 26px; }
.logic-entry .le-text { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.logic-entry .le-text b { font-size: 15px; color: #1F2C3E; }
.logic-entry .le-text small { font-size: 12px; color: #667085; }
.logic-entry .le-go { font-size: 13px; color: #2E90FA; font-weight: 600; }

.entries-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
@media (max-width: 720px) { .entries-grid { grid-template-columns: repeat(2, 1fr); } }
.role-entry {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 10px; min-height: 150px; padding: 26px 16px;
  background: #fff; border: 1px solid #E4E7ED; border-radius: 12px;
  cursor: pointer; transition: all 0.2s; text-decoration: none; color: inherit;
}
.role-entry:hover { border-color: #3B82F6; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.12); transform: translateY(-2px); }
.role-entry .entry-icon { font-size: 36px; }
.role-entry .entry-name { font-size: 16px; font-weight: 700; color: #303133; }
.role-entry.student { border-top: 3px solid #12B76A; }
.role-entry.pc { border-top: 3px solid #F79009; }
</style>
