import Link from "next/link";
import type { HotelItem } from "@/lib/types";

function stars(n?: number): string {
  return n ? "★".repeat(Math.max(1, Math.min(5, Math.round(n)))) : "";
}

export default function HotelCard({
  hotel,
  searchParams,
}: {
  hotel: HotelItem;
  searchParams?: { destination?: string; checkIn?: string; checkOut?: string };
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden hover:border-brand-300 hover:shadow-hover transition-all flex flex-col sm:flex-row">
      {/* 图片 */}
      <div className="sm:w-56 h-44 sm:h-auto shrink-0 bg-neutral-100 relative">
        {hotel.main_picture ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={hotel.main_picture}
            alt={hotel.hotel_name || "酒店"}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl text-neutral-300">
            ◆
          </div>
        )}
      </div>

      {/* 信息 */}
      <div className="flex-1 p-5 flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {hotel.star_tag && (
                <span className="px-1.5 py-0.5 rounded text-[11px] bg-brand-50 text-brand-600">
                  {hotel.star_tag}
                </span>
              )}
              <span className="text-[11px] text-amber-500">
                {stars(hotel.star_rating)}
              </span>
              {hotel.brand_name && (
                <span className="text-[11px] text-neutral-400">
                  {hotel.brand_name}
                </span>
              )}
            </div>
            <h3 className="mt-1 text-lg font-semibold leading-snug">
              {hotel.hotel_name || "未知酒店"}
            </h3>
            <p className="mt-1 text-xs text-neutral-500 line-clamp-1">
              {[hotel.business_zone, hotel.district, hotel.address]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>

          <div className="text-right shrink-0">
            <div className="flex items-baseline gap-0.5 justify-end">
              <span className="text-xs text-neutral-400">¥</span>
              <span className="text-2xl font-bold text-brand-600 tabular-nums">
                {hotel.min_price ?? "—"}
              </span>
            </div>
            <div className="text-[11px] text-neutral-400">起 / 晚</div>
          </div>
        </div>

        <div className="mt-auto pt-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <Facility on={hotel.has_wifi} label="WiFi" />
            <Facility on={hotel.has_parking} label="停车" />
            <Facility on={hotel.has_swimming_pool} label="泳池" />
            <Facility on={hotel.has_breakfast} label="早餐" />
          </div>

          <div className="flex items-center gap-3">
            {typeof hotel.review_score === "number" && (
              <div className="text-right">
                <div className="text-sm font-semibold text-amber-600 tabular-nums">
                  {hotel.review_score.toFixed(1)}
                </div>
                <div className="text-[10px] text-neutral-400">
                  {hotel.review_count || 0} 条评价
                </div>
              </div>
            )}
            <Link
              href={{
                pathname: "/hotel/book",
                query: {
                  token: hotel.search_offer_id || "",
                  hotel_name: hotel.hotel_name || "",
                  price: hotel.min_price ?? "",
                  destination: searchParams?.destination || "",
                  check_in: searchParams?.checkIn || "",
                  check_out: searchParams?.checkOut || "",
                },
              }}
              className="px-4 py-1.5 rounded-lg bg-brand-500 text-white text-xs font-medium hover:bg-brand-600 transition"
            >
              预订
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Facility({ on, label }: { on?: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] ${
        on ? "text-emerald-600" : "text-neutral-400"
      }`}
    >
      <span>{on ? "✓" : "—"}</span>
      {label}
    </span>
  );
}
