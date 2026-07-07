"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LoadingState, ErrorState } from "@/components/ResultShell";

export default function PaymentRedirectPage() {
  return (
    <Suspense fallback={<LoadingState text="加载中..." />}>
      <PaymentRedirectInner />
    </Suspense>
  );
}

function PaymentRedirectInner() {
  const sp = useSearchParams();
  const id = sp.get("id") || ""; // out_trade_no
  const type = sp.get("type") || "flight"; // flight | hotel

  const [status, setStatus] = useState<"polling" | "paid" | "timeout" | "error">("polling");
  const [orderNo, setOrderNo] = useState<string>("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!id) {
      setStatus("error");
      return;
    }

    let attempts = 0;
    const maxAttempts = 10; // 每 3s 一次，最多 30s

    const poll = async () => {
      attempts++;
      try {
        // 按业务类型查详情
        let res: Response;
        if (type === "flight") {
          res = await fetch("/api/flight/order/detail", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ out_trade_no: id }),
          });
        } else if (type === "bus") {
          res = await fetch("/api/bus/order/detail", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ out_trade_no: id }),
          });
        } else {
          res = await fetch(`/api/hotel/order/detail/${id}`);
        }
        const json = await res.json();
        if (json.code !== 0) throw new Error(json.message);

        const data = json.data || {};
        const orderNo = data.system_no || data.order_no || "";
        if (orderNo) setOrderNo(orderNo);

        // 判断是否已支付
        const paid =
          data.pay_status === "paid" ||
          data.status === "paid" ||
          data.status === "confirmed" ||
          data.status === "issued" ||
          data.status === "completed";

        if (paid) {
          setStatus("paid");
          if (timerRef.current) clearInterval(timerRef.current);
          return;
        }

        if (attempts >= maxAttempts) {
          setStatus("timeout");
          if (timerRef.current) clearInterval(timerRef.current);
        }
      } catch {
        if (attempts >= maxAttempts) {
          setStatus("timeout");
          if (timerRef.current) clearInterval(timerRef.current);
        }
      }
    };

    poll(); // 立即查一次
    timerRef.current = setInterval(poll, 3000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [id, type]);

  if (!id) {
    return <ErrorState message="缺少订单参数" />;
  }

  if (status === "polling") {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <div className="h-16 w-16 mx-auto rounded-full border-4 border-brand-200 border-t-brand-500 animate-spin mb-6" />
        <h2 className="text-lg font-semibold mb-2">支付结果确认中...</h2>
        <p className="text-sm text-neutral-500">
          正在与支付系统同步，请稍候（最多 30 秒）
        </p>
      </div>
    );
  }

  if (status === "paid") {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <div className="h-16 w-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl mb-6">
          ✓
        </div>
        <h2 className="text-lg font-semibold mb-2 text-emerald-600">支付成功</h2>
        <p className="text-sm text-neutral-500 mb-1">订单号：{orderNo || id}</p>
        <p className="text-sm text-neutral-500 mb-6">
          {type === "flight"
            ? "出票信息将稍后发送至联系人手机"
            : type === "bus"
            ? "车票信息将稍后发送至联系人手机"
            : "酒店确认后即可入住"}
        </p>
        <div className="flex gap-3 justify-center">
          {orderNo && (
            <Link
              href={`/orders/${orderNo}?type=${type}`}
              className="px-6 h-11 inline-flex items-center rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition"
            >
              查看订单
            </Link>
          )}
          <Link
            href="/orders"
            className="px-6 h-11 inline-flex items-center rounded-xl border border-neutral-200 text-sm text-neutral-600 hover:bg-neutral-50 transition"
          >
            我的订单
          </Link>
        </div>
      </div>
    );
  }

  if (status === "timeout") {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <div className="h-16 w-16 mx-auto rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-3xl mb-6">
          ⏱
        </div>
        <h2 className="text-lg font-semibold mb-2">支付状态查询超时</h2>
        <p className="text-sm text-neutral-500 mb-6">
          如果已完成支付，请稍后在订单列表查看最新状态
        </p>
        <div className="flex gap-3 justify-center">
          {orderNo && (
            <Link
              href={`/orders/${orderNo}?type=${type}`}
              className="px-6 h-11 inline-flex items-center rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition"
            >
              查看订单
            </Link>
          )}
          <Link
            href="/orders"
            className="px-6 h-11 inline-flex items-center rounded-xl border border-neutral-200 text-sm text-neutral-600 hover:bg-neutral-50 transition"
          >
            我的订单
          </Link>
        </div>
      </div>
    );
  }

  return <ErrorState message="支付状态查询失败" />;
}
