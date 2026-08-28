#!/usr/bin/env python3
"""通过 gh CLI 修改 gh-pages 分支上 index.html 的 <title>（绕开 git push 网络问题）"""
import base64, json, subprocess, sys

REPO = 'eltonliz/saas-audit-prototype'
OLD = '<title>SAAS直播内容审查 — 高保真原型</title>'
NEW = '<title>SaaS-Class 课程与营期原型</title>'

def gh(*args, stdin=None):
    r = subprocess.run(['gh'] + list(args), capture_output=True, text=True, input=stdin)
    if r.returncode != 0:
        print('gh error:', r.stderr[:500]); sys.exit(1)
    return r.stdout

meta = json.loads(gh('api', f'repos/{REPO}/contents/index.html?ref=gh-pages'))
html = base64.b64decode(meta['content']).decode('utf-8')
if NEW in html:
    print('index.html already updated')
else:
    assert OLD in html, 'old title not found: ' + html[-200:]
    new_html = html.replace(OLD, NEW)
    resp = gh('api', '-X', 'PUT', f'repos/{REPO}/contents/index.html',
              '-f', 'message=deploy: 标题改为SaaS-Class课程与营期原型',
              '-f', 'branch=gh-pages',
              '-f', 'sha=' + meta['sha'],
              '-f', 'content=' + base64.b64encode(new_html.encode('utf-8')).decode('ascii'))
    print('index.html updated, commit', json.loads(resp)['commit']['sha'][:7])

# 404.html 同步
try:
    m404 = json.loads(gh('api', f'repos/{REPO}/contents/404.html?ref=gh-pages'))
    h404 = base64.b64decode(m404['content']).decode('utf-8')
    if OLD in h404:
        n404 = h404.replace(OLD, NEW)
        resp = gh('api', '-X', 'PUT', f'repos/{REPO}/contents/404.html',
                  '-f', 'message=deploy: 404标题同步',
                  '-f', 'branch=gh-pages',
                  '-f', 'sha=' + m404['sha'],
                  '-f', 'content=' + base64.b64encode(n404.encode('utf-8')).decode('ascii'))
        print('404.html updated, commit', json.loads(resp)['commit']['sha'][:7])
    else:
        print('404.html already updated')
except SystemExit:
    raise
except Exception as e:
    print('404.html skip:', str(e)[:200])
