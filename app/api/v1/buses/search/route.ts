import { NextRequest, NextResponse } from "next/server";
import { busSearch, ApiError } from "@/lib/api";
import {
  busSummary,
  busSuggestions,
  type AgentResponse,
  type AgentErrorResponse,
} from "@/lib/agentize";
import type { BusItem } from "@/lib/types";
import { POPULAR_BUS_CITIES } from "@/lib/cities";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function fail(
  code: string,
  message: string,
  hint?: string,
  status = 400
): NextResponse<AgentErrorResponse> {
  return NextResponse.json({ error: { code, message, hint } }, { status });
}

/** 城市名 → 6 位行政区划码 + 中心坐标 */
function resolveCity(name: string): {
  adcode: string;
  lng?: number;
  lat?: number;
  addr?: string;
} {
  const hit = POPULAR_BUS_CITIES.find(
    (c) => c.city === name || c.city.startsWith(name) || name.includes(c.city)
  );
  if (hit) return { adcode: hit.adcode, lng: hit.lng, lat: hit.lat, addr: hit.addr };
  return { adcode: name };
}

/**
 * POST /api/v1/buses/search
 * Agent 友好的城际巴士搜索接口。
 */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return fail("INVALID_PARAMS", "请求体不是合法 JSON");
  }

  const from = (body.from as string)?.trim();
  const to = (body.to as string)?.trim();
  const date = (body.date as string)?.trim();

  if (!from || !to || !date) {
    return fail(
      "INVALID_PARAMS",
      "缺少必填参数：from / to / date",
      "示例：{ from: '深圳', to: '广州', date: '2026-08-01' }"
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

  const sortBy = (body.sort_by as string) || "dep_time";
  const page = Number(body.page) || 1;
  const pageSize = Math.min(Number(body.page_size) || 20, 50);

  const startCity = resolveCity(from);
  const endCity = resolveCity(to);

  try {
    const data = await busSearch({
      start_city_code: startCity.adcode,
      end_city_code: endCity.adcode,
      date,
      // 巴士接口实际要求 start_addr 或经纬度，带上兜底
      start_addr: startCity.addr,
      start_lng: startCity.lng,
      start_lat: startCity.lat,
      end_addr: endCity.addr,
      end_lng: endCity.lng,
      end_lat: endCity.lat,
      sort_by: sortBy,
      page,
      page_size: pageSize,
    });

    const lines = data.lines || [];
    const total = data.total || lines.length;
    const meta = {
      total,
      page: data.page_info?.page || page,
      page_size: data.page_info?.page_size || pageSize,
      sort: sortBy,
    };

    const enriched = lines.map((b: BusItem) => ({
      ...b,
      summary: busSummary(b),
      quick_facts: {
        price_yuan: typeof b.price === "number" ? b.price / 100 : undefined,
        dep_time: b.dep_time,
        duration_min: b.duration,
        seats_left: b.avail_seat_count,
        class: b.class_name,
      },
    }));

    const suggestions = busSuggestions(lines, meta, { from, to, date });

    const res: AgentResponse = {
      data: enriched,
      meta,
      suggestions,
    };
    return NextResponse.json(res);
  } catch (err) {
    const e = err as ApiError;
    return fail(
      "UPSTREAM_ERROR",
      e.message || "上游接口异常",
      "可稍后重试，或检查 from/to 是否为有效城市",
      500
    );
  }
}
