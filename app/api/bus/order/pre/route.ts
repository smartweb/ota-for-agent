import { NextRequest, NextResponse } from "next/server";
import { busPreOrder, ApiError } from "@/lib/order-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/bus/order/pre —— 预下单（询价） */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ code: 400, message: "请求体不是合法 JSON", data: null }, { status: 400 });
  }
  try {
    const data = await busPreOrder(body as Parameters<typeof busPreOrder>[0]);
    return NextResponse.json({ code: 0, message: "success", data });
  } catch (err) {
    const e = err as ApiError;
    return NextResponse.json(
      { code: e.code ?? 500, message: e.message ?? "询价失败", data: null },
      { status: 500 }
    );
  }
}
