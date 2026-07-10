"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getOrderIndex,
  patchOrderIndex,
  type OrderIndexEntry,
} from "@/lib/order-store";
import { StatusBadge } from "@/components/order/OrderStatus";

/** 每个订单的实时状态（来自上游详情） */
interface LiveStatus {
  status?: string;
  status_text?: string;
  amount?: number;
  loading: boolean;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderIndexEntry[]>([]);
  const [live, setLive] = useState<Record<string, LiveStatus>>({});
  const [loaded, setLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  /** 拉取单笔订单的真实详情 */
  const fetchOne = async (o: OrderIndexEntry): Promise<LiveStatus> => {
    try {
      let res: Response;
      if (o.type === "flight") {
        res = await fetch("/api/flight/order/detail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ system_no: o.order_no }),
        });
      } else if (o.type === "bus") {
        res = await fetch("/api/bus/order/detail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ system_no: o.order_no }),
        });
      } else {
        res = await fetch(`/api/hotel/order/detail/${o.order_no}`);
      }
      const json = await res.json();
      if (json.code !== 0) return { loading: false };
      const data = json.data || {};
      // 详情接口金额单位：机票/酒店=元，巴士=元（detail 口径统一为元）
      const amount = typeof data.total_amount === "number" ? data.total_amount : undefined;
      // 把金额回写本地索引，减少后续刷新
      if (typeof amount === "number" && amount !== o.amount) {
        patchOrderIndex(o.out_trade_no, { amount });
      }
      return {
        status: data.status,
        status_text: data.status_text,
        amount,
        loading: false,
      };
    } catch {
      return { loading: false };
    }
  };

  /** 批量刷新所有订单的真实状态 */
  const refreshAll = async (list: OrderIndexEntry[]) => {
    setRefreshing(true);
    // 标记为 loading
    const init: Record<string, LiveStatus> = {};
    list.forEach((o) => (init[o.out_trade_no] = { loading: true }));
    setLive(init);

    // 并发拉取（订单数量通常较少，直接并发；失败的单条降级用本地数据）
    const entries = await Promise.all(
      list.map(async (o) => {
        const s = await fetchOne(o);
        return [o.out_trade_no, s] as const;
      })
    );
    const map: Record<string, LiveStatus> = {};
    entries.forEach(([k, v]) => (map[k] = v));
    setLive(map);
    setRefreshing(false);
  };

  useEffect(() => {
    const list = getOrderIndex();
    setOrders(list);
    setLoaded(true);
    if (list.length > 0) refreshAll(list);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-semibold">我的订单</h1>
        {orders.length > 0 && (
          <button
            onClick={() => refreshAll(orders)}
            disabled={refreshing}
            className="text-xs text-neutral-500 hover:text-brand-600 disabled:opacity-50 transition"
          >
            {refreshing ? "刷新中..." : "↻ 刷新状态"}
          </button>
        )}
      </div>
      <p className="text-xs text-neutral-500 mb-6">
        订单记录在本地浏览器中（演示用，清浏览器缓存会丢失），状态/金额实时从上游同步
      </p>

      {loaded && orders.length === 0 && (
        <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center">
          <div className="text-4xl mb-3 opacity-50">📋</div>
          <h3 className="font-semibold mb-1">暂无订单</h3>
          <p className="text-sm text-neutral-500 mb-4">去搜索机票、酒店或巴士，开启你的旅程</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/flight"
              className="px-5 h-10 inline-flex items-center rounded-xl bg-brand-500 text-white text-sm hover:bg-brand-600 transition"
            >
              搜机票
            </Link>
            <Link
              href="/hotel"
              className="px-5 h-10 inline-flex items-center rounded-xl border border-neutral-200 text-sm text-neutral-600 hover:bg-neutral-50 transition"
            >
              搜酒店
            </Link>
            <Link
              href="/bus"
              className="px-5 h-10 inline-flex items-center rounded-xl border border-neutral-200 text-sm text-neutral-600 hover:bg-neutral-50 transition"
            >
              搜巴士
            </Link>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {orders.map((o) => {
          const l = live[o.out_trade_no];
          const amount = l?.amount ?? o.amount;
          const status = l?.status;
          const statusLoading = l?.loading;
          return (
            <Link
              key={o.out_trade_no}
              href={`/orders/${o.order_no}?type=${o.type}`}
              className="block rounded-2xl border border-neutral-200 bg-white p-4 hover:border-brand-300 hover:shadow-hover transition-all"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span
                      className={`text-[11px] px-1.5 py-0.5 rounded ${
                        o.type === "flight"
                          ? "bg-sky-50 text-sky-600"
                          : o.type === "bus"
                          ? "bg-amber-50 text-amber-600"
                          : "bg-violet-50 text-violet-600"
                      }`}
                    >
                      {o.type === "flight" ? "机票" : o.type === "bus" ? "巴士" : "酒店"}
                    </span>
                    {/* 实时状态徽标（拉取中显示占位） */}
                    {statusLoading ? (
                      <span className="text-[11px] text-neutral-400">状态同步中…</span>
                    ) : status ? (
                      <StatusBadge status={status} text={l?.status_text} />
                    ) : null}
                    <span className="text-xs text-neutral-400">
                      {new Date(o.created_at).toLocaleString("zh-CN")}
                    </span>
                  </div>
                  <div className="text-sm font-medium truncate">{o.title}</div>
                  <div className="text-xs text-neutral-400 mt-0.5 truncate">
                    订单号 {o.order_no}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {typeof amount === "number" && (
                    <div className="text-base font-bold text-brand-600">¥{amount}</div>
                  )}
                  <div className="text-xs text-neutral-400 mt-1">查看详情 →</div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
