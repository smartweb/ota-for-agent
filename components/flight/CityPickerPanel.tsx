"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { AirportCity } from "@/lib/cities";

type Scope = "domestic" | "intl";

interface ScopeConfig {
  key: Scope;
  label: string;
  cities: AirportCity[];
}

interface CityPickerPanelProps {
  /** 当前选中值（city 名或 code，取决于 valueMode） */
  value: string;
  /** 选择回调，回传的值类型由 valueMode 决定 */
  onChange: (v: string) => void;
  onClose?: () => void;
  /**
   * 值类型：
   * - "code"：以 IATA 三字码为值（机票用）
   * - "city"：以城市中文名为值（酒店用，因为后端 destination 是城市名）
   */
  valueMode?: "code" | "city";
  /** 最近搜索记录（已排序），最多展示 6 条 */
  recent?: AirportCity[];
  /** 是否启用国内/国际切换；酒店场景可只传国内 */
  scopes?: ScopeConfig[];
  /** 热门展示前 N 个 */
  hotCount?: number;
}

export default function CityPickerPanel({
  value,
  onChange,
  onClose,
  valueMode = "code",
  recent = [],
  scopes,
  hotCount = 20,
}: CityPickerPanelProps) {
  const defaultScopes: ScopeConfig[] = useMemo(
    () => [
      // 默认空，调用方一般会传 scopes
      { key: "domestic", label: "国内", cities: [] },
    ],
    []
  );
  const cfgs = scopes && scopes.length ? scopes : defaultScopes;

  const [scopeKey, setScopeKey] = useState<Scope>(cfgs[0].key);
  const [activeLetter, setActiveLetter] = useState<string>("热门");
  const panelRef = useRef<HTMLDivElement>(null);

  const current = cfgs.find((s) => s.key === scopeKey) || cfgs[0];
  const list = current.cities;

  // 切换 scope 时回到「热门」
  useEffect(() => {
    setActiveLetter("热门");
  }, [scopeKey]);

  // 点击外部关闭
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose?.();
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [onClose]);

  // 字母分组（仅保留实际存在城市的字母）
  const { hot, letters } = useMemo(() => {
    const top = list.slice(0, hotCount);
    const map = new Map<string, AirportCity[]>();
    for (const c of list) {
      const L = (c.letter || "#").toUpperCase();
      if (!map.has(L)) map.set(L, []);
      map.get(L)!.push(c);
    }
    return { hot: top, letters: Array.from(map.keys()).sort() };
  }, [list, hotCount]);

  const visible = useMemo(() => {
    if (activeLetter === "热门") return hot;
    return list.filter((c) => (c.letter || "#").toUpperCase() === activeLetter);
  }, [activeLetter, hot, list]);

  // 当前选中对象（用于头部展示）
  const all = useMemo(() => cfgs.flatMap((s) => s.cities), [cfgs]);
  const selected = all.find((c) =>
    valueMode === "code" ? c.code === value : c.city === value
  );

  const handlePick = (c: AirportCity) => {
    onChange(valueMode === "code" ? c.code : c.city);
    onClose?.();
  };

  const showScopeTabs = cfgs.length > 1;
  const showRecent = recent.length > 0;

  return (
    <div
      ref={panelRef}
      className="absolute z-30 mt-1 w-full sm:w-[560px] rounded-2xl border border-neutral-200 bg-white shadow-hover overflow-hidden"
    >
      {/* 头部：当前选择 + 关闭 */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-100">
        <div className="text-xs text-neutral-500">
          已选：
          <span className="text-neutral-800 font-medium">
            {selected ? `${selected.city}` : value || "—"}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-neutral-400 hover:text-neutral-700 text-sm"
          aria-label="关闭"
        >
          ✕
        </button>
      </div>

      {/* 国内 / 国际 切换（多 scope 时才显示） */}
      {showScopeTabs && (
        <div className="flex gap-1 px-4 pt-3">
          {cfgs.map((t) => (
            <button
              key={t.key}
              onClick={() => setScopeKey(t.key)}
              className={`px-3 py-1 rounded-full text-xs transition ${
                scopeKey === t.key
                  ? "bg-brand-50 text-brand-600 font-medium"
                  : "text-neutral-500 hover:bg-neutral-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* 最近搜索（酒店场景用） */}
      {showRecent && (
        <div className="px-4 pt-3">
          <SectionLabel>最近搜索</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {recent.map((c) => {
              const active = valueMode === "code" ? c.code === value : c.city === value;
              return (
                <button
                  key={(c.code || "") + c.city}
                  onClick={() => handlePick(c)}
                  className={`px-3 py-1 rounded-full text-xs transition ${
                    active
                      ? "bg-brand-500 text-white"
                      : "bg-neutral-50 text-neutral-600 hover:bg-brand-50 hover:text-brand-600"
                  }`}
                >
                  {c.city}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 索引栏：热门 + A-Z */}
      <div className="flex flex-wrap gap-x-1 gap-y-1 px-4 py-2 max-h-[88px] overflow-y-auto">
        <IndexBtn
          label="热门"
          active={activeLetter === "热门"}
          onClick={() => setActiveLetter("热门")}
        />
        {letters.map((L) => (
          <IndexBtn
            key={L}
            label={L}
            active={activeLetter === L}
            onClick={() => setActiveLetter(L)}
          />
        ))}
      </div>

      {/* 城市网格 */}
      <div className="px-4 pb-3 max-h-[280px] overflow-y-auto">
        <SectionLabel>
          {activeLetter === "热门" ? "热门城市" : activeLetter}
        </SectionLabel>
        {visible.length === 0 ? (
          <div className="py-6 text-center text-sm text-neutral-400">
            该字母下暂无城市
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {visible.map((c) => {
              const active =
                valueMode === "code" ? c.code === value : c.city === value;
              return (
                <button
                  key={(c.code || "") + c.city}
                  onClick={() => handlePick(c)}
                  className={`px-2 py-2 rounded-lg text-sm transition text-left ${
                    active
                      ? "bg-brand-500 text-white font-medium"
                      : "bg-neutral-50 text-neutral-700 hover:bg-brand-50 hover:text-brand-600"
                  }`}
                  title={c.airport || c.city}
                >
                  <div className="leading-tight">{c.city}</div>
                  {valueMode === "code" && (
                    <div
                      className={`text-[10px] mt-0.5 ${
                        active ? "text-white/70" : "text-neutral-400"
                      }`}
                    >
                      {c.code}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function IndexBtn({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`h-6 min-w-[24px] px-1 rounded text-xs transition ${
        active
          ? "bg-brand-500 text-white font-semibold"
          : "text-neutral-500 hover:bg-neutral-100"
      }`}
    >
      {label}
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-medium text-neutral-400 mt-1 mb-2">
      {children}
    </div>
  );
}
