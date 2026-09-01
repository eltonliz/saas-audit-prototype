import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1600, height: 950 } });
const errors = [];
page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
page.on('console', m => { if (m.type() === 'error' && !m.text().includes('favicon')) errors.push('CONSOLE: ' + m.text()); });

await page.goto('http://127.0.0.1:8890/member-report-prototype.html');
await page.waitForTimeout(900);

// 1. KPI 卡点击下钻
await page.click('#pane-tenant .card.tone-blue.clickable');
await page.waitForTimeout(250);
console.log('KPI watch -> live tab:', await page.evaluate(() => document.getElementById('pane-live').classList.contains('active')));

// 2. 漏斗点击 → 通用弹窗
await page.click('.tab[data-tab="tenant"]');
await page.waitForTimeout(200);
await page.click('#tenantFunnel .funnel-row >> nth=2');
await page.waitForTimeout(250);
const gm1 = await page.evaluate(() => ({ open: document.getElementById('gm').classList.contains('open'), title: document.getElementById('gm-title').textContent }));
console.log('funnel modal:', JSON.stringify(gm1));
await page.keyboard.press('Escape'); await page.waitForTimeout(150);

// 3. 导出 toast
await page.click('.btn:has-text("导出")');
await page.waitForTimeout(300);
console.log('toast visible:', await page.evaluate(() => !!document.querySelector('.toast')));

// 4. 流量口径弹窗
await page.click('.card.tone-cyan.clickable');
await page.waitForTimeout(250);
console.log('flow modal title:', await page.evaluate(() => document.getElementById('gm-title').textContent));
await page.click('#gm .modal-close'); await page.waitForTimeout(150);

// 5. 直播搜索过滤
await page.click('.tab[data-tab="live"]');
await page.waitForTimeout(200);
await page.fill('#liveSearch', '直播76');
await page.waitForTimeout(250);
const rows1 = await page.evaluate(() => document.querySelectorAll('#liveRows tr').length);
await page.fill('#liveSearch', '260625');
await page.waitForTimeout(250);
const rows2 = await page.evaluate(() => document.querySelectorAll('#liveRows tr').length);
console.log('search "直播76" rows:', rows1, '| search ID"260625" rows:', rows2);
await page.fill('#liveSearch', '');
await page.waitForTimeout(200);

// 6. 带货场 vs 无带货场动态详情
await page.click('#liveRows .link:has-text("直播76") >> nth=0');
await page.waitForTimeout(250);
const detail76 = await page.evaluate(() => ({
  name: document.getElementById('ld-name').textContent,
  cartEmpty: document.querySelector('#ld-cart .empty') !== null,
  custTable: document.querySelectorAll('#ld-cust tbody tr').length,
}));
console.log('detail 直播76(带货):', JSON.stringify(detail76));
await page.click('#live-detail .back'); await page.waitForTimeout(200);
await page.fill('#liveSearch', '直播828');
await page.waitForTimeout(200);
await page.click('#liveRows .link >> nth=0');
await page.waitForTimeout(250);
const detail828 = await page.evaluate(() => ({
  name: document.getElementById('ld-name').textContent,
  cartEmpty: document.querySelector('#ld-cart .empty') !== null,
  custEmpty: document.querySelector('#ld-cust .empty') !== null,
}));
console.log('detail 直播828(无观看):', JSON.stringify(detail828));
await page.click('#live-detail .back'); await page.waitForTimeout(150);
await page.fill('#liveSearch', ''); await page.waitForTimeout(200);

// 7. 商品条形点击弹窗
await page.click('.tab[data-tab="product"]');
await page.waitForTimeout(200);
await page.click('#productBars .bar-row >> nth=0');
await page.waitForTimeout(250);
console.log('product modal:', await page.evaluate(() => document.getElementById('gm-title').textContent));
await page.keyboard.press('Escape'); await page.waitForTimeout(150);

// 8. 店员条形 → member-detail
await page.click('.tab[data-tab="staff"]');
await page.waitForTimeout(200);
await page.click('#staffBars .bar-row >> nth=0');
await page.waitForTimeout(250);
console.log('staff bar -> member-detail:', await page.evaluate(() => document.getElementById('member-detail').classList.contains('active')));

// 9. 课程详情（第2行）
await page.click('.tab[data-tab="course"]');
await page.waitForTimeout(200);
await page.click('#course-list .link:has-text("销售技巧") >> nth=0');
await page.waitForTimeout(250);
console.log('course 销售技巧 detail:', await page.evaluate(() => document.getElementById('cd-name').textContent.trim().slice(0, 4)));

// 10. 门店条形 → store-detail
await page.click('.tab[data-tab="tenant"]');
await page.waitForTimeout(200);
await page.click('#storeBars .bar-row >> nth=2');
await page.waitForTimeout(250);
console.log('store bar -> detail name:', await page.evaluate(() => document.getElementById('sd-name').textContent));

console.log('JS errors:', errors.length ? errors.join(' | ') : 'none');
await browser.close();
