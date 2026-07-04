"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { POPULAR_HOTEL_BRANDS } from "@/lib/cities";
import {
  detectGeo,
  getCachedGeo,
  cacheGeo,
  nearestCityName,
} from "@/lib/geo";

/**
 * 首页底部「优质酒店品牌」模块。
 * 点击品牌 → /hotel?brand=xxx&destination=当前定位城市
 * 定位失败时回退到上海，确保 destination 始终是合法城市名。
 */
export default function HomeBrands() {
  const [city, setCity] = useState<string>("上海");

  useEffect(() => {
    // 先用缓存即时显示
    const cached = getCachedGeo();
    if (cached) setCity(nearestCityName(cached));

    // 异步刷新定位
    detectGeo().then((g) => {
      if (g) {
        cacheGeo(g);
        setCity(nearestCityName(g));
      }
    });
  }, []);

  return (
    <section className="py-12">
      <div className="flex items-end justify-between mb-5">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">优质酒店品牌</h2>
          <p className="text-xs text-neutral-500 mt-1">
            8 大国内国际品牌 · 点击直达
            <span className="text-brand-600"> {city} </span>
            品牌门店
          </p>
        </div>
        <Link
          href={`/hotel?destination=${encodeURIComponent(city)}`}
          className="text-xs text-brand-600 hover:text-brand-700 transition"
        >
          查看全部 →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {POPULAR_HOTEL_BRANDS.map((b) => {
          const href = `/hotel?brand=${encodeURIComponent(b.name)}&destination=${encodeURIComponent(
            city
          )}`;
          return (
            <Link
              key={b.name}
              href={href}
              className="group flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4 hover:border-brand-300 hover:shadow-hover transition-all"
            >
              <span
                className={`h-11 w-11 shrink-0 rounded-xl bg-gradient-to-br ${b.gradient} text-white font-bold flex items-center justify-center text-base shadow-sm`}
              >
                {b.icon}
              </span>
              <div className="min-w-0">
                <div className="text-sm font-semibold group-hover:text-brand-600 transition">
                  {b.name}
                </div>
                <div className="text-xs text-neutral-500 truncate mt-0.5">
                  {b.desc}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
