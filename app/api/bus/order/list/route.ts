import { NextRequest, NextResponse } from "next/server";
import { busOrderList, ApiError } from "@/lib/order-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/bus/order/list [page,page_size,status] —— 巴士订单列表 */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    // 允许空 body
  }
  try {
    const data = await busOrderList(body);
    return NextResponse.json({ code: 0, message: "success", data });
  } catch (err) {
    const e = err as ApiError;
    return NextResponse.json(
      { code: e.code ?? 500, message: e.message ?? "查询订单列表失败", data: null },
      { status: 500 }
    );
  }
}
