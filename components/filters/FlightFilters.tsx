"use client";

import { useMemo } from "react";
import type { FlightItem } from "@/lib/types";
import {
  FilterPanel,
  FilterSection,
  CheckOption,
  PriceInput,
} from "./FilterUI";

/** 出发时段（按起飞小时） */
export interface TimeBand {
  key: string;
  label: string;
  range: [number, number]; // [起始小时, 结束小时)
}

export const TIME_BANDS: TimeBand[] = [
  { key: "morning", label: "上午 06:00-12:00", range: [6, 12] },
  { key: "afternoon", label: "下午 12:00-18:00", range: [12, 18] },
  { key: "evening", label: "晚上 18:00-24:00", range: [18, 24] },
  { key: "dawn", label: "凌晨 00:00-06:00", range: [0, 6] },
];

export interface FlightFilterState {
  airlines: string[];
  timeBands: string[];
  cabinClasses: string[];
  priceMin: string;
  priceMax: string;
}

export const defaultFlightFilters: FlightFilterState = {
  airlines: [],
  timeBands: [],
  cabinClasses: [],
  priceMin: "",
  priceMax: "",
};

export type FlightSortKey = "price_asc" | "price_desc" | "dep_asc" | "dep_desc" | "duration_asc";

/** 从 dep_time "2026-08-01 20:30" 取小时 */
export function hourOf(t?: string): number {
  if (!t) return -1;
  const m = t.match(/(\d{2}):(\d{2})/);
  return m ? parseInt(m[1], 10) : -1;
}

/** 取航班最低价（cabins[0].adult_price） */
export function flightPrice(f: FlightItem): number {
  return f.cabins?.[0]?.adult_price ?? f.cabins?.[0]?.lowest_price ?? Infinity;
}

/**
 * 应用本地筛选 + 排序。
 */
export function applyFlightFilters(
  flights: FlightItem[],
  filter: FlightFilterState,
  sort: FlightSortKey
): FlightItem[] {
  let list = flights.slice();

  // 航司
  if (filter.airlines.length) {
    list = list.filter((f) => filter.airlines.includes(f.airline_name || ""));
  }
  // 时段
  if (filter.timeBands.length) {
    const bands = TIME_BANDS.filter((b) => filter.timeBands.includes(b.key));
    list = list.filter((f) => {
      const h = hourOf(f.dep_time);
      return bands.some((b) => h >= b.range[0] && h < b.range[1]);
    });
  }
  // 舱位等级
  if (filter.cabinClasses.length) {
    list = list.filter((f) =>
      (f.cabins || []).some((c) => filter.cabinClasses.includes(c.cabin_class || ""))
    );
  }
  // 价格
  const min = filter.priceMin ? Number(filter.priceMin) : -Infinity;
  const max = filter.priceMax ? Number(filter.priceMax) : Infinity;
  list = list.filter((f) => {
    const p = flightPrice(f);
    return p >= min && p <= max;
  });

  // 排序
  switch (sort) {
    case "price_asc":
      list.sort((a, b) => flightPrice(a) - flightPrice(b));
      break;
    case "price_desc":
      list.sort((a, b) => flightPrice(b) - flightPrice(a));
      break;
    case "dep_asc":
      list.sort((a, b) => depMinutes(a) - depMinutes(b));
      break;
    case "dep_desc":
      list.sort((a, b) => depMinutes(b) - depMinutes(a));
      break;
    case "duration_asc":
      list.sort((a, b) => (a.duration_minutes || 0) - (b.duration_minutes || 0));
      break;
  }
  return list;
}

function depMinutes(f: FlightItem): number {
  const m = (f.dep_time || "").match(/(\d{2}):(\d{2})/);
  return m ? parseInt(m[1], 10) * 60 + parseInt(m[2], 10) : 0;
}

/* ------------------------- 筛选侧栏 UI ------------------------- */

export function FlightFilterSidebar({
  flights,
  filter,
  onChange,
  onReset,
}: {
  flights: FlightItem[];
  filter: FlightFilterState;
  onChange: (next: FlightFilterState) => void;
  onReset: () => void;
}) {
  // 动态聚合航司（带数量）
  const airlineOptions = useMemo(() => {
    const map = new Map<string, number>();
    flights.forEach((f) => {
      const a = f.airline_name || "其它";
      map.set(a, (map.get(a) || 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [flights]);

  const cabinOptions = useMemo(() => {
    const map = new Map<string, string>();
    flights.forEach((f) =>
      (f.cabins || []).forEach((c) => {
        if (c.cabin_class && !map.has(c.cabin_class)) {
          map.set(c.cabin_class, c.cabin_name || c.cabin_class);
        }
      })
    );
    // 标准顺序：经济/公务/头等
    const order = ["economy", "premium_economy", "business", "first"];
    return order
      .filter((k) => map.has(k))
      .map((k) => [k, map.get(k)!] as [string, string]);
  }, [flights]);

  const toggle = (key: keyof Pick<FlightFilterState, "airlines" | "timeBands" | "cabinClasses">, v: string) => {
    const arr = filter[key];
    onChange({
      ...filter,
      [key]: arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v],
    });
  };

  return (
    <FilterPanel onReset={onReset}>
      <FilterSection title="航司">
        {airlineOptions.length === 0 && (
          <p className="text-xs text-neutral-400">暂无</p>
        )}
        {airlineOptions.map(([name, count]) => (
          <CheckOption
            key={name}
            label={name}
            count={count}
            checked={filter.airlines.includes(name)}
            onChange={() => toggle("airlines", name)}
          />
        ))}
      </FilterSection>

      <FilterSection title="起飞时段">
        {TIME_BANDS.map((b) => (
          <CheckOption
            key={b.key}
            label={b.label}
            checked={filter.timeBands.includes(b.key)}
            onChange={() => toggle("timeBands", b.key)}
          />
        ))}
      </FilterSection>

      <FilterSection title="舱位">
        {cabinOptions.length === 0 && (
          <p className="text-xs text-neutral-400">暂无</p>
        )}
        {cabinOptions.map(([code, name]) => (
          <CheckOption
            key={code}
            label={name}
            checked={filter.cabinClasses.includes(code)}
            onChange={() => toggle("cabinClasses", code)}
          />
        ))}
      </FilterSection>

      <FilterSection title="价格范围（元）">
        <div className="flex gap-2 items-end">
          <PriceInput
            label="最低"
            value={filter.priceMin}
            onChange={(v) => onChange({ ...filter, priceMin: v })}
            placeholder="0"
          />
          <span className="text-neutral-300 pb-2">—</span>
          <PriceInput
            label="最高"
            value={filter.priceMax}
            onChange={(v) => onChange({ ...filter, priceMax: v })}
            placeholder="不限"
          />
        </div>
      </FilterSection>
    </FilterPanel>
  );
}
