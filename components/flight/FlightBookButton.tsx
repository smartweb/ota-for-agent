"use client";

import { useRouter } from "next/navigation";

/**
 * 机票预订按钮：把超长的 search_offer_id 存入 sessionStorage，
 * URL 只携带简短展示信息，避免 URL 过长。
 */
export default function FlightBookButton({
  searchOfferId,
  flightNo,
  airline,
  depCity,
  arrCity,
  depTime,
  arrTime,
  price,
  date,
  from,
  to,
}: {
  searchOfferId?: string;
  flightNo?: string;
  airline?: string;
  depCity?: string;
  arrCity?: string;
  depTime?: string;
  arrTime?: string;
  price?: number | string;
  date?: string;
  from?: string;
  to?: string;
}) {
  const router = useRouter();

  const handleClick = () => {
    if (!searchOfferId) return;
    sessionStorage.setItem("flight_search_offer_id", searchOfferId);

    const params = new URLSearchParams({
      flight_no: flightNo || "",
      airline: airline || "",
      dep_city: depCity || "",
      arr_city: arrCity || "",
      dep_time: depTime || "",
      arr_time: arrTime || "",
      price: String(price ?? ""),
      date: date || "",
      from: from || "",
      to: to || "",
    });
    router.push(`/flight/book?${params.toString()}`);
  };

  return (
    <button
      onClick={handleClick}
      className="mt-2 inline-block px-4 py-1.5 rounded-lg bg-brand-500 text-white text-xs font-medium hover:bg-brand-600 transition"
    >
      预订
    </button>
  );
}
