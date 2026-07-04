import { NextRequest, NextResponse } from "next/server";
import { hotelOrderCancel, ApiError } from "@/lib/order-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { order_no?: string; cancel_reason?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ code: 400, message: "请求体不是合法 JSON", data: null }, { status: 400 });
  }
  if (!body.order_no) {
    return NextResponse.json({ code: 400, message: "需要 order_no", data: null }, { status: 400 });
  }
  try {
    const data = await hotelOrderCancel(body.order_no, body.cancel_reason);
    return NextResponse.json({ code: 0, message: "success", data });
  } catch (err) {
    const e = err as ApiError;
    return NextResponse.json(
      { code: e.code ?? 500, message: e.message ?? "取消失败", data: null },
      { status: 500 }
    );
  }
}
