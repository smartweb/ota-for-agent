"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  POPULAR_AIRPORTS,
  POPULAR_BUS_CITIES,
  POPULAR_HOTEL_CITIES,
  INTERNATIONAL_AIRPORTS,
  type BusCity,
  type AirportCity,
  type HotelCity,
} from "@/lib/cities";
import CityPickerPanel from "@/components/flight/CityPickerPanel";

/** 酒店最近搜索的 localStorage key */
const HOTEL_RECENT_KEY = "hotel_recent_cities";
/** 巴士最近搜索的 localStorage key */
const BUS_RECENT_KEY = "bus_recent_cities";
const MAX_RECENT = 6;

type TabKey = "flight" | "hotel" | "bus";

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: "flight", label: "机票", icon: "✈" },
  { key: "hotel", label: "酒店", icon: "🏨" },
  { key: "bus", label: "巴士", icon: "🚌" },
];

/** 默认日期 = 今天 + N 天 */
function defaultDate(offsetDays = 7): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export type { TabKey };

export default function SearchTabs({
  initialTab = "flight",
  controlledTab,
  onTabChange,
  variant = "card",
}: {
  initialTab?: TabKey;
  controlledTab?: TabKey;
  onTabChange?: (t: TabKey) => void;
  variant?: "card" | "plain";
}) {
  const router = useRouter();
  const [internalTab, setInternalTab] = useState<TabKey>(initialTab);
  const tab = controlledTab ?? internalTab;
  const setTab = (t: TabKey) => {
    if (onTabChange) onTabChange(t);
    else setInternalTab(t);
  };

  const wrapperCls =
    variant === "card"
      ? "w-full rounded-2xl border border-neutral-200 bg-white shadow-card"
      : "w-full rounded-2xl bg-white/95 backdrop-blur-md shadow-hover ring-1 ring-black/5";

  return (
    <div className={wrapperCls}>
      {/* Tab 头 */}
      <div className="flex border-b border-neutral-200">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative ${
              tab === t.key
                ? "text-brand-600"
                : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            <span className="mr-2">{t.icon}</span>
            {t.label}
            {tab === t.key && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 bg-brand-500" />
            )}
          </button>
        ))}
      </div>

      {/* 表单区：三个表单共用统一的两行结构，保证等高 + 按钮可见 */}
      <div className="p-6">
        {tab === "flight" && <FlightForm router={router} />}
        {tab === "hotel" && <HotelForm router={router} />}
        {tab === "bus" && <BusForm router={router} />}
      </div>
    </div>
  );
}

/* ------------------------------ 共享小组件 ------------------------------ */

function DateField({
  label,
  value,
  onChange,
  min,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  min?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 min-w-0 flex-1">
      <span className="text-xs font-medium text-neutral-500">{label}</span>
      <input
        type="date"
        value={value}
        min={min}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 rounded-xl border border-neutral-200 bg-neutral-50 px-3 text-sm focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100 transition"
      />
    </label>
  );
}

function SwapButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="交换出发和到达"
      className="h-12 w-10 shrink-0 flex items-center justify-center rounded-xl border border-neutral-200 text-neutral-500 hover:text-brand-500 hover:border-brand-300 transition self-end"
    >
      ⇄
    </button>
  );
}

function SubmitButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="submit"
      className="h-12 shrink-0 px-8 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 active:scale-[0.98] transition shadow-sm self-end"
    >
      {children}
    </button>
  );
}

/* -------------------------------- 机票 -------------------------------- */

function FlightCityField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const cur = ALL_AIRPORTS.find((c) => c.code === value);
  return (
    <div className="flex flex-col gap-1.5 min-w-0 relative">
      <span className="text-xs font-medium text-neutral-500">{label}</span>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="h-12 rounded-xl border border-neutral-200 bg-neutral-50 px-3 text-left text-sm focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100 transition flex items-center justify-between gap-2"
      >
        <span className="truncate">
          {cur ? (
            <>
              <span className="font-medium">{cur.city}</span>
              <span className="text-neutral-400 ml-1.5 text-xs">{cur.code}</span>
            </>
          ) : (
            <span className="text-neutral-400">请选择</span>
          )}
        </span>
        <span className="text-neutral-400 text-xs shrink-0">▾</span>
      </button>
      {open && (
        <CityPickerPanel
          value={value}
          onChange={onChange}
          onClose={() => setOpen(false)}
          valueMode="code"
          scopes={FLIGHT_SCOPES}
        />
      )}
    </div>
  );
}

/** 机票面板：国内 + 国际两个 scope */
const FLIGHT_SCOPES = [
  { key: "domestic" as const, label: "国内", cities: POPULAR_AIRPORTS },
  { key: "intl" as const, label: "国际/地区", cities: INTERNATIONAL_AIRPORTS },
];

