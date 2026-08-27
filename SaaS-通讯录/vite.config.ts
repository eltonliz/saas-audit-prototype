import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

// 独立通讯录原型：@ 指向父工程 src，仅装载通讯录依赖链
// base './'：GitHub Pages 子路径部署（https://eltonliz.github.io/saas-im-proto/）资源相对加载
export default defineConfig({
  plugins: [vue()],
  base: './',
  resolve: {
    alias: {
      '@': resolve(__dirname, '../src'),
    },
  },
  server: {
    port: 5177,
  },
});
