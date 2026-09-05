import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const p = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
const errs = [];
p.on('pageerror', e => errs.push(e.message.slice(0, 150)));
await p.goto('http://127.0.0.1:8890/member-report-prototype.html');
await p.waitForTimeout(900);
for (const t of ['tenant','store','live','product','customer','staff','manager']) {
  await p.evaluate(k => switchTab(k), t);
  await p.waitForTimeout(200);
  const st = await p.evaluate(k => {
    const pane = document.getElementById('pane-' + k);
    return { a: pane.classList.contains('active'), len: pane.innerHTML.length };
  }, t);
  console.log(t, st.a ? 'OK' : 'FAIL', 'len:', st.len);
}
await p.evaluate(() => switchTab('store'));
await p.evaluate(() => openStoreDetail('天河旗舰店'));
await p.waitForTimeout(200);
console.log('store-detail:', await p.evaluate(() => document.getElementById('store-detail').classList.contains('active')));
await p.evaluate(() => openMemberDetail('张三', '店员'));
await p.waitForTimeout(200);
const md = await p.evaluate(() => ({ list: !document.getElementById('md-list').hidden, course: document.getElementById('md-course').hidden, live: document.getElementById('md-live').hidden }));
console.log('member tabs:', JSON.stringify(md));
await p.evaluate(() => switchTab('live'));
await p.evaluate(() => openLiveDetail(0));
await p.waitForTimeout(200);
console.log('live828 cart rows:', await p.evaluate(() => document.querySelectorAll('#ld-cart tbody tr').length),
  '| 空态:', await p.evaluate(() => document.getElementById('ld-cart').innerText.includes('未挂载')));
await p.evaluate(() => switchView('app'));
await p.evaluate(() => openAppCourse());
await p.waitForTimeout(300);
console.log('course mgmt cards:', await p.evaluate(() => document.querySelectorAll('#ac-body .ac-card').length));
await p.evaluate(() => acTab('conv')); await p.waitForTimeout(200);
console.log('conv camps:', await p.evaluate(() => document.querySelectorAll('#ac-body .ac-camp').length),
  '| grid:', await p.evaluate(() => [...document.querySelectorAll('#ac-body .ac-camp .g .l')].slice(0,8).map(x=>x.textContent).join('/')));
await p.evaluate(() => openCampStudents(0)); await p.waitForTimeout(250);
console.log('camp students:', await p.evaluate(() => document.querySelectorAll('#cs-body .ac-custrow').length),
  '| KPI:', await p.evaluate(() => [...document.querySelectorAll('#cs-body .ac-kpi .l')].map(x=>x.textContent).join('/')));
await p.evaluate(() => switchView('pc')); await p.evaluate(() => switchTab('live'));
await p.evaluate(() => openPeriodMenu());
await p.evaluate(() => pickPeriod('2026-08-03','2026-09-02'));
await p.waitForTimeout(300);
console.log('近30天 sessions:', await p.evaluate(() => document.getElementById('l-kpi-sessions').textContent),
  '| rows:', await p.evaluate(() => document.querySelectorAll('#liveRows tr:not(.tot)').length));
await p.setViewportSize({ width: 390, height: 844 });
await p.waitForTimeout(250);
console.log('mobile no h-scroll:', await p.evaluate(() => document.documentElement.scrollWidth <= 390));
await p.screenshot({ path: '/tmp/pom-live-report/v519-final-mobile.png' });
await p.setViewportSize({ width: 1600, height: 1000 });
await p.evaluate(() => switchTab('tenant')); await p.waitForTimeout(250);
await p.screenshot({ path: '/tmp/pom-live-report/v519-final.png' });
console.log('errors:', errs.length ? [...new Set(errs)].join(' | ') : 'none');
await browser.close();