/** 国内 + 国际机场合并，给字段做反查 */
const ALL_AIRPORTS: AirportCity[] = [...POPULAR_AIRPORTS, ...INTERNATIONAL_AIRPORTS];

function FlightForm({ router }: { router: ReturnType<typeof useRouter> }) {
  const airports = POPULAR_AIRPORTS;
  const [from, setFrom] = useState(airports[1].code); // SHA 上海
  const [to, setTo] = useState(airports[3].code); // SZX 深圳
  const [date, setDate] = useState(defaultDate(7));

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const q = new URLSearchParams({ from, to, date });
        router.push(`/flight?${q.toString()}`);
      }}
      className="space-y-3"
    >
      {/* 行1：出发 ⇄ 到达（面板选择，支持国内/国际 + A-Z） */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-3">
        <FlightCityField label="出发城市" value={from} onChange={setFrom} />
        <SwapButton onClick={swap} />
        <FlightCityField label="到达城市" value={to} onChange={setTo} />
      </div>
      {/* 行2：日期 + 搜索 */}
      <div className="flex gap-3">
        <DateField label="出发日期" value={date} onChange={setDate} min={defaultDate(0)} />
        <SubmitButton>搜索航班</SubmitButton>
      </div>
    </form>
  );
}

/* -------------------------------- 酒店 -------------------------------- */

/** 酒店面板：只有国内城市（单 scope，组件不会渲染切换 Tab） */
const HOTEL_SCOPES = [
  { key: "domestic" as const, label: "国内", cities: POPULAR_HOTEL_CITIES as AirportCity[] },
];

/** 读取 localStorage 里最近选择过的酒店城市（按选择顺序倒序，最新在前） */
function readHotelRecent(): HotelCity[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HOTEL_RECENT_KEY);
    if (!raw) return [];
    const names: string[] = JSON.parse(raw);
    return names
      .map((n) => POPULAR_HOTEL_CITIES.find((c) => c.city === n))
      .filter((c): c is HotelCity => !!c);
  } catch {
    return [];
  }
}

/** 写入一个最近搜索城市（去重并放到最前，最多保留 MAX_RECENT 条） */
function pushHotelRecent(city: string) {
  if (typeof window === "undefined") return;
  try {
    const prev = readHotelRecent().map((c) => c.city);
    const next = [city, ...prev.filter((n) => n !== city)].slice(0, MAX_RECENT);
    localStorage.setItem(HOTEL_RECENT_KEY, JSON.stringify(next));
  } catch {
    // 忽略隐私模式等写入异常
  }
}

function HotelForm({ router }: { router: ReturnType<typeof useRouter> }) {
  const [destination, setDestination] = useState("杭州");
  const [checkIn, setCheckIn] = useState(defaultDate(7));
  const [checkOut, setCheckOut] = useState(defaultDate(9));
  const [open, setOpen] = useState(false);
  const [recent, setRecent] = useState<HotelCity[]>([]);

  // 组件挂载后读取最近搜索（避免 SSR 报错）
  useEffect(() => {
    setRecent(readHotelRecent());
  }, []);

  const cur = POPULAR_HOTEL_CITIES.find((c) => c.city === destination);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!destination) return;
        pushHotelRecent(destination);
        const q = new URLSearchParams({ destination, checkIn, checkOut });
        router.push(`/hotel?${q.toString()}`);
      }}
      className="space-y-3"
    >
      {/* 行1：目的地（城市选择面板） */}
      <div className="flex flex-col gap-1.5 min-w-0 relative">
        <span className="text-xs font-medium text-neutral-500">目的地</span>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="h-12 rounded-xl border border-neutral-200 bg-neutral-50 px-3 text-left text-sm focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100 transition flex items-center justify-between gap-2"
        >
          <span className="truncate">
            {cur ? (
              <span className="font-medium">{cur.city}</span>
            ) : (
              <span className="text-neutral-800 font-medium">{destination || "请选择"}</span>
            )}
          </span>
          <span className="text-neutral-400 text-xs shrink-0">▾</span>
        </button>
        {open && (
          <CityPickerPanel
            value={destination}
            valueMode="city"
            scopes={HOTEL_SCOPES}
            recent={recent}
            onChange={(city) => {
              setDestination(city);
              // 立即更新最近搜索（去重 + 前置），让下次打开就能看到
              const next = [
                city,
                ...recent.filter((c) => c.city !== city).map((c) => c.city),
              ].slice(0, MAX_RECENT);
              pushHotelRecent(city);
              setRecent(
                next
                  .map((n) => POPULAR_HOTEL_CITIES.find((c) => c.city === n))
                  .filter((c): c is HotelCity => !!c)
              );
            }}
            onClose={() => setOpen(false)}
          />
        )}
      </div>
      {/* 行2：入住 + 离店 + 搜索 */}
      <div className="flex gap-3">
        <DateField label="入住" value={checkIn} onChange={setCheckIn} min={defaultDate(0)} />
        <DateField label="离店" value={checkOut} onChange={setCheckOut} min={checkIn} />
        <SubmitButton>搜索酒店</SubmitButton>
      </div>
    </form>
  );
}

