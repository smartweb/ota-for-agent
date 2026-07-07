"use client";

import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { LoadingState, ErrorState } from "@/components/ResultShell";
import { StatusBadge } from "@/components/order/OrderStatus";
import type {
  FlightOrderDetailResponse,
  HotelOrderDetailResponse,
  BusOrderDetailResponse,
} from "@/lib/order-types";

export default function OrderDetailPage() {
  return (
    <Suspense fallback={<LoadingState text="加载中..." />}>
      <OrderDetailInner />
    </Suspense>
  );
}

function OrderDetailInner() {
  const params = useParams();
  const sp = useSearchParams();
  const orderId = (params?.id as string) || "";
  const type = sp.get("type") || "flight";

  const [detail, setDetail] = useState<
    FlightOrderDetailResponse | HotelOrderDetailResponse | BusOrderDetailResponse | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canceling, setCanceling] = useState(false);

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      let res: Response;
      if (type === "flight") {
        res = await fetch("/api/flight/order/detail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ system_no: orderId }),
        });
      } else if (type === "bus") {
        res = await fetch("/api/bus/order/detail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ system_no: orderId }),
        });
      } else {
        res = await fetch(`/api/hotel/order/detail/${orderId}`);
      }
      const json = await res.json();
      if (json.code !== 0) throw new Error(json.message);
      setDetail(json.data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, type]);

  const handleCancel = async () => {
    if (!confirm("确定取消该订单吗？")) return;
    setCanceling(true);
    try {
      const endpoint =
        type === "flight"
          ? "/api/flight/order/cancel"
          : type === "bus"
          ? "/api/bus/order/cancel"
          : "/api/hotel/order/cancel";
      const body =
        type === "hotel"
          ? { order_no: orderId }
          : { system_no: orderId };
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.code !== 0) throw new Error(json.message);
      alert(json.data?.message || "取消成功");
      fetchDetail();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setCanceling(false);
    }
  };

  if (loading) return <LoadingState text="加载订单..." />;
  if (error) return <ErrorState message={error} />;
  if (!detail)
    return (
      <div className="mx-auto max-w-2xl px-6 py-12">
        <p className="text-neutral-500">未找到订单</p>
      </div>
    );

  const isFlight = type === "flight";
  const isBus = type === "bus";
  /* 机票/酒店/巴士订单字段名不同，统一用索引签名访问 */
  const d: Record<string, any> = detail as Record<string, any>;
  const status = d.status || "";
  const totalAmount = d.total_amount;
  const orderNoDisplay = d.system_no || d.order_no || orderId;
  const payDeadline = d.pay_expire_time || d.expires_at;

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <Link
        href="/orders"
        className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-brand-600 mb-4 transition"
      >
        ← 返回订单列表
      </Link>

      {/* 状态卡片 */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold">
            {isFlight ? "机票订单" : isBus ? "巴士订单" : "酒店订单"}
          </h1>
          <StatusBadge status={status} text={d.status_text} />
        </div>
        <div className="text-xs text-neutral-400 space-y-1">
          <div>订单号：{orderNoDisplay}</div>
          {d.created_at && <div>下单时间：{d.created_at}</div>}
          {payDeadline && <div>支付截止：{payDeadline}</div>}
        </div>
      </div>

      {/* 业务信息 */}
      {isFlight ? (
        <FlightDetailInfo detail={detail as FlightOrderDetailResponse} />
      ) : isBus ? (
        <BusDetailInfo detail={detail as BusOrderDetailResponse} />
      ) : (
        <HotelDetailInfo detail={detail as HotelOrderDetailResponse} />
      )}

      {/* 金额 */}
      {typeof totalAmount === "number" && (
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-600">订单总额</span>
            <span className="text-2xl font-bold text-brand-600">¥{totalAmount}</span>
          </div>
        </div>
      )}

      {/* 操作 */}
      <div className="flex gap-3">
        {(d.can_cancel || d.cancel_info?.can_cancel) && (
          <button
            onClick={handleCancel}
            disabled={canceling}
            className="px-6 h-11 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 disabled:opacity-60 transition"
          >
            {canceling ? "取消中..." : "取消订单"}
          </button>
        )}
        {/* 待支付状态提供重新支付（跳详情系统会展示 checkout_url，这里简化为去列表） */}
        {(status === "pending_pay" || status === "pending_payment") && (
          <Link
            href="/orders"
            className="px-6 h-11 inline-flex items-center rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition"
          >
            去支付
          </Link>
        )}
      </div>
    </div>
  );
}

/* ----------------------------- 机票详情信息 ----------------------------- */

