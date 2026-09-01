import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
const errors = [];
page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
page.on('console', m => { if (m.type() === 'error' && !m.text().includes('favicon')) errors.push('CONSOLE: ' + m.text()); });

await page.goto('http://127.0.0.1:8890/member-report-prototype.html');
await page.waitForTimeout(900);

// 1. 切到 APP 视图
await page.click('.nav-item[data-view="app"]');
await page.waitForTimeout(300);
console.log('app view:', await page.evaluate(() => document.getElementById('view-app').classList.contains('active')));

// 2. 店长默认：头部 + Tab + home 内容
const head1 = await page.evaluate(() => document.getElementById('ph-name')?.textContent || document.querySelector('#ph-head .p-name').textContent);
console.log('default role head:', head1);
const tabs1 = await page.evaluate(() => [...document.querySelectorAll('#p-tabbar .p-tab')].map(t => t.textContent.trim()));
console.log('manager tabs:', tabs1.join('/'));
console.log('mgr home has banner:', await page.evaluate(() => !!document.querySelector('#p-body .a-banner')));

// 3. 店长 live Tab：场次卡点击 → sheet
await page.click('#p-tabbar .p-tab:has-text("直播")');
await page.waitForTimeout(250);
const cards = await page.evaluate(() => document.querySelectorAll('#p-body .a-card').length);
console.log('mgr live cards:', cards);
await page.click('#p-body .a-card.clickable >> nth=0');
await page.waitForTimeout(300);
console.log('live sheet open:', await page.evaluate(() => document.getElementById('p-sheet').classList.contains('open')),
  '| title:', await page.evaluate(() => document.getElementById('sh-title').textContent));
await page.click('#p-sheet .sh-close');
await page.waitForTimeout(250);

// 4. 店长 cust Tab + 客户 sheet
await page.click('#p-tabbar .p-tab:has-text("客户")');
await page.waitForTimeout(250);
await page.click('#p-body .a-row.clickable >> nth=0');
await page.waitForTimeout(300);
console.log('member sheet:', await page.evaluate(() => document.getElementById('sh-title').textContent));
await page.keyboard.press('Escape');
await page.evaluate(() => closeSheet());
await page.waitForTimeout(200);

// 5. 切店员角色
await page.click('#seg-staff');
await page.waitForTimeout(300);
const tabs2 = await page.evaluate(() => [...document.querySelectorAll('#p-tabbar .p-tab')].map(t => t.textContent.trim()));
console.log('staff tabs:', tabs2.join('/'));
console.log('staff head:', await page.evaluate(() => document.querySelector('#ph-head .p-name').textContent));

// 6. 店员 members Tab + 筛选
await page.click('#p-tabbar .p-tab:has-text("我的会员")');
await page.waitForTimeout(250);
const before = await page.evaluate(() => document.querySelectorAll('#p-body .a-row').length);
await page.click('#p-body .a-chip:has-text("VIP")');
await page.waitForTimeout(250);
const after = await page.evaluate(() => document.querySelectorAll('#p-body .a-row').length);
console.log('members rows all:', before, '-> vip:', after);

// 7. 店员 live Tab（名下客户参与）
await page.click('#p-tabbar .p-tab:has-text("直播")');
await page.waitForTimeout(250);
console.log('staff live rows:', await page.evaluate(() => document.querySelectorAll('#p-body .a-row').length));

// 8. 回 PC 视图
await page.click('.nav-item[data-view="pc"]');
await page.waitForTimeout(250);
console.log('pc view back:', await page.evaluate(() => document.getElementById('view-pc').classList.contains('active')));

// 9. 截图：店长 home + 店员 members
await page.click('.nav-item[data-view="app"]');
await page.click('#seg-manager'); await page.waitForTimeout(300);
await page.screenshot({ path: '/tmp/pom-live-report/v52-app-manager.png' });
await page.click('#seg-staff');
await page.click('#p-tabbar .p-tab:has-text("我的会员")'); await page.waitForTimeout(300);
await page.screenshot({ path: '/tmp/pom-live-report/v52-app-staff.png' });

console.log('JS errors:', errors.length ? errors.join(' | ') : 'none');
await browser.close();
