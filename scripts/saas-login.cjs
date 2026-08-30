// SaaS 后台自动登录 + 菜单全量截图（业务普查）
const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const b = await chromium.launch({ headless: true });
  const ctx = await b.newContext({ viewport: { width: 1600, height: 900 }, ignoreHTTPSErrors: true });
  const p = await ctx.newPage();
  const OUT = '/tmp/saas-survey';
  fs.mkdirSync(OUT, { recursive: true });

  await p.goto('https://saas-tenant.ryrkxn.cn/#/tenant/login', { waitUntil: 'networkidle' });
  await p.getByPlaceholder('请输入手机号').fill('13300000000');
  await p.getByPlaceholder('请输入验证码').fill('1502');
  // 勾选协议：页面内 DOM 直接点击
  const checked = await p.evaluate(() => {
    const cbs = document.querySelectorAll('input[type="checkbox"]');
    for (const c of cbs) { c.click(); if (c.checked) return true; }
    // 兜底：找 TDesign 勾选图标元素
    const icons = document.querySelectorAll('[class*="checkbox"]');
    for (const c of icons) { c.dispatchEvent(new MouseEvent('click', { bubbles: true })); }
    return false;
  });
  console.log('checked:', checked);
  await p.waitForTimeout(400);
  const loginBtn = await p.getByRole('button', { name: '登录' }).first().boundingBox();
  if (loginBtn) { await p.mouse.click(loginBtn.x + loginBtn.width / 2, loginBtn.y + loginBtn.height / 2); }
  await p.waitForTimeout(4500);
  console.log('URL1:', p.url());
  console.log('BODY1:', (await p.innerText('body')).slice(0, 160).replace(/\n/g, '|'));

  // 项目选择：展开「互联网」分组 → 进入 hhh 项目
  await p.waitForTimeout(800);
  try { await p.click('text=互联网 (7项目)'); await p.waitForTimeout(1200); } catch (e) {}
  try { const h = await p.$('text=hhh'); if (h) { await h.click(); await p.waitForTimeout(2000); } } catch (e) {}
  console.log('URL2:', p.url());
  console.log('P2:', (await p.innerText('body')).slice(0, 300).replace(/\n/g, '|'));
  // 找“进入/工作台”按钮
  for (const t of ['进入', '进入系统', '工作台', '进入项目']) {
    try { const e2 = await p.$('text=' + t); if (e2) { await e2.click(); await p.waitForTimeout(3000); break; } } catch (e) {}
  }
  console.log('URL3:', p.url());
  await p.waitForTimeout(2500);
  await p.screenshot({ path: OUT + '/00-home.png', fullPage: false });
  // 输出侧边栏菜单全量文本
  const menuText = await p.evaluate(() => {
    const els = [...document.querySelectorAll('[class*="menu"] li, [class*="menu"] a, [class*="submenu"]')];
    return els.map(e => e.innerText.trim()).filter(t => t && t.length < 20).join('\n');
  });
  fs.writeFileSync(OUT + '/menu.txt', menuText);
  console.log('MENU:', menuText.slice(0, 600).replace(/\n/g, '|'));
  await b.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
