"use client";

import { useEffect, useMemo, useState } from "react";
import type { HotelCity } from "@/lib/cities";
import type { HotelItem, HotelSearchResponse } from "@/lib/types";
import {
  detectGeo,
  getCachedGeo,
  cacheGeo,
  nearestCities,
  nearestCityName,
  type GeoLoc,
} from "@/lib/geo";
import { LoadingState, EmptyState, ErrorState } from "./ResultShell";

export default function HomeHotels() {
  const [geo, setGeo] = useState<GeoLoc | null>(null);
  const [geoReady, setGeoReady] = useState(false);
  const [cities, setCities] = useState<HotelCity[]>(() => nearestCities(null, 6));
  const [activeCity, setActiveCity] = useState<HotelCity>(cities[0]);

  // 首次挂载：尝试定位（优先用 localStorage 缓存）
  useEffect(() => {
    let cancelled = false;
    const cached = getCachedGeo();
    if (cached) {
      setGeo(cached);
      const nearby = nearestCities(cached, 6);
      setCities(nearby);
      setActiveCity(nearby[0]);
      setGeoReady(true);
      return;
    }

    detectGeo().then((g) => {
      if (cancelled) return;
      if (g) {
        cacheGeo(g);
        setGeo(g);
        const nearby = nearestCities(g, 6);
        setCities(nearby);
        setActiveCity(nearby[0]);
      }
      setGeoReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="py-10">
      <div className="flex items-end justify-between mb-5 flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            {geo ? `${nearestCityName(geo)} · 精选好店` : "热门城市 · 精选好店"}
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            {geo
              ? "已根据你的位置推荐，可在城市间切换"
              : geoReady
              ? "未获取到定位，默认推荐热门城市（可在城市间切换）"
              : "正在获取你的位置..."}
          </p>
        </div>
      </div>

      {/* 城市 Tab */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 -mx-1 px-1">
        {cities.map((c) => {
          const active = c.city === activeCity.city;
          return (
            <button
              key={c.city}
              onClick={() => setActiveCity(c)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition border ${
                active
                  ? "bg-brand-500 text-white border-brand-500 shadow-sm"
                  : "bg-white text-neutral-600 border-neutral-200 hover:border-brand-300 hover:text-brand-600"
              }`}
            >
              {c.city}
            </button>
          );
        })}
      </div>

      {/* 该城市 8 家酒店 */}
      <CityHotels key={activeCity.city} city={activeCity} />
    </section>
  );
}

/* ---------------------- 单个城市的酒店列表 ---------------------- */

function CityHotels({ city }: { city: HotelCity }) {
  const checkIn = useMemo(() => offsetDate(7), []);
  const checkOut = useMemo(() => offsetDate(8), []);
  const body = useMemo(
    () => ({
      destination: city.city,
      check_in: checkIn,
      check_out: checkOut,
      page: 1,
      page_size: 8,
      sort_by: "best",
      filters: { min_price: 200, max_price: 500 },
    }),
    [city.city, checkIn, checkOut]
  );

  const { data, loading, error } = useHotels(body, [city.city]);

  if (loading)
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div
            key={i}
            className="h-56 rounded-2xl border border-neutral-200 bg-neutral-50 animate-pulse"
          />
        ))}
      </div>
    );
  if (error) return <ErrorState message={error} />;
  // 过滤掉价格为 0 或缺失的酒店
  const hotels = (data?.hotels || []).filter(
    (h) => typeof h.min_price === "number" && h.min_price > 0
  );
  if (!hotels.length)
    return <EmptyState title={`${city.city} 暂无推荐酒店`} />;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {hotels.slice(0, 8).map((h, i) => (
        <HotelMini key={h.hotel_id || i} hotel={h} />
      ))}
    </div>
  );
}

function HotelMini({ hotel }: { hotel: HotelItem }) {
  return (
    <a
      href={`/hotel?destination=${encodeURIComponent(hotel.hotel_name || "")}`}
      className="group block rounded-2xl border border-neutral-200 bg-white overflow-hidden hover:border-brand-300 hover:shadow-hover transition-all"
    >
      <div className="h-36 bg-neutral-100 relative overflow-hidden">
        {hotel.main_picture ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={hotel.main_picture}
            alt={hotel.hotel_name || "酒店"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl text-neutral-300">
            ◆
          </div>
        )}
        {hotel.star_tag && (
          <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[11px] bg-white/90 text-brand-600 backdrop-blur">
            {hotel.star_tag}
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-sm font-medium leading-snug line-clamp-1">
          {hotel.hotel_name || "未知酒店"}
        </h3>
        <p className="mt-1 text-xs text-neutral-500 line-clamp-1">
          {[hotel.business_zone, hotel.district].filter(Boolean).join(" · ")}
        </p>
        <div className="mt-2 flex items-end justify-between">
          <div className="flex items-baseline gap-0.5">
            <span className="text-xs text-neutral-400">¥</span>
            <span className="text-lg font-bold text-brand-600 tabular-nums">
              {hotel.min_price ?? "—"}
            </span>
            <span className="text-[11px] text-neutral-400">/晚</span>
          </div>
          {typeof hotel.review_score === "number" && (
            <span className="text-xs text-amber-600 tabular-nums">
              {hotel.review_score.toFixed(1)} ★
            </span>
          )}
        </div>
      </div>
    </a>
  );
}

/* ------------------------------ 工具 ------------------------------ */

function offsetDate(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

import { useProxySearch } from "./ResultShell";
function useHotels(
  body: Record<string, unknown>,
  deps: unknown[]
) {
  return useProxySearch<HotelSearchResponse>("hotel", body, deps);
}
