"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import SearchTabs from "@/components/SearchTabs";
import FlightCard from "@/components/flight/FlightCard";
import {
  useProxySearch,
  ResultHeader,
  LoadingState,
  ErrorState,
  EmptyState,
} from "@/components/ResultShell";
import { POPULAR_AIRPORTS } from "@/lib/cities";
import type { FlightSearchResponse } from "@/lib/types";
import {
  FlightFilterSidebar,
  applyFlightFilters,
  defaultFlightFilters,
  type FlightFilterState,
  type FlightSortKey,
} from "@/components/filters/FlightFilters";
import { SortBar, type SortOption } from "@/components/filters/SortBar";

const SORT_OPTIONS: SortOption<FlightSortKey>[] = [
  { key: "price_asc", label: "价格↑" },
  { key: "price_desc", label: "价格↓" },
  { key: "dep_asc", label: "起飞早→晚" },
  { key: "dep_desc", label: "起飞晚→早" },
  { key: "duration_asc", label: "飞行时长短" },
];

export default function FlightResultPage() {
  return (
    <Suspense fallback={<LoadingState text="加载中..." />}>
      <FlightResultInner />
    </Suspense>
  );
}

function FlightResultInner() {
  const sp = useSearchParams();
  const from = sp.get("from") || POPULAR_AIRPORTS[1].code;
  const to = sp.get("to") || POPULAR_AIRPORTS[3].code;
  const date = sp.get("date") || defaultDate(7);

  const [filter, setFilter] = useState<FlightFilterState>(defaultFlightFilters);
  const [sort, setSort] = useState<FlightSortKey>("price_asc");

  const reqBody = useMemo(
    () => ({
      trip_mode: "domestic",
      trip_type: "oneway",
      from_code: from,
      to_code: to,
      depart_date: date,
      cabin_class: "economy",
      passengers: { adult: 1, child: 0, infant: 0 },
      page_size: 20,
      sort_by: "price",
    }),
    [from, to, date]
  );

  const { data, loading, error } = useProxySearch<FlightSearchResponse>(
    "flight",
    reqBody,
    [from, to, date]
  );

  const fromCity = POPULAR_AIRPORTS.find((c) => c.code === from)?.city || from;
  const toCity = POPULAR_AIRPORTS.find((c) => c.code === to)?.city || to;

  const allFlights = data?.flights || [];
  const filtered = useMemo(
    () => applyFlightFilters(allFlights, filter, sort),
    [allFlights, filter, sort]
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6">
        <SearchTabs initialTab="flight" />
      </div>

      <ResultHeader
        title={`${fromCity} → ${toCity}`}
        extra={
          <span className="text-xs text-neutral-500">
            {date} · 单程 · 经济舱
          </span>
        }
      />

      {loading && <LoadingState text="正在为你搜索最优惠的航班..." />}
      {error && <ErrorState message={error} />}
      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6 mt-4">
          {/* 左：筛选 */}
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <FlightFilterSidebar
              flights={allFlights}
              filter={filter}
              onChange={setFilter}
              onReset={() => setFilter(defaultFlightFilters)}
            />
          </aside>

          {/* 右：排序 + 列表 */}
          <div className="min-w-0">
            <div className="mb-4">
              <SortBar
                options={SORT_OPTIONS}
                value={sort}
                onChange={setSort}
                count={filtered.length}
              />
            </div>

            {filtered.length > 0 ? (
              <div className="space-y-3">
                {filtered.map((f, i) => (
                  <FlightCard key={f.flight_id || i} flight={f} searchParams={{ from, to, date }} />
                ))}
              </div>
            ) : allFlights.length > 0 ? (
              <EmptyState
                title="当前筛选下无航班"
                hint="试试放宽筛选条件（航司/时段/价格）"
              />
            ) : (
              <EmptyState hint="该航线当天可能没有直飞航班，试试更换日期" />
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
