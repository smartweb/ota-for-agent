"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  GuestForm,
  ContactForm,
  emptyGuest,
  validateGuests,
  validateContact,
} from "@/components/order/OrderForms";
import { LoadingState, ErrorState, EmptyState } from "@/components/ResultShell";
import type { ContactInfo, GuestInfo, RoomTypeProduct } from "@/lib/order-types";
import type { HotelRoomsResponse } from "@/lib/order-types";
import { addOrderIndex, genOutTradeNo } from "@/lib/order-store";

export default function HotelBookPage() {
  return (
    <Suspense fallback={<LoadingState text="加载中..." />}>
      <HotelBookInner />
    </Suspense>
  );
}

function HotelBookInner() {
  const sp = useSearchParams();
  const router = useRouter();

  const searchOfferId = sp.get("token") || "";
  const hotelName = sp.get("hotel_name") || "";
  const hotelPrice = sp.get("price") || "";
  const destination = sp.get("destination") || "";
  const checkIn = sp.get("check_in") || "";
  const checkOut = sp.get("check_out") || "";

  const [rooms, setRooms] = useState<HotelRoomsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<RoomTypeProduct | null>(null);
  const [selectedRoomName, setSelectedRoomName] = useState("");

  const [guests, setGuests] = useState<GuestInfo[]>([emptyGuest()]);
  const [contact, setContact] = useState<ContactInfo>({ name: "", phone: "" });
  const [creating, setCreating] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // 拉房型
  useEffect(() => {
    if (!searchOfferId) {
      setError("缺少预订令牌（token），请从酒店列表点击「预订」进入");
      setLoading(false);
      return;
    }
    fetch("/api/hotel/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ search_offer_id: searchOfferId }),
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.code !== 0) throw new Error(json.message || "查询房型失败");
        setRooms(json.data);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [searchOfferId]);

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 1;
    const diff = (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000;
    return Math.max(1, Math.round(diff));
  }, [checkIn, checkOut]);

  /** 下单 */
  const doCreateOrder = async () => {
    if (!selectedProduct?.offer_id) {
      setOrderError("请先选择房型");
      return;
    }
    setOrderError(null);
    const ve = validateGuests(guests) || validateContact(contact);
    if (ve) {
      setOrderError(ve);
      return;
    }
    setCreating(true);
    try {
      const outTradeNo = genOutTradeNo("hotel");
      const origin = window.location.origin;
      const res = await fetch("/api/hotel/order/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offer_id: selectedProduct.offer_id,
          out_trade_no: outTradeNo,
          contact,
          guests,
          pay_mode: "user_pay",
          return_url: `${origin}/payment/redirect?id=${outTradeNo}&type=hotel`,
        }),
      });
      const json = await res.json();
      if (json.code !== 0) throw new Error(json.message || "下单失败");
      const order = json.data;
      addOrderIndex({
        out_trade_no: outTradeNo,
        order_no: order.order_no,
        type: "hotel",
        created_at: Date.now(),
        title: `${order.hotel_name || hotelName} · ${order.room_name || selectedRoomName}`,
        amount: order.total_amount,
      });
      if (order.checkout_url) {
        window.location.href = order.checkout_url;
      } else {
        router.push(`/orders/${order.order_no}?type=hotel`);
      }
    } catch (e) {
      setOrderError((e as Error).message);
      setCreating(false);
    }
  };

  if (loading) return <LoadingState text="正在查询房型..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <Link
        href={`/hotel?destination=${encodeURIComponent(destination)}&checkIn=${checkIn}&checkOut=${checkOut}`}
        className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-brand-600 mb-4 transition"
      >
        ← 返回酒店列表
      </Link>

      <h1 className="text-xl font-semibold mb-1">{rooms?.hotel_name || hotelName}</h1>
      <p className="text-xs text-neutral-500 mb-6">
        {checkIn} → {checkOut} · {nights} 晚
      </p>

      {/* 房型/产品选择 */}
      <h2 className="text-sm font-semibold mb-3">选择房型</h2>
      {rooms?.room_types?.length ? (
        <div className="space-y-3 mb-8">
          {rooms.room_types.map((rt) => (
            <div key={rt.room_type_id} className="rounded-2xl border border-neutral-200 overflow-hidden">
              <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-200">
                <div className="font-medium text-sm">{rt.room_name}</div>
                <div className="text-xs text-neutral-500 mt-0.5">
                  {[rt.bed_type && "床型", rt.area && `${rt.area}㎡`, rt.has_window ? "有窗" : "无窗"]
                    .filter(Boolean)
                    .join(" · ")}
                </div>
              </div>
              <div className="divide-y divide-neutral-100">
                {rt.products.map((p) => {
                  const active = selectedProduct?.offer_id === p.offer_id;
                  return (
                    <label
                      key={p.product_id}
                      className={`flex items-center justify-between px-4 py-3 cursor-pointer transition ${
                        active ? "bg-brand-50" : "hover:bg-neutral-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="product"
                          checked={active}
                          onChange={() => {
                            setSelectedProduct(p);
                            setSelectedRoomName(rt.room_name);
                          }}
                          className="accent-brand-500"
                        />
                        <div>
                          <div className="text-sm">{p.product_name}</div>
                          <div className="text-xs text-neutral-500 mt-0.5">
                            {p.has_breakfast ? "含早" : "无早"} ·{" "}
                            {p.refundable ? "可取消" : "不可取消"}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-bold text-brand-600">¥{p.price}</div>
                        <div className="text-[11px] text-neutral-400">/晚</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="暂无可预订房型" />
      )}

      {orderError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 mb-4">
          {orderError}
        </div>
      )}

      {/* 入住人 */}
      <h2 className="text-sm font-semibold mb-3">入住人</h2>
      <div className="space-y-2 mb-6">
        {guests.map((g, i) => (
          <GuestForm
            key={i}
            index={i}
            value={g}
            onChange={(v) => setGuests((prev) => prev.map((x, j) => (j === i ? v : x)))}
            onRemove={() => setGuests((prev) => prev.filter((_, j) => j !== i))}
            canRemove={guests.length > 1}
          />
        ))}
        <button
          type="button"
          onClick={() => setGuests((prev) => [...prev, emptyGuest()])}
          className="w-full py-2 rounded-xl border border-dashed border-neutral-300 text-sm text-neutral-500 hover:border-brand-400 hover:text-brand-600 transition"
        >
          + 添加入住人
        </button>
      </div>

      {/* 联系人 */}
      <div className="mb-6">
        <ContactForm value={contact} onChange={setContact} />
      </div>

      {/* 底部下单条 */}
      {selectedProduct && (
        <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-neutral-200 -mx-6 px-6 py-3 flex items-center justify-between gap-3">
          <div>
            <div className="text-xs text-neutral-400">
              {selectedRoomName} · {nights}晚
            </div>
            <div className="text-xl font-bold text-brand-600">
              ¥{(selectedProduct.price * nights).toFixed(0)}
            </div>
          </div>
          <button
            onClick={doCreateOrder}
            disabled={creating}
            className="px-8 h-11 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 disabled:opacity-60 transition"
          >
            {creating ? "提交中..." : "提交订单"}
          </button>
        </div>
      )}
    </div>
  );
}
