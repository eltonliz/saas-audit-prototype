/**
 * mermaid 渲染全局串行队列（模块级单例）
 * mermaid.render 并发调用共享测量节点会产生竞态/挂起，必须串行
 */
let queue: Promise<void> = Promise.resolve();

export function enqueueMermaidRender(task: () => Promise<void>): Promise<void> {
  queue = queue.then(task).catch(() => {});
  return queue;
}
