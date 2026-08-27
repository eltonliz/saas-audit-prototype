/**
 * 弹窗需求说明桥接器
 * 页面内打开弹窗/抽屉时调用 notifyModalOpen(key)，需求面板即时切换为该弹窗的专属需求说明；
 * URL 同步带上 modal= 参数（刷新后仍能直达对应说明）。
 * key 必须与 src/data/page-registry.ts 中登记的弹窗 key 一致。
 */
export function notifyModalOpen(key: string) {
  try {
    const url = new URL(window.location.href)
    url.searchParams.set('modal', key)
    window.history.replaceState(window.history.state, '', url.toString())
  } catch { /* hash 路由或地址不可写时忽略，仅事件通知 */ }
  window.dispatchEvent(new CustomEvent('modal-spec-open', { detail: { key } }))
}

/** 关闭弹窗时调用：清除面板的弹窗说明聚焦（回到页面级说明） */
export function notifyModalClose() {
  try {
    const url = new URL(window.location.href)
    if (url.searchParams.has('modal')) {
      url.searchParams.delete('modal')
      window.history.replaceState(window.history.state, '', url.toString())
    }
  } catch { /* ignore */ }
  window.dispatchEvent(new CustomEvent('modal-spec-close'))
}
