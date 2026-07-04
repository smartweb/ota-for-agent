"use client";

import { useEffect, useState } from "react";
import type { BusinessType } from "@/lib/api";

interface Result<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * 统一调用 BFF /api/proxy?type=xxx 的客户端 hook
 */
export function useProxySearch<T>(
  type: BusinessType,
  body: Record<string, unknown> | null,
  deps: unknown[] = []
): Result<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!body) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/proxy?type=${type}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then(async (r) => {
        const json = await r.json();
        if (!r.ok || json.code !== 0) {
          throw new Error(json.message || `请求失败（${r.status}）`);
        }
        return json.data as T;
      })
      .then((d) => {
        if (!cancelled) {
          setData(d);
          setLoading(false);
        }
      })
      .catch((e: Error) => {
        if (!cancelled) {
          setError(e.message || "网络错误");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error };
}

/* --------------------- 共享 UI 片段 --------------------- */

export function LoadingState({ text = "搜索中..." }: { text?: string }) {
  return (
    <div className="space-y-3">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-24 rounded-2xl border border-neutral-200 bg-neutral-50 animate-pulse"
        />
      ))}
      <p className="text-center text-sm text-neutral-400">{text}</p>
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
      <div className="text-3xl mb-3">⚠️</div>
      <h3 className="font-semibold text-red-700 mb-1">搜索失败</h3>
      <p className="text-sm text-red-600/80 break-all">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 px-4 py-1.5 rounded-lg border border-red-300 text-red-700 text-sm hover:bg-red-100 transition"
        >
          重试
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  title = "未找到结果",
  hint = "试试更换搜索条件或日期",
}: {
  title?: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center">
      <div className="text-4xl mb-3 opacity-60">🔍</div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-neutral-500">{hint}</p>
    </div>
  );
}

export function ResultHeader({
  title,
  total,
  extra,
}: {
  title: string;
  total?: number;
  extra?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between mb-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {typeof total === "number" && (
          <p className="text-xs text-neutral-500 mt-1">共 {total} 条结果</p>
        )}
      </div>
      {extra}
    </div>
  );
}
