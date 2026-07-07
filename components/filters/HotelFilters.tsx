"use client";

import { useMemo } from "react";
import {
  FilterPanel,
  FilterSection,
  CheckOption,
  RadioOption,
  PriceInput,
  PricePreset,
} from "./FilterUI";
import type { HotelItem } from "@/lib/types";

export interface HotelFilterState {
  /** 品牌（单选，接口 hotel_brand 是字符串） */
  brand: string;
  /** 价格区间 元/晚 */
  priceMin: string;
  priceMax: string;
  /** 星级 */
  starLevels: number[];
  /** 设施 */
  hasWifi: boolean;
  hasParking: boolean;
  hasBreakfast: boolean;
  hasSwimmingPool: boolean;
  hasGym: boolean;
  hasChildFriendly: boolean;
  /** 评分阈值（min_review_score，0-5） */
  minReviewScore: number;
  /** 距离上限 km（max_distance_km） */
  maxDistanceKm: string;
  /** 商圈/行政区（多选，取自聚合） */
  zones: string[];
  /** 仅看收藏 */
  onlyFavorites: boolean;
}

export const defaultHotelFilters: HotelFilterState = {
  brand: "",
  priceMin: "",
  priceMax: "",
  starLevels: [],
  hasWifi: false,
  hasParking: false,
  hasBreakfast: false,
  hasSwimmingPool: false,
  hasGym: false,
  hasChildFriendly: false,
  minReviewScore: 0,
  maxDistanceKm: "",
  zones: [],
  onlyFavorites: false,
};

/** 价格预设分段（元/晚） */
const PRICE_PRESETS: { label: string; min: string; max: string }[] = [
  { label: "¥0-300", min: "", max: "300" },
  { label: "¥300-600", min: "300", max: "600" },
  { label: "¥600-1000", min: "600", max: "1000" },
  { label: "¥1000+", min: "1000", max: "" },
];

/** 评分档位（min_review_score） */
const REVIEW_SCORES = [
  { score: 9, label: "9+ 极佳" },
  { score: 8, label: "8+ 很好" },
  { score: 7, label: "7+ 好" },
];

const REVIEW_STARS = [
  { level: 5, label: "五星级 / 豪华" },
  { level: 4, label: "四星级 / 高档" },
  { level: 3, label: "三星级 / 舒适" },
  { level: 2, label: "二星级 / 经济" },
];

const BRANDS = ["锦江", "华住", "如家", "维也纳", "亚朵", "希尔顿", "万豪", "首旅"];

/** 把前端筛选状态转成接口 filters 对象（空值剔除） */
export function toApiFilters(f: HotelFilterState): Record<string, unknown> {
  const filters: Record<string, unknown> = {};
  if (f.brand) filters.hotel_brand = f.brand;
  if (f.priceMin) filters.min_price = Number(f.priceMin);
  if (f.priceMax) filters.max_price = Number(f.priceMax);
  if (f.starLevels.length) filters.star_levels = f.starLevels;
  if (f.hasWifi) filters.has_wifi = true;
  if (f.hasParking) filters.has_parking = true;
  if (f.hasBreakfast) filters.has_restaurant = true;
  if (f.hasSwimmingPool) filters.has_swimming_pool = true;
  if (f.hasGym) filters.has_gymnasium = true;
  if (f.hasChildFriendly) filters.has_child_facility = true;
  if (f.minReviewScore > 0) filters.min_review_score = f.minReviewScore;
  if (f.maxDistanceKm) filters.max_distance_km = Number(f.maxDistanceKm);
  return filters;
}

/**
 * 从酒店结果里聚合商圈/行政区选项（带计数），供侧栏多选。
 */
export function aggregateZones(hotels: HotelItem[]): { name: string; count: number }[] {
  const map = new Map<string, number>();
  for (const h of hotels) {
    const z = h.business_zone || h.district;
    if (!z) continue;
    map.set(z, (map.get(z) || 0) + 1);
  }
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);
}

