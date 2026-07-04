import { NextRequest, NextResponse } from "next/server";
import { hotelSearch, ApiError } from "@/lib/api";
import {
  hotelSummary,
  hotelSuggestions,
  type AgentResponse,
  type AgentErrorResponse,
} from "@/lib/agentize";
import type { HotelItem } from "@/lib/types";

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

// 已知的模糊关键词（品牌/景点等），用于提示 Agent 改用城市名
const FUZZY_HINTS = ["锦江", "华住", "如家", "希尔顿", "万豪", "西湖", "外滩", "迪士尼", "长城"];

/**
 * POST /api/v1/hotels/search
 * Agent 友好的酒店搜索接口。
 */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return fail("INVALID_PARAMS", "请求体不是合法 JSON");
  }

  const city = (body.city as string)?.trim();
  const checkIn = (body.check_in as string)?.trim();
  const checkOut = (body.check_out as string)?.trim();

  if (!city || !checkIn || !checkOut) {
    return fail(
      "INVALID_PARAMS",
      "缺少必填参数：city / check_in / check_out",
      "示例：{ city: '杭州', check_in: '2026-08-01', check_out: '2026-08-03' }"
    );
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(checkIn) || !/^\d{4}-\d{2}-\d{2}$/.test(checkOut)) {
    return fail(
      "INVALID_PARAMS",
      "日期格式应为 YYYY-MM-DD",
      "示例：check_in='2026-08-01' check_out='2026-08-03'"
    );
  }
  if (checkOut <= checkIn) {
    return fail(
      "INVALID_PARAMS",
      "check_out 必须晚于 check_in",
      `离店日至少为入住日的次日，如 check_in=${checkIn} check_out=${nextDay(checkIn)}`
    );
  }
  // 模糊关键词提示
  if (FUZZY_HINTS.some((k) => city.includes(k)) && city.length <= 4) {
    return fail(
      "CITY_REQUIRED",
      `city "${city}" 像是品牌/景点，需要明确城市名`,
      "请改用城市名，如「杭州」「上海」；品牌可用 brand 参数，景点用关键词 + 城市"
    );
  }

  const sortBy = (body.sort_by as string) || "best";
  const page = Number(body.page) || 1;
  const pageSize = Math.min(Number(body.page_size) || 20, 50);

  // 组装 filters
  const filters: Record<string, unknown> = {};
  if (body.brand) filters.hotel_brand = body.brand;
  if (body.min_price != null) filters.min_price = Number(body.min_price);
  if (body.max_price != null) filters.max_price = Number(body.max_price);
  if (Array.isArray(body.star_levels) && body.star_levels.length)
    filters.star_levels = body.star_levels;
  if (body.has_wifi) filters.has_wifi = true;
  if (body.has_parking) filters.has_parking = true;
  if (body.has_breakfast) filters.has_restaurant = true;
  if (body.has_swimming_pool) filters.has_swimming_pool = true;

  try {
    const data = await hotelSearch({
      destination: city,
      check_in: checkIn,
      check_out: checkOut,
      adult_count: Number(body.adults) || 2,
      room_count: Number(body.rooms) || 1,
      sort_by: sortBy,
      page,
      page_size: pageSize,
      ...(Object.keys(filters).length ? { filters } : {}),
    });

    // 过滤价格为 0 / 缺失的脏数据
    const hotels = (data.hotels || []).filter(
      (h) => typeof h.min_price === "number" && h.min_price > 0
    );
    const total = data.total || hotels.length;
    const meta = {
      total,
      page: data.page_info?.page || page,
      page_size: data.page_info?.page_size || pageSize,
      sort: sortBy,
    };

    const enriched = hotels.map((h: HotelItem) => ({
      ...h,
      summary: hotelSummary(h),
      quick_facts: {
        price: h.min_price,
        star: h.star_rating,
        rating: h.review_score,
        brand: h.brand_name,
        zone: h.business_zone || h.district,
      },
    }));

    const suggestions = hotelSuggestions(hotels, meta, {
      city,
      check_in: checkIn,
      check_out: checkOut,
      brand: body.brand as string,
      max_price: body.max_price as number,
    });

    const res: AgentResponse = {
      data: enriched,
      meta,
      suggestions,
    };
    return NextResponse.json(res);
  } catch (err) {
    const e = err as ApiError;
    const msg = e.message || "上游接口异常";
    // 城市不明确是常见错误，单独识别
    if (/明确城市|adcode|区划/i.test(msg)) {
      return fail(
        "CITY_REQUIRED",
        msg,
        "city 需是明确城市名（如「杭州」），不能用品牌名或景点名",
        500
      );
    }
    return fail("UPSTREAM_ERROR", msg, "可稍后重试，或检查 city 是否为有效城市", 500);
  }
}

function nextDay(date: string): string {
  const d = new Date(date);
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}
