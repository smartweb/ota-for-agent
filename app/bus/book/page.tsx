"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LoadingState, ErrorState } from "@/components/ResultShell";
import {
  ContactForm,
  BusPassengerForm,
  emptyBusPassenger,
  validateBusPassengers,
  validateContact,
} from "@/components/order/OrderForms";
import type { BusPassenger, ContactInfo } from "@/lib/order-types";
import { addOrderIndex, genOutTradeNo } from "@/lib/order-store";
import { useGuardedAction } from "@/lib/use-guarded-action";

interface BusBookMeta {
  line_class_day_gid: string;
  start_station_gid?: string;
  end_station_gid?: string;
  dep_time?: string;
  dep_date?: string;
  start_station_name?: string;
  end_station_name?: string;
  from_city?: string;
  to_city?: string;
  class_name?: string;
  price?: number; // 分
  line_name?: string;
  // 搜索上下文（adcode + date），用于"返回列表"还原
  search_from?: string;
  search_to?: string;
  search_date?: string;
}

/** 分 → 元 */
function fenToYuan(fen?: number): string {
  if (fen == null) return "—";
  return (fen / 100).toLocaleString("zh-CN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export default function BusBookPage() {
  return (
    <Suspense fallback={<LoadingState text="加载中..." />}>
      <BusBookInner />
    </Suspense>
  );
}

function BusBookInner() {
  const sp = useSearchParams();
  const from = sp.get("from") || "";
  const to = sp.get("to") || "";
  const depTime = sp.get("dep_time") || "";
  const depDate = sp.get("dep_date") || "";
  const startStation = sp.get("start_station") || "";
  const endStation = sp.get("end_station") || "";
  const className = sp.get("class_name") || "";
  const priceFen = Number(sp.get("price") || 0);

  const [meta, setMeta] = useState<BusBookMeta | null>(null);
  const [contact, setContact] = useState<ContactInfo>({ name: "", phone: "" });
  const [passengers, setPassengers] = useState<BusPassenger[]>([emptyBusPassenger()]);
  const [pricing, setPricing] = useState<{ total: number; seats: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 从 sessionStorage 读取下单所需的 GID（及搜索上下文）
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = sessionStorage.getItem("bus_book_meta");
      setMeta(raw ? (JSON.parse(raw) as BusBookMeta) : null);
    } catch {
      setMeta(null);
    }
  }, []);

  // 返回列表链接：优先用 sessionStorage 里的搜索 adcode，回退到 URL（兼容旧链接）
  const backToListHref = useMemo(() => {
    const f = meta?.search_from || sp.get("from") || "";
    const t = meta?.search_to || sp.get("to") || "";
    const d = meta?.search_date || depDate || "";
    const q = new URLSearchParams({ from: f, to: t, date: d });
    return `/bus?${q.toString()}`;
  }, [meta, sp, depDate]);

  const invalid = !meta?.line_class_day_gid || !meta?.start_station_gid || !meta?.end_station_gid;

  /** 询价 + 下单（防重复提交） */
  const handleSubmit = useGuardedAction(async () => {
    setError(null);

    if (invalid) {
      setError("缺少班次/站点信息，请从巴士列表点击「预订」进入");
      return;
    }
    const ve = validateBusPassengers(passengers) || validateContact(contact);
    if (ve) {
      setError(ve);
      return;
    }
    if (!contact.phone) {
      setError("请填写联系人手机号");
      return;
    }

    setSubmitting(true);
    try {
      // 1. 询价（确认余票和总价）
      const preRes = await fetch("/api/bus/order/pre", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          line_class_day_gid: meta!.line_class_day_gid,
          start_station_gid: meta!.start_station_gid,
          end_station_gid: meta!.end_station_gid,
          passengers,
        }),
      });
      const preJson = await preRes.json();
      if (preJson.code !== 0) throw new Error(preJson.message || "询价失败");
      const totalPriceYuan = preJson.data.total_price as number;
      const seats = preJson.data.avail_seat_count as number;
      if (seats < passengers.length) {
        throw new Error(`余票不足：剩余 ${seats} 张，需要 ${passengers.length} 张`);
      }
      setPricing({ total: totalPriceYuan, seats });

      // 2. 创建订单
      const outTradeNo = genOutTradeNo("bus");
      const origin = window.location.origin;
      const createRes = await fetch("/api/bus/order/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          line_class_day_gid: meta!.line_class_day_gid,
          start_station_gid: meta!.start_station_gid,
          end_station_gid: meta!.end_station_gid,
          passengers,
          user_phone: contact.phone,
          out_trade_no: outTradeNo,
          // 创建订单的 total_amount 单位是分，仅校验用
          total_amount: Math.round(totalPriceYuan * 100),
          pay_mode: "user_pay",
          return_url: `${origin}/payment/redirect?id=${outTradeNo}&type=bus`,
        }),
      });
      const json = await createRes.json();
      if (json.code !== 0) throw new Error(json.message || "下单失败");
      const order = json.data;

      addOrderIndex({
        out_trade_no: outTradeNo,
        order_no: order.system_no,
        type: "bus",
        created_at: Date.now(),
        title: `${from} → ${to} · ${depDate} ${depTime} ${startStation}`,
        amount: order.total_amount / 100, // 分 → 元
      });

      if (order.checkout_url) {
        window.location.href = order.checkout_url;
      } else {
        window.location.href = `/orders/${order.system_no}?type=bus`;
      }
    } catch (e) {
      setError((e as Error).message);
      setSubmitting(false);
    }
  });

  if (invalid && meta !== null) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-8">
        <ErrorState message="缺少下单所需的班次/站点信息，请返回列表重新选择" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <Link
        href={backToListHref}
        className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-brand-600 mb-4 transition"
      >
        ← 返回巴士列表
      </Link>

      {/* 行程信息 */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-5 mb-4">
        <h1 className="text-lg font-semibold mb-3">
          {from} → {to}
        </h1>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Info label="出发日期" value={depDate} />
          <Info label="发车时间" value={depTime} />
          <Info label="上车点" value={startStation} />
          <Info label="下车点" value={endStation} />
          <Info label="车型" value={className} />
          <Info label="票价" value={`¥${fenToYuan(priceFen)}/人`} />
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 mb-4">
          {error}
        </div>
      )}

      {/* 联系人 */}
      <div className="mb-4">
        <ContactForm value={contact} onChange={setContact} />
      </div>

      {/* 乘客 */}
      <h2 className="text-sm font-semibold mb-3">乘车人</h2>
      <div className="space-y-3 mb-4">
        {passengers.map((p, i) => (
          <BusPassengerForm
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
          onClick={() => setPassengers((prev) => [...prev, emptyBusPassenger()])}
          className="w-full py-2 rounded-xl border border-dashed border-neutral-300 text-sm text-neutral-500 hover:border-brand-400 hover:text-brand-600 transition"
        >
          + 添加乘车人
        </button>
      </div>

      {/* 底部下单条 */}
      <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-neutral-200 -mx-6 px-6 py-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-xs text-neutral-400">
            {passengers.length} 人 {pricing && `· 余票 ${pricing.seats}`}
          </div>
          <div className="text-xl font-bold text-brand-600">
            ¥{pricing ? pricing.total : fenToYuan(priceFen * passengers.length)}
          </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="px-8 h-11 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 disabled:opacity-60 transition"
        >
          {submitting ? "提交中..." : "立即预订"}
        </button>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <div className="text-[11px] text-neutral-400">{label}</div>
      <div className="text-neutral-800">{value || "—"}</div>
    </div>
  );
}