/* -------------------------------- 巴士 -------------------------------- */

/** 巴士面板：只有国内城市，单 scope（组件不会渲染切换 Tab）。
 * BusCity 用 adcode 作值；映射成 AirportCity 形态以复用 CityPickerPanel（code=adcode）。 */
const BUS_SCOPES = [
  {
    key: "domestic" as const,
    label: "国内",
    cities: POPULAR_BUS_CITIES.map((c) => ({
      city: c.city,
      code: c.adcode,
      province: c.province,
      letter: c.letter,
    })) as AirportCity[],
  },
];

/** adcode 反查 BusCity（用于字段头部展示） */
function findBusCity(adcode: string): BusCity | undefined {
  return POPULAR_BUS_CITIES.find((c) => c.adcode === adcode);
}

/** 读取 localStorage 里最近搜索过的巴士城市 */
function readBusRecent(): BusCity[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(BUS_RECENT_KEY);
    if (!raw) return [];
    const codes: string[] = JSON.parse(raw);
    return codes
      .map((code) => POPULAR_BUS_CITIES.find((c) => c.adcode === code))
      .filter((c): c is BusCity => !!c);
  } catch {
    return [];
  }
}

function pushBusRecent(adcode: string) {
  if (typeof window === "undefined") return;
  try {
    const prev = readBusRecent().map((c) => c.adcode);
    const next = [adcode, ...prev.filter((n) => n !== adcode)].slice(0, MAX_RECENT);
    localStorage.setItem(BUS_RECENT_KEY, JSON.stringify(next));
  } catch {
    // 忽略隐私模式等写入异常
  }
}

function BusCityField({
  label,
  value,
  onChange,
  recent,
}: {
  label: string;
  value: string; // adcode
  onChange: (v: string) => void;
  recent?: AirportCity[];
}) {
  const [open, setOpen] = useState(false);
  const cur = findBusCity(value);
  return (
    <div className="flex flex-col gap-1.5 min-w-0 relative">
      <span className="text-xs font-medium text-neutral-500">{label}</span>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="h-12 rounded-xl border border-neutral-200 bg-neutral-50 px-3 text-left text-sm focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100 transition flex items-center justify-between gap-2"
      >
        <span className="truncate">
          {cur ? (
            <span className="font-medium">{cur.city}</span>
          ) : (
            <span className="text-neutral-400">请选择</span>
          )}
        </span>
        <span className="text-neutral-400 text-xs shrink-0">▾</span>
      </button>
      {open && (
        <CityPickerPanel
          value={value}
          valueMode="code"
          scopes={BUS_SCOPES}
          recent={recent}
          onChange={onChange}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

function BusForm({ router }: { router: ReturnType<typeof useRouter> }) {
  const cities = POPULAR_BUS_CITIES;
  const [from, setFrom] = useState(cities[3].adcode); // 深圳
  const [to, setTo] = useState(cities[2].adcode); // 广州
  const [date, setDate] = useState(defaultDate(7));
  const [recent, setRecent] = useState<AirportCity[]>([]);

  // 挂载后读取最近搜索（避免 SSR 报错）
  useEffect(() => {
    setRecent(
      readBusRecent().map((c) => ({
        city: c.city,
        code: c.adcode,
        province: c.province,
        letter: c.letter,
      }))
    );
  }, []);

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        pushBusRecent(from);
        pushBusRecent(to);
        const q = new URLSearchParams({ from, to, date });
        router.push(`/bus?${q.toString()}`);
      }}
      className="space-y-3"
    >
      {/* 行1：出发 ⇄ 到达（面板选择，支持热门 + A-Z） */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-3">
        <BusCityField label="出发城市" value={from} onChange={setFrom} recent={recent} />
        <SwapButton onClick={swap} />
        <BusCityField label="到达城市" value={to} onChange={setTo} recent={recent} />
      </div>
      {/* 行2：日期 + 搜索 */}
      <div className="flex gap-3">
        <DateField label="出发日期" value={date} onChange={setDate} min={defaultDate(0)} />
        <SubmitButton>搜索班次</SubmitButton>
      </div>
    </form>
  );
}