export function HotelFilterSidebar({
  filter,
  onChange,
  onReset,
  hotels = [],
}: {
  filter: HotelFilterState;
  onChange: (next: HotelFilterState) => void;
  onReset: () => void;
  /** 当前结果集，用于聚合商圈/景点选项 */
  hotels?: HotelItem[];
}) {
  const zones = useMemo(() => aggregateZones(hotels), [hotels]);

  const toggleStar = (level: number) => {
    const arr = filter.starLevels;
    onChange({
      ...filter,
      starLevels: arr.includes(level)
        ? arr.filter((x) => x !== level)
        : [...arr, level],
    });
  };

  const toggleZone = (name: string) => {
    const arr = filter.zones;
    onChange({
      ...filter,
      zones: arr.includes(name) ? arr.filter((x) => x !== name) : [...arr, name],
    });
  };

  return (
    <FilterPanel onReset={onReset}>
      <FilterSection title="价格范围（元/晚）">
        <div className="flex flex-wrap gap-1.5 mb-2">
          {PRICE_PRESETS.map((p) => {
            const active =
              filter.priceMin === p.min && filter.priceMax === p.max;
            return (
              <PricePreset
                key={p.label}
                label={p.label}
                active={active}
                onClick={() =>
                  onChange({ ...filter, priceMin: p.min, priceMax: p.max })
                }
              />
            );
          })}
        </div>
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

      <FilterSection title="评分">
        <RadioOption
          label="不限"
          checked={filter.minReviewScore === 0}
          onChange={() => onChange({ ...filter, minReviewScore: 0 })}
        />
        {REVIEW_SCORES.map((s) => (
          <RadioOption
            key={s.score}
            label={s.label}
            checked={filter.minReviewScore === s.score}
            onChange={() => onChange({ ...filter, minReviewScore: s.score })}
          />
        ))}
      </FilterSection>

      <FilterSection title="档次（星级）">
        {REVIEW_STARS.map((s) => (
          <CheckOption
            key={s.level}
            label={s.label}
            checked={filter.starLevels.includes(s.level)}
            onChange={() => toggleStar(s.level)}
          />
        ))}
      </FilterSection>

      {zones.length > 0 && (
        <FilterSection title="商圈 / 行政区" defaultOpen={false}>
          {zones.map((z) => (
            <CheckOption
              key={z.name}
              label={z.name}
              checked={filter.zones.includes(z.name)}
              onChange={() => toggleZone(z.name)}
              count={z.count}
            />
          ))}
        </FilterSection>
      )}

      <FilterSection title="距离市中心（km）" defaultOpen={false}>
        <RadioOption
          label="不限"
          checked={filter.maxDistanceKm === ""}
          onChange={() => onChange({ ...filter, maxDistanceKm: "" })}
        />
        {["3", "5", "10"].map((km) => (
          <RadioOption
            key={km}
            label={`≤ ${km} km`}
            checked={filter.maxDistanceKm === km}
            onChange={() => onChange({ ...filter, maxDistanceKm: km })}
          />
        ))}
      </FilterSection>

      <FilterSection title="设施服务" defaultOpen={false}>
        <CheckOption
          label="免费 WiFi"
          checked={filter.hasWifi}
          onChange={(v) => onChange({ ...filter, hasWifi: v })}
        />
        <CheckOption
          label="停车场"
          checked={filter.hasParking}
          onChange={(v) => onChange({ ...filter, hasParking: v })}
        />
        <CheckOption
          label="含早餐 / 餐厅"
          checked={filter.hasBreakfast}
          onChange={(v) => onChange({ ...filter, hasBreakfast: v })}
        />
        <CheckOption
          label="游泳池"
          checked={filter.hasSwimmingPool}
          onChange={(v) => onChange({ ...filter, hasSwimmingPool: v })}
        />
        <CheckOption
          label="健身房"
          checked={filter.hasGym}
          onChange={(v) => onChange({ ...filter, hasGym: v })}
        />
        <CheckOption
          label="儿童友好"
          checked={filter.hasChildFriendly}
          onChange={(v) => onChange({ ...filter, hasChildFriendly: v })}
        />
      </FilterSection>

      <FilterSection title="品牌" defaultOpen={false}>
        <RadioOption
          label="全部品牌"
          checked={filter.brand === ""}
          onChange={() => onChange({ ...filter, brand: "" })}
        />
        {BRANDS.map((b) => (
          <RadioOption
            key={b}
            label={b}
            checked={filter.brand === b}
            onChange={() => onChange({ ...filter, brand: b })}
          />
        ))}
      </FilterSection>

      <FilterSection title="我的收藏" defaultOpen={false}>
        <CheckOption
          label="仅看收藏"
          checked={filter.onlyFavorites}
          onChange={(v) => onChange({ ...filter, onlyFavorites: v })}
        />
      </FilterSection>
    </FilterPanel>
  );
}
