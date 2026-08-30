// SaaS 业务普查 v3：JS click 导航 + 采集
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  var b = await chromium.launch({ headless: true });
  var ctx = await b.newContext({ viewport: { width: 1600, height: 900 }, ignoreHTTPSErrors: true });
  var p = await ctx.newPage();
  var OUT = '/tmp/saas-survey';
  fs.mkdirSync(OUT, { recursive: true });
  await p.goto('https://saas-tenant.ryrkxn.cn/#/tenant/login', { waitUntil: 'networkidle' });
  await p.getByPlaceholder('请输入手机号').fill('13300000000');
  await p.getByPlaceholder('请输入验证码').fill('1502');
  for (var attempt = 0; attempt < 4; attempt++) {
    var lbl = await p.getByText('阅读并同意').first().boundingBox();
    if (lbl) { await p.mouse.click(lbl.x - 16, lbl.y + lbl.height / 2); await p.waitForTimeout(350); }
    var btn = await p.getByRole('button', { name: '登录' }).first().boundingBox();
    if (btn) await p.mouse.click(btn.x + btn.width / 2, btn.y + btn.height / 2);
    await p.waitForTimeout(4000);
    if (p.url().indexOf('login') < 0) break;
    // 重新填验证码（可能被刷新）
    try { await p.getByPlaceholder('请输入验证码').fill('1502'); } catch (e) {}
  }
  console.log('LOGIN:', p.url());
  try { await p.click('text=互联网 (7项目)', { timeout: 4000 }); await p.waitForTimeout(1200); } catch (e) {}
  try { var h = await p.$('text=hhh'); if (h) { await h.click(); await p.waitForTimeout(2500); } } catch (e) {}

  async function clickMenu(kw) {
    return p.evaluate(function (kw) {
      var els = Array.prototype.slice.call(document.querySelectorAll('li, div, span, a'));
      var hit = els.filter(function (e) { return e.innerText && e.innerText.trim() === kw && e.offsetParent !== null; });
      if (hit.length) { var t = hit[hit.length - 1]; (t.querySelector('a') || t).click(); return true; }
      return false;
    }, kw);
  }
  var survey = [];
  var domains = ['课堂', '客户', '营销', '商品', '交易', '门店', '组织'];
  for (var di = 0; di < domains.length; di++) {
    var kw = domains[di];
    var okc = await clickMenu(kw);
    await p.waitForTimeout(2000);
    var head = (await p.innerText('body')).slice(0, 200).replace(/\n/g, '|');
    var url = p.url();
    // 二级菜单文本（侧栏可见项）
    var subs = await p.evaluate(function () {
      var out = [];
      document.querySelectorAll('li, a, div').forEach(function (e) {
        if (e.children.length === 0) { var t = (e.innerText || '').trim(); if (t && t.length < 14 && e.offsetParent !== null) out.push(t); }
      });
      return Array.from(new Set(out)).slice(0, 40);
    });
    survey.push({ kw: kw, url: url, head: head, subs: subs });
    await p.screenshot({ path: OUT + '/' + kw + '.png' });
    fs.writeFileSync(OUT + '/survey.json', JSON.stringify(survey, null, 1));
  }
  console.log(JSON.stringify(survey.map(function (s) { return { kw: s.kw, head: s.head.slice(0, 60), subsN: s.subs.length }; })));
  await b.close();
})().catch(function (e) { console.error('ERR', e.message); process.exit(1); });
