"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getOrderIndex, type OrderIndexEntry } from "@/lib/order-store";

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderIndexEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setOrders(getOrderIndex());
    setLoaded(true);
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <h1 className="text-xl font-semibold mb-1">我的订单</h1>
      <p className="text-xs text-neutral-500 mb-6">
        订单记录在本地浏览器中（演示用，清浏览器缓存会丢失）
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
        {orders.map((o) => (
          <Link
            key={o.out_trade_no}
            href={`/orders/${o.order_no}?type=${o.type}`}
            className="block rounded-2xl border border-neutral-200 bg-white p-4 hover:border-brand-300 hover:shadow-hover transition-all"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
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
                {typeof o.amount === "number" && (
                  <div className="text-base font-bold text-brand-600">¥{o.amount}</div>
                )}
                <div className="text-xs text-neutral-400 mt-1">查看详情 →</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
