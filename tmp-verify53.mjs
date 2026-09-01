import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1600, height: 950 } });
const errors = [];
page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
page.on('console', m => { if (m.type() === 'error' && !m.text().includes('favicon')) errors.push('CONSOLE: ' + m.text()); });

await page.goto('http://127.0.0.1:8890/member-report-prototype.html');
await page.waitForTimeout(900);

// 1. 环比已移除
console.log('card-trend left:', await page.evaluate(() => document.querySelectorAll('.card-trend').length));
console.log('环比 text count:', await page.evaluate(() => document.body.innerText.split('环比').length - 1));

// 2. 默认周期（近7天）模拟重算
console.log('pill:', await page.evaluate(() => document.getElementById('periodText').textContent));
console.log('sessions(近7天):', await page.evaluate(() => document.getElementById('l-kpi-sessions').textContent),
  '| watch:', await page.evaluate(() => document.getElementById('l-kpi-watch').textContent),
  '| flow:', await page.evaluate(() => document.getElementById('l-kpi-flow').textContent));

// 3. 切近30天
await page.click('.pill.amber');
await page.waitForTimeout(300);
await page.click('#gm .a-chip:has-text("近30天")');
await page.waitForTimeout(400);
console.log('近30天 pill:', await page.evaluate(() => document.getElementById('periodText').textContent),
  '| sessions:', await page.evaluate(() => document.getElementById('l-kpi-sessions').textContent),
  '| watch:', await page.evaluate(() => document.getElementById('l-kpi-watch').textContent),
  '| flow:', await page.evaluate(() => document.getElementById('l-kpi-flow').textContent),
  '| rows:', await page.evaluate(() => document.querySelectorAll('#liveRows tr').length));

// 4. 日历自选起止（单日 09-01 → 0 场空态）
await page.click('.pill.amber'); await page.waitForTimeout(300);
const dayBtns = await page.evaluate(() => [...document.querySelectorAll('#gm .a-chip')].filter(b => /^\d{2}-\d{2}$/.test(b.textContent.trim())));
await dayBtns[dayBtns.length - 1].click(); await page.waitForTimeout(200); // 09-01 起始
await dayBtns[dayBtns.length - 1].click(); await page.waitForTimeout(300); // 再点=单日
console.log('single day sessions:', await page.evaluate(() => document.getElementById('l-kpi-sessions').textContent),
  '| empty row:', await page.evaluate(() => document.querySelector('#liveRows .empty') !== null));

// 5. 恢复近30天 + 租户 KPI 同步
await page.click('.pill.amber'); await page.waitForTimeout(250);
await page.click('#gm .a-chip:has-text("近30天")'); await page.waitForTimeout(350);
console.log('tenant watch:', await page.evaluate(() => document.getElementById('t-kpi-watch').textContent),
  '| gmv:', await page.evaluate(() => document.getElementById('t-kpi-gmv').textContent),
  '| member:', await page.evaluate(() => document.getElementById('t-kpi-member').textContent));

// 6. 统计规则与公式页
await page.click('.nav-item[data-view="rules"]');
await page.waitForTimeout(300);
console.log('rules view:', await page.evaluate(() => document.getElementById('view-rules').classList.contains('active')),
  '| title:', await page.evaluate(() => document.getElementById('pageTitle').textContent));
console.log('rules sections:', await page.evaluate(() => document.querySelectorAll('#view-rules .sec').length),
  '| formula rows:', await page.evaluate(() => document.querySelectorAll('#view-rules tbody tr').length));
await page.screenshot({ path: '/tmp/pom-live-report/v53-rules.png', fullPage: true });

// 7. 回 PC 截图（近30天状态）
await page.click('.nav-item[data-view="pc"]');
await page.click('.tab[data-tab="live"]'); await page.waitForTimeout(300);
await page.screenshot({ path: '/tmp/pom-live-report/v53-live-30d.png' });

console.log('JS errors:', errors.length ? errors.join(' | ') : 'none');
await browser.close();
