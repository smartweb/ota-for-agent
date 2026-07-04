"use client";

/**
 * 通用分页器。
 * - 显示首页/末页/当前页前后各 2 页，其余用省略号
 * - 禁用态：上一页（首页）、下一页（末页）
 */
export function Pagination({
  current,
  pageSize,
  total,
  onChange,
}: {
  current: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  // 生成页码序列：1 … (current-2 ~ current+2) … totalPages
  const pages = pageSequence(current, totalPages);

  return (
    <nav
      className="flex items-center justify-center gap-1.5 mt-10 select-none"
      aria-label="分页"
    >
      <PageBtn
        disabled={current <= 1}
        onClick={() => onChange(current - 1)}
      >
        ‹
      </PageBtn>

      {pages.map((p, i) =>
        p === "..." ? (
          <span
            key={`gap-${i}`}
            className="w-9 h-9 flex items-center justify-center text-neutral-400 text-sm"
          >
            …
          </span>
        ) : (
          <PageBtn
            key={p}
            active={p === current}
            onClick={() => onChange(p)}
          >
            {p}
          </PageBtn>
        )
      )}

      <PageBtn
        disabled={current >= totalPages}
        onClick={() => onChange(current + 1)}
      >
        ›
      </PageBtn>
    </nav>
  );
}

function PageBtn({
  children,
  active,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  const base =
    "min-w-9 h-9 px-2 rounded-lg text-sm font-medium transition flex items-center justify-center";
  const cls = disabled
    ? `${base} text-neutral-300 cursor-not-allowed`
    : active
    ? `${base} bg-brand-500 text-white shadow-sm`
    : `${base} text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900`;
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cls}
    >
      {children}
    </button>
  );
}

/**
 * 生成紧凑页码序列，例如：
 *  current=5, total=20 → [1, "...", 3, 4, 5, 6, 7, "...", 20]
 *  current=2, total=20 → [1, 2, 3, 4, "...", 20]
 *  current=1, total=20 → [1, 2, 3, "...", 20]
 *  total=4            → [1, 2, 3, 4]
 *
 * 去重：中间段会避开已单独展示的首页(1)和末页(total)。
 */
function pageSequence(current: number, total: number): (number | "...")[] {
  const delta = 2; // 当前页前后各显示 2 页
  const range: (number | "...")[] = [];

  // 中间段边界（不含首尾边界，避免与单独展示的首页/末页重复）
  const left = Math.max(2, current - delta);
  const right = Math.min(total - 1, current + delta);

  const hasLeftGap = left > 2;
  const hasRightGap = right < total - 1;

  // 整段无省略：直接铺满
  if (total <= 1) {
    return [1];
  }
  if (!hasLeftGap && !hasRightGap && right >= left) {
    for (let i = 1; i <= total; i++) range.push(i);
    return range;
  }

  // 首页
  range.push(1);
  if (hasLeftGap) range.push("...");

  // 中间段（已避开 1 和 total）
  for (let i = left; i <= right; i++) range.push(i);

  // 末页
  if (hasRightGap) range.push("...");
  range.push(total);

  return range;
}
