// 静态托管 SPA fallback：复制 index.html 为 404.html
// 适用 GitHub Pages / Netlify（hash 路由下作为双保险）
// 同时生成 .nojekyll：禁用 GitHub Pages 的 Jekyll 处理，否则 _ 开头的构建产物（如 _plugin-vue_export-helper.js）会被忽略而 404
import { copyFileSync, existsSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, '../dist');
const indexHtml = resolve(distDir, 'index.html');
const fallback = resolve(distDir, '404.html');

if (existsSync(indexHtml)) {
  copyFileSync(indexHtml, fallback);
  console.log('[postbuild] 404.html 复制完成');
} else {
  console.warn('[postbuild] 未找到 dist/index.html，跳过');
}

writeFileSync(resolve(distDir, '.nojekyll'), '');
console.log('[postbuild] .nojekyll 已生成（禁用 Jekyll）');
