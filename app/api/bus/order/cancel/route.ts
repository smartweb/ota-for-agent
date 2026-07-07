import { NextRequest, NextResponse } from "next/server";
import { busOrderCancel, ApiError } from "@/lib/order-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/bus/order/cancel { system_no, reason? } —— 取消巴士订单 */
export async function POST(req: NextRequest) {
  let body: { system_no?: string; reason?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ code: 400, message: "请求体不是合法 JSON", data: null }, { status: 400 });
  }
  if (!body.system_no) {
    return NextResponse.json({ code: 400, message: "需要 system_no", data: null }, { status: 400 });
  }
  try {
    const data = await busOrderCancel(body.system_no, body.reason);
    return NextResponse.json({ code: 0, message: "success", data });
  } catch (err) {
    const e = err as ApiError;
    return NextResponse.json(
      { code: e.code ?? 500, message: e.message ?? "取消订单失败", data: null },
      { status: 500 }
    );
  }
}
