"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  POPULAR_AIRPORTS,
  POPULAR_BUS_CITIES,
  type BusCity,
} from "@/lib/cities";

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
      ? "w-full rounded-2xl border border-neutral-200 bg-white shadow-card overflow-hidden"
      : "w-full rounded-2xl bg-white/95 backdrop-blur-md shadow-hover ring-1 ring-black/5 overflow-hidden";

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

function CityPicker({
  label,
  value,
  onChange,
  options,
  hideCode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { city: string; code: string }[];
  hideCode?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5 min-w-0">
      <span className="text-xs font-medium text-neutral-500">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 rounded-xl border border-neutral-200 bg-neutral-50 px-3 text-sm focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100 transition"
      >
        {options.map((o) => (
          <option key={o.code} value={o.code}>
            {hideCode ? o.city : `${o.city} (${o.code})`}
          </option>
        ))}
      </select>
    </label>
  );
}

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
      {/* 行1：出发 ⇄ 到达 */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-3">
        <CityPicker label="出发城市" value={from} onChange={setFrom} options={airports} />
        <SwapButton onClick={swap} />
        <CityPicker label="到达城市" value={to} onChange={setTo} options={airports} />
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

function HotelForm({ router }: { router: ReturnType<typeof useRouter> }) {
  const [destination, setDestination] = useState("杭州西湖");
  const [checkIn, setCheckIn] = useState(defaultDate(7));
  const [checkOut, setCheckOut] = useState(defaultDate(9));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const q = new URLSearchParams({ destination, checkIn, checkOut });
        router.push(`/hotel?${q.toString()}`);
      }}
      className="space-y-3"
    >
      {/* 行1：目的地（占满） */}
      <label className="flex flex-col gap-1.5 min-w-0">
        <span className="text-xs font-medium text-neutral-500">目的地 / 关键词</span>
        <input
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="如 杭州西湖、外滩、迪士尼"
          className="h-12 rounded-xl border border-neutral-200 bg-neutral-50 px-3 text-sm focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100 transition"
        />
      </label>
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

function BusForm({ router }: { router: ReturnType<typeof useRouter> }) {
  const cities = POPULAR_BUS_CITIES;
  const [from, setFrom] = useState(cities[3].adcode); // 深圳
  const [to, setTo] = useState(cities[2].adcode); // 广州
  const [date, setDate] = useState(defaultDate(7));

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  const busOptions = cities.map((c: BusCity) => ({ city: c.city, code: c.adcode }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const q = new URLSearchParams({ from, to, date });
        router.push(`/bus?${q.toString()}`);
      }}
      className="space-y-3"
    >
      {/* 行1：出发 ⇄ 到达 */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-3">
        <CityPicker label="出发城市" value={from} onChange={setFrom} options={busOptions} hideCode />
        <SwapButton onClick={swap} />
        <CityPicker label="到达城市" value={to} onChange={setTo} options={busOptions} hideCode />
      </div>
      {/* 行2：日期 + 搜索 */}
      <div className="flex gap-3">
        <DateField label="出发日期" value={date} onChange={setDate} min={defaultDate(0)} />
        <SubmitButton>搜索班次</SubmitButton>
      </div>
    </form>
  );
}
