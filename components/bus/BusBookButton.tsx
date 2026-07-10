"use client";

import { useRouter } from "next/navigation";
import type { BusItem } from "@/lib/types";

/**
 * 巴士预订按钮：把班次下单所需的 GID（gid / start_station_gid / end_station_gid）
 * 写入 sessionStorage（key=bus_book_meta），URL 只携带简短展示信息，
 * 跳转 /bus/book 完成下单。避免 URL 过长。
 */
export default function BusBookButton({
  bus,
  disabled,
  searchParams,
}: {
  bus: BusItem;
  disabled?: boolean;
  /** 列表页搜索上下文（adcode + date），用于预订页"返回列表"还原 */
  searchParams?: { from?: string; to?: string; date?: string };
}) {
  const router = useRouter();

  const handleClick = () => {
    // 下单必填：line_class_day_gid（=gid）+ start_station_gid + end_station_gid
    if (!bus.gid) return;
    sessionStorage.setItem(
      "bus_book_meta",
      JSON.stringify({
        line_class_day_gid: bus.gid,
        start_station_gid: bus.start_station_gid,
        end_station_gid: bus.end_station_gid,
        dep_time: bus.dep_time,
        dep_date: bus.dep_date,
        start_station_name: bus.start_station_name,
        end_station_name: bus.end_station_name,
        from_city: bus.from_city,
        to_city: bus.to_city,
        class_name: bus.class_name,
        price: bus.price, // 分
        line_name: bus.line_name,
        // 搜索上下文（adcode），返回列表时用
        search_from: searchParams?.from || "",
        search_to: searchParams?.to || "",
        search_date: searchParams?.date || "",
      })
    );

    const params = new URLSearchParams({
      from: bus.from_city || "",
      to: bus.to_city || "",
      dep_time: bus.dep_time || "",
      dep_date: bus.dep_date || "",
      start_station: bus.start_station_name || "",
      end_station: bus.end_station_name || "",
      class_name: bus.class_name || "",
      price: String(bus.price ?? ""), // 分
    });
    router.push(`/bus/book?${params.toString()}`);
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className="mt-2 px-4 py-1.5 rounded-lg bg-brand-500 text-white text-xs font-medium hover:bg-brand-600 disabled:bg-neutral-300 disabled:cursor-not-allowed transition"
    >
      {disabled ? "售罄" : "预订"}
    </button>
  );
}
