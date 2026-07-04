import { NextRequest, NextResponse } from "next/server";
import { hotelOrderList, ApiError } from "@/lib/order-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    // 允许空 body
  }
  try {
    const data = await hotelOrderList(body);
    return NextResponse.json({ code: 0, message: "success", data });
  } catch (err) {
    const e = err as ApiError;
    return NextResponse.json(
      { code: e.code ?? 500, message: e.message ?? "查询失败", data: null },
      { status: 500 }
    );
  }
}
