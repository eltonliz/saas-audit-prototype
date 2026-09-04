import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const p = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
const errs = [];
p.on('pageerror', e => errs.push(e.message.slice(0, 150)));
await p.goto('http://127.0.0.1:8890/member-report-prototype.html');
await p.waitForTimeout(900);

// 各报表页逐一验证
for (const t of ['tenant', 'store', 'live', 'product', 'customer', 'course', 'staff', 'manager']) {
  await p.evaluate(k => switchTab(k), t);
  await p.waitForTimeout(220);
  const st = await p.evaluate(k => {
    const pane = document.getElementById('pane-' + k);
    return { active: pane.classList.contains('active'), len: pane.innerHTML.length };
  }, t);
  console.log(t, st.active ? 'OK' : 'FAIL', 'len:', st.len);
}

// 门店钻取链
await p.evaluate(() => switchTab('store'));
await p.evaluate(() => openStoreDetail('天河旗舰店'));
await p.waitForTimeout(200);
console.log('store-detail:', await p.evaluate(() => document.getElementById('store-detail').classList.contains('active')));
await p.evaluate(() => openMemberDetail('张三', '店员'));
await p.waitForTimeout(200);
console.log('member-detail:', await p.evaluate(() => document.getElementById('member-detail').classList.contains('active')));
const md = await p.evaluate(() => ({
  list: !document.getElementById('md-list').hidden,
  course: document.getElementById('md-course').hidden,
  live: document.getElementById('md-live').hidden
}));
console.log('md tabs:', JSON.stringify(md));
await p.evaluate(() => openStoreDetail('天河旗舰店'));
await p.waitForTimeout(150);
console.log('back to store-detail:', await p.evaluate(() => document.getElementById('store-detail').classList.contains('active')));

// 直播单场
await p.evaluate(() => switchTab('live'));
await p.evaluate(() => openLiveDetail(0));
await p.waitForTimeout(200);
console.log('live-detail:', await p.evaluate(() => document.getElementById('live-detail').classList.contains('active')));

// APP 端
await p.evaluate(() => switchView('app'));
await p.waitForTimeout(250);
console.log('app view:', await p.evaluate(() => document.getElementById('view-app').classList.contains('active')),
  '| tabbar:', await p.evaluate(() => [...document.querySelectorAll('#p-tabbar .p-tab span')].map(s => s.textContent).join('/')));
await p.evaluate(() => openAppCourse()); await p.waitForTimeout(300);
console.log('course mgmt:', await p.evaluate(() => document.getElementById('app-course').classList.contains('open')),
  '| cards:', await p.evaluate(() => document.querySelectorAll('#ac-body .ac-card').length));
await p.evaluate(() => acTab('conv')); await p.waitForTimeout(200);
console.log('conv camps:', await p.evaluate(() => document.querySelectorAll('#ac-body .ac-camp').length));
await p.evaluate(() => openCampStudents(0)); await p.waitForTimeout(250);
console.log('camp students:', await p.evaluate(() => document.querySelectorAll('#cs-body .ac-custrow').length),
  '| display:', await p.evaluate(() => getComputedStyle(document.getElementById('app-camp-students')).display));
await p.screenshot({ path: '/tmp/pom-live-report/v519-customers.png' });
await p.evaluate(() => closeCampStudents());
await p.evaluate(() => closeAppCourse());

// 规则页
await p.evaluate(() => switchView('rules')); await p.waitForTimeout(200);
console.log('rules view:', await p.evaluate(() => document.getElementById('view-rules').classList.contains('active')));

// 375px 手机视口门店报表
await p.setViewportSize({ width: 390, height: 844 });
await p.evaluate(() => switchView('pc')); await p.evaluate(() => switchTab('store')); await p.waitForTimeout(250);
console.log('mobile no h-scroll:', await p.evaluate(() => document.documentElement.scrollWidth <= 390));
await p.screenshot({ path: '/tmp/pom-live-report/v519-mobile-store.png' });

console.log('errors:', errs.length ? [...new Set(errs)].join(' | ') : 'none');
await browser.close();
