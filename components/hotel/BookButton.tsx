"use client";

import { useRouter } from "next/navigation";

/**
 * 酒店预订按钮：把超长的 search_offer_id 存入 sessionStorage，
 * URL 只携带简短展示信息（酒店名/价格/日期），避免 URL 过长。
 */
export default function BookButton({
  searchOfferId,
  hotelName,
  price,
  destination,
  checkIn,
  checkOut,
}: {
  searchOfferId?: string;
  hotelName?: string;
  price?: number | string;
  destination?: string;
  checkIn?: string;
  checkOut?: string;
}) {
  const router = useRouter();

  const handleClick = () => {
    if (!searchOfferId) return;
    // 存 token 到 sessionStorage，book 页读取
    sessionStorage.setItem("hotel_search_offer_id", searchOfferId);
    sessionStorage.setItem("hotel_book_meta", JSON.stringify({ hotelName, price, destination, checkIn, checkOut }));

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
      className="px-4 py-1.5 rounded-lg bg-brand-500 text-white text-xs font-medium hover:bg-brand-600 transition"
    >
      预订
    </button>
  );
}
