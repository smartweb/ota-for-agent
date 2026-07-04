import { NextRequest, NextResponse } from "next/server";
import { hotelRooms, ApiError } from "@/lib/order-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { search_offer_id?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ code: 400, message: "请求体不是合法 JSON", data: null }, { status: 400 });
  }
  if (!body.search_offer_id) {
    return NextResponse.json({ code: 400, message: "需要 search_offer_id", data: null }, { status: 400 });
  }
  try {
    const data = await hotelRooms(body.search_offer_id);
    return NextResponse.json({ code: 0, message: "success", data });
  } catch (err) {
    const e = err as ApiError;
    return NextResponse.json(
      { code: e.code ?? 500, message: e.message ?? "查询房型失败", data: null },
      { status: 500 }
    );
  }
}
