"use client";

export interface SortOption<T extends string> {
  key: T;
  label: string;
}

type ViewMode = "list" | "map";

/**
 * 横向排序选择条：tab 风格，激活态高亮。
 * 可选地图视图切换（viewMode + onViewModeChange）。
 */
export function SortBar<T extends string>({
  options,
  value,
  onChange,
  count,
  viewMode = "list",
  onViewModeChange,
  showViewToggle = false,
}: {
  options: SortOption<T>[];
  value: T;
  onChange: (v: T) => void;
  count?: number;
  viewMode?: ViewMode;
  onViewModeChange?: (v: ViewMode) => void;
  /** 是否展示列表/地图切换按钮 */
  showViewToggle?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-1 bg-neutral-100 rounded-xl p-1 overflow-x-auto">
        {options.map((o) => {
          const active = o.key === value;
          return (
            <button
              key={o.key}
              onClick={() => onChange(o.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                active
                  ? "bg-white text-brand-600 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {typeof count === "number" && (
          <span className="text-xs text-neutral-400">共 {count} 条</span>
        )}
        {showViewToggle && onViewModeChange && (
          <div className="flex items-center gap-0.5 bg-neutral-100 rounded-lg p-0.5">
            <button
              onClick={() => onViewModeChange("list")}
              aria-label="列表视图"
              className={`h-7 w-7 rounded-md flex items-center justify-center text-xs transition ${
                viewMode === "list"
                  ? "bg-white text-brand-600 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              ☰
            </button>
            <button
              onClick={() => onViewModeChange("map")}
              aria-label="地图视图"
              className={`h-7 w-7 rounded-md flex items-center justify-center text-xs transition ${
                viewMode === "map"
                  ? "bg-white text-brand-600 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              📍
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
