"use client";

import { useState } from "react";
import Link from "next/link";
import BookButton from "./BookButton";
import type { HotelItem } from "@/lib/types";
import {
  distanceLabel,
  reviewScoreLabel,
  sceneTagLabel,
  readFavorites,
  toggleFavorite,
} from "@/lib/hotel-utils";

function stars(n?: number): string {
  return n ? "★".repeat(Math.max(1, Math.min(5, Math.round(n)))) : "";
}

/**
 * 把酒店摘要字段拼成 /hotel/detail 的 querystring。
 * search_offer_id 太长不放 URL，调用方在点击时写入 sessionStorage。
 */
function buildDetailHref(
  hotel: HotelItem,
  sp: { destination?: string; checkIn?: string; checkOut?: string }
): string {
  const params = new URLSearchParams({
    hotel_id: hotel.hotel_id || "",
    hotel_name: hotel.hotel_name || "",
    star_rating: String(hotel.star_rating ?? ""),
    review_score: String(hotel.review_score ?? ""),
    review_count: String(hotel.review_count ?? ""),
    min_price: String(hotel.min_price ?? ""),
    distance_km: String(hotel.distance_km ?? ""),
    destination: sp.destination || "",
    check_in: sp.checkIn || "",
    check_out: sp.checkOut || "",
    brand_name: hotel.brand_name || "",
    district: hotel.district || "",
    business_zone: hotel.business_zone || "",
    address: hotel.address || "",
    has_wifi: hotel.has_wifi ? "1" : "0",
    has_parking: hotel.has_parking ? "1" : "0",
    has_breakfast: hotel.has_breakfast ? "1" : "0",
    has_swimming_pool: hotel.has_swimming_pool ? "1" : "0",
    main_picture: hotel.main_picture || "",
    star_tag: hotel.star_tag || "",
  });
  return `/hotel/detail?${params.toString()}`;
}

export default function HotelCard({
  hotel,
  searchParams,
}: {
  hotel: HotelItem;
  searchParams?: { destination?: string; checkIn?: string; checkOut?: string };
}) {
  const detailHref = buildDetailHref(hotel, searchParams || {});
  const [faved, setFaved] = useState<boolean>(() => {
    if (!hotel.hotel_id) return false;
    return readFavorites().includes(hotel.hotel_id);
  });

  const handleCardClick = (e: React.MouseEvent) => {
    if (hotel.search_offer_id) {
      sessionStorage.setItem("hotel_search_offer_id", hotel.search_offer_id);
    }
    void e;
  };

  const toggleFav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!hotel.hotel_id) return;
    setFaved(toggleFavorite(hotel.hotel_id).includes(hotel.hotel_id));
  };

  const dist = distanceLabel(hotel.distance_km);
  const scoreLabel = reviewScoreLabel(hotel.review_score);
  const sceneTags = (hotel.scene_tags || []).slice(0, 3);

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden hover:border-brand-300 hover:shadow-hover transition-all flex flex-col sm:flex-row">
      {/* 图片 + 信息区整体作为链接，点击进入详情 */}
      <Link
        href={detailHref}
        onClick={handleCardClick}
        className="flex flex-col sm:flex-row flex-1 min-w-0"
      >
        {/* 图片 + 收藏角标 */}
        <div className="sm:w-56 h-44 sm:h-auto shrink-0 bg-neutral-100 relative">
          {hotel.main_picture ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={hotel.main_picture}
              alt={hotel.hotel_name || "酒店"}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl text-neutral-300">
              ◆
            </div>
          )}
          {/* 收藏爱心 */}
          <button
            onClick={toggleFav}
            aria-label={faved ? "取消收藏" : "收藏"}
            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/85 backdrop-blur flex items-center justify-center hover:bg-white transition shadow-sm"
          >
            <span className={faved ? "text-brand-500" : "text-neutral-400"}>
              {faved ? "♥" : "♡"}
            </span>
          </button>
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
              {dist && (
                <p className="mt-1 text-[11px] text-neutral-400">📍 {dist}</p>
              )}
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

          {/* 场景标签 */}
          {sceneTags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {sceneTags.map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 rounded-full text-[10px] bg-neutral-100 text-neutral-500"
                >
                  {sceneTagLabel(t)}
                </span>
              ))}
            </div>
          )}

          <div className="mt-auto pt-3 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <Facility on={hotel.has_wifi} label="WiFi" />
              <Facility on={hotel.has_parking} label="停车" />
              <Facility on={hotel.has_swimming_pool} label="泳池" />
              <Facility on={hotel.has_breakfast} label="早餐" />
            </div>

            <div className="flex items-center gap-3">
              {typeof hotel.review_score === "number" && (
                <div className="text-right">
                  <div className="flex items-baseline gap-1.5 justify-end">
                    <span className="text-sm font-semibold text-amber-600 tabular-nums">
                      {hotel.review_score.toFixed(1)}
                    </span>
                    <span className="text-[10px] text-neutral-500">
                      {scoreLabel}
                    </span>
                  </div>
                  {typeof hotel.review_count === "number" &&
                    hotel.review_count > 0 && (
                      <div className="text-[10px] text-neutral-400">
                        {hotel.review_count} 条评价
                      </div>
                    )}
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>

      {/* 预订按钮：阻止冒泡，避免触发详情页跳转 */}
      <div className="sm:self-center sm:pr-5 sm:pl-0 px-5 pb-4 sm:pb-0 shrink-0">
        <BookButton
          searchOfferId={hotel.search_offer_id}
          hotelName={hotel.hotel_name}
          price={hotel.min_price}
          destination={searchParams?.destination}
          checkIn={searchParams?.checkIn}
          checkOut={searchParams?.checkOut}
        />
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
