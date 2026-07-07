"use client";

import type { HotelFilterState } from "@/components/filters/HotelFilters";

/**
 * 顶部一行快速筛选 chip：复用侧栏的 filter state，一键切换常用维度。
 * 每个 chip 点击后切换（再点取消），不互斥。
 */
export interface ChipDef {
  key: string;
  label: string;
  /** 当前是否激活 */
  isActive: (f: HotelFilterState) => boolean;
  /** 切换到激活态要赋的增量；再点一次回到非激活 */
  toggle: (f: HotelFilterState) => HotelFilterState;
}

const CHIPS: ChipDef[] = [
  {
    key: "score9",
    label: "评分 9+",
    isActive: (f) => f.minReviewScore === 9,
    toggle: (f) => ({
      ...f,
      minReviewScore: f.minReviewScore === 9 ? 0 : 9,
    }),
  },
  {
    key: "score8",
    label: "评分 8+",
    isActive: (f) => f.minReviewScore === 8,
    toggle: (f) => ({
      ...f,
      minReviewScore: f.minReviewScore === 8 ? 0 : 8,
    }),
  },
  {
    key: "wifi",
    label: "免费 WiFi",
    isActive: (f) => f.hasWifi,
    toggle: (f) => ({ ...f, hasWifi: !f.hasWifi }),
  },
  {
    key: "breakfast",
    label: "含早餐",
    isActive: (f) => f.hasBreakfast,
    toggle: (f) => ({ ...f, hasBreakfast: !f.hasBreakfast }),
  },
  {
    key: "parking",
    label: "可停车",
    isActive: (f) => f.hasParking,
    toggle: (f) => ({ ...f, hasParking: !f.hasParking }),
  },
  {
    key: "pool",
    label: "游泳池",
    isActive: (f) => f.hasSwimmingPool,
    toggle: (f) => ({ ...f, hasSwimmingPool: !f.hasSwimmingPool }),
  },
  {
    key: "gym",
    label: "健身房",
    isActive: (f) => f.hasGym,
    toggle: (f) => ({ ...f, hasGym: !f.hasGym }),
  },
  {
    key: "dist3",
    label: "距中心 ≤3km",
    isActive: (f) => f.maxDistanceKm === "3",
    toggle: (f) => ({
      ...f,
      maxDistanceKm: f.maxDistanceKm === "3" ? "" : "3",
    }),
  },
  {
    key: "star5",
    label: "五星级",
    isActive: (f) => f.starLevels.includes(5),
    toggle: (f) => ({
      ...f,
      starLevels: f.starLevels.includes(5)
        ? f.starLevels.filter((s) => s !== 5)
        : [...f.starLevels, 5],
    }),
  },
  {
    key: "fav",
    label: "♥ 我的收藏",
    isActive: (f) => f.onlyFavorites,
    toggle: (f) => ({ ...f, onlyFavorites: !f.onlyFavorites }),
  },
];

export default function QuickFilterChips({
  filter,
  onChange,
}: {
  filter: HotelFilterState;
  onChange: (f: HotelFilterState) => void;
}) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin">
      {CHIPS.map((c) => {
        const active = c.isActive(filter);
        return (
          <button
            key={c.key}
            type="button"
            onClick={() => onChange(c.toggle(filter))}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition border whitespace-nowrap ${
              active
                ? "bg-brand-500 text-white border-brand-500 shadow-sm"
                : "bg-white text-neutral-600 border-neutral-200 hover:border-brand-300 hover:text-brand-600"
            }`}
          >
            {c.label}
          </button>
        );
      })}
    </div>
  );
}
