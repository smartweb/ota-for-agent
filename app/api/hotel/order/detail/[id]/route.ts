import { NextRequest, NextResponse } from "next/server";
import { hotelOrderDetail, ApiError } from "@/lib/order-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/hotel/order/detail/[order_no] → 上游 GET /open/v1/hotel/order/detail/{order_no} */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const orderNo = params.id;
  if (!orderNo) {
    return NextResponse.json({ code: 400, message: "缺少 order_no", data: null }, { status: 400 });
  }
  try {
    const data = await hotelOrderDetail(orderNo);
    return NextResponse.json({ code: 0, message: "success", data });
  } catch (err) {
    const e = err as ApiError;
    return NextResponse.json(
      { code: e.code ?? 500, message: e.message ?? "查询失败", data: null },
      { status: 500 }
    );
  }
}
