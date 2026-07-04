"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import Link from "next/link";
import {
  PassengerForm,
  ContactForm,
  emptyPassenger,
  validatePassengers,
  validateContact,
} from "@/components/order/OrderForms";
import { LoadingState, ErrorState } from "@/components/ResultShell";
import type { PassengerInfo, ContactInfo } from "@/lib/order-types";
import type { FlightPricingResponse } from "@/lib/order-types";
import { addOrderIndex, genOutTradeNo } from "@/lib/order-store";

export default function FlightBookPage() {
  return (
    <Suspense fallback={<LoadingState text="加载中..." />}>
      <FlightBookInner />
    </Suspense>
  );
}

function FlightBookInner() {
  const sp = useSearchParams();
  const router = useRouter();

  // 从 URL 取航班摘要信息（由 FlightCard 传入）
  const flightNo = sp.get("flight_no") || "";
  const airline = sp.get("airline") || "";
  const depCity = sp.get("dep_city") || "";
  const arrCity = sp.get("arr_city") || "";
  const depTime = sp.get("dep_time") || "";
  const arrTime = sp.get("arr_time") || "";
  const price = sp.get("price") || "";
  const searchOfferId = sp.get("token") || "";
  const date = sp.get("date") || "";

  const [passengers, setPassengers] = useState<PassengerInfo[]>([emptyPassenger()]);
  const [contact, setContact] = useState<ContactInfo>({ name: "", phone: "" });
  const [step, setStep] = useState<"fill" | "pricing" | "creating">("fill");
  const [pricing, setPricing] = useState<FlightPricingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!searchOfferId) {
    return (
      <ErrorState message="缺少预订令牌（token），请从航班列表点击「预订」进入" />
    );
  }

  /** 第一步：校验 + 验价 */
  const doPricing = async () => {
    setError(null);
    const ve = validatePassengers(passengers) || validateContact(contact);
    if (ve) {
      setError(ve);
      return;
    }
    setStep("pricing");
    try {
      const res = await fetch("/api/flight/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ search_offer_id: searchOfferId, passengers }),
      });
      const json = await res.json();
      if (json.code !== 0) throw new Error(json.message || "验价失败");
      setPricing(json.data);
      setStep("fill"); // 验价完成，展示确认区
    } catch (e) {
      setError((e as Error).message);
      setStep("fill");
    }
  };

  /** 第二步：创建订单 */
  const doCreateOrder = async () => {
    if (!pricing?.offer_id) {
      setError("验价结果缺失，请重新验价");
      return;
    }
    setError(null);
    setStep("creating");
    try {
      const outTradeNo = genOutTradeNo("flight");
      const origin = window.location.origin;
      const res = await fetch("/api/flight/order/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offer_id: pricing.offer_id,
          passengers,
          contact,
          out_trade_no: outTradeNo,
          pay_mode: "user_pay",
          return_url: `${origin}/payment/redirect?id=${outTradeNo}&type=flight`,
        }),
      });
      const json = await res.json();
      if (json.code !== 0) throw new Error(json.message || "下单失败");
      const order = json.data;
      // 记录到本地订单索引
      addOrderIndex({
        out_trade_no: outTradeNo,
        order_no: order.system_no,
        type: "flight",
        created_at: Date.now(),
        title: `${depCity}→${arrCity} ${flightNo}`,
        amount: order.total_amount,
      });
      // 跳转收银台
      if (order.checkout_url) {
        window.location.href = order.checkout_url;
      } else {
        router.push(`/orders/${order.system_no}?type=flight`);
      }
    } catch (e) {
      setError((e as Error).message);
      setStep("fill");
    }
  };

  const busy = step === "pricing" || step === "creating";

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      {/* 返回 */}
      <Link
        href={`/flight?from=${sp.get("from") || ""}&to=${sp.get("to") || ""}&date=${date}`}
        className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-brand-600 mb-4 transition"
      >
        ← 返回航班列表
      </Link>

      <h1 className="text-xl font-semibold mb-1">填写订单</h1>
      <p className="text-xs text-neutral-500 mb-6">机票预订 · 请仔细核对乘机人信息</p>

      {/* 航班信息摘要 */}
      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold tabular-nums">{depTime.slice(-5) || "--:--"}</div>
              <div className="text-xs text-neutral-500">{depCity}</div>
            </div>
            <div className="text-neutral-300 px-2">✈</div>
            <div className="text-center">
              <div className="text-lg font-semibold tabular-nums">{arrTime.slice(-5) || "--:--"}</div>
              <div className="text-xs text-neutral-500">{arrCity}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-neutral-400">{airline} {flightNo}</div>
            <div className="text-lg font-bold text-brand-600">¥{price}</div>
          </div>
        </div>
        <div className="mt-2 text-xs text-neutral-400">{date}</div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 mb-4">
          {error}
        </div>
      )}

      {/* 乘客表单 */}
      <div className="space-y-3 mb-6">
        {passengers.map((p, i) => (
          <PassengerForm
            key={i}
            index={i}
            value={p}
            onChange={(v) => setPassengers((prev) => prev.map((x, j) => (j === i ? v : x)))}
            onRemove={() => setPassengers((prev) => prev.filter((_, j) => j !== i))}
            canRemove={passengers.length > 1}
          />
        ))}
        <button
          type="button"
          onClick={() => setPassengers((prev) => [...prev, emptyPassenger()])}
          className="w-full py-2.5 rounded-xl border border-dashed border-neutral-300 text-sm text-neutral-500 hover:border-brand-400 hover:text-brand-600 transition"
        >
          + 添加乘客
        </button>
      </div>

      {/* 联系人 */}
      <div className="mb-6">
        <ContactForm value={contact} onChange={setContact} />
      </div>

      {/* 验价结果 */}
      {pricing && (
        <div className="rounded-2xl border border-brand-200 bg-brand-50/50 p-5 mb-6">
          <h3 className="text-sm font-semibold text-brand-700 mb-3">验价确认</h3>
          {pricing.price_changed && (
            <div className="text-xs text-orange-600 mb-2">⚠ 价格有变动，请确认后再支付</div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-600">订单总额</span>
            <span className="text-2xl font-bold text-brand-600">¥{pricing.total_fare}</span>
          </div>
          {pricing.refund_rule && (
            <div className="mt-2 text-xs text-neutral-500">退改：{pricing.refund_rule}</div>
          )}
          <div className="mt-1 text-xs text-neutral-400">
            支付有效期至 {pricing.expired_at}
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex gap-3">
        {!pricing ? (
          <button
            onClick={doPricing}
            disabled={busy}
            className="flex-1 h-12 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 disabled:opacity-60 transition"
          >
            {step === "pricing" ? "验价中..." : "确认信息并验价"}
          </button>
        ) : (
          <button
            onClick={doCreateOrder}
            disabled={busy}
            className="flex-1 h-12 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 disabled:opacity-60 transition"
          >
            {step === "creating" ? "提交订单中..." : `提交订单 ¥${pricing.total_fare}`}
          </button>
        )}
      </div>
    </div>
  );
}
