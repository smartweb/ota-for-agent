import { NextRequest, NextResponse } from "next/server";
import { busOrderDetail, ApiError } from "@/lib/order-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/bus/order/detail { system_no?, out_trade_no? } —— 巴士订单详情 */
export async function POST(req: NextRequest) {
  let body: { system_no?: string; out_trade_no?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ code: 400, message: "请求体不是合法 JSON", data: null }, { status: 400 });
  }
  if (!body.system_no && !body.out_trade_no) {
    return NextResponse.json({ code: 400, message: "需要 system_no 或 out_trade_no", data: null }, { status: 400 });
  }
  try {
    const data = await busOrderDetail(body.system_no || "", body.out_trade_no);
    return NextResponse.json({ code: 0, message: "success", data });
  } catch (err) {
    const e = err as ApiError;
    return NextResponse.json(
      { code: e.code ?? 500, message: e.message ?? "查询订单失败", data: null },
      { status: 500 }
    );
  }
}
