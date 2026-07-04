/**
 * 本地订单索引（客户端 localStorage）。
 * 记录 out_trade_no ↔ 订单号 ↔ 业务类型，订单列表页用这些索引批量查上游详情。
 * 这是 Web 端的轻量方案：平台没有「我的订单」跨用户聚合接口，本地索引兜底。
 */

export type OrderBizType = "flight" | "hotel";

export interface OrderIndexEntry {
  out_trade_no: string;
  order_no: string; // 机票 system_no 或 酒店 order_no
  type: OrderBizType;
  created_at: number;
  title: string; // 一句话描述，如 "上海→深圳 MU5357"
  amount?: number;
}

const KEY = "longxa_orders";

export function getOrderIndex(): OrderIndexEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as OrderIndexEntry[]) : [];
  } catch {
    return [];
  }
}

export function addOrderIndex(entry: OrderIndexEntry): void {
  if (typeof window === "undefined") return;
  const list = getOrderIndex();
  // 去重（按 out_trade_no）
  const filtered = list.filter((e) => e.out_trade_no !== entry.out_trade_no);
  filtered.unshift(entry);
  window.localStorage.setItem(KEY, JSON.stringify(filtered.slice(0, 100)));
}

export function removeOrderIndex(outTradeNo: string): void {
  if (typeof window === "undefined") return;
  const list = getOrderIndex().filter((e) => e.out_trade_no !== outTradeNo);
  window.localStorage.setItem(KEY, JSON.stringify(list));
}

export function findOrderByOrderNo(orderNo: string): OrderIndexEntry | undefined {
  return getOrderIndex().find((e) => e.order_no === orderNo);
}

/** 生成商户订单号：LX + 业务 + 时间戳 + 随机 */
export function genOutTradeNo(type: OrderBizType): string {
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  const prefix = type === "flight" ? "F" : "H";
  return `LX${prefix}${ts}${rand}`;
}
