import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import TDesign from 'tdesign-vue-next';
import 'tdesign-vue-next/es/style/index.css';
import './assets/design-tokens.css';
import App from './App.vue';
import router from './router';

// 根据环境变量决定使用 Sim 还是 Real 适配器
// VITE_MODE=sim (默认) | VITE_MODE=real
const mode = import.meta.env.VITE_MODE || 'sim';
console.log(`[SAAS Audit Prototype] 运行模式: ${mode}`);

const app = createApp(App);
app.config.errorHandler = (err, instance, info) => {
  console.error('[Vue error]', info, err);
};

// Pinia 状态管理
const pinia = createPinia();
app.use(pinia);

// Vue Router
app.use(router);

// Element Plus UI 组件库（过渡期保留，逐步替换为 tdesign）
app.use(ElementPlus);

// TDesign UI 组件库（全量注册，组件前缀 t-）
app.use(TDesign);

app.mount('#app');
