<template>
  <!-- SaaS-Class 课程与营期域 · 四端入口门户（三端 APP + PC 后台） -->
  <div class="portal">
    <header class="hero">
      <h1>SaaS-Class 课程与营期原型</h1>
    </header>

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
.hero { text-align: center; margin-bottom: 40px; }
.hero h1 { font-size: 28px; margin: 0; color: #303133; }

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
