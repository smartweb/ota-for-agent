import Link from "next/link";
import type { FlightItem } from "@/lib/types";

/** "2026-06-01 08:00" → "08:00" */
function hhmm(s?: string): string {
  if (!s) return "--:--";
  const m = s.match(/(\d{2}:\d{2})/);
  return m ? m[1] : s;
}

function durationLabel(min?: number): string {
  if (!min) return "";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h${m}m` : `${h}h`;
}

/**
 * 折扣格式化。
 * 接口实测返回「折」单位（如 2、2.3 = 2 折、2.3 折）；
 * 文档示例出现过小数（0.5 = 5 折）。用阈值判断：< 1 视为小数 ×10，否则原值。
 */
function formatDiscount(rate: number): string {
  const zhe = rate < 1 ? rate * 10 : rate;
  return zhe.toFixed(1).replace(/\.0$/, "");
}

export default function FlightCard({
  flight,
  searchParams,
}: {
  flight: FlightItem;
  /** 当前搜索的 from/to/date，用于预订页返回链 */
  searchParams?: { from?: string; to?: string; date?: string };
}) {
  const cabin = flight.cabins?.[0];
  const price = cabin?.adult_price ?? cabin?.lowest_price;

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 hover:border-brand-300 hover:shadow-hover transition-all">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* 航司 */}
        <div className="flex items-center gap-3 w-40">
          <div className="h-10 w-10 rounded-lg bg-neutral-100 flex items-center justify-center text-xs font-bold text-neutral-600">
            {flight.airline_code || "—"}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">
              {flight.airline_name || "—"}
            </div>
            <div className="text-xs text-neutral-500">{flight.flight_no}</div>
          </div>
        </div>

        {/* 时刻 */}
        <div className="flex items-center gap-3 flex-1 min-w-[260px] justify-center">
          <div className="text-center">
            <div className="text-xl font-semibold tabular-nums">
              {hhmm(flight.dep_time)}
            </div>
            <div className="text-xs text-neutral-500 mt-0.5">
              {flight.dep_airport_name?.replace(/机场.*/, "") || flight.dep_city_name}
              {flight.dep_terminal ? ` ${flight.dep_terminal}` : ""}
            </div>
          </div>

          <div className="flex flex-col items-center text-neutral-400 flex-1 max-w-[140px]">
            <span className="text-[11px]">
              {durationLabel(flight.duration_minutes)}
            </span>
            <div className="relative w-full flex items-center mt-0.5">
              <span className="h-px bg-neutral-200 flex-1" />
              <span className="px-1 text-xs">✈</span>
              <span className="h-px bg-neutral-200 flex-1" />
            </div>
            <span className="text-[11px] mt-0.5 text-neutral-400">
              {flight.stop_count ? `经停 ${flight.stop_count}` : "直飞"}
            </span>
          </div>

          <div className="text-center">
            <div className="text-xl font-semibold tabular-nums">
              {hhmm(flight.arr_time)}
            </div>
            <div className="text-xs text-neutral-500 mt-0.5">
              {flight.arr_airport_name?.replace(/机场.*/, "") || flight.arr_city_name}
              {flight.arr_terminal ? ` ${flight.arr_terminal}` : ""}
            </div>
          </div>
        </div>

        {/* 价格 */}
        <div className="text-right w-32">
          <div className="flex items-baseline justify-end gap-1">
            <span className="text-xs text-neutral-400">¥</span>
            <span className="text-2xl font-bold text-brand-600 tabular-nums">
              {price ?? "—"}
            </span>
          </div>
          <div className="text-[11px] text-neutral-400 mt-0.5">
            {cabin?.cabin_name || "起"}
            {cabin?.discount_rate
              ? ` · ${formatDiscount(cabin.discount_rate)}折`
              : ""}
          </div>
          <Link
            href={{
              pathname: "/flight/book",
              query: {
                token: cabin?.search_offer_id || "",
                flight_no: flight.flight_no || "",
                airline: flight.airline_name || "",
                dep_city: flight.dep_city_name || "",
                arr_city: flight.arr_city_name || "",
                dep_time: flight.dep_time || "",
                arr_time: flight.arr_time || "",
                price: price ?? "",
                date: searchParams?.date || "",
                from: searchParams?.from || "",
                to: searchParams?.to || "",
              },
            }}
            className="mt-2 inline-block px-4 py-1.5 rounded-lg bg-brand-500 text-white text-xs font-medium hover:bg-brand-600 transition"
          >
            预订
          </Link>
        </div>
      </div>

      {flight.meal && (
        <div className="mt-3 pt-3 border-t border-neutral-100 text-xs text-neutral-500 flex flex-wrap gap-x-4 gap-y-1">
          <span>机型 {flight.aircraft_type || "—"}</span>
          <span>· {flight.meal}</span>
          {cabin?.baggage_rule && <span>· 行李 {cabin.baggage_rule}</span>}
        </div>
      )}
    </div>
  );
}
