"use client";

import {
  FilterPanel,
  FilterSection,
  CheckOption,
  RadioOption,
  PriceInput,
} from "./FilterUI";

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
};

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
  return filters;
}

const BRANDS = ["锦江", "华住", "如家", "维也纳", "亚朵", "希尔顿", "万豪", "首旅"];
const STARS = [
  { level: 5, label: "五星级 / 豪华" },
  { level: 4, label: "四星级 / 高档" },
  { level: 3, label: "三星级 / 舒适" },
  { level: 2, label: "二星级 / 经济" },
];

export function HotelFilterSidebar({
  filter,
  onChange,
  onReset,
}: {
  filter: HotelFilterState;
  onChange: (next: HotelFilterState) => void;
  onReset: () => void;
}) {
  const toggleStar = (level: number) => {
    const arr = filter.starLevels;
    onChange({
      ...filter,
      starLevels: arr.includes(level)
        ? arr.filter((x) => x !== level)
        : [...arr, level],
    });
  };

  return (
    <FilterPanel onReset={onReset}>
      <FilterSection title="品牌">
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

      <FilterSection title="价格范围（元/晚）">
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

      <FilterSection title="档次（星级）">
        {STARS.map((s) => (
          <CheckOption
            key={s.level}
            label={s.label}
            checked={filter.starLevels.includes(s.level)}
            onChange={() => toggleStar(s.level)}
          />
        ))}
      </FilterSection>

      <FilterSection title="设施服务" defaultOpen={false}>
        <CheckOption
          label="WiFi"
          checked={filter.hasWifi}
          onChange={(v) => onChange({ ...filter, hasWifi: v })}
        />
        <CheckOption
          label="停车场"
          checked={filter.hasParking}
          onChange={(v) => onChange({ ...filter, hasParking: v })}
        />
        <CheckOption
          label="含早餐/餐厅"
          checked={filter.hasBreakfast}
          onChange={(v) => onChange({ ...filter, hasBreakfast: v })}
        />
        <CheckOption
          label="游泳池"
          checked={filter.hasSwimmingPool}
          onChange={(v) => onChange({ ...filter, hasSwimmingPool: v })}
        />
      </FilterSection>
    </FilterPanel>
  );
}
