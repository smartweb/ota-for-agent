"use client";

/**
 * 筛选侧栏通用 UI 原子组件。
 * 风格：极简白底卡片，分组带标题，checkbox/radio/价格区间。
 */

export function FilterPanel({
  children,
  onReset,
}: {
  children: React.ReactNode;
  onReset?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200">
        <span className="text-sm font-semibold">筛选</span>
        {onReset && (
          <button
            onClick={onReset}
            className="text-xs text-neutral-400 hover:text-brand-600 transition"
          >
            重置
          </button>
        )}
      </div>
      <div className="p-4 space-y-5">{children}</div>
    </div>
  );
}

export function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details open={defaultOpen} className="group">
      <summary className="flex items-center justify-between cursor-pointer list-none">
        <span className="text-xs font-semibold text-neutral-700">{title}</span>
        <span className="text-neutral-400 text-xs group-open:rotate-180 transition-transform">
          ▾
        </span>
      </summary>
      <div className="mt-2.5 space-y-1.5">{children}</div>
    </details>
  );
}

export function CheckOption({
  label,
  checked,
  onChange,
  count,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  count?: number;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer text-sm py-1 group">
      <span
        className={`h-4 w-4 shrink-0 rounded border flex items-center justify-center transition ${
          checked
            ? "bg-brand-500 border-brand-500 text-white"
            : "border-neutral-300 group-hover:border-brand-400 bg-white"
        }`}
      >
        {checked && (
          <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none">
            <path
              d="M2.5 6.5l2.5 2.5 4.5-5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <span className="text-neutral-700 group-hover:text-neutral-900 flex-1 truncate">
        {label}
      </span>
      {typeof count === "number" && (
        <span className="text-xs text-neutral-400">{count}</span>
      )}
    </label>
  );
}

export function RadioOption({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer text-sm py-1 group">
      <span
        className={`h-4 w-4 shrink-0 rounded-full border flex items-center justify-center transition ${
          checked ? "border-brand-500" : "border-neutral-300 group-hover:border-brand-400"
        }`}
      >
        {checked && (
          <span className="h-2 w-2 rounded-full bg-brand-500" />
        )}
      </span>
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <span className="text-neutral-700 group-hover:text-neutral-900">{label}</span>
    </label>
  );
}

export function PriceInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1 flex-1">
      <span className="text-[11px] text-neutral-400">{label}</span>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50 pl-6 pr-2 text-sm focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100 transition"
        />
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-neutral-400">
          ¥
        </span>
      </div>
    </label>
  );
}
