"use client";

import { useMemo, useState } from "react";
import type { HotelItem } from "@/lib/types";
import { reviewScoreLabel } from "@/lib/hotel-utils";

/**
 * 简化版酒店地图视图（纯 SVG，无需引入第三方地图库）。
 * 思路：取当前结果集的经纬度，归一化映射到 SVG 坐标系，
 * 高亮显示酒店 pin，hover/click 选中后展示浮卡。
 *
 * 注：上游开放平台未提供真实地图底图瓦片，这里只做相对位置展示，
 * 用于"哪些酒店更聚拢/更靠近市中心"的视觉直觉。
 */
export default function HotelMapView({
  hotels,
  onSelect,
}: {
  hotels: HotelItem[];
  onSelect?: (hotelId: string) => void;
}) {
  const [activeId, setActiveId] = useState<string>("");

  // 计算经纬度边界，归一化到 [0.06, 0.94] x [0.1, 0.9] 的 SVG 区域
  const { points, hasGeo } = useMemo(() => {
    const valid = hotels.filter(
      (h) =>
        typeof h.latitude === "number" &&
        typeof h.longitude === "number" &&
        h.latitude !== 0 &&
        h.longitude !== 0
    );
    if (valid.length === 0) return { points: [], hasGeo: false };

    const lats = valid.map((h) => h.latitude!);
    const lngs = valid.map((h) => h.longitude!);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const latRange = maxLat - minLat || 0.001;
    const lngRange = maxLng - minLng || 0.001;

    const points = valid.map((h) => {
      // 经度 → x，纬度 → y（北方在上，纬度大 → y 小）
      const x = 0.06 + ((h.longitude! - minLng) / lngRange) * 0.88;
      const y = 0.1 + (1 - (h.latitude! - minLat) / latRange) * 0.8;
      return { hotel: h, x, y };
    });
    return { points, hasGeo: true };
  }, [hotels]);

  const activeHotel = useMemo(
    () => points.find((p) => p.hotel.hotel_id === activeId)?.hotel,
    [points, activeId]
  );

  if (!hasGeo) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center">
        <div className="text-4xl mb-3 opacity-60">🗺️</div>
        <h3 className="font-semibold mb-1">暂无地图数据</h3>
        <p className="text-sm text-neutral-500">
          这些酒店未返回地理坐标，无法在地图上展示
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-gradient-to-br from-emerald-50 via-sky-50 to-neutral-50 overflow-hidden relative">
      <svg viewBox="0 0 1 1" preserveAspectRatio="none" className="w-full h-[520px]">
        {/* 简化网格 */}
        {[0.2, 0.4, 0.6, 0.8].map((g) => (
          <line
            key={`h${g}`}
            x1="0"
            y1={g}
            x2="1"
            y2={g}
            stroke="rgba(0,0,0,0.05)"
            strokeWidth="0.002"
          />
        ))}
        {[0.2, 0.4, 0.6, 0.8].map((g) => (
          <line
            key={`v${g}`}
            x1={g}
            y1="0"
            x2={g}
            y2="1"
            stroke="rgba(0,0,0,0.05)"
            strokeWidth="0.002"
          />
        ))}

        {/* 中心标记（市中心） */}
        <circle
          cx="0.5"
          cy="0.5"
          r="0.012"
          fill="rgba(255,90,31,0.2)"
        />
        <circle cx="0.5" cy="0.5" r="0.005" fill="#FF5A1F" />

        {/* 酒店 pin */}
        {points.map((p) => {
          const isActive = p.hotel.hotel_id === activeId;
          return (
            <g
              key={p.hotel.hotel_id}
              transform={`translate(${p.x} ${p.y})`}
              className="cursor-pointer"
              onClick={() => {
                setActiveId(p.hotel.hotel_id || "");
                if (p.hotel.hotel_id) onSelect?.(p.hotel.hotel_id);
              }}
            >
              <circle
                r={isActive ? "0.022" : "0.014"}
                fill={isActive ? "#FF5A1F" : "#0a0a0a"}
                fillOpacity={isActive ? 1 : 0.75}
                stroke="#fff"
                strokeWidth="0.003"
              />
              {typeof p.hotel.min_price === "number" && (
                <text
                  x="0"
                  y={isActive ? -0.038 : -0.03}
                  textAnchor="middle"
                  fontSize={isActive ? "0.04" : "0.032"}
                  fill={isActive ? "#E63E00" : "#0a0a0a"}
                  fontWeight="600"
                >
                  ¥{p.hotel.min_price}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* 浮卡：选中酒店 */}
      {activeHotel && (
        <div className="absolute left-3 bottom-3 right-3 sm:right-auto sm:w-80 rounded-xl bg-white shadow-hover border border-neutral-200 overflow-hidden">
          <div className="flex gap-3 p-3">
            <div className="w-20 h-20 shrink-0 rounded-lg bg-neutral-100 overflow-hidden">
              {activeHotel.main_picture ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activeHotel.main_picture}
                  alt={activeHotel.hotel_name || ""}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-300">
                  ◆
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold truncate">
                {activeHotel.hotel_name}
              </div>
              <div className="text-xs text-neutral-500 mt-0.5 truncate">
                {activeHotel.business_zone || activeHotel.district || ""}
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <div className="flex items-center gap-1">
                  {typeof activeHotel.review_score === "number" && (
                    <span className="text-xs text-amber-600 font-semibold">
                      {activeHotel.review_score.toFixed(1)}
                    </span>
                  )}
                  <span className="text-[10px] text-neutral-400">
                    {reviewScoreLabel(activeHotel.review_score)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold text-brand-600">
                    ¥{activeHotel.min_price ?? "—"}
                  </span>
                  <span className="text-[10px] text-neutral-400">起</span>
                </div>
              </div>
            </div>
          </div>
          {activeHotel.hotel_id && (
            <button
              onClick={() => {
                if (activeHotel.search_offer_id) {
                  sessionStorage.setItem(
                    "hotel_search_offer_id",
                    activeHotel.search_offer_id
                  );
                }
                // 通过 URL query 跳详情
                const u = new URLSearchParams({
                  hotel_id: activeHotel.hotel_id || "",
                  hotel_name: activeHotel.hotel_name || "",
                  min_price: String(activeHotel.min_price ?? ""),
                });
                window.location.href = `/hotel/detail?${u.toString()}`;
              }}
              className="w-full py-2 text-sm text-brand-600 hover:bg-brand-50 transition border-t border-neutral-100"
            >
              查看详情 →
            </button>
          )}
        </div>
      )}

      {/* 提示 */}
      <div className="absolute top-3 left-3 text-[11px] text-neutral-500 bg-white/80 backdrop-blur px-2 py-1 rounded-full">
        📍 {points.length} 家酒店 · 点击标记查看
      </div>
    </div>
  );
}
