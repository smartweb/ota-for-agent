import type { BusItem } from "@/lib/types";
import BusBookButton from "./BusBookButton";

/** 分 → 元（接口单位是分） */
function fenToYuan(fen?: number): string {
  if (fen == null) return "—";
  return (fen / 100).toLocaleString("zh-CN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function durationLabel(min?: number): string {
  if (!min) return "";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h${m}m` : `${h}h`;
}

/**
 * 距离格式化。接口文档标 km，但实际返回米（如深圳→广州返回 140000 而非 140）。
 * 阈值判断：> 200 视为米换算成公里，否则视为公里。
 */
function distanceLabel(d?: number): string {
  if (!d || d <= 0) return "";
  const km = d > 200 ? Math.round(d / 1000) : Math.round(d);
  return `${km}km`;
}

export default function BusCard({
  bus,
  searchParams,
}: {
  bus: BusItem;
  /** 当前搜索的 from/to（adcode）/date，用于预订页返回链 */
  searchParams?: { from?: string; to?: string; date?: string };
}) {
  const avail = bus.avail_seat_count ?? 0;
  const low = avail > 0 && avail <= 5;

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 hover:border-brand-300 hover:shadow-hover transition-all">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* 时刻 + 站点 */}
        <div className="flex items-center gap-4 flex-1 min-w-[280px]">
          <div className="text-center">
            <div className="text-xl font-semibold tabular-nums">
              {bus.dep_time || "--:--"}
            </div>
            <div className="text-[11px] text-neutral-400 mt-0.5">发车</div>
          </div>
          <div className="flex-1 min-w-[160px]">
            <div className="text-sm font-medium truncate">
              {bus.start_station_name || bus.from_city}
            </div>
            <div className="mt-1.5 relative flex items-center text-[11px] text-neutral-400">
              <span className="h-px bg-neutral-200 flex-1" />
              <span className="px-1.5">
                {durationLabel(bus.duration)}
                {distanceLabel(bus.distance) && ` · ${distanceLabel(bus.distance)}`}
              </span>
              <span className="h-px bg-neutral-200 flex-1" />
            </div>
            <div className="mt-1.5 text-sm font-medium truncate text-right">
              {bus.end_station_name || bus.to_city}
            </div>
          </div>
        </div>

        {/* 车型 + 余票 */}
        <div className="text-center w-28">
          <div className="text-xs text-neutral-700">{bus.class_name || "—"}</div>
          <div
            className={`text-[11px] mt-1 ${
              avail === 0
                ? "text-neutral-400"
                : low
                ? "text-brand-600"
                : "text-emerald-600"
            }`}
          >
            {avail === 0 ? "已售罄" : low ? `仅剩 ${avail} 张` : `余 ${avail} 张`}
          </div>
        </div>

        {/* 价格 + 按钮 */}
        <div className="text-right w-32">
          <div className="flex items-baseline justify-end gap-0.5">
            <span className="text-xs text-neutral-400">¥</span>
            <span className="text-2xl font-bold text-brand-600 tabular-nums">
              {fenToYuan(bus.price)}
            </span>
          </div>
          <BusBookButton
            bus={bus}
            disabled={avail === 0}
            searchParams={searchParams}
          />
        </div>
      </div>

      {(bus.remark || bus.line_name) && (
        <div className="mt-3 pt-3 border-t border-neutral-100 text-xs text-neutral-500 flex flex-wrap gap-x-4">
          {bus.line_name && <span>线路 · {bus.line_name}</span>}
          {bus.remark && <span>{bus.remark}</span>}
        </div>
      )}
    </div>
  );
}
