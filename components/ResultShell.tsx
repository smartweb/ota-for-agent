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
  // 初始为 true：避免首次渲染时 data=null 却跳过 loading 态，
  // 导致列表页一闪而过的"未找到结果"（SSR + hydrate 第一次都受影响）。
  const [loading, setLoading] = useState(true);
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

/**
 * 骨架卡片单元：带 shimmer 流动光泽
 */
function SkeletonBox({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-md bg-[linear-gradient(90deg,#f4f4f5_0%,#ececee_40%,#f8f8f9_50%,#ececee_60%,#f4f4f5_100%)] bg-[length:200%_100%] animate-shimmer ${className}`}
    />
  );
}

/** 顶部品牌色流动进度条，提供「正在加载」的强烈信号 */
function LoadingBar() {
  return (
    <div className="relative h-[3px] w-full overflow-hidden rounded-full bg-neutral-100">
      <div className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-brand-500 animate-loading-bar" />
    </div>
  );
}

/** 跳动的省略号 */
function BouncingDots() {
  return (
    <span className="inline-flex gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="inline-block w-1.5 h-1.5 rounded-full bg-brand-400 animate-dot-bounce"
          style={{ animationDelay: `${i * 0.16}s` }}
        />
      ))}
    </span>
  );
}

/** 机票列表骨架 */
function FlightSkeletonCard() {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-card">
      <div className="flex items-center gap-4">
        {/* 航司图标 */}
        <SkeletonBox className="w-10 h-10 rounded-full shrink-0" />
        {/* 航段信息 */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-3">
            <SkeletonBox className="w-14 h-4" />
            <SkeletonBox className="w-6 h-3" />
            <SkeletonBox className="w-14 h-4" />
            <SkeletonBox className="w-16 h-3" />
          </div>
          <div className="flex items-center gap-3">
            <SkeletonBox className="w-20 h-3" />
            <SkeletonBox className="w-12 h-3" />
          </div>
        </div>
        {/* 价格 */}
        <div className="text-right space-y-2 shrink-0">
          <SkeletonBox className="w-16 h-5 ml-auto" />
          <SkeletonBox className="w-12 h-3 ml-auto" />
        </div>
      </div>
    </div>
  );
}

/** 酒店列表骨架 */
function HotelSkeletonCard() {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white shadow-card overflow-hidden">
      <div className="flex">
        {/* 图片 */}
        <SkeletonBox className="w-40 h-32 shrink-0 rounded-none" />
        {/* 信息 */}
        <div className="flex-1 min-w-0 p-4 space-y-2">
          <SkeletonBox className="w-2/3 h-4" />
          <SkeletonBox className="w-1/3 h-3" />
          <div className="flex gap-2 pt-1">
            <SkeletonBox className="w-10 h-5 rounded-full" />
            <SkeletonBox className="w-12 h-5 rounded-full" />
            <SkeletonBox className="w-14 h-5 rounded-full" />
          </div>
          <SkeletonBox className="w-1/2 h-3" />
        </div>
        {/* 价格 */}
        <div className="p-4 text-right space-y-2 shrink-0">
          <SkeletonBox className="w-16 h-6 ml-auto" />
          <SkeletonBox className="w-12 h-3 ml-auto" />
          <SkeletonBox className="w-14 h-7 ml-auto mt-3" />
        </div>
      </div>
    </div>
  );
}

/** 通用骨架 */
function GenericSkeletonCard() {
  return <SkeletonBox className="h-24 rounded-2xl" />;
}

export function LoadingState({
  text = "搜索中...",
  type = "generic",
  count = 4,
}: {
  text?: string;
  type?: "flight" | "hotel" | "generic";
  count?: number;
}) {
  const SkeletonCard =
    type === "flight"
      ? FlightSkeletonCard
      : type === "hotel"
      ? HotelSkeletonCard
      : GenericSkeletonCard;

  return (
    <div className="space-y-4">
      <LoadingBar />
      <div className={type === "generic" ? "space-y-3" : "space-y-4"}>
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <div className="flex items-center justify-center gap-2 pt-2">
        <BouncingDots />
        <span className="text-sm text-neutral-400">{text}</span>
      </div>
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
