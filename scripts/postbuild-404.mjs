// 静态托管 SPA fallback：复制 index.html 为 404.html
// 适用 GitHub Pages / Netlify（hash 路由下作为双保险）
import { copyFileSync, existsSync } from 'node:fs';
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
