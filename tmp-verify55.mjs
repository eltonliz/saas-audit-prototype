import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1600, height: 950 } });
const errors = [];
page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
page.on('console', m => { if (m.type() === 'error' && !m.text().includes('favicon')) errors.push('CONSOLE: ' + m.text()); });

await page.goto('http://127.0.0.1:8890/member-report-prototype.html');
await page.waitForTimeout(900);

// 1. 一级菜单导航（Tab 条已删）
console.log('tabs bar left:', await page.evaluate(() => document.querySelectorAll('.tabs[role=tablist]').length),
  '| nav pages:', await page.evaluate(() => document.querySelectorAll('.nav-item[data-page]').length));
for (const t of ['store','live','product','customer','course','staff','manager','tenant']) {
  await page.click(`.nav-item[data-page="${t}"]`);
  await page.waitForTimeout(180);
  const ok = await page.evaluate(k => document.getElementById('pane-' + k).classList.contains('active'), t);
  if (!ok) console.log('nav', t, 'FAIL');
}
console.log('all nav pages OK | title:', await page.evaluate(() => document.getElementById('pageTitle').textContent));

// 2. 汇总行数量
const tots = await page.evaluate(() => document.querySelectorAll('tr.tot').length);
console.log('total summary rows:', tots);

// 3. 课程与营期报表
await page.click('.nav-item[data-page="course"]');
await page.waitForTimeout(250);
const courseBits = await page.evaluate(() => ({
  campKpi: document.querySelectorAll('#pane-course .a-kpi, #pane-course .grid.g6 .card').length,
  funnel: document.querySelectorAll('#pane-course .funnel-row').length,
  campRows: document.querySelectorAll('#pane-course tr.tot').length,
  hasCampTable: document.body.innerText.includes('已加入 260 · 通过 280 · 报名 320'),
  hasStudent: document.body.innerText.includes('学员报名与学习数据'),
}));
console.log('course&camp:', JSON.stringify(courseBits));

// 4. 直播汇总行动态（近30天=5场）
await page.click('.nav-item[data-page="live"]');
await page.waitForTimeout(250);
const tot = await page.evaluate(() => document.querySelector('#liveRows tr.tot td')?.textContent);
console.log('live summary row:', tot);

// 5. 周期切换联动汇总
await page.click('.pill.amber'); await page.waitForTimeout(250);
await page.click('#gm .a-chip:has-text("近7天")'); await page.waitForTimeout(350);
const tot7 = await page.evaluate(() => document.querySelector('#liveRows tr.tot td')?.textContent);
console.log('live summary after 近7天:', tot7);

// 6. APP / 规则页仍正常
await page.click('.nav-item[data-view="app"]'); await page.waitForTimeout(250);
console.log('app ok:', await page.evaluate(() => document.getElementById('view-app').classList.contains('active')),
  '| app tabs:', await page.evaluate(() => [...document.querySelectorAll('#p-tabbar .p-tab')].length));
await page.click('.nav-item[data-view="rules"]'); await page.waitForTimeout(250);
console.log('rules ok:', await page.evaluate(() => document.getElementById('view-rules').classList.contains('active')));

// 7. 截图
await page.click('.nav-item[data-page="tenant"]'); await page.waitForTimeout(300);
await page.screenshot({ path: '/tmp/pom-live-report/v55-overview.png' });
await page.click('.nav-item[data-page="course"]'); await page.waitForTimeout(300);
await page.screenshot({ path: '/tmp/pom-live-report/v55-course.png', fullPage: true });

console.log('JS errors:', errors.length ? errors.join(' | ') : 'none');
await browser.close();
