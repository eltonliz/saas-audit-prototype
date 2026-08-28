/**
 * 弹窗需求说明桥接器
 * 页面内打开弹窗/抽屉时调用 notifyModalOpen(key)，需求面板即时切换为该弹窗的专属需求说明；
 * URL 同步带上 modal= 参数（刷新后仍能直达对应说明）。
 * key 必须与 src/data/page-registry.ts 中登记的弹窗 key 一致。
 */

/** hash 路由下把 modal 参数写入 hash 内 query（vue-router 可解析），并兼容写一份到外部 search */
function setModalParam(key: string | null) {
  try {
    const url = new URL(window.location.href)
    // 1) hash 内 query（vue-router hash 模式解析的就是它）
    const rawHash = url.hash || '#/'
    const qIdx = rawHash.indexOf('?')
    const hashPath = qIdx >= 0 ? rawHash.slice(1, qIdx) : rawHash.slice(1)
    const params = new URLSearchParams(qIdx >= 0 ? rawHash.slice(qIdx + 1) : '')
    if (key) params.set('modal', key)
    else params.delete('modal')
    const qs = params.toString()
    url.hash = '#' + hashPath + (qs ? '?' + qs : '')
    // 2) 外部 search 同步一份（老书签兼容）
    if (key) url.searchParams.set('modal', key)
    else url.searchParams.delete('modal')
    window.history.replaceState(window.history.state, '', url.toString())
  } catch { /* 地址不可写时忽略，仅事件通知 */ }
}

export function notifyModalOpen(key: string) {
  setModalParam(key)
  window.dispatchEvent(new CustomEvent('modal-spec-open', { detail: { key } }))
}

/** 关闭弹窗时调用：清除面板的弹窗说明聚焦（回到页面级说明） */
export function notifyModalClose() {
  setModalParam(null)
  window.dispatchEvent(new CustomEvent('modal-spec-close'))
}
