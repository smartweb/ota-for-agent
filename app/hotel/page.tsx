"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import SearchTabs from "@/components/SearchTabs";
import HotelCard from "@/components/hotel/HotelCard";
import {
  useProxySearch,
  ResultHeader,
  LoadingState,
  ErrorState,
  EmptyState,
} from "@/components/ResultShell";
import type { HotelSearchResponse } from "@/lib/types";
import { Pagination } from "@/components/Pagination";
import {
  HotelFilterSidebar,
  defaultHotelFilters,
  toApiFilters,
  type HotelFilterState,
} from "@/components/filters/HotelFilters";
import { SortBar, type SortOption } from "@/components/filters/SortBar";

const PAGE_SIZE = 20;

type HotelSortKey = "best" | "price_asc" | "price_desc" | "rating_desc" | "star_desc";

const SORT_OPTIONS: SortOption<HotelSortKey>[] = [
  { key: "best", label: "综合" },
  { key: "price_asc", label: "价格↑" },
  { key: "price_desc", label: "价格↓" },
  { key: "rating_desc", label: "评分高" },
  { key: "star_desc", label: "星级高" },
];

/** 前端排序 key → 接口 sort_by */
const SORT_API: Record<HotelSortKey, string> = {
  best: "best",
  price_asc: "price",
  price_desc: "price",
  rating_desc: "rating",
  star_desc: "star",
};

export default function HotelResultPage() {
  return (
    <Suspense fallback={<LoadingState text="加载中..." />}>
      <HotelResultInner />
    </Suspense>
  );
}

function HotelResultInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const destination = sp.get("destination") || "杭州西湖";
  const checkIn = sp.get("checkIn") || defaultDate(7);
  const checkOut = sp.get("checkOut") || defaultDate(9);
  const brandParam = sp.get("brand") || "";

  // 页码
  const [page, setPage] = useState<number>(() => {
    const p = Number(sp.get("page"));
    return Number.isFinite(p) && p > 0 ? p : 1;
  });

  // 筛选状态：URL brand 作为初始品牌
  const [filter, setFilter] = useState<HotelFilterState>(() => ({
    ...defaultHotelFilters,
    brand: brandParam,
  }));

  // 排序
  const [sort, setSort] = useState<HotelSortKey>("best");

  // URL 同步页码（浏览器前进/后退）
  useEffect(() => {
    const p = Number(sp.get("page"));
    setPage(Number.isFinite(p) && p > 0 ? p : 1);
  }, [sp]);

  // brand 参数变化时（如从首页品牌卡进入）同步到筛选
  useEffect(() => {
    setFilter((f) => ({ ...f, brand: brandParam }));
  }, [brandParam]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const apiFilters = useMemo(
    () => toApiFilters(filter),
    [filter]
  );

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

  const total = data?.total ?? data?.page_info?.total ?? 0;
  const currentPage = data?.page_info?.page ?? page;

  /**
   * 本地兜底过滤：开放平台 filters 当前为 mock（不真实过滤），
   * 这里对返回结果再过滤一次价格/星级/设施，确保筛选对用户真实可见。
   */
  const visibleHotels = useMemo(() => {
    const list = data?.hotels || [];
    const min = filter.priceMin ? Number(filter.priceMin) : -Infinity;
    const max = filter.priceMax ? Number(filter.priceMax) : Infinity;
    return list.filter((h) => {
      // 价格为 0 或缺失的酒店直接剔除
      if (!h.min_price || h.min_price <= 0) return false;
      if (typeof h.min_price === "number" && (h.min_price < min || h.min_price > max))
        return false;
      if (
        filter.starLevels.length &&
        !filter.starLevels.includes(Math.round(h.star_rating || 0))
      )
        return false;
      if (filter.hasWifi && !h.has_wifi) return false;
      if (filter.hasParking && !h.has_parking) return false;
      if (filter.hasBreakfast && !h.has_breakfast) return false;
      if (filter.hasSwimmingPool && !h.has_swimming_pool) return false;
      return true;
    });
  }, [data, filter]);

  /** 翻页：保留当前所有 query 参数，仅替换 page */
  const goPage = (p: number) => {
    const q = new URLSearchParams(sp.toString());
    q.set("page", String(p));
    router.push(`/hotel?${q.toString()}`);
    setPage(p);
  };

  /** 筛选变化：重置到第 1 页 */
  const onFilterChange = (next: HotelFilterState) => {
    setFilter(next);
    setPage(1);
    const q = new URLSearchParams(sp.toString());
    q.delete("page");
    router.replace(`/hotel?${q.toString()}`);
  };

  /** 排序变化：重置到第 1 页 */
  const onSortChange = (s: HotelSortKey) => {
    setSort(s);
    setPage(1);
  };

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

      {loading && <LoadingState text="正在为你挑选最合适的酒店..." />}
      {error && <ErrorState message={error} />}
      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6 mt-4">
          {/* 左：筛选 */}
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <HotelFilterSidebar
              filter={filter}
              onChange={onFilterChange}
              onReset={() => onFilterChange(defaultHotelFilters)}
            />
          </aside>

          {/* 右：排序 + 列表 + 分页 */}
          <div className="min-w-0">
            <div className="mb-4">
              <SortBar
                options={SORT_OPTIONS}
                value={sort}
                onChange={onSortChange}
                count={total}
              />
            </div>

            {visibleHotels.length > 0 ? (
              <>
                <div className="space-y-4">
                  {visibleHotels.map((h, i) => (
                    <HotelCard
                      key={h.hotel_id || i}
                      hotel={h}
                      searchParams={{ destination, checkIn, checkOut }}
                    />
                  ))}
                </div>
                <Pagination
                  current={currentPage}
                  pageSize={PAGE_SIZE}
                  total={total}
                  onChange={goPage}
                />
              </>
            ) : (
              <EmptyState hint="试试放宽筛选条件（品牌/价格/星级）或调整日期范围" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function defaultDate(offsetDays = 7): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}
