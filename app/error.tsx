"use client";

/**
 * 路由级错误边界：捕获 app 路由树内任意客户端组件抛出的运行时错误，
 * 避免整页白屏。保留 Header/Footer 之外的 main 区域可恢复。
 */
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 上报错误（生产可接入 Sentry 等；当前仅 console，便于本地排查）
    console.error("[app:error]", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl px-6 py-20 text-center">
      <div className="text-4xl mb-4">😵</div>
      <h2 className="text-lg font-semibold mb-2">页面出错了</h2>
      <p className="text-sm text-neutral-500 mb-1 break-all">
        {error.message || "发生了未知错误"}
      </p>
      {error.digest && (
        <p className="text-xs text-neutral-400 mb-6">错误编号：{error.digest}</p>
      )}
      <div className="flex gap-3 justify-center mt-6">
        <button
          onClick={reset}
          className="px-6 h-11 inline-flex items-center rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition"
        >
          重试
        </button>
        <a
          href="/"
          className="px-6 h-11 inline-flex items-center rounded-xl border border-neutral-200 text-sm text-neutral-600 hover:bg-neutral-50 transition"
        >
          返回首页
        </a>
      </div>
    </div>
  );
}
