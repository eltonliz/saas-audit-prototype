import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// 部署到 GitHub Pages / Vercel / Netlify / Gitee Pages 等静态托管：
//  base 用相对路径 './'，适配任意子目录与自定义域
//  router 切换为 hash 模式（#/xxx），彻底避免静态托管刷新子路由 404
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 2000,
  },
  server: {
    port: 5174,
    open: true,
  },
})
