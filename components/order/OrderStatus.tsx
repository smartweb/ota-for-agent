/**
 * 订单状态标签：把平台返回的状态码/枚举映射成中文 + 颜色。
 */

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  // 机票
  pending_pay: { label: "待支付", cls: "bg-amber-50 text-amber-600" },
  issued: { label: "已出票", cls: "bg-emerald-50 text-emerald-600" },
  completed: { label: "已完成", cls: "bg-neutral-100 text-neutral-500" },
  cancelled: { label: "已取消", cls: "bg-neutral-100 text-neutral-400" },
  canceled: { label: "已取消", cls: "bg-neutral-100 text-neutral-400" },
  refunding: { label: "退票中", cls: "bg-orange-50 text-orange-600" },
  refunded: { label: "已退款", cls: "bg-neutral-100 text-neutral-400" },
  // 酒店
  pending_payment: { label: "待支付", cls: "bg-amber-50 text-amber-600" },
  paid: { label: "已支付", cls: "bg-blue-50 text-blue-600" },
  confirmed: { label: "已确认", cls: "bg-emerald-50 text-emerald-600" },
  // 巴士
  ticketed: { label: "已出票", cls: "bg-emerald-50 text-emerald-600" },
};

export function StatusBadge({ status, text }: { status: string; text?: string }) {
  const mapped = STATUS_MAP[status];
  const label = text || mapped?.label || status;
  const cls = mapped?.cls || "bg-neutral-100 text-neutral-500";
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}
