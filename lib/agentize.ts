/**
 * Agent 友好层：把结构化业务数据转成自然语言 summary，
 * 并生成 suggestions 引导 Agent 下一步动作。
 */

import type {
  FlightItem,
  HotelItem,
  BusItem,
} from "./types";

/* ----------------------------- 类型定义 ----------------------------- */

export interface MetaInfo {
  total: number;
  page: number;
  page_size: number;
  sort?: string;
}

export interface AgentSuggestion {
  action: string;
  params?: Record<string, unknown>;
  reason: string;
}

export interface AgentResponse<T = unknown> {
  data: T[];
  meta: MetaInfo;
  suggestions: AgentSuggestion[];
  error?: undefined;
}

export interface AgentErrorResponse {
  data?: undefined;
  meta?: undefined;
  suggestions?: undefined;
  error: {
    code: string;
    message: string;
    hint?: string;
  };
}

export class AgentError extends Error {
  code: string;
  hint?: string;
  constructor(code: string, message: string, hint?: string) {
    super(message);
    this.code = code;
    this.hint = hint;
  }
}

/* ----------------------------- 机票 summary ----------------------------- */

function hhmm(s?: string): string {
  if (!s) return "--:--";
  const m = s.match(/(\d{2}:\d{2})/);
  return m ? m[1] : s;
}

function durationLabel(min?: number): string {
  if (!min) return "";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}小时${m}分` : `${h}小时`;
}

export function flightSummary(f: FlightItem): string {
  const airline = f.airline_name || "未知航司";
  const no = f.flight_no || "";
  const dep = f.dep_city_name || f.dep_airport_name || "";
  const arr = f.arr_city_name || f.arr_airport_name || "";
  const depTime = hhmm(f.dep_time);
  const arrTime = hhmm(f.arr_time);
  const dur = durationLabel(f.duration_minutes);
  const stop = f.stop_count ? `经停${f.stop_count}次` : "直飞";
  return `${airline} ${no}，${dep} ${depTime} 出发，${arrTime} 到达 ${arr}，${stop}${dur ? `，飞行${dur}` : ""}`;
}

export function flightRecommendReason(f: FlightItem, rank: number, total: number): string {
  const price = f.cabins?.[0]?.adult_price;
  const reasons: string[] = [];
  if (rank === 0 && total > 1) reasons.push("当前列表价格最低");
  if (!f.stop_count) reasons.push("直飞省时");
  if (f.cabins?.[0]?.seat_status === "few") reasons.push("余票紧张，建议尽快预订");
  if (!reasons.length) reasons.push("综合性价比不错");
  return reasons.join("，");
}

/* ----------------------------- 酒店 summary ----------------------------- */

export function hotelSummary(h: HotelItem): string {
  const name = h.hotel_name || "未知酒店";
  const tag = h.star_tag || (h.star_rating ? `${h.star_rating}星` : "");
  const zone = h.business_zone || h.district || h.city || "";
  const price = typeof h.min_price === "number" ? `¥${h.min_price}/晚起` : "价格待定";
  const score =
    typeof h.review_score === "number"
      ? `，评分 ${h.review_score.toFixed(1)}`
      : "";
  const facilities: string[] = [];
  if (h.has_wifi) facilities.push("WiFi");
  if (h.has_parking) facilities.push("停车");
  if (h.has_breakfast) facilities.push("早餐");
  if (h.has_swimming_pool) facilities.push("泳池");
  const facStr = facilities.length ? `，有${facilities.join("/")}` : "";
  return `${tag ? `${tag}·` : ""}${name}（${zone}），${price}${score}${facStr}`;
}

/* ----------------------------- 巴士 summary ----------------------------- */

export function busSummary(b: BusItem): string {
  const cls = b.class_name || "大巴";
  const from = b.start_station_name || b.from_city || "出发站";
  const to = b.end_station_name || b.to_city || "到达站";
  const time = b.dep_time || "--:--";
  const dur = durationLabel(b.duration);
  const priceYuan =
    typeof b.price === "number" ? `¥${(b.price / 100).toFixed(0)}` : "价格待定";
  const seat = b.avail_seat_count ?? 0;
  const seatStr =
    seat === 0 ? "已售罄" : seat <= 5 ? `仅剩${seat}张` : `余${seat}张`;
  return `${cls} ${time} 从${from}发车，约${dur || "未知时长"}到达${to}，${priceYuan}，${seatStr}`;
}

/* ----------------------------- suggestions 生成 ----------------------------- */

export function flightSuggestions(
  data: FlightItem[],
  meta: MetaInfo,
  reqParams: { from?: string; to?: string; date?: string; sort_by?: string }
): AgentSuggestion[] {
  const out: AgentSuggestion[] = [];
  const hasNext = meta.page * meta.page_size < meta.total;
  if (hasNext) {
    out.push({
      action: "next_page",
      params: { ...reqParams, page: meta.page + 1 },
      reason: `还有更多航班（共${meta.total}条）`,
    });
  }
  if (data.length > 3) {
    out.push({
      action: "sort_by",
      params: { ...reqParams, sort_by: "dep_time" },
      reason: "按起飞时间排序，方便挑合适时段",
    });
  }
  return out;
}

export function hotelSuggestions(
  data: HotelItem[],
  meta: MetaInfo,
  reqParams: {
    city?: string;
    check_in?: string;
    check_out?: string;
    brand?: string;
    max_price?: number;
  }
): AgentSuggestion[] {
  const out: AgentSuggestion[] = [];
  const hasNext = meta.page * meta.page_size < meta.total;
  if (hasNext) {
    out.push({
      action: "next_page",
      params: { ...reqParams, page: meta.page + 1 },
      reason: `还有更多酒店（共${meta.total}条）`,
    });
  }
  if (!reqParams.brand && data.length > 5) {
    out.push({
      action: "filter_by_brand",
      params: { ...reqParams, brand: "锦江" },
      reason: "可按品牌缩小范围",
    });
  }
  if (!reqParams.max_price && data.length > 5) {
    out.push({
      action: "filter_by_price",
      params: { ...reqParams, max_price: 500 },
      reason: "可限制价格区间",
    });
  }
  return out;
}

export function busSuggestions(
  data: BusItem[],
  meta: MetaInfo,
  reqParams: { from?: string; to?: string; date?: string }
): AgentSuggestion[] {
  const out: AgentSuggestion[] = [];
  const hasNext = meta.page * meta.page_size < meta.total;
  if (hasNext) {
    out.push({
      action: "next_page",
      params: { ...reqParams, page: meta.page + 1 },
      reason: `还有更多班次（共${meta.total}条）`,
    });
  }
  const cheap = data.filter((b) => typeof b.price === "number").sort((a, b) => (a.price || 0) - (b.price || 0))[0];
  if (cheap && data.length > 1) {
    out.push({
      action: "sort_by",
      params: { ...reqParams, sort_by: "price" },
      reason: `最便宜的是 ¥${((cheap.price || 0) / 100).toFixed(0)}`,
    });
  }
  return out;
}