function FlightDetailInfo({ detail }: { detail: FlightOrderDetailResponse }) {
  const fi = detail.flight_info;
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 mb-4">
      <h2 className="text-sm font-semibold mb-3">航班信息</h2>
      {fi && (
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="text-center">
            <div className="text-lg font-semibold">{fi.dep_time?.slice(-5) || "--:--"}</div>
            <div className="text-xs text-neutral-500">{fi.dep_city}</div>
            <div className="text-xs text-neutral-400">{fi.dep_airport_name}</div>
          </div>
          <div className="text-center text-neutral-400">
            <div className="text-xs">{fi.airline_name} {fi.flight_no}</div>
            <div className="text-lg">✈</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">{fi.arr_time?.slice(-5) || "--:--"}</div>
            <div className="text-xs text-neutral-500">{fi.arr_city}</div>
            <div className="text-xs text-neutral-400">{fi.arr_airport_name}</div>
          </div>
        </div>
      )}
      {detail.ticket_nos && detail.ticket_nos.length > 0 && (
        <div className="mt-3 pt-3 border-t border-neutral-100 text-xs text-neutral-500">
          票号：{detail.ticket_nos.join(", ")}
        </div>
      )}
      {detail.passengers && detail.passengers.length > 0 && (
        <div className="mt-3 pt-3 border-t border-neutral-100">
          <div className="text-xs font-medium text-neutral-500 mb-2">乘客</div>
          <div className="space-y-1">
            {detail.passengers.map((p, i) => (
              <div key={i} className="text-xs text-neutral-600">
                {p.name} · {p.id_type} {p.id_number.slice(-4)} · {p.phone}
              </div>
            ))}
          </div>
        </div>
      )}
      {detail.refund_rule?.text && (
        <div className="mt-3 pt-3 border-t border-neutral-100 text-xs text-neutral-500">
          退改规则：{detail.refund_rule.text}
        </div>
      )}
    </div>
  );
}

/* ----------------------------- 酒店详情信息 ----------------------------- */

function HotelDetailInfo({ detail }: { detail: HotelOrderDetailResponse }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 mb-4">
      <h2 className="text-sm font-semibold mb-3">酒店信息</h2>
      <div className="space-y-2 text-sm">
        <Row label="酒店" value={detail.hotel_name} />
        <Row label="房型" value={`${detail.room_name || ""} · ${detail.room_count || 1}间`} />
        <Row label="入住" value={`${detail.check_in} → ${detail.check_out} (${detail.nights || 1}晚)`} />
        {detail.confirmation_no && <Row label="确认号" value={detail.confirmation_no} />}
        {detail.hotel_address && <Row label="地址" value={detail.hotel_address} />}
        {detail.guests && detail.guests.length > 0 && (
          <Row label="入住人" value={detail.guests.map((g) => g.name).join("、")} />
        )}
      </div>
      {detail.cancel_info?.cancel_policy_rules && detail.cancel_info.cancel_policy_rules.length > 0 && (
        <div className="mt-3 pt-3 border-t border-neutral-100 text-xs text-neutral-500">
          取消政策：
          {detail.cancel_info.cancel_policy_rules.map((r, i) => (
            <span key={i} className="block">
              {r.desc || (r.cancel_type === 1 ? "可取消" : "不可取消")}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex gap-3">
      <span className="text-neutral-400 w-16 shrink-0">{label}</span>
      <span className="text-neutral-700">{value || "—"}</span>
    </div>
  );
}

/* ----------------------------- 巴士详情信息 ----------------------------- */

function BusDetailInfo({ detail }: { detail: BusOrderDetailResponse }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 mb-4">
      <h2 className="text-sm font-semibold mb-3">行程信息</h2>
      <div className="space-y-2 text-sm">
        <Row
          label="发车"
          value={`${detail.start_class_time || ""} · ${detail.start_station_name || ""}`}
        />
        <Row
          label="到达"
          value={`${detail.end_class_time || ""} · ${detail.end_station_name || ""}`}
        />
        {detail.contact_phone && <Row label="联系电话" value={detail.contact_phone} />}
      </div>

      {/* 乘客 */}
      {detail.passengers && detail.passengers.length > 0 && (
        <div className="mt-3 pt-3 border-t border-neutral-100">
          <div className="text-xs font-medium text-neutral-500 mb-2">乘车人</div>
          <div className="space-y-1">
            {detail.passengers.map((p, i) => (
              <div key={i} className="text-xs text-neutral-600">
                {p.name}
                {p.is_child && <span className="ml-1 text-amber-600">儿童</span>}
                {p.cert_no && ` · ${p.cert_no.slice(-4)}`}
                {p.phone && ` · ${p.phone}`}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 车票 */}
      {detail.tickets && detail.tickets.length > 0 && (
        <div className="mt-3 pt-3 border-t border-neutral-100">
          <div className="text-xs font-medium text-neutral-500 mb-2">车票</div>
          <div className="space-y-1.5">
            {detail.tickets.map((t, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-xs text-neutral-600 bg-neutral-50 rounded px-2 py-1.5"
              >
                <div>
                  {t.passenger_name}
                  {t.seat_no && ` · 座位 ${t.seat_no}`}
                  {t.ticket_type && ` · ${t.ticket_type}`}
                </div>
                <div className="flex items-center gap-2">
                  {typeof t.pay_amount === "number" && (
                    <span className="text-brand-600">¥{t.pay_amount}</span>
                  )}
                  {t.ticket_status && (
                    <span className="text-neutral-400">{t.ticket_status}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
