"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import SearchTabs from "@/components/SearchTabs";
import HotelCard from "@/components/hotel/HotelCard";
import HotelMapView from "@/components/hotel/HotelMapView";
import QuickFilterChips from "@/components/hotel/QuickFilterChips";
import {
  useProxySearch,
  ResultHeader,
  LoadingState,
  ErrorState,
  EmptyState,
} from "@/components/ResultShell";
import type { HotelSearchResponse, HotelItem } from "@/lib/types";
import { Pagination } from "@/components/Pagination";
import {
  HotelFilterSidebar,
  defaultHotelFilters,
  toApiFilters,
  type HotelFilterState,
} from "@/components/filters/HotelFilters";
import { SortBar, type SortOption } from "@/components/filters/SortBar";
import { readFavorites } from "@/lib/hotel-utils";

const PAGE_SIZE = 20;

type HotelSortKey =
  | "best"
  | "price_asc"
  | "price_desc"
  | "rating_desc"
  | "star_desc"
  | "distance_asc";

const SORT_OPTIONS: SortOption<HotelSortKey>[] = [
  { key: "best", label: "综合" },
  { key: "price_asc", label: "价格↑" },
  { key: "price_desc", label: "价格↓" },
  { key: "rating_desc", label: "评分高" },
  { key: "star_desc", label: "星级高" },
  { key: "distance_asc", label: "距离近" },
];

/** 前端排序 key → 接口 sort_by（部分需要客户端兜底重排） */
const SORT_API: Record<HotelSortKey, string> = {
  best: "best",
  price_asc: "price",
  price_desc: "price",
  rating_desc: "rating",
  star_desc: "star",
  distance_asc: "distance",
};

export default function HotelResultPage() {
  return (
    <Suspense fallback={<LoadingState type="hotel" text="加载中..." />}>
      <HotelResultInner />
    </Suspense>
  );
}

function HotelResultInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const destination = sp.get("destination") || "杭州";
  const checkIn = sp.get("checkIn") || defaultDate(7);
  const checkOut = sp.get("checkOut") || defaultDate(9);

  // 页码
  const [page, setPage] = useState<number>(() => {
    const p = Number(sp.get("page"));
    return Number.isFinite(p) && p > 0 ? p : 1;
  });

  /**
   * 筛选状态从 URL 初始化（刷新可恢复）。URL query 设计：
   * brand, priceMin, priceMax, stars (5,4,3), wifi, parking, breakfast, pool, gym, child,
   * score (minReviewScore), dist (maxDistanceKm), zone (多值用逗号), fav (onlyFavorites)
   */
  const [filter, setFilter] = useState<HotelFilterState>(() => ({
    ...defaultHotelFilters,
    brand: sp.get("brand") || "",
    priceMin: sp.get("priceMin") || "",
    priceMax: sp.get("priceMax") || "",
    starLevels: parseStars(sp.get("stars")),
    hasWifi: sp.get("wifi") === "1",
    hasParking: sp.get("parking") === "1",
    hasBreakfast: sp.get("breakfast") === "1",
    hasSwimmingPool: sp.get("pool") === "1",
    hasGym: sp.get("gym") === "1",
    hasChildFriendly: sp.get("child") === "1",
    minReviewScore: Number(sp.get("score")) || 0,
    maxDistanceKm: sp.get("dist") || "",
    zones: sp.get("zone") ? sp.get("zone")!.split(",").filter(Boolean) : [],
    onlyFavorites: sp.get("fav") === "1",
  }));

  const initialSort = (sp.get("sort") as HotelSortKey) || "best";
  const [sort, setSort] = useState<HotelSortKey>(
    SORT_OPTIONS.some((o) => o.key === initialSort) ? initialSort : "best"
  );
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [favorites, setFavorites] = useState<string[]>([]);

  // 浏览器前进/后退同步页码
  useEffect(() => {
    const p = Number(sp.get("page"));
    setPage(Number.isFinite(p) && p > 0 ? p : 1);
  }, [sp]);

  // 挂载后读取收藏列表（避免 SSR 报错）
  useEffect(() => {
    setFavorites(readFavorites());
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const apiFilters = useMemo(() => toApiFilters(filter), [filter]);

  const reqBody = useMemo(
    () => ({
      destination,
      check_in: checkIn,
      check_out: checkOut,
      adult_count: 2,
      room_count: 1,
      sort_by: SORT_API[sort],
      page,
      page_size: PAGE_SIZE,
      ...(Object.keys(apiFilters).length ? { filters: apiFilters } : {}),
    }),
    [destination, checkIn, checkOut, sort, page, apiFilters]
  );

  const { data, loading, error } = useProxySearch<HotelSearchResponse>(
    "hotel",
    reqBody,
    [destination, checkIn, checkOut, sort, page, JSON.stringify(apiFilters)]
  );

  const title = filter.brand
    ? `${filter.brand} 品牌酒店`
    : `「${destination}」酒店`;

  /**
   * 客户端兜底过滤：
   * 1) 价格为 0 / 缺失的酒店直接剔除（接口脏数据）
   * 2) 商圈 / 收藏 在客户端做（接口不识别）
   * 3) 距离 / 评分 / 设施 / 价格 / 星级 也再过滤一遍，保证筛选对用户真实可见
   *
   * 注：早期版本曾按 review_count<=0 过滤，但实测该字段并不可靠
   *    （许多酒店 review_score 有值但 review_count 为 0），故不再用它过滤。
   */
  const visibleHotels = useMemo<HotelItem[]>(() => {
    const list = data?.hotels || [];
    const min = filter.priceMin ? Number(filter.priceMin) : -Infinity;
    const max = filter.priceMax ? Number(filter.priceMax) : Infinity;
    return list.filter((h) => {
      if (!h.min_price || h.min_price <= 0) return false;
      if (typeof h.min_price === "number" && (h.min_price < min || h.min_price > max))
        return false;
      if (
        filter.starLevels.length &&
        !filter.starLevels.includes(Math.round(h.star_rating || 0))
      )
        return false;
      if (filter.minReviewScore > 0 && (h.review_score ?? 0) < filter.minReviewScore)
        return false;
      if (
        filter.maxDistanceKm &&
        typeof h.distance_km === "number" &&
        h.distance_km > Number(filter.maxDistanceKm)
      )
        return false;
      if (filter.hasWifi && !h.has_wifi) return false;
      if (filter.hasParking && !h.has_parking) return false;
      if (filter.hasBreakfast && !h.has_breakfast) return false;
      if (filter.hasSwimmingPool && !h.has_swimming_pool) return false;
      if (filter.zones.length) {
        const z = h.business_zone || h.district || "";
        if (!filter.zones.includes(z)) return false;
      }
      if (filter.onlyFavorites && h.hotel_id && !favorites.includes(h.hotel_id))
        return false;
      return true;
    });
  }, [data, filter, favorites]);

  /**
   * 客户端排序：价格升降序、距离近 在接口侧不区分方向或不可靠，
   * 这里再排一遍以保证 UI 标签真实生效。
   */
  const sortedHotels = useMemo(() => {
    const arr = [...visibleHotels];
    const cmp: Record<HotelSortKey, (a: HotelItem, b: HotelItem) => number> = {
      best: () => 0,
      price_asc: (a, b) => (a.min_price ?? 0) - (b.min_price ?? 0),
      price_desc: (a, b) => (b.min_price ?? 0) - (a.min_price ?? 0),
      rating_desc: (a, b) => (b.review_score ?? 0) - (a.review_score ?? 0),
      star_desc: (a, b) => (b.star_rating ?? 0) - (a.star_rating ?? 0),
      distance_asc: (a, b) => (a.distance_km ?? 0) - (b.distance_km ?? 0),
    };
    arr.sort(cmp[sort]);
    return arr;
  }, [visibleHotels, sort]);

  /** 翻页：保留当前所有 query 参数，仅替换 page */
  const goPage = (p: number) => {
    const q = new URLSearchParams(sp.toString());
    q.set("page", String(p));
    router.push(`/hotel?${q.toString()}`);
    setPage(p);
  };

  /** 把 filter 状态序列化进 URL（刷新可恢复） */
  const syncUrl = (next: HotelFilterState) => {
    const q = new URLSearchParams(sp.toString());
    q.delete("page");
    setUrlFlag(q, "brand", next.brand);
    setUrlFlag(q, "priceMin", next.priceMin);
    setUrlFlag(q, "priceMax", next.priceMax);
    setUrlStars(q, next.starLevels);
    setUrlFlag(q, "wifi", next.hasWifi ? "1" : "");
    setUrlFlag(q, "parking", next.hasParking ? "1" : "");
    setUrlFlag(q, "breakfast", next.hasBreakfast ? "1" : "");
    setUrlFlag(q, "pool", next.hasSwimmingPool ? "1" : "");
    setUrlFlag(q, "gym", next.hasGym ? "1" : "");
    setUrlFlag(q, "child", next.hasChildFriendly ? "1" : "");
    setUrlFlag(q, "score", next.minReviewScore > 0 ? String(next.minReviewScore) : "");
    setUrlFlag(q, "dist", next.maxDistanceKm);
    setUrlFlag(q, "zone", next.zones.length ? next.zones.join(",") : "");
    setUrlFlag(q, "fav", next.onlyFavorites ? "1" : "");
    router.replace(`/hotel?${q.toString()}`);
  };

  /** 筛选变化：重置到第 1 页 + 同步 URL */
  const onFilterChange = (next: HotelFilterState) => {
    setFilter(next);
    setPage(1);
    syncUrl(next);
  };

  /** 排序变化：重置到第 1 页 + 同步 URL */
  const onSortChange = (s: HotelSortKey) => {
    setSort(s);
    setPage(1);
    const q = new URLSearchParams(sp.toString());
    q.delete("page");
    q.set("sort", s);
    router.replace(`/hotel?${q.toString()}`);
  };

  // 当前页结果数（修正分页总数显示，避免误导）
  const displayTotal = sortedHotels.length;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6">
        <SearchTabs initialTab="hotel" />
      </div>

      <ResultHeader
        title={title}
        extra={
          <span className="text-xs text-neutral-500">
            {checkIn} → {checkOut} · 1 间 · 2 成人
          </span>
        }
      />

      {loading && (
        <LoadingState type="hotel" text="正在为你挑选最合适的酒店" />
      )}
      {error && <ErrorState message={error} />}
      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6 mt-4">
          {/* 左：筛选 */}
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <HotelFilterSidebar
              filter={filter}
              onChange={onFilterChange}
              onReset={() => onFilterChange(defaultHotelFilters)}
              hotels={data?.hotels || []}
            />
          </aside>

          {/* 右：排序 + 快速 chips + 列表/地图 + 分页 */}
          <div className="min-w-0">
            <div className="mb-3 space-y-3">
              <SortBar
                options={SORT_OPTIONS}
                value={sort}
                onChange={onSortChange}
                count={displayTotal}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                showViewToggle
              />
              <QuickFilterChips filter={filter} onChange={onFilterChange} />
            </div>

            {sortedHotels.length > 0 ? (
              viewMode === "map" ? (
                <HotelMapView hotels={sortedHotels} />
              ) : (
                <>
                  <div className="space-y-4">
                    {sortedHotels.map((h, i) => (
                      <HotelCard
                        key={h.hotel_id || i}
                        hotel={h}
                        searchParams={{ destination, checkIn, checkOut }}
                      />
                    ))}
                  </div>
                  <Pagination
                    current={page}
                    pageSize={PAGE_SIZE}
                    total={Math.max(displayTotal, page * PAGE_SIZE)}
                    onChange={goPage}
                  />
                </>
              )
            ) : (
              <EmptyState hint="试试放宽筛选条件（品牌/价格/星级/评分）或调整日期范围" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ----------------------------- helpers ----------------------------- */

function defaultDate(offsetDays = 7): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function parseStars(s: string | null): number[] {
  if (!s) return [];
  return s
    .split(",")
    .map((x) => Number(x))
    .filter((n) => Number.isFinite(n) && n > 0);
}

function setUrlFlag(q: URLSearchParams, key: string, value: string) {
  if (value) q.set(key, value);
  else q.delete(key);
}

function setUrlStars(q: URLSearchParams, stars: number[]) {
  if (stars.length) q.set("stars", stars.join(","));
  else q.delete("stars");
}
