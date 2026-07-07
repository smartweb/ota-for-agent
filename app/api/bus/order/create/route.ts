import { NextRequest, NextResponse } from "next/server";
import { busOrderCreate, ApiError } from "@/lib/order-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/bus/order/create —— 创建巴士订单 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ code: 400, message: "请求体不是合法 JSON", data: null }, { status: 400 });
  }
  try {
    const data = await busOrderCreate(body as Parameters<typeof busOrderCreate>[0]);
    return NextResponse.json({ code: 0, message: "success", data });
  } catch (err) {
    const e = err as ApiError;
    return NextResponse.json(
      { code: e.code ?? 500, message: e.message ?? "下单失败", data: null },
      { status: 500 }
    );
  }
}
