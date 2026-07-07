"use client";

/**
 * 机票结果页日期切换 Tab。
 * 显示当前日期前后各 N 天，每个 Tab 显示「MM-DD 周X」。
 * 切换时触发 onChange，父组件重新搜索。
 */

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];
const MONTH_DAY_FMT = new Intl.DateTimeFormat("zh-CN", {
  month: "2-digit",
  day: "2-digit",
});

export interface DateTab {
  date: string; // YYYY-MM-DD
  weekday: string;
  label: string; // MM-DD
  isToday: boolean;
}

/** 围绕 centerDate 生成前后各 halfRange 天的日期数组 */
export function buildDateTabs(centerDate: string, halfRange = 3): DateTab[] {
  const center = new Date(centerDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tabs: DateTab[] = [];

  for (let i = -halfRange; i <= halfRange; i++) {
    const d = new Date(center);
    d.setDate(d.getDate() + i);
    // 不允许过去日期
    if (d < today) continue;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const dateStr = `${yyyy}-${mm}-${dd}`;
    tabs.push({
      date: dateStr,
      weekday: WEEKDAYS[d.getDay()],
      label: MONTH_DAY_FMT.format(d).replace("/", "-"),
      isToday: d.getTime() === today.getTime(),
    });
  }
  return tabs;
}

export default function DatePickerTabs({
  value,
  onChange,
  tabs,
}: {
  value: string;
  onChange: (date: string) => void;
  tabs: DateTab[];
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
      {tabs.map((tab) => {
        const active = tab.date === value;
        return (
          <button
            key={tab.date}
            onClick={() => onChange(tab.date)}
            className={`shrink-0 px-4 py-2 rounded-xl border text-center min-w-[72px] transition ${
              active
                ? "bg-brand-500 text-white border-brand-500 shadow-sm"
                : "bg-white text-neutral-600 border-neutral-200 hover:border-brand-300 hover:text-brand-600"
            }`}
          >
            <div className={`text-sm font-semibold tabular-nums ${active ? "" : ""}`}>
              {tab.label}
            </div>
            <div
              className={`text-xs mt-0.5 ${
                active ? "text-white/80" : "text-neutral-400"
              }`}
            >
              {tab.isToday ? "今天" : `周${tab.weekday}`}
            </div>
          </button>
        );
      })}
    </div>
  );
}
