import { NextRequest, NextResponse } from "next/server";
import { flightSearch, ApiError } from "@/lib/api";
import {
  flightSummary,
  flightRecommendReason,
  flightSuggestions,
  AgentError as AgentBizError,
  type AgentResponse,
  type AgentErrorResponse,
} from "@/lib/agentize";
import type { FlightItem } from "@/lib/types";
import { POPULAR_AIRPORTS } from "@/lib/cities";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** 城市名 → 三字码（机场数据兜底） */
function resolveCode(input: string): string {
  if (!input) return "";
  const up = input.toUpperCase();
  // 本身就是三字码
  if (/^[A-Z]{3}$/.test(up)) return up;
  // 城市名匹配
  const hit = POPULAR_AIRPORTS.find(
    (c) => c.city === input || c.city.startsWith(input)
  );
  return hit?.code || up;
}

function fail(
  code: string,
  message: string,
  hint?: string,
  status = 400
): NextResponse<AgentErrorResponse> {
  return NextResponse.json(
    { error: { code, message, hint } },
    { status }
  );
}

/**
 * POST /api/v1/flights/search
 * Agent 友好的机票搜索接口。
 */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return fail("INVALID_PARAMS", "请求体不是合法 JSON");
  }

  // 参数校验
  const from = (body.from as string)?.trim();
  const to = (body.to as string)?.trim();
  const date = (body.date as string)?.trim();

  if (!from || !to || !date) {
    return fail(
      "INVALID_PARAMS",
      "缺少必填参数：from / to / date",
      "示例：{ from: '上海', to: '深圳', date: '2026-08-01' }"
    );
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return fail(
      "INVALID_PARAMS",
      `date 格式应为 YYYY-MM-DD，收到 "${date}"`,
      "示例：2026-08-01"
    );
  }
  const today = new Date().toISOString().slice(0, 10);
  if (date < today) {
    return fail(
      "INVALID_PARAMS",
      `date 不能是过去日期（${date}）`,
      `请设为今天及以后，如 ${today}`
    );
  }

  const cabinClass = (body.cabin_class as string) || "economy";
  const adults = Number(body.adults) || 1;
  const sortBy = (body.sort_by as string) || "price";
  const page = Number(body.page) || 1;
  const pageSize = Math.min(Number(body.page_size) || 20, 50);

  try {
    const data = await flightSearch({
      trip_mode: "domestic",
      trip_type: "oneway",
      from_code: resolveCode(from),
      to_code: resolveCode(to),
      depart_date: date,
      cabin_class: cabinClass,
      passengers: { adult: adults, child: 0, infant: 0 },
      page_size: pageSize,
      sort_by: sortBy,
    });

    const flights = data.flights || [];
    const total = data.total || flights.length;
    const meta = {
      total,
      page,
      page_size: pageSize,
      sort: sortBy,
    };

    // 给每条航班附 summary / recommend_reason
    const enriched = flights.map((f: FlightItem, i: number) => ({
      ...f,
      summary: flightSummary(f),
      recommend_reason: flightRecommendReason(f, i, flights.length),
      // 提炼关键字段，便于 Agent 直接展示
      quick_facts: {
        price: f.cabins?.[0]?.adult_price ?? f.cabins?.[0]?.lowest_price,
        dep_time: f.dep_time,
        arr_time: f.arr_time,
        flight_no: f.flight_no,
        airline: f.airline_name,
        direct: !f.stop_count,
      },
    }));

    const suggestions = flightSuggestions(flights, meta, {
      from,
      to,
      date,
      sort_by: sortBy,
    });

    const res: AgentResponse = {
      data: enriched,
      meta,
      suggestions,
    };
    return NextResponse.json(res);
  } catch (err) {
    const e = err as ApiError;
    if (e instanceof AgentBizError) {
      return fail(e.code, e.message, e.hint, 500);
    }
    return fail(
      "UPSTREAM_ERROR",
      e.message || "上游接口异常",
      "可稍后重试，或检查 from/to 是否为有效城市",
      500
    );
  }
}
