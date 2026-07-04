"use client";

export interface SortOption<T extends string> {
  key: T;
  label: string;
}

/**
 * 横向排序选择条：tab 风格，激活态高亮。
 */
export function SortBar<T extends string>({
  options,
  value,
  onChange,
  count,
}: {
  options: SortOption<T>[];
  value: T;
  onChange: (v: T) => void;
  count?: number;
}) {
  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-1 bg-neutral-100 rounded-xl p-1">
        {options.map((o) => {
          const active = o.key === value;
          return (
            <button
              key={o.key}
              onClick={() => onChange(o.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
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
      {typeof count === "number" && (
        <span className="text-xs text-neutral-400">共 {count} 条</span>
      )}
    </div>
  );
}
