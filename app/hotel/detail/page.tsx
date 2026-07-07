"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LoadingState, ErrorState, EmptyState } from "@/components/ResultShell";
import {
  GuestForm,
  ContactForm,
  emptyGuest,
  validateGuests,
  validateContact,
} from "@/components/order/OrderForms";
import { addOrderIndex, genOutTradeNo } from "@/lib/order-store";
import type {
  HotelRoomsResponse,
  RoomType,
  RoomTypeProduct,
  GuestInfo,
  ContactInfo,
} from "@/lib/order-types";

/** 解析 "1" / "0" 字符串 → boolean */
function flag(v: string | null): boolean {
  return v === "1" || v === "true";
}

/** 解析数字字符串；缺失返回 undefined */
function num(v: string | null): number | undefined {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export default function HotelDetailPage() {
  return (
    <Suspense fallback={<LoadingState type="hotel" text="加载中..." />}>
      <HotelDetailInner />
    </Suspense>
  );
}

function HotelDetailInner() {
  const sp = useSearchParams();

  // 列表卡片传过来的展示字段（URL query）
  const hotelId = sp.get("hotel_id") || "";
  const hotelName = sp.get("hotel_name") || "未知酒店";
  const starRating = num(sp.get("star_rating"));
  const starTag = sp.get("star_tag") || "";
  const reviewScore = num(sp.get("review_score"));
  const reviewCount = num(sp.get("review_count"));
  const minPrice = num(sp.get("min_price"));
  const brandName = sp.get("brand_name") || "";
  const district = sp.get("district") || "";
  const businessZone = sp.get("business_zone") || "";
  const address = sp.get("address") || "";
  const destination = sp.get("destination") || "";
  const checkIn = sp.get("check_in") || "";
  const checkOut = sp.get("check_out") || "";
  const mainPicture = sp.get("main_picture") || "";
  const hasWifi = flag(sp.get("has_wifi"));
  const hasParking = flag(sp.get("has_parking"));
  const hasBreakfast = flag(sp.get("has_breakfast"));
  const hasSwimmingPool = flag(sp.get("has_swimming_pool"));

  // 从 sessionStorage 读 search_offer_id（列表点击时写入，仅用于拉房型）
  const [rooms, setRooms] = useState<HotelRoomsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 选中的房型产品（用于底部下单条）
  const [selectedProduct, setSelectedProduct] = useState<RoomTypeProduct | null>(null);
  const [selectedRoomName, setSelectedRoomName] = useState("");

  // 入住人 / 联系人 / 下单状态
  const router = useRouter();
  const [guests, setGuests] = useState<GuestInfo[]>([emptyGuest()]);
  const [contact, setContact] = useState<ContactInfo>({ name: "", phone: "" });
  const [creating, setCreating] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  useEffect(() => {
    const token =
      (typeof window !== "undefined" && sessionStorage.getItem("hotel_search_offer_id")) || "";
    if (!token) {
      setError("缺少查询令牌，请从酒店列表点击进入");
      setLoading(false);
      return;
    }
    fetch("/api/hotel/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ search_offer_id: token }),
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.code !== 0) throw new Error(json.message || "查询房型失败");
        setRooms(json.data);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 1;
    const diff = (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000;
    return Math.max(1, Math.round(diff));
  }, [checkIn, checkOut]);

  const addressLine = [businessZone, district, address].filter(Boolean).join(" · ");

  /** 直接在详情页下单（不再跳 /hotel/book，避免 offer_id 类型混淆） */
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
        title: `${rooms?.hotel_name || hotelName} · ${selectedRoomName}`,
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

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <Link
        href={`/hotel?destination=${encodeURIComponent(destination)}&checkIn=${checkIn}&checkOut=${checkOut}`}
        className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-brand-600 mb-4 transition"
      >
        ← 返回酒店列表
      </Link>

      {/* 头图 */}
      <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden bg-neutral-100 mb-5">
        {mainPicture ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={mainPicture}
            alt={hotelName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl text-neutral-300">
            ◆
          </div>
        )}
      </div>

      {/* 标题区 */}
      <div className="mb-4">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          {starTag && (
            <span className="px-1.5 py-0.5 rounded text-[11px] bg-brand-50 text-brand-600">
              {starTag}
            </span>
          )}
          {typeof starRating === "number" && starRating > 0 && (
            <span className="text-xs text-amber-500">
              {"★".repeat(Math.max(1, Math.min(5, Math.round(starRating))))}
            </span>
          )}
          {brandName && (
            <span className="text-[11px] text-neutral-400">{brandName}</span>
          )}
        </div>
        <h1 className="text-2xl font-semibold leading-snug">{hotelName}</h1>
        {addressLine && (
          <p className="mt-1.5 text-sm text-neutral-500">📍 {addressLine}</p>
        )}
      </div>

      {/* 价格 + 评分条 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <InfoCard label="起价" value={minPrice != null ? `¥${minPrice}/晚` : "—"} />
        <InfoCard
          label="评分"
          value={
            typeof reviewScore === "number"
              ? `${reviewScore.toFixed(1)}`
              : "—"
          }
          sub={typeof reviewCount === "number" ? `${reviewCount} 条评价` : undefined}
          valueClass="text-amber-600"
        />
        <InfoCard
          label="入住 / 离店"
          value={checkIn && checkOut ? `${checkIn} → ${checkOut}` : "—"}
          sub={`${nights} 晚`}
          className="col-span-2 sm:col-span-1"
        />
      </div>

      {/* 设施标签 */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Tag on={hasWifi} label="WiFi" />
        <Tag on={hasParking} label="停车场" />
        <Tag on={hasBreakfast} label="含早餐" />
        <Tag on={hasSwimmingPool} label="游泳池" />
      </div>

      {/* 房型列表 */}
      <h2 className="text-base font-semibold mb-3">选择房型</h2>
      {loading && <LoadingState type="hotel" text="正在查询房型" count={3} />}
      {error && <ErrorState message={error} />}
      {!loading && !error && (
        <>
          {rooms?.room_types?.length ? (
            <div className="space-y-3 mb-8">
              {rooms.room_types.map((rt) => (
                <RoomTypeCard
                  key={rt.room_type_id}
                  room={rt}
                  nights={nights}
                  selectedOfferId={selectedProduct?.offer_id}
                  onSelect={(p) => {
                    setSelectedProduct(p);
                    setSelectedRoomName(rt.room_name);
                  }}
                />
              ))}
            </div>
          ) : (
            <EmptyState title="暂无可预订房型" hint="请尝试更换日期或其它酒店" />
          )}
        </>
      )}

      {/* 选中房型后展示联系人 + 入住人表单，直接在详情页下单 */}
      {selectedProduct && !loading && !error && (
        <>
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
          <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-neutral-200 -mx-6 px-6 py-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs text-neutral-400 truncate">
                {selectedRoomName} · {nights}晚 · {selectedProduct.product_name}
              </div>
              <div className="text-xl font-bold text-brand-600">
                ¥{(selectedProduct.price * nights).toFixed(0)}
              </div>
            </div>
            <button
              onClick={doCreateOrder}
              disabled={creating}
              className="px-8 h-11 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 disabled:opacity-60 transition shrink-0"
            >
              {creating ? "提交中..." : "立即预订"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ----------------------------- 子组件 ----------------------------- */

function InfoCard({
  label,
  value,
  sub,
  className = "",
  valueClass = "text-brand-600",
}: {
  label: string;
  value: string;
  sub?: string;
  className?: string;
  valueClass?: string;
}) {
  return (
    <div className={`rounded-xl border border-neutral-200 bg-white px-4 py-3 ${className}`}>
      <div className="text-[11px] text-neutral-400 mb-0.5">{label}</div>
      <div className={`text-base font-bold tabular-nums ${valueClass}`}>{value}</div>
      {sub && <div className="text-[11px] text-neutral-400 mt-0.5">{sub}</div>}
    </div>
  );
}

function Tag({ on, label }: { on: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs ${
        on
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
          : "bg-neutral-50 text-neutral-400 border border-neutral-200"
      }`}
    >
      <span>{on ? "✓" : "—"}</span>
      {label}
    </span>
  );
}

function RoomTypeCard({
  room,
  nights,
  selectedOfferId,
  onSelect,
}: {
  room: RoomType;
  nights: number;
  selectedOfferId?: string;
  onSelect: (p: RoomTypeProduct) => void;
}) {
  const meta = [
    room.bed_type,
    room.area ? `${room.area}㎡` : "",
    room.max_occupancy ? `${room.max_occupancy}人` : "",
    room.has_window != null ? (room.has_window ? "有窗" : "无窗") : "",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="rounded-2xl border border-neutral-200 overflow-hidden">
      {/* 房型头 */}
      <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-200">
        <div className="font-medium text-sm">{room.room_name}</div>
        {meta && <div className="text-xs text-neutral-500 mt-0.5">{meta}</div>}
      </div>

      {/* 产品列表 */}
      <div className="divide-y divide-neutral-100">
        {room.products.map((p) => {
          const active = selectedOfferId === p.offer_id;
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
                  name="room-product"
                  checked={active}
                  onChange={() => onSelect(p)}
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
                <div className="text-base font-bold text-brand-600">
                  ¥{p.price}
                </div>
                <div className="text-[11px] text-neutral-400">
                  {nights}晚 ¥{(p.price * nights).toFixed(0)}
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
