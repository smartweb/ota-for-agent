"use client";

import { useRef, useCallback } from "react";

/**
 * 防止异步动作被重复触发的 hook。
 * 用 ref 而非 state，因为 ref 的变更在同步代码内立即生效，
 * 能在 React 重渲染之前就拦住第二次点击。
 *
 * 用法：
 *   const run = useGuardedAction(async () => { ... });
 *   <button onClick={run} />
 *
 * 返回的函数与原函数签名一致；若已有任务在执行，重复调用会被忽略。
 */
export function useGuardedAction<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>
): (...args: TArgs) => Promise<TResult | undefined> {
  const running = useRef(false);
  return useCallback(
    async (...args: TArgs) => {
      if (running.current) return undefined;
      running.current = true;
      try {
        return await fn(...args);
      } finally {
        running.current = false;
      }
    },
    [fn]
  );
}
