"use client";

/**
 * 全局错误边界：当根 layout.tsx 自身抛错时（error.tsx 无法捕获 layout 错误），
 * Next.js 会渲染这个组件替换整个 <html>。因此它必须自带 <html>/<body>。
 */
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global:error]", error);
  }, [error]);

  return (
    <html lang="zh-CN">
      <body
        className="min-h-screen bg-white text-neutral-900 font-sans antialiased"
        style={{
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, 'PingFang SC', sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: "36rem",
            margin: "5rem auto",
            padding: "0 1.5rem",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>😵</div>
          <h2
            style={{
              fontSize: "1.125rem",
              fontWeight: 600,
              marginBottom: "0.5rem",
            }}
          >
            应用发生错误
          </h2>
          <p style={{ fontSize: "0.875rem", color: "#737373", marginBottom: "1.5rem" }}>
            {error.message || "发生了未知错误"}
          </p>
          <button
            onClick={reset}
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "0.75rem",
              background: "#FF5A1F",
              color: "#fff",
              fontSize: "0.875rem",
              fontWeight: 500,
              border: "none",
              cursor: "pointer",
            }}
          >
            重试
          </button>
        </div>
      </body>
    </html>
  );
}
