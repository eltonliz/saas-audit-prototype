import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

// 独立内容审查原型：@ 指向父工程 src，仅装载内容审查依赖链
// base './'：GitHub Pages 子路径部署（https://eltonliz.github.io/<repo>/）资源相对加载
export default defineConfig({
  plugins: [vue()],
  base: './',
  resolve: {
    alias: {
      '@': resolve(__dirname, '../src'),
    },
  },
  server: {
    port: 5176,
  },
});
