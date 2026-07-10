"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";
import SearchTabs from "@/components/SearchTabs";
import BusCard from "@/components/bus/BusCard";
import {
  useProxySearch,
  ResultHeader,
  LoadingState,
  ErrorState,
  EmptyState,
} from "@/components/ResultShell";
import { POPULAR_BUS_CITIES } from "@/lib/cities";
import type { BusSearchResponse } from "@/lib/types";

export default function BusResultPage() {
  return (
    <Suspense fallback={<LoadingState text="加载中..." />}>
      <BusResultInner />
    </Suspense>
  );
}

function BusResultInner() {
  const sp = useSearchParams();
  const from = sp.get("from") || POPULAR_BUS_CITIES[3].adcode;
  const to = sp.get("to") || POPULAR_BUS_CITIES[2].adcode;
  const date = sp.get("date") || defaultDate(7);

  const reqBody = useMemo(() => {
    const startCity = POPULAR_BUS_CITIES.find((c) => c.adcode === from);
    const endCity = POPULAR_BUS_CITIES.find((c) => c.adcode === to);
    return {
      start_city_code: from,
      end_city_code: to,
      date,
      start_addr: startCity?.addr,
      start_lng: startCity?.lng,
      start_lat: startCity?.lat,
      end_addr: endCity?.addr,
      end_lng: endCity?.lng,
      end_lat: endCity?.lat,
      sort_by: "dep_time",
      page: 1,
      page_size: 20,
    };
  }, [from, to, date]);

  const { data, loading, error } = useProxySearch<BusSearchResponse>(
    "bus",
    reqBody,
    [from, to, date]
  );

  const fromCity = POPULAR_BUS_CITIES.find((c) => c.adcode === from)?.city || from;
  const toCity = POPULAR_BUS_CITIES.find((c) => c.adcode === to)?.city || to;

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-6">
        <SearchTabs initialTab="bus" />
      </div>

      <ResultHeader
        title={`${fromCity} → ${toCity}`}
        total={data?.total}
        extra={<span className="text-xs text-neutral-500">{date} · 城际巴士</span>}
      />

      {loading && <LoadingState text="正在为你查询班次..." />}
      {error && <ErrorState message={error} />}
      {!loading && !error && (
        <>
          {data?.lines && data.lines.length > 0 ? (
            <div className="space-y-3">
              {data.lines.map((b, i) => (
                <BusCard
                  key={b.gid || i}
                  bus={b}
                  searchParams={{ from, to, date }}
                />
              ))}
            </div>
          ) : (
            <EmptyState hint="该线路当天可能无班次，试试更换日期或相邻城市" />
          )}
        </>
      )}
    </div>
  );
}

function defaultDate(offsetDays = 7): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}
