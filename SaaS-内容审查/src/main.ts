import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import App from './App.vue';
import router from './router';
import { registerStaticMode } from '@/handoff/static-mode';

// 记录动态原型入口来源（ProtoViewerShell.openLive 写入 ?from=proto&node=...）
// 供 ProtoReturnButton 在内页跳转丢失 query 后仍保持显示
try {
  const hash = window.location.hash;
  const qs = hash.includes('?') ? hash.split('?')[1] : '';
  const params = new URLSearchParams(qs);
  if (params.get('from') === 'proto') {
    sessionStorage.setItem('saas-from-proto', '1');
    const node = params.get('node');
    if (node) sessionStorage.setItem('saas-from-proto-node', node);
  }
} catch { /* ignore */ }

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(ElementPlus);
registerStaticMode(app);
app.mount('#app');
