import { NextRequest, NextResponse } from "next/server";
import {
  flightSearch,
  hotelSearch,
  busSearch,
  ApiError,
  type BusinessType,
} from "@/lib/api";
import type {
  FlightSearchRequest,
  HotelSearchRequest,
  BusSearchRequest,
} from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * 统一 BFF 代理：
 *   POST /api/proxy?type=flight  body: FlightSearchRequest
 *   POST /api/proxy?type=hotel   body: HotelSearchRequest
 *   POST /api/proxy?type=bus     body: BusSearchRequest
 *
 * 服务端注入 Bearer Token 后转发到 /open/v1/* 。
 */
export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") as BusinessType | null;

  if (!type || !["flight", "hotel", "bus"].includes(type)) {
    return NextResponse.json(
      { code: 400, message: "缺少或非法的 type 参数", data: null },
      { status: 400 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { code: 400, message: "请求体不是合法 JSON", data: null },
      { status: 400 }
    );
  }

  try {
    let data: unknown;
    if (type === "flight") {
      data = await flightSearch(body as FlightSearchRequest);
    } else if (type === "hotel") {
      data = await hotelSearch(body as HotelSearchRequest);
    } else {
      data = await busSearch(body as BusSearchRequest);
    }
    return NextResponse.json({ code: 0, message: "success", data });
  } catch (err) {
    const e = err as ApiError;
    const status = e.code === 40113 || e.code === 401 ? 401 : 500;
    return NextResponse.json(
      {
        code: e.code ?? 500,
        message: e.message ?? "服务端调用失败",
        data: null,
        request_id: e.requestId,
      },
      { status }
    );
  }
}
