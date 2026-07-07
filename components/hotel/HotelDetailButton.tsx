"use client";

import { useRouter } from "next/navigation";

/**
 * 酒店详情页的「预订」按钮。
 * 复用 BookButton 的 token 写入逻辑：把超长的 search_offer_id 存入 sessionStorage，
 * URL 只携带简短展示信息，跳转到现有 /hotel/book 预订页。
 *
 * 与 BookButton 的区别：可在父组件内指定要下单的 offerId（房型选择后），
 * 默认沿用列表卡片传来的 search_offer_id。
 */
export default function HotelDetailButton({
  offerId,
  searchOfferId,
  hotelName,
  roomName,
  price,
  destination,
  checkIn,
  checkOut,
  nights,
  className,
  children,
}: {
  /** 选中的房型产品 offer_id；若指定则下单用它，否则回退到 search_offer_id */
  offerId?: string;
  searchOfferId?: string;
  hotelName?: string;
  roomName?: string;
  price?: number;
  destination?: string;
  checkIn?: string;
  checkOut?: string;
  nights?: number;
  className?: string;
  children?: React.ReactNode;
}) {
  const router = useRouter();

  const handleClick = () => {
    // 优先使用选中房型的 offer_id，否则回退到搜索 offer
    const token = offerId || searchOfferId;
    if (!token) return;
    sessionStorage.setItem("hotel_search_offer_id", token);
    sessionStorage.setItem(
      "hotel_book_meta",
      JSON.stringify({ hotelName, roomName, price, destination, checkIn, checkOut, nights })
    );

    const params = new URLSearchParams({
      hotel_name: hotelName || "",
      price: String(price ?? ""),
      destination: destination || "",
      check_in: checkIn || "",
      check_out: checkOut || "",
    });
    router.push(`/hotel/book?${params.toString()}`);
  };

  return (
    <button
      onClick={handleClick}
      className={
        className ||
        "px-8 h-11 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition"
      }
    >
      {children || "立即预订"}
    </button>
  );
}
